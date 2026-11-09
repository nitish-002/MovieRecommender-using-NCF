import { useState, useCallback } from 'react'
import { X, Brain, ArrowRight, Film, Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { MovieSearch } from '../movie/MovieSearch'
import { PredictionResult } from './PredictionResult'

export function PreferenceForm({ 
  users = [], 
  selectedUserId, 
  onUserChange, 
  onPredict, 
  predicting,
  prediction 
}) {
  const [selectedMovie, setSelectedMovie] = useState(null)

  const handleUserChange = useCallback((userId) => {
    onUserChange(userId)
    setSelectedMovie(null)
  }, [onUserChange])

  const handleMovieSelect = useCallback((movie) => {
    setSelectedMovie(movie)
  }, [])

  const handlePredict = useCallback(async () => {
    if (selectedMovie && onPredict) {
      await onPredict(selectedMovie.movie_id || selectedMovie.id)
    }
  }, [selectedMovie, onPredict])

  return (
    <div className="space-y-6">
      {/* Profile Selector if multiple users available */}
      {users.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-secondary uppercase tracking-wider">
            Target User Profile
          </label>
          <select
            value={selectedUserId || ''}
            onChange={(e) => handleUserChange(e.target.value ? Number(e.target.value) : null)}
            className={cn(
              'w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm',
              'text-primary focus:outline-none focus:ring-2 focus:ring-accent',
              'cursor-pointer'
            )}
          >
            <option value="">Select a user profile...</option>
            {users.map((u) => (
              <option key={u.id || u.movie_lens_user_id} value={u.movie_lens_user_id}>
                {u.email} (MovieLens ID: #{u.movie_lens_user_id})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Movie Search Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-secondary uppercase tracking-wider">
          Search Movie from MovieLens 25M Catalog
        </label>
        <MovieSearch
          placeholder="Search movie title (e.g., Matrix, Interstellar, Pulp Fiction)..."
          onSelect={handleMovieSelect}
        />
      </div>

      {/* Selected Movie Preview Card */}
      {selectedMovie && (
        <div className="bg-surface/80 rounded-2xl p-4 border border-border/80 animate-scale-in flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative h-16 w-11 rounded-xl overflow-hidden bg-surface shrink-0 border border-border">
              {selectedMovie.poster_url ? (
                <img src={selectedMovie.poster_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="h-5 w-5 text-border" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm text-primary truncate">{selectedMovie.title}</h4>
              <p className="text-xs text-secondary truncate mt-0.5">
                {selectedMovie.genres?.slice(0, 3).join(', ') || 'No genres'}
                {selectedMovie.year && ` • ${selectedMovie.year}`}
              </p>
              <span className="inline-block mt-1 text-[10px] text-secondary px-2 py-0.5 rounded bg-card border border-border">
                ID #{selectedMovie.movie_id || selectedMovie.id}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedMovie(null)}
            className="p-1.5 text-secondary hover:text-primary hover:bg-card rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Remove selected movie"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        onClick={handlePredict}
        disabled={!selectedMovie || predicting || !selectedUserId}
        className={cn(
          'w-full py-3 px-6 rounded-xl font-semibold text-sm',
          'flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer',
          'focus-visible-ring disabled:opacity-40 disabled:cursor-not-allowed',
          selectedMovie && selectedUserId && !predicting
            ? 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/25 active:scale-[0.99]'
            : 'bg-surface text-secondary border border-border'
        )}
      >
        {predicting ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Calculating Latent Embeddings...</span>
          </>
        ) : (
          <>
            <Brain className="h-4 w-4" />
            <span>Compute Affinity Score</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </>
        )}
      </button>

      {prediction && (
        <div className="pt-2">
          <PredictionResult prediction={prediction} />
        </div>
      )}
    </div>
  )
}
