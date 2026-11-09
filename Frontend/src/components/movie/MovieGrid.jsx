import { Film } from 'lucide-react'
import { MovieCard } from './MovieCard'
import { LoadingSkeleton } from '../ui/SharedComponents'
import { cn } from '../../utils/cn'

export function MovieGrid({ 
  movies, 
  onMovieClick, 
  onPredict, 
  showRank = false,
  loading = false,
  emptyMessage = 'No movies found',
  className = ''
}) {
  const gridClasses = cn(
    'grid gap-4 sm:gap-5',
    'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
    className
  )

  if (loading) {
    return (
      <div className={gridClasses}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className="space-y-2">
            <LoadingSkeleton variant="poster" className="w-full aspect-[2/3] rounded-2xl" />
            <LoadingSkeleton variant="title" className="h-4 w-4/5" />
            <LoadingSkeleton variant="text" className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (!movies?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface/30 rounded-2xl border border-border">
        <div className="p-4 rounded-2xl bg-card border border-border/60 text-secondary mb-3">
          <Film className="h-8 w-8" />
        </div>
        <h3 className="text-base font-semibold text-primary mb-1">{emptyMessage}</h3>
        <p className="text-secondary text-xs max-w-sm">
          Try adjusting your search query or selecting different genre filters
        </p>
      </div>
    )
  }

  return (
    <div className={gridClasses} role="list" aria-label="Movie grid">
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
  )
}
