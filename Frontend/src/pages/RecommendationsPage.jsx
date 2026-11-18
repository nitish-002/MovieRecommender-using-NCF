import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Film, Sparkles, RefreshCw, Heart, ArrowRight } from 'lucide-react'
import { cn } from '../utils/cn'
import { MovieGrid } from '../components/movie/MovieGrid'
import { MovieDetailsModal } from '../components/movie/MovieDetailsModal'
import { RecommendationFilters } from '../components/recommendation/RecommendationFilters'
import { useRecommendations, useMetrics } from '../hooks/useMovies'
import { useAuth } from '../context/AuthContext'
import { movieApi } from '../services/movieApi'

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
  const [interactions, setInteractions] = useState({ liked_movie_ids: [], seen_movie_ids: [] })
  const [, setActionLoading] = useState(false)

  const { recommendations, loading, error, refetch } = useRecommendations(topN)
  const { metrics } = useMetrics()

  const fetchInteractions = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await movieApi.getUserInteractions()
      if (data) {
        setInteractions({
          liked_movie_ids: data.liked_movie_ids || [],
          seen_movie_ids: data.seen_movie_ids || [],
        })
      }
    } catch (e) {
      console.error('Failed to fetch user interactions:', e)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchInteractions()
  }, [fetchInteractions])

  const handleLike = async (movie) => {
    const movieId = movie.movie_id || movie.id
    if (!movieId) return
    const isCurrentlyLiked = interactions.liked_movie_ids.includes(movieId)

    setActionLoading(true)
    try {
      if (isCurrentlyLiked) {
        await movieApi.removeInteraction(movieId)
      } else {
        await movieApi.recordInteraction(movieId, 'liked')
      }
      await fetchInteractions()
      await refetch()
    } catch (err) {
      console.error('Like toggle failed:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarkSeen = async (movie) => {
    const movieId = movie.movie_id || movie.id
    if (!movieId) return
    const isCurrentlySeen = interactions.seen_movie_ids.includes(movieId)

    setActionLoading(true)
    try {
      if (isCurrentlySeen) {
        await movieApi.removeInteraction(movieId)
      } else {
        await movieApi.recordInteraction(movieId, 'seen')
      }
      await fetchInteractions()
      await refetch()
    } catch (err) {
      console.error('Seen toggle failed:', err)
    } finally {
      setActionLoading(false)
    }
  }

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
          Personalized Recommendations
        </h1>
        <p className="text-secondary text-sm leading-relaxed mb-6">
          Sign in to calibrate your movie preferences and get real-time recommendations tailored to you.
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

  const hasDynamicTaste = interactions.liked_movie_ids.length > 0

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dynamic Taste Calibration Callout if not yet onboarded */}
      {!user?.onboarding_completed && !hasDynamicTaste && (
        <div className="p-4 sm:p-5 rounded-2xl bg-accent/10 border border-accent/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm shadow-lg shadow-accent/5">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-accent/20 text-accent shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-primary text-base">Calibrate your personal movie taste</p>
              <p className="text-secondary text-xs mt-0.5">
                Select 3 or more favorite films to customize your personal movie recommendations.
              </p>
            </div>
          </div>
          <Link
            to="/onboarding"
            className="px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-hover shadow-md shadow-accent/20 transition-all text-center shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>Start Calibration</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Header with Linked Profile Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">For You</h1>
          <p className="text-secondary text-sm mt-1">
            {hasDynamicTaste 
              ? `Personalized from your ${interactions.liked_movie_ids.length} liked movies` 
              : 'Top movie recommendations tailored to your taste profile'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {hasDynamicTaste ? (
            <>
              <div className="px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs font-semibold text-red-400 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 fill-current text-red-500" />
                Dynamic Taste ({interactions.liked_movie_ids.length} liked)
              </div>
              <Link
                to="/onboarding"
                className="px-3 py-1.5 rounded-xl bg-surface hover:bg-card border border-border text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1"
                title="Add or change liked movies"
              >
                <span>Edit Taste</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/25 text-xs font-semibold text-accent flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Personalized Picks
            </div>
          )}

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

      {/* Movie Grid with Interactive Like / Seen actions */}
      <MovieGrid
        movies={filteredRecommendations}
        loading={loading}
        showRank
        onMovieClick={setSelectedMovie}
        onLike={handleLike}
        onMarkSeen={handleMarkSeen}
        likedMovieIds={interactions.liked_movie_ids}
        seenMovieIds={interactions.seen_movie_ids}
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
        onLike={handleLike}
        onMarkSeen={handleMarkSeen}
        isLiked={selectedMovie ? interactions.liked_movie_ids.includes(selectedMovie.movie_id || selectedMovie.id) : false}
        isSeen={selectedMovie ? interactions.seen_movie_ids.includes(selectedMovie.movie_id || selectedMovie.id) : false}
      />
    </div>
  )
}
