import { useState, useEffect, useRef } from 'react'
import { X, Film, Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { movieApi } from '../../services/movieApi'

export function MovieSearch({ 
  onSelect, 
  placeholder = 'Search by title, genre, keyword...',
  className = '',
  showInModal = false
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await movieApi.searchMovies(query.trim(), 8)
        setResults(data || [])
        setShowDropdown(true)
      } catch (err) {
        console.error('Search error:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 280)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e) => {
    if (!showDropdown || !results.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault()
        handleSelect(results[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const handleSelect = (movie) => {
    setQuery(movie.title)
    setShowDropdown(false)
    onSelect?.(movie)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowDropdown(false)
  }

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      <div className="relative">
        <svg 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary h-4 w-4 pointer-events-none" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full pl-11 pr-11 py-2.5 rounded-xl text-sm',
            'bg-surface border border-border text-primary placeholder:text-secondary/70',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
            'transition-all duration-200'
          )}
        />

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <Loader2 className="animate-spin h-4 w-4 text-accent" />
          )}
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-secondary hover:text-primary rounded-lg transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {showDropdown && results.length > 0 && (
        <div
          className={cn(
            'absolute z-50 left-0 right-0 mt-2 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-scale-in',
            showInModal ? 'max-h-56' : 'max-h-80',
            'overflow-y-auto'
          )}
        >
          {results.map((movie, index) => (
            <button
              key={`${movie.movie_id || movie.id}-${index}`}
              type="button"
              onClick={() => handleSelect(movie)}
              className={cn(
                'w-full px-4 py-3 text-left flex items-center gap-3.5 transition-colors cursor-pointer',
                'border-b border-border/50 last:border-b-0',
                selectedIndex === index ? 'bg-surface text-primary' : 'hover:bg-surface/80 text-secondary'
              )}
            >
              <div className="relative h-12 w-9 rounded-lg overflow-hidden bg-surface shrink-0 border border-border/60">
                {movie.poster_url ? (
                  <img src={movie.poster_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="h-4 w-4 text-border" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-primary truncate">{movie.title}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-secondary truncate">
                  {movie.year && <span>{movie.year}</span>}
                  {movie.genres?.length > 0 && (
                    <span>• {movie.genres.slice(0, 2).join(', ')}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
