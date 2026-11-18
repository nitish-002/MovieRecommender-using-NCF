import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowRight, Info, Sparkles, Film, X, Loader2 } from 'lucide-react'
import { cn } from '../utils/cn'
import { MovieSearch } from '../components/movie/MovieSearch'
import { PredictionResult } from '../components/prediction/PredictionResult'
import { usePrediction } from '../hooks/usePrediction'
import { useAuth } from '../context/AuthContext'

export function PredictorPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [selectedMovie, setSelectedMovie] = useState(null)
  const { predict, predicting, prediction, error, clearPrediction } = usePrediction()

  useEffect(() => {
    clearPrediction()
  }, [clearPrediction])

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie)
    clearPrediction()
  }

  const handlePredict = async () => {
    if (selectedMovie) {
      await predict(selectedMovie.movie_id || selectedMovie.id)
    }
  }

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
          <Brain className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">
          Movie Match Predictor
        </h1>
        <p className="text-secondary text-sm leading-relaxed mb-6">
          Find out how likely you are to enjoy any specific movie based on your personal taste profile.
        </p>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/25 transition-all"
        >
          Sign In to Test Predictions
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Personalized Scoring
        </div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Movie Match Predictor</h1>
        <p className="text-secondary text-sm max-w-md mx-auto">
          Search for any movie to calculate your personalized match score.
        </p>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border/80 space-y-6 shadow-xl">
        {/* User Profile Badge */}
        <div className="flex items-center justify-between p-3.5 bg-surface/70 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent font-bold text-xs">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-xs text-primary">{user?.email}</p>
              <p className="text-[11px] text-accent font-medium">Personalized Taste Profile</p>
            </div>
          </div>
          <span className="text-[10px] text-secondary px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-medium">
            Active
          </span>
        </div>

        {/* Movie Search Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-secondary uppercase tracking-wider">
            Choose Movie
          </label>
          <MovieSearch
            placeholder="Type a title (e.g., Inception, The Matrix, Toy Story)..."
            onSelect={handleMovieSelect}
          />
        </div>

        {/* Selected Movie Preview */}
        {selectedMovie && (
          <div className="bg-surface/90 rounded-2xl p-4 border border-border/80 animate-scale-in flex items-center justify-between gap-4">
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
                  {selectedMovie.genres?.slice(0, 3).join(', ') || 'General'}
                  {selectedMovie.year && ` • ${selectedMovie.year}`}
                </p>
                <span className="inline-block mt-1 text-[10px] text-secondary px-2 py-0.5 rounded bg-card border border-border">
                  ID #{selectedMovie.movie_id || selectedMovie.id}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedMovie(null)
                clearPrediction()
              }}
              className="p-1.5 text-secondary hover:text-primary hover:bg-card rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Remove movie"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Prediction Execution Button */}
        <button
          type="button"
          onClick={handlePredict}
          disabled={!selectedMovie || predicting}
          className={cn(
            'w-full py-3 px-6 rounded-xl font-semibold text-sm',
            'flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer',
            'focus-visible-ring disabled:opacity-40 disabled:cursor-not-allowed',
            selectedMovie && !predicting
              ? 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/25 active:scale-[0.99]'
              : 'bg-surface text-secondary border border-border'
          )}
        >
          {predicting ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Running NeuMF Forward Pass...</span>
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              <span>Predict Preference Score</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </button>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Prediction Output Result */}
      {prediction && (
        <PredictionResult prediction={prediction} onClose={clearPrediction} />
      )}

      {/* Explainer Accordion */}
      <div className="bg-surface/50 rounded-2xl p-5 border border-border space-y-3">
        <h4 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
          <Info className="h-4 w-4 text-accent" />
          How NeuMF Computes This Score
        </h4>
        <div className="grid gap-2 sm:grid-cols-2 text-xs text-secondary/90 leading-relaxed">
          <div className="bg-card/70 p-3 rounded-xl border border-border/60">
            <strong className="text-primary block mb-1">1. Latent Interaction</strong>
            GMF calculates the element-wise product of user and movie embedding vectors.
          </div>
          <div className="bg-card/70 p-3 rounded-xl border border-border/60">
            <strong className="text-primary block mb-1">2. Non-Linear Patterns</strong>
            Multi-Layer Perceptron (MLP) layers (64→32→16→8) capture complex user-item non-linearities.
          </div>
          <div className="bg-card/70 p-3 rounded-xl border border-border/60">
            <strong className="text-primary block mb-1">3. Fusion Layer</strong>
            Outputs are concatenated and fed into a sigmoid output neuron producing the predicted probability score.
          </div>
          <div className="bg-card/70 p-3 rounded-xl border border-border/60">
            <strong className="text-primary block mb-1">4. Threshold Meaning</strong>
            A score above 50% indicates probability that the user rates this movie &gt;= 3.5 stars.
          </div>
        </div>
      </div>
    </div>
  )
}
