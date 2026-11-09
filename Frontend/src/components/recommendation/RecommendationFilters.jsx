import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { cn } from '../../utils/cn'
import { MovieCard } from '../movie/MovieCard'

const TOP_N_OPTIONS = [5, 10, 20, 50]

export function RecommendationFilters({ 
  topN = 10, 
  onTopNChange, 
  genres = [], 
  selectedGenres = [], 
  onGenreToggle,
  onClearGenres,
  loading = false,
  className = ''
}) {
  return (
    <div className={cn('bg-surface/50 rounded-2xl p-4 sm:p-5 border border-border space-y-4', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Top N selection */}
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-accent shrink-0" />
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Recommendations:</span>
          <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border">
            {TOP_N_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onTopNChange?.(n)}
                disabled={loading}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
                  topN === n 
                    ? 'bg-accent text-white shadow-sm shadow-accent/30' 
                    : 'text-secondary hover:text-primary hover:bg-surface'
                )}
              >
                Top {n}
              </button>
            ))}
          </div>
        </div>

        {selectedGenres.length > 0 && onClearGenres && (
          <button
            type="button"
            onClick={onClearGenres}
            className="flex items-center gap-1.5 text-xs text-secondary hover:text-accent transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset genre filters ({selectedGenres.length})
          </button>
        )}
      </div>

      {genres.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/60">
          <span className="text-xs font-medium text-secondary">Filter by Genre:</span>
          <div className="flex flex-wrap gap-1.5">
            {genres.map((genre) => {
              const isSelected = selectedGenres.includes(genre)
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => onGenreToggle?.(genre)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer select-none',
                    isSelected
                      ? 'bg-accent text-white shadow-sm shadow-accent/25 border border-accent'
                      : 'bg-card text-secondary border border-border hover:text-primary hover:border-accent/40'
                  )}
                >
                  {genre}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function RecommendationSection({ 
  title, 
  subtitle,
  movies = [], 
  onMovieClick, 
  onPredict, 
  loading = false,
  emptyMessage,
  showRank = false 
}) {
  if (loading) {
    return (
      <section className="space-y-3.5 animate-slide-up">
        <div className="h-6 w-48 bg-surface rounded-lg animate-pulse" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-surface rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (!movies?.length) {
    return (
      <section className="space-y-3.5 animate-slide-up">
        {title && <h2 className="text-xl font-bold text-primary">{title}</h2>}
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-surface/30 rounded-2xl border border-border">
          <p className="text-sm font-medium text-primary mb-1">{emptyMessage || 'No recommendations found'}</p>
          <p className="text-xs text-secondary">Try selecting different filters</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-3.5 animate-slide-up">
      {title && (
        <div>
          <h2 className="text-xl font-bold text-primary">{title}</h2>
          {subtitle && <p className="text-xs text-secondary mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div 
        className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        role="list"
      >
        {movies.map((movie, index) => (
          <MovieCard
            key={`${movie.movie_id || movie.id}-${index}`}
            movie={movie}
            rank={showRank ? index + 1 : undefined}
            score={movie.preference_score ?? movie.score}
            onClick={onMovieClick}
            onPredict={onPredict}
          />
        ))}
      </div>
    </section>
  )
}
