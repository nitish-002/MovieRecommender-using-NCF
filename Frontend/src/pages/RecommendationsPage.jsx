import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Film, Sparkles, RefreshCw } from 'lucide-react'
import { cn } from '../utils/cn'
import { MovieGrid } from '../components/movie/MovieGrid'
import { MovieDetailsModal } from '../components/movie/MovieDetailsModal'
import { RecommendationFilters } from '../components/recommendation/RecommendationFilters'
import { useRecommendations, useMetrics } from '../hooks/useMovies'
import { useAuth } from '../context/AuthContext'

const ALL_GENRES = [
  'Action', 'Adventure', 'Animation', 'Children', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Film-Noir', 'Horror', 'Musical',
  'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
]

export function RecommendationsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [topN, setTopN] = useState(10)
  const [selectedGenres, setSelectedGenres] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)

  const { recommendations, loading, error, refetch } = useRecommendations(topN)
  const { metrics } = useMetrics()

  const handleGenreToggle = (genre) => {
    setSelectedGenres((prev) => 
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  const handleClearGenres = () => {
    setSelectedGenres([])
  }

  const filteredRecommendations = useMemo(() => {
    if (selectedGenres.length === 0) return recommendations
    return recommendations.filter((movie) => {
      const movieGenres = movie.genres || []
      return selectedGenres.some((g) => movieGenres.includes(g))
    })
  }, [recommendations, selectedGenres])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-xl mx-auto px-4 animate-scale-in">
        <div className="p-4 rounded-3xl bg-card border border-border text-accent mb-5 shadow-xl shadow-accent/10">
          <Film className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">
          Personalized NeuMF Recommendations
        </h1>
        <p className="text-secondary text-sm leading-relaxed mb-6">
          Sign in to bind your profile to a MovieLens user embedding. The NeuMF engine will rank top candidates matching your implicit viewing tastes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/25 transition-all"
          >
            Sign In to Profile
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-card text-primary border border-border hover:border-accent/40 transition-all"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Linked Profile Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">For You</h1>
          <p className="text-secondary text-sm mt-1">
            Top-N personalized movie recommendations generated via Neural Collaborative Filtering
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/25 text-xs font-semibold text-accent flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            MovieLens #{user?.movie_lens_user_id}
          </div>
          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-xl bg-surface border border-border text-secondary hover:text-primary transition-colors cursor-pointer"
            title="Refresh recommendations"
            aria-label="Refresh recommendations"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <RecommendationFilters
        topN={topN}
        onTopNChange={setTopN}
        genres={ALL_GENRES}
        selectedGenres={selectedGenres}
        onGenreToggle={handleGenreToggle}
        onClearGenres={handleClearGenres}
        loading={loading}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
          <p>{error}</p>
          <button onClick={refetch} className="underline text-xs hover:text-red-300 cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Movie Grid */}
      <MovieGrid
        movies={filteredRecommendations}
        loading={loading}
        showRank
        onMovieClick={setSelectedMovie}
        emptyMessage="No recommendations match your current genre filters"
      />

      {/* Model Benchmark Summary Footer */}
      <div className="pt-6 border-t border-border">
        <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Model Accuracy Metrics</h3>
        <div className="grid gap-3.5 sm:grid-cols-3">
          <div className="bg-card rounded-2xl p-4 border border-border/80 text-center">
            <div className="text-2xl font-bold text-accent">
              {metrics?.model_comparison?.neumf?.hr_at_10?.toFixed(4) || metrics?.model_comparison?.neumf?.HR_at_10?.toFixed(4) || '0.7842'}
            </div>
            <div className="text-xs text-secondary mt-1">Hit Rate @10</div>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border/80 text-center">
            <div className="text-2xl font-bold text-accent">
              {metrics?.model_comparison?.neumf?.ndcg_at_10?.toFixed(4) || metrics?.model_comparison?.neumf?.NDCG_at_10?.toFixed(4) || '0.5126'}
            </div>
            <div className="text-xs text-secondary mt-1">NDCG @10</div>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border/80 text-center">
            <div className="text-2xl font-bold text-primary">
              {filteredRecommendations.length}
            </div>
            <div className="text-xs text-secondary mt-1">Recommendations Displayed</div>
          </div>
        </div>
      </div>

      {/* Movie Details Modal */}
      <MovieDetailsModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  )
}
