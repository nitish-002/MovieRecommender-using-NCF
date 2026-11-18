import { useState, useEffect } from 'react'
import { Calendar, Film, Sparkles, Star, X, Heart, Eye } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Modal, LoadingSkeleton, Button } from '../ui/SharedComponents'
import { movieApi } from '../../services/movieApi'
import { usePrediction } from '../../hooks/usePrediction'
import { useAuth } from '../../context/AuthContext'

export function MovieDetailsModal({ 
  movie, 
  isOpen, 
  onClose, 
  onPredict,
  onLike,
  onMarkSeen,
  isLiked = false,
  isSeen = false,
  recommendationScore 
}) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { predict, predicting, prediction, error: predictError, clearPrediction } = usePrediction()

  useEffect(() => {
    if (isOpen && movie) {
      clearPrediction()
      setLoading(true)
      movieApi.getMovie(movie.movie_id || movie.id)
        .then((data) => setDetails(data))
        .catch(() => setDetails(movie))
        .finally(() => setLoading(false))
    } else {
      setDetails(null)
      clearPrediction()
    }
  }, [isOpen, movie, clearPrediction])

  const handlePredictClick = async () => {
    const movieId = movie?.movie_id || movie?.id
    if (!movieId) return

    if (onPredict) {
      await onPredict(movieId)
    } else {
      await predict(movieId)
    }
  }

  if (!isOpen || !movie) return null

  const movieData = details || movie
  const genres = movieData.genres || []
  const effectiveScore = prediction?.score ?? prediction?.preference_score ?? recommendationScore ?? movie.preference_score ?? movie.score

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-1.5 rounded-full bg-surface text-secondary hover:text-primary hover:bg-card border border-border transition-colors z-20 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Movie Poster */}
          <div className="md:col-span-5">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-surface border border-border shadow-xl">
              {loading ? (
                <LoadingSkeleton variant="poster" className="w-full h-full" />
              ) : movieData.poster_url ? (
                <img
                  src={movieData.poster_url}
                  alt={movieData.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-surface to-card">
                  <Film className="h-16 w-16 text-border mb-3" />
                  <p className="text-sm font-medium text-secondary">{movieData.title}</p>
                </div>
              )}

              {effectiveScore !== undefined && effectiveScore !== null && (
                <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-white text-sm font-bold">
                    {effectiveScore <= 1 ? `${Math.round(effectiveScore * 100)}% Match` : effectiveScore.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details & Actions */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-primary leading-tight">
                  {movieData.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-secondary">
                  {movieData.year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-secondary" />
                      {movieData.year}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-surface border border-border">
                    ID: {movieData.movie_id || movieData.id}
                  </span>
                </div>
              </div>

              {genres.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Genres</span>
                  <div className="flex flex-wrap gap-1.5">
                    {genres.map((g) => (
                      <span
                        key={g}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-surface text-primary border border-border"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movieData.overview ? (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Overview</span>
                  <p className="text-sm text-secondary/90 leading-relaxed line-clamp-4">
                    {movieData.overview}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-secondary/70 italic">
                  No synopsis available in dataset.
                </p>
              )}

              {/* Live Prediction result if triggered in modal */}
              {prediction && (
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/25 space-y-2 animate-scale-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Predicted Affinity
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {Math.round((prediction.score ?? prediction.preference_score ?? 0) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(Math.max((prediction.score ?? prediction.preference_score ?? 0) * 100, 5), 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-secondary">
                    Based on user profile #{user?.movie_lens_user_id || 'guest'} interaction history
                  </p>
                </div>
              )}

              {predictError && (
                <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  {predictError}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-border flex flex-wrap gap-2.5">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    onClick={handlePredictClick}
                    loading={predicting}
                  >
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Predict Preference
                  </Button>

                  {onLike && (
                    <button
                      type="button"
                      onClick={() => onLike(movie)}
                      className={cn(
                        'px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border',
                        isLiked
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-md shadow-red-500/15'
                          : 'bg-surface text-secondary hover:text-red-400 border-border hover:bg-card'
                      )}
                    >
                      <Heart className={cn('h-4 w-4', isLiked && 'fill-current text-red-500')} />
                      <span>{isLiked ? 'Liked' : 'Like'}</span>
                    </button>
                  )}

                  {onMarkSeen && (
                    <button
                      type="button"
                      onClick={() => onMarkSeen(movie)}
                      className={cn(
                        'px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border',
                        isSeen
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-md shadow-cyan-500/15'
                          : 'bg-surface text-secondary hover:text-cyan-400 border-border hover:bg-card'
                      )}
                    >
                      <Eye className={cn('h-4 w-4', isSeen && 'stroke-[2.5] text-cyan-400')} />
                      <span>{isSeen ? 'Seen' : 'Mark Seen'}</span>
                    </button>
                  )}
                </>
              ) : (
                <a
                  href="/login"
                  className="flex-1 py-2.5 px-4 text-center rounded-xl text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
                >
                  Sign in to Predict
                </a>
              )}
              <Button
                variant="secondary"
                size="md"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
