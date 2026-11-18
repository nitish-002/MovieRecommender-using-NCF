import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Check, Film, Search, ArrowRight, Loader2, Heart, RotateCcw } from 'lucide-react'
import { cn } from '../utils/cn'
import { movieApi } from '../services/movieApi'
import { useAuth } from '../context/AuthContext'

// Curated selection of recognizable, diverse films across genres for fast cold-start onboarding
const POPULAR_ONBOARDING_SEEDS = [
  { id: 1, title: 'Toy Story (1995)', genres: ['Animation', 'Children', 'Comedy'] },
  { id: 260, title: 'Star Wars: Episode IV - A New Hope (1977)', genres: ['Action', 'Adventure', 'Sci-Fi'] },
  { id: 2571, title: 'The Matrix (1999)', genres: ['Action', 'Sci-Fi', 'Thriller'] },
  { id: 296, title: 'Pulp Fiction (1994)', genres: ['Comedy', 'Crime', 'Drama'] },
  { id: 318, title: 'The Shawshank Redemption (1994)', genres: ['Crime', 'Drama'] },
  { id: 356, title: 'Forrest Gump (1994)', genres: ['Comedy', 'Drama', 'Romance'] },
  { id: 593, title: 'The Silence of the Lambs (1991)', genres: ['Crime', 'Horror', 'Thriller'] },
  { id: 858, title: 'The Godfather (1972)', genres: ['Crime', 'Drama'] },
  { id: 4993, title: 'The Lord of the Rings: The Fellowship of the Ring (2001)', genres: ['Adventure', 'Fantasy'] },
  { id: 58559, title: 'The Dark Knight (2008)', genres: ['Action', 'Crime', 'Drama'] },
  { id: 79132, title: 'Inception (2010)', genres: ['Action', 'Crime', 'Sci-Fi'] },
  { id: 109487, title: 'Interstellar (2014)', genres: ['Sci-Fi', 'IMAX'] },
  { id: 112552, title: 'Whiplash (2014)', genres: ['Drama'] },
  { id: 122904, title: 'Deadpool (2016)', genres: ['Action', 'Adventure', 'Comedy'] },
  { id: 500, title: 'Mrs. Doubtfire (1993)', genres: ['Comedy', 'Drama'] },
  { id: 1270, title: 'Back to the Future (1985)', genres: ['Adventure', 'Comedy', 'Sci-Fi'] },
  { id: 1196, title: 'Star Wars: Episode V - The Empire Strikes Back (1980)', genres: ['Action', 'Adventure', 'Sci-Fi'] },
  { id: 1721, title: 'Titanic (1997)', genres: ['Drama', 'Romance'] },
  { id: 4306, title: 'Shrek (2001)', genres: ['Animation', 'Comedy', 'Fantasy'] },
  { id: 60069, title: 'WALL·E (2008)', genres: ['Adventure', 'Animation', 'Children', 'Sci-Fi'] },
  { id: 68157, title: 'Inglourious Basterds (2009)', genres: ['Action', 'Drama', 'War'] },
  { id: 71535, title: 'Zombieland (2009)', genres: ['Action', 'Comedy', 'Horror'] },
  { id: 91529, title: 'The Dark Knight Rises (2012)', genres: ['Action', 'Crime', 'Drama'] },
  { id: 134130, title: 'The Martian (2015)', genres: ['Adventure', 'Drama', 'Sci-Fi'] },
]

export function OnboardingPage() {
  const { refetch } = useAuth()
  const navigate = useNavigate()

  const [selectedIds, setSelectedIds] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Search catalog when query >= 2 chars
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await movieApi.searchMovies(searchQuery.trim(), 12)
        setSearchResults(results || [])
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setSearching(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const toggleSelect = (movieId) => {
    setSelectedIds((prev) =>
      prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    )
  }

  const handleFinish = async () => {
    if (selectedIds.length < 3) return
    setSubmitting(true)
    setError(null)

    try {
      await movieApi.completeOnboarding(selectedIds)
      await refetch?.()
      navigate('/recommendations')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to complete onboarding. Please try again.')
      setSubmitting(false)
    }
  }

  const minRequired = 3
  const isReady = selectedIds.length >= minRequired
  const displayMovies = searchQuery.trim().length >= 2 ? searchResults : POPULAR_ONBOARDING_SEEDS

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Taste Calibration
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
          What kind of movies do you love?
        </h1>
        <p className="text-secondary text-sm leading-relaxed">
          Select at least <span className="text-primary font-semibold">3 movies</span> you enjoy. 
          Our NeuMF neural network will combine their pre-trained latent vectors to construct your personal taste profile in real-time.
        </p>
      </div>

      {/* Floating Action / Progress Bar */}
      <div className="sticky top-20 z-30 p-4 bg-card/90 backdrop-blur-xl rounded-2xl border border-border shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Heart className={cn('h-5 w-5', isReady ? 'text-red-500 fill-red-500' : 'text-secondary')} />
            <span className="text-sm font-semibold text-primary">
              {selectedIds.length} of {minRequired} selected
            </span>
          </div>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleFinish}
          disabled={!isReady || submitting}
          className={cn(
            'px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer',
            isReady
              ? 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/25'
              : 'bg-surface text-secondary/60 cursor-not-allowed border border-border'
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Calibrating NeuMF...</span>
            </>
          ) : (
            <>
              <span>Generate My Recommendations</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search catalog for favorite movies (e.g. Inception, Matrix, Titanic)..."
          className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-2xl text-sm text-primary placeholder-secondary/60 focus-visible-ring"
        />
        {searching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-accent" />
        )}
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayMovies.map((movie) => {
          const movieId = movie.movie_id || movie.id
          const isSelected = selectedIds.includes(movieId)

          return (
            <div
              key={movieId}
              onClick={() => toggleSelect(movieId)}
              className={cn(
                'group relative rounded-2xl overflow-hidden p-3.5 border transition-all duration-200 cursor-pointer flex flex-col justify-between text-left select-none',
                isSelected
                  ? 'bg-accent/15 border-accent shadow-lg shadow-accent/15 ring-2 ring-accent/30'
                  : 'bg-card border-border/80 hover:border-accent/40 hover:-translate-y-0.5'
              )}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <div className="p-2 rounded-xl bg-surface border border-border/60 text-secondary group-hover:text-primary transition-colors">
                    <Film className="h-5 w-5" />
                  </div>
                  <div
                    className={cn(
                      'h-6 w-6 rounded-full flex items-center justify-center transition-all',
                      isSelected
                        ? 'bg-accent text-white scale-110 shadow-md shadow-accent/40'
                        : 'border border-border/80 text-transparent group-hover:border-accent/40'
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </div>
                </div>

                <h3 className="font-semibold text-primary text-sm line-clamp-2 leading-snug">
                  {movie.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {movie.genres?.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="text-[10px] font-medium px-2 py-0.5 bg-surface text-secondary rounded-md border border-border/60"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
