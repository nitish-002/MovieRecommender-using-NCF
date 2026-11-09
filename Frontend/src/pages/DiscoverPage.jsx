import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, Rows3, SlidersHorizontal, RotateCcw } from 'lucide-react'
import { cn } from '../utils/cn'
import { MovieCarousel } from '../components/movie/MovieCarousel'
import { MovieGrid } from '../components/movie/MovieGrid'
import { MovieSearch } from '../components/movie/MovieSearch'
import { GenreChip } from '../components/movie/GenreChip'
import { MovieDetailsModal } from '../components/movie/MovieDetailsModal'
import { movieApi } from '../services/movieApi'

const ALL_GENRES = [
  'Action', 'Adventure', 'Animation', 'Children', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Film-Noir', 'Horror', 'Musical',
  'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
]

export function DiscoverPage() {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [query, setQuery] = useState(initialSearch)
  const [selectedGenres, setSelectedGenres] = useState([])
  const [sortBy, setSortBy] = useState('popularity')
  const [viewMode, setViewMode] = useState('grid')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)

  const fetchMovies = useCallback(async (searchTerm) => {
    setLoading(true)
    try {
      const term = searchTerm?.trim() || 'the'
      const data = await movieApi.searchMovies(term, 60)
      setMovies(data || [])
    } catch (err) {
      console.error('Discover search failed:', err)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Sync URL search params
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    setQuery(urlSearch)
    fetchMovies(urlSearch)
  }, [searchParams, fetchMovies])

  const handleSearchSelect = (movie) => {
    setSelectedMovie(movie)
  }

  const handleGenreToggle = (genre) => {
    setSelectedGenres((prev) => 
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  const handleClearFilters = () => {
    setSelectedGenres([])
    setSortBy('popularity')
  }

  // Filter & Sort movies in memory
  const processedMovies = useMemo(() => {
    let result = [...movies]

    // Genre filter: movie must contain every selected genre (or at least one if preferred)
    if (selectedGenres.length > 0) {
      result = result.filter((m) => {
        const movieGenres = m.genres || []
        return selectedGenres.some((g) => movieGenres.includes(g))
      })
    }

    // Sort
    if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    } else if (sortBy === 'year') {
      result.sort((a, b) => (b.year || 0) - (a.year || 0))
    }

    return result
  }, [movies, selectedGenres, sortBy])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Discover Catalog</h1>
          <p className="text-secondary text-sm mt-1">
            Search 47,000+ titles and explore genres across the MovieLens 25M dataset
          </p>
        </div>

        {/* Controls: Sort + View Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-border">
            <SlidersHorizontal className="h-4 w-4 text-secondary" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-primary focus:outline-none cursor-pointer"
            >
              <option value="popularity" className="bg-card">Sort by Relevance</option>
              <option value="title" className="bg-card">Title (A–Z)</option>
              <option value="year" className="bg-card">Release Year</option>
            </select>
          </div>

          <div className="flex items-center bg-surface p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'grid' ? 'bg-accent text-white shadow-sm' : 'text-secondary hover:text-primary'
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'carousel' ? 'bg-accent text-white shadow-sm' : 'text-secondary hover:text-primary'
              )}
              aria-label="Carousel view"
            >
              <Rows3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Active Filters Bar */}
      <div className="bg-surface/50 rounded-2xl p-5 border border-border space-y-4">
        <MovieSearch
          placeholder="Search for movies, directors, franchises..."
          onSelect={handleSearchSelect}
        />

        {/* Genre Pill Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Filter by Genre ({selectedGenres.length > 0 ? `${selectedGenres.length} active` : 'All'})
            </span>
            {selectedGenres.length > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-xs text-secondary hover:text-accent transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Genre filters">
            {ALL_GENRES.map((genre) => (
              <GenreChip
                key={genre}
                genre={genre}
                selected={selectedGenres.includes(genre)}
                onClick={() => handleGenreToggle(genre)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Search status header */}
      <div className="flex items-center justify-between px-1 text-xs text-secondary">
        <span>
          Showing <strong className="text-primary">{processedMovies.length}</strong> {processedMovies.length === 1 ? 'title' : 'titles'}
          {query ? ` matching "${query}"` : ''}
          {selectedGenres.length > 0 ? ` in ${selectedGenres.join(', ')}` : ''}
        </span>
      </div>

      {/* Movie Results Display */}
      {viewMode === 'carousel' ? (
        <MovieCarousel
          title={query ? `Results for "${query}"` : 'Browse Catalog'}
          movies={processedMovies}
          loading={loading}
          onMovieClick={setSelectedMovie}
        />
      ) : (
        <MovieGrid
          movies={processedMovies}
          loading={loading}
          onMovieClick={setSelectedMovie}
          emptyMessage={query ? `No titles found matching "${query}"` : 'No movies match the selected filters'}
        />
      )}

      {/* Movie Details Modal */}
      <MovieDetailsModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  )
}
