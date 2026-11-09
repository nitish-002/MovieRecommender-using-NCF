import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export function GenreChip({ genre, selected, onClick, removable = false, onRemove }) {
  if (removable) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
          'bg-accent/15 text-accent border border-accent/30 animate-fade-in'
        )}
      >
        {genre}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="p-0.5 rounded-full hover:bg-accent/20 text-accent transition-colors cursor-pointer"
            aria-label={`Remove ${genre}`}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
        'transition-all duration-200 focus-visible-ring cursor-pointer select-none',
        selected
          ? 'bg-accent text-white shadow-md shadow-accent/25 border border-accent'
          : 'bg-surface/80 text-secondary border border-border hover:text-primary hover:border-accent/40 hover:bg-card'
      )}
    >
      {genre}
    </button>
  )
}

export function GenreFilterChips({ genres, selectedGenres, onToggle, className = '' }) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} role="group" aria-label="Genre filters">
      {genres.map((genre) => (
        <GenreChip
          key={genre}
          genre={genre}
          selected={selectedGenres.includes(genre)}
          onClick={() => onToggle(genre)}
        />
      ))}
    </div>
  )
}
