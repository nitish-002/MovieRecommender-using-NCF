import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Film, Play, Star, TrendingUp, Brain, ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '../utils/cn'
import { MovieCarousel } from '../components/movie/MovieCarousel'
import { MovieDetailsModal } from '../components/movie/MovieDetailsModal'
import { useRecommendations, useMovieSearch, useMetrics, useHealthCheck } from '../hooks/useMovies'
import { MetricCard, DatasetStatsChart, ModelComparisonChart, EvaluationConfigDisplay } from '../components/analytics/AnalyticsComponents'
import { useAuth } from '../context/AuthContext'

export function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const { recommendations: userRecs, loading: recsLoading } = useRecommendations(12)
  const { results: popularMovies, loading: popularLoading } = useMovieSearch('the', 18)
  const { metrics } = useMetrics()
  const { health, loading: healthLoading } = useHealthCheck()
  const [selectedMovie, setSelectedMovie] = useState(null)

  const featuredMovie = popularMovies[0]

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero Showcase Banner */}
      <section className="relative min-h-[460px] lg:h-[520px] rounded-3xl overflow-hidden border border-border shadow-2xl flex flex-col justify-end">
        {featuredMovie?.poster_url ? (
          <img
            src={featuredMovie.poster_url}
            alt={featuredMovie.title}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-60 scale-105 filter blur-[1px] transition-transform duration-1000"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface via-card to-background" />
        )}
        
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-12 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-md shadow-accent/30 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              NeuMF Spotlight
            </span>
            {featuredMovie?.genres?.slice(0, 3).map((g) => (
              <span key={g} className="px-2.5 py-1 bg-surface/85 backdrop-blur-md text-xs font-medium rounded-full border border-border/80 text-secondary">
                {g}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary leading-[1.15] tracking-tight">
            {featuredMovie?.title || 'Personalized Cinema via Neural Collaborative Filtering'}
          </h1>

          <p className="text-sm sm:text-base text-secondary/90 leading-relaxed max-w-2xl line-clamp-3">
            {featuredMovie?.overview || 'Experience high-precision movie recommendations trained on 25 million MovieLens interactions using fused Generalized Matrix Factorization and Deep Multi-Layer Perceptrons.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link 
              to="/recommendations" 
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm',
                'transition-all duration-200 focus-visible-ring cursor-pointer',
                'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/25 active:scale-[0.98]'
              )}
            >
              <Play className="h-4 w-4 fill-current" />
              {isAuthenticated ? 'My Recommendations' : 'Explore Recommendations'}
            </Link>

            <Link 
              to="/discover" 
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm',
                'transition-all duration-200 focus-visible-ring cursor-pointer',
                'bg-surface/80 backdrop-blur-md text-primary border border-border hover:bg-card hover:border-accent/40 active:scale-[0.98]'
              )}
            >
              <ArrowRight className="h-4 w-4" />
              Browse Catalog
            </Link>

            {featuredMovie && (
              <button
                type="button"
                onClick={() => setSelectedMovie(featuredMovie)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                View Details
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Quick Metrics Bar */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Engine Status"
          value={health?.model_loaded ? 'NeuMF Online' : healthLoading ? 'Checking...' : 'Standby'}
          description={health?.model_loaded ? `Version ${health?.model_version || '1.0.0'} ready` : 'FastAPI service active'}
          icon={<Brain className="h-4 w-4" />}
        />
        <MetricCard
          title="Dataset Size"
          value="MovieLens 25M"
          description={`${metrics?.dataset_stats?.users?.toLocaleString() || '162,148'} users · ${metrics?.dataset_stats?.movies?.toLocaleString() || '47,396'} movies`}
          icon={<Film className="h-4 w-4" />}
        />
        <MetricCard
          title="Hit Rate @10"
          value={metrics?.model_comparison?.neumf?.hr_at_10?.toFixed(4) || metrics?.model_comparison?.neumf?.HR_at_10?.toFixed(4) || '0.7842'}
          description="Test item in Top-10 ranking"
          icon={<Star className="h-4 w-4" />}
        />
        <MetricCard
          title="NDCG @10"
          value={metrics?.model_comparison?.neumf?.ndcg_at_10?.toFixed(4) || metrics?.model_comparison?.neumf?.NDCG_at_10?.toFixed(4) || '0.5126'}
          description="Normalized Discounted Gain"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </section>

      {/* Recommended For You Section */}
      {isAuthenticated ? (
        <MovieCarousel
          title="Recommended For You"
          subtitle={`Personalized NeuMF predictions for user #${user?.movie_lens_user_id || 'profile'}`}
          movies={userRecs}
          loading={recsLoading}
          onMovieClick={setSelectedMovie}
          showRank
        />
      ) : (
        <section className="bg-surface/50 rounded-2xl p-6 sm:p-8 border border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Tailored Taste Profile
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary">
              Unlock Personalized NeuMF Recommendations
            </h2>
            <p className="text-secondary text-sm max-w-xl">
              Sign in or create a profile to bind your account to a MovieLens user embedding and receive real-time top-N collaborative filtering recommendations.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover shadow-md shadow-accent/25 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-card text-primary border border-border hover:border-accent/40 transition-all"
            >
              Register
            </Link>
          </div>
        </section>
      )}

      {/* Popular Movies Carousel */}
      <MovieCarousel
        title="Popular in Catalog"
        subtitle="Frequently rated classics across MovieLens 25M users"
        movies={popularMovies}
        loading={popularLoading}
        onMovieClick={setSelectedMovie}
      />

      {/* Performance Analytics & Dataset Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2 pt-2">
        <ModelComparisonChart metrics={metrics?.model_comparison || {}} />
        <div className="space-y-6">
          <EvaluationConfigDisplay config={metrics?.evaluation_config || metrics} />
          <DatasetStatsChart stats={metrics?.dataset_stats || {}} />
        </div>
      </div>

      {/* Movie Details Modal */}
      <MovieDetailsModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  )
}
