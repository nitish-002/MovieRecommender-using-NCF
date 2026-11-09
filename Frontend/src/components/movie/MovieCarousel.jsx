import { useRef, useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MovieCard } from './MovieCard'
import { LoadingSkeleton } from '../ui/SharedComponents'
import { cn } from '../../utils/cn'

export function MovieCarousel({ 
  title, 
  subtitle,
  movies = [], 
  onMovieClick, 
  onPredict, 
  showRank = false,
  loading = false,
  className = ''
}) {
  const scrollRef = useRef(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 10)
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10)
    }
  }, [])

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    checkScroll()
    const container = scrollRef.current
    if (!container) return
    container.addEventListener('scroll', checkScroll, { passive: true })
    return () => container.removeEventListener('scroll', checkScroll)
  }, [checkScroll, movies.length])

  if (!loading && (!movies || movies.length === 0)) return null

  return (
    <section className={cn('relative space-y-3.5', className)} aria-label={title}>
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="text-xl font-bold text-primary tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-secondary mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!showLeftArrow}
            className={cn(
              'p-2 rounded-xl bg-surface border border-border text-secondary',
              'hover:text-primary hover:bg-card hover:border-accent/40 transition-all cursor-pointer',
              'disabled:opacity-20 disabled:cursor-not-allowed'
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!showRightArrow}
            className={cn(
              'p-2 rounded-xl bg-surface border border-border text-secondary',
              'hover:text-primary hover:bg-card hover:border-accent/40 transition-all cursor-pointer',
              'disabled:opacity-20 disabled:cursor-not-allowed'
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 pt-1 -mx-2 px-2"
        role="list"
        aria-label={title}
      >
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="w-44 sm:w-48 shrink-0 space-y-2">
                <LoadingSkeleton variant="poster" className="w-full aspect-[2/3] rounded-2xl" />
                <LoadingSkeleton variant="title" className="h-4 w-3/4" />
                <LoadingSkeleton variant="text" className="h-3 w-1/2" />
              </div>
            ))
          : movies.map((movie, index) => (
              <div key={`${movie.movie_id || movie.id}-${index}`} className="w-44 sm:w-48 shrink-0">
                <MovieCard
                  movie={movie}
                  rank={showRank ? index + 1 : undefined}
                  score={movie.preference_score ?? movie.score}
                  onClick={onMovieClick}
                  onPredict={onPredict}
                />
              </div>
            ))}
      </div>
    </section>
  )
}
