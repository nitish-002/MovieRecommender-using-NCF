import { useState } from 'react'
import { Sparkles, Star, Film, Bookmark, Heart, Eye } from 'lucide-react'
import { cn } from '../../utils/cn'
import { LoadingSkeleton } from '../ui/SharedComponents'

export function MovieCard({ 
  movie, 
  rank, 
  score, 
  onClick, 
  onPredict, 
  onLike,
  onMarkSeen,
  isLiked = false,
  isSeen = false,
  variant = 'default',
  className = ''
}) {
  const [predicting, setPredicting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  if (!movie) {
    return <LoadingSkeleton variant="poster" className="aspect-[2/3]" />
  }

  const genres = movie.genres || []
  const displayGenres = genres.slice(0, 2)
  const hasMoreGenres = genres.length > 2

  const handlePredict = async (e) => {
    e.stopPropagation()
    if (onPredict) {
      setPredicting(true)
      try {
        await onPredict(movie.movie_id)
      } finally {
        setPredicting(false)
      }
    }
  }

  const handleToggleSave = (e) => {
    e.stopPropagation()
    setIsSaved(!isSaved)
  }

  return (
    <article
      className={cn(
        'group relative bg-card rounded-2xl overflow-hidden',
        'border border-border/80 transition-all duration-300',
        'hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1',
        'cursor-pointer flex flex-col',
        variant === 'compact' && 'max-w-xs',
        variant === 'hero' && 'max-w-lg',
        className
      )}
      onClick={() => onClick?.(movie)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(movie)
        }
      }}
      role="button"
      aria-label={`View details for ${movie.title}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-surface to-card text-center">
            <Film className="h-10 w-10 text-border mb-2" />
            <span className="text-xs text-secondary/70 line-clamp-2">{movie.title}</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {rank !== undefined && (
            <span className="bg-accent text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md shadow-accent/30">
              #{rank}
            </span>
          )}
        </div>

        {score !== undefined && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              {typeof score === 'number' ? (score <= 1 ? `${Math.round(score * 100)}%` : score.toFixed(1)) : score}
            </span>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          'flex flex-col justify-end p-3.5 z-10'
        )}>
          <div className="flex items-center gap-1.5">
            {onPredict && (
              <button
                type="button"
                onClick={handlePredict}
                disabled={predicting}
                className={cn(
                  'flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold',
                  'transition-all duration-200 focus-visible-ring cursor-pointer',
                  'bg-accent text-white hover:bg-accent-hover shadow-md shadow-accent/30',
                  'disabled:opacity-50 flex items-center justify-center gap-1'
                )}
                title="Predict your neural affinity for this movie"
              >
                {predicting ? (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Predict</span>
                  </>
                )}
              </button>
            )}

            {onLike && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onLike(movie)
                }}
                className={cn(
                  'p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer',
                  isLiked
                    ? 'bg-red-500/25 text-red-500 border border-red-500/50 shadow-md shadow-red-500/20'
                    : 'bg-surface/80 text-secondary hover:text-red-400 hover:bg-white/15'
                )}
                aria-label={isLiked ? 'Unlike movie' : 'Like and add to my taste'}
                title={isLiked ? 'Liked (in taste profile)' : 'Like & add to taste profile'}
              >
                <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
              </button>
            )}

            {onMarkSeen && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkSeen(movie)
                }}
                className={cn(
                  'p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer',
                  isSeen
                    ? 'bg-cyan-500/25 text-cyan-400 border border-cyan-500/50 shadow-md shadow-cyan-500/20'
                    : 'bg-surface/80 text-secondary hover:text-cyan-400 hover:bg-white/15'
                )}
                aria-label={isSeen ? 'Marked as seen' : 'Mark as already seen'}
                title={isSeen ? 'Already seen (excluded from recs)' : 'Mark as already seen'}
              >
                <Eye className={cn('h-4 w-4', isSeen && 'stroke-[2.5]')} />
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleSave}
              className={cn(
                'p-2 rounded-xl backdrop-blur-md transition-colors cursor-pointer',
                isSaved 
                  ? 'bg-accent/20 text-accent border border-accent/40' 
                  : 'bg-surface/80 text-secondary hover:text-primary hover:bg-white/15'
              )}
              aria-label={isSaved ? 'Remove from saved' : 'Save movie'}
              title={isSaved ? 'Saved in watchlist' : 'Save to watchlist'}
            >
              <Bookmark className={cn('h-4 w-4', isSaved && 'fill-current')} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-primary text-sm line-clamp-1 group-hover:text-accent transition-colors" title={movie.title}>
            {movie.title}
          </h3>
          {movie.year && (
            <p className="text-[11px] text-secondary mt-0.5">{movie.year}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          {displayGenres.map((genre) => (
            <span 
              key={genre} 
              className="px-2 py-0.5 bg-surface text-[10px] font-medium text-secondary rounded-md border border-border/60"
            >
              {genre}
            </span>
          ))}
          {hasMoreGenres && (
            <span className="text-[10px] text-secondary/70">
              +{genres.length - 2}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
