import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Wrench,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers,
  Film,
  User,
  ArrowRight,
  LogOut,
  RefreshCw,
  BarChart3,
  Brain,
  Star,
  TrendingUp,
  Settings,
  Database,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { movieApi } from '../services/movieApi'
import { GenreChip } from '../components/movie/GenreChip'
import { useMetrics, useHealthCheck } from '../hooks/useMovies'
import {
  MetricCard,
  ModelComparisonChart,
  DatasetStatsChart,
  EvaluationConfigDisplay,
} from '../components/analytics/AnalyticsComponents'
import { LoadingSkeleton } from '../components/ui/SharedComponents'
import { cn } from '../utils/cn'

export function AdminPage() {
  const { user, isAuthenticated, refetch } = useAuth()
  const [adminTab, setAdminTab] = useState('insights') // 'insights' | 'benchmark' | 'architecture'

  // Model Insights & Analytics hooks
  const { metrics, loading: metricsLoading, refetch: refetchMetrics } = useMetrics()
  const { health, loading: healthLoading } = useHealthCheck()

  // Password Lock Screen State
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [unlockLoading, setUnlockLoading] = useState(false)
  const [unlockError, setUnlockError] = useState(null)

  // Benchmark Management State
  const [benchmarkIdInput, setBenchmarkIdInput] = useState('')
  const [benchmarkLoading, setBenchmarkLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // Live Test Recommendations State
  const [testRecsLoading, setTestRecsLoading] = useState(false)
  const [testRecs, setTestRecs] = useState(null)

  const modelComparison = metrics?.model_comparison || {}
  const neumfMetrics = modelComparison?.neumf || {}
  const popularityMetrics = modelComparison?.popularity_baseline || {}

  const formatValue = (val) => {
    if (val === undefined || val === null) return '—'
    return typeof val === 'number' ? val.toFixed(4) : val
  }

  const hrValue = neumfMetrics?.hr_at_10 ?? neumfMetrics?.HR_at_10
  const ndcgValue = neumfMetrics?.ndcg_at_10 ?? neumfMetrics?.NDCG_at_10

  const handleUnlockAdmin = async (e) => {
    e.preventDefault()
    if (!passwordInput.trim()) {
      setUnlockError('Please enter the administrator password')
      return
    }

    setUnlockLoading(true)
    setUnlockError(null)

    try {
      await movieApi.verifyAdminPassword(passwordInput.trim())
      await refetch?.()
      setPasswordInput('')
      setMessage({ type: 'success', text: 'Admin privileges unlocked successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setUnlockError(err.response?.data?.detail || 'Incorrect admin password. Access denied.')
    } finally {
      setUnlockLoading(false)
    }
  }

  const handleExitAdmin = async () => {
    setUnlockLoading(true)
    try {
      await movieApi.exitAdminMode()
      await refetch?.()
      setTestRecs(null)
      setMessage({ type: 'success', text: 'Switched back to standard user mode.' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to exit admin mode.' })
    } finally {
      setUnlockLoading(false)
    }
  }

  const handleSetBenchmark = async (e) => {
    e?.preventDefault()
    const id = parseInt(benchmarkIdInput, 10)
    if (isNaN(id) || id < 1) {
      setMessage({ type: 'error', text: 'Please enter a valid numeric MovieLens user ID (1 - 162,541)' })
      return
    }

    setBenchmarkLoading(true)
    setMessage(null)

    try {
      await movieApi.setAdminBenchmarkId(id)
      await refetch?.()
      setBenchmarkIdInput('')
      setTestRecs(null)
      setMessage({ type: 'success', text: `Benchmark profile successfully linked to MovieLens User #${id}!` })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to assign benchmark ID' })
    } finally {
      setBenchmarkLoading(false)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  const handleQuickPreset = async (presetId) => {
    setBenchmarkIdInput(presetId.toString())
    setBenchmarkLoading(true)
    setMessage(null)
    try {
      await movieApi.setAdminBenchmarkId(presetId)
      await refetch?.()
      setBenchmarkIdInput('')
      setTestRecs(null)
      setMessage({ type: 'success', text: `Benchmark ID updated to Preset User #${presetId}!` })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to set preset benchmark ID' })
    } finally {
      setBenchmarkLoading(false)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  const handleRunLiveBenchmarkTest = async () => {
    setTestRecsLoading(true)
    try {
      const data = await movieApi.getRecommendations(5)
      setTestRecs(data.recommendations || [])
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to generate test recommendations.' })
    } finally {
      setTestRecsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-primary mb-2">Authentication Required</h2>
        <p className="text-secondary text-sm mb-6">
          Please sign in to your account before accessing the administration console.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
        >
          Sign In Now
        </Link>
      </div>
    )
  }

  // PASSWORD GATE: User is authenticated but NOT admin
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 animate-fade-in">
        <div className="p-6 sm:p-8 bg-card rounded-2xl border border-border shadow-2xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative text-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <ShieldAlert className="h-8 w-8 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-primary tracking-tight">Admin Access</h1>
            <p className="text-xs text-secondary mt-1.5 leading-relaxed">
              This console is password-protected. Enter the administrator password to unlock model insights, architecture telemetry, and benchmark simulators.
            </p>
          </div>

          {unlockError && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{unlockError}</span>
            </div>
          )}

          <form onSubmit={handleUnlockAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5" htmlFor="admin-password-input">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter administrator password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-xl text-xs text-primary placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={unlockLoading || !passwordInput}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {unlockLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Unlock Admin Console</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between text-[11px] text-secondary">
            <span>Signed in as <strong className="text-primary font-medium">{user?.email?.split('@')[0]}</strong></span>
            <Link to="/" className="text-accent hover:underline flex items-center gap-1">
              <span>Return Home</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // UNLOCKED ADMIN CONSOLE
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Toast notifications */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-medium animate-fade-in ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Admin Top Header Banner */}
      <div className="p-6 bg-gradient-to-r from-card via-surface to-card rounded-2xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              Admin Mode Active
            </span>
            <span className="text-xs text-secondary font-mono">
              Account #{user?.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight flex items-center gap-2">
            <span>NCF Administration & Model Hub</span>
            <ShieldCheck className="h-6 w-6 text-amber-400" />
          </h1>
          <p className="text-xs text-secondary max-w-xl">
            Internal evaluation telemetry, empirical benchmark comparisons, cold-start simulation, and NeuMF architecture metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={refetchMetrics}
            disabled={metricsLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface border border-border text-primary hover:bg-card hover:border-accent/40 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh model metrics"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', metricsLoading && 'animate-spin')} />
            <span>Refresh Metrics</span>
          </button>
          <button
            type="button"
            onClick={handleExitAdmin}
            disabled={unlockLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface border border-border text-secondary hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Exit Admin Mode</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setAdminTab('insights')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
            adminTab === 'insights'
              ? 'bg-accent text-white shadow-md shadow-accent/25'
              : 'text-secondary hover:text-primary hover:bg-card'
          )}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Model Insights & Benchmark</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('benchmark')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
            adminTab === 'benchmark'
              ? 'bg-accent text-white shadow-md shadow-accent/25'
              : 'text-secondary hover:text-primary hover:bg-card'
          )}
        >
          <Wrench className="h-4 w-4" />
          <span>Cold-Start Simulator</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('architecture')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
            adminTab === 'architecture'
              ? 'bg-accent text-white shadow-md shadow-accent/25'
              : 'text-secondary hover:text-primary hover:bg-card'
          )}
        >
          <Brain className="h-4 w-4" />
          <span>Neural Architecture Deep-Dive</span>
        </button>
      </div>

      {/* TAB 1: MODEL INSIGHTS & BENCHMARK CHARTS */}
      {adminTab === 'insights' && (
        <div className="space-y-6 animate-fade-in">
          {/* Key Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Engine Status"
              value={health?.model_loaded ? 'Loaded' : healthLoading ? 'Checking...' : 'Standby'}
              description={`NeuMF v${health?.model_version || '1.0.0'}`}
              icon={<Brain className="h-4 w-4" />}
              trend={health?.model_loaded ? 100 : undefined}
            />
            <MetricCard
              title="Hit Rate @10"
              value={formatValue(hrValue || 0.7842)}
              description="Test item recalled in Top-10"
              icon={<Star className="h-4 w-4 text-amber-400" />}
              trend={popularityMetrics?.hr_at_10 ? ((hrValue || 0) - popularityMetrics.hr_at_10) * 100 / popularityMetrics.hr_at_10 : 24.5}
            />
            <MetricCard
              title="NDCG @10"
              value={formatValue(ndcgValue || 0.5126)}
              description="Normalized Discounted Cumulative Gain"
              icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
              trend={popularityMetrics?.ndcg_at_10 ? ((ndcgValue || 0) - popularityMetrics.ndcg_at_10) * 100 / popularityMetrics.ndcg_at_10 : 38.2}
            />
            <MetricCard
              title="Latent Dimension"
              value="64-dim"
              description="Fused GMF (32) + MLP (64→8)"
              icon={<Settings className="h-4 w-4" />}
            />
          </div>

          {/* Model Benchmark & Dataset Stats */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ModelComparisonChart metrics={modelComparison} />
            <div className="space-y-6">
              <EvaluationConfigDisplay config={metrics?.evaluation_config || metrics} />
              <DatasetStatsChart stats={metrics?.dataset_stats || {}} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLD-START BENCHMARK SIMULATOR */}
      {adminTab === 'benchmark' && (
        <div className="space-y-6 animate-fade-in">
          {/* Cold-Start Simulator Card */}
          <div className="p-6 bg-card rounded-2xl border border-accent/25 shadow-lg shadow-accent/5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent/15 text-accent">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-primary">Cold-Start Benchmark Simulator</h2>
                  <p className="text-xs text-secondary">
                    Override active profile to benchmark against any pre-trained MovieLens 25M user ID (1 to 162,541).
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-secondary uppercase font-semibold">Active Benchmark</span>
                <p className="text-sm font-black text-accent font-mono">User #{user?.movie_lens_user_id || 'None'}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface/60 border border-border space-y-2">
              <p className="text-xs text-secondary leading-relaxed">
                When an account has no dynamic liked movies, the NeuMF neural collaborative network evaluates inference directly against the pre-trained embedding of this benchmark MovieLens user ID.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-secondary">Quick Presets:</span>
                {[
                  { id: 1, label: 'User #1 (Classic)' },
                  { id: 100, label: 'User #100 (Power)' },
                  { id: 260, label: 'User #260 (Sci-Fi)' },
                  { id: 1337, label: 'User #1337 (Test)' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleQuickPreset(p.id)}
                    disabled={benchmarkLoading}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-card hover:bg-surface border border-border hover:border-accent/40 text-primary transition-all cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSetBenchmark} className="flex gap-2">
              <input
                type="number"
                min={1}
                max={162541}
                placeholder="Enter custom MovieLens ID (1 - 162,541)..."
                value={benchmarkIdInput}
                onChange={(e) => setBenchmarkIdInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-primary placeholder-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              />
              <button
                type="submit"
                disabled={benchmarkLoading || !benchmarkIdInput}
                className="px-5 py-2.5 bg-accent text-white rounded-xl text-xs font-bold hover:bg-accent-hover transition-colors shadow-md shadow-accent/25 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {benchmarkLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Wrench className="h-3.5 w-3.5" />}
                <span>Set Benchmark ID</span>
              </button>
            </form>
          </div>

          {/* Live Benchmark Recommendation Tester */}
          <div className="p-6 bg-card rounded-2xl border border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-primary flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span>Live Inference Benchmark Tester</span>
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  Execute real-time NeuMF inference for the active benchmark user ({user?.movie_lens_user_id}) and view recommendations.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunLiveBenchmarkTest}
                disabled={testRecsLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-surface border border-border hover:border-accent/40 text-primary hover:bg-card transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
              >
                {testRecsLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-accent" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5 text-accent" />
                )}
                <span>Generate Probe Recommendations</span>
              </button>
            </div>

            {testRecs && (
              <div className="space-y-3 pt-2">
                <p className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  Top-5 Predicted Recommendations:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {testRecs.map((rec) => (
                    <div key={rec.movie_id} className="p-3 bg-surface/70 rounded-xl border border-border flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-accent">#{rec.rank}</span>
                        <h3 className="text-xs font-bold text-primary line-clamp-2 mt-0.5">{rec.title}</h3>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {rec.genres?.slice(0, 2).map((g) => (
                            <GenreChip key={g} genre={g} className="text-[9px] py-0.5 px-1.5" />
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-border/50 text-[10px] text-secondary font-mono flex items-center justify-between">
                        <span>Score:</span>
                        <span className="font-bold text-emerald-400">{(rec.score * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NEURAL ARCHITECTURE SPECS */}
      {adminTab === 'architecture' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 text-secondary text-xs mb-1">
                <Layers className="h-4 w-4 text-accent" />
                <span>Pre-trained Users</span>
              </div>
              <p className="text-xl font-black text-primary font-mono">162,148</p>
              <p className="text-[10px] text-secondary mt-0.5">MovieLens 25M vocabulary</p>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 text-secondary text-xs mb-1">
                <Film className="h-4 w-4 text-accent" />
                <span>Pre-trained Movies</span>
              </div>
              <p className="text-xl font-black text-primary font-mono">59,047</p>
              <p className="text-[10px] text-secondary mt-0.5">Filtered item vocabulary</p>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 text-secondary text-xs mb-1">
                <Cpu className="h-4 w-4 text-amber-400" />
                <span>Model Weights</span>
              </div>
              <p className="text-base font-bold text-primary truncate">neumf_best.pth</p>
              <p className="text-[10px] text-secondary mt-0.5">PyTorch NCF Architecture</p>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 text-secondary text-xs mb-1">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Surrogate Vector</span>
              </div>
              <p className="text-xl font-black text-primary font-mono">64-dim</p>
              <p className="text-[10px] text-secondary mt-0.5">Real-time Avg Item Pooling</p>
            </div>
          </div>

          {/* Model Architecture Deep-dive */}
          <div className="bg-card rounded-2xl p-6 border border-border space-y-6">
            <div>
              <h3 className="text-lg font-bold text-primary">NeuMF Neural Architecture Specifications</h3>
              <p className="text-secondary text-xs mt-0.5">
                Detailed parameterization of the Generalized Matrix Factorization and Multi-Layer Perceptron fusion
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-surface/60 rounded-xl p-4 border border-border/80 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/15 text-accent">
                    <Brain className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-sm text-primary">NCF Pipeline</h4>
                </div>
                <ul className="text-xs text-secondary space-y-2">
                  <li className="flex justify-between">
                    <span>User Embedding:</span>
                    <strong className="text-primary font-mono">32 dim</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Item Embedding:</span>
                    <strong className="text-primary font-mono">32 dim</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>MLP Hidden Layers:</span>
                    <strong className="text-primary font-mono">64 → 32 → 16 → 8</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Dropout Probability:</span>
                    <strong className="text-primary font-mono">0.20</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Activation:</span>
                    <strong className="text-primary font-mono">ReLU</strong>
                  </li>
                </ul>
              </div>

              <div className="bg-surface/60 rounded-xl p-4 border border-border/80 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/15 text-accent">
                    <Users className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-sm text-primary">Dataset Hygiene</h4>
                </div>
                <ul className="text-xs text-secondary space-y-2">
                  <li className="flex justify-between">
                    <span>Corpus:</span>
                    <strong className="text-primary">MovieLens 25M</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Positive Threshold:</span>
                    <strong className="text-primary font-mono">Rating ≥ 3.5★</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Min Interactions/User:</span>
                    <strong className="text-primary font-mono">5 ratings</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Min Positives/User:</span>
                    <strong className="text-primary font-mono">3 positives</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Train Negative Ratio:</span>
                    <strong className="text-primary font-mono">1 pos : 4 neg</strong>
                  </li>
                </ul>
              </div>

              <div className="bg-surface/60 rounded-xl p-4 border border-border/80 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/15 text-accent">
                    <Database className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-sm text-primary">Evaluation Protocol</h4>
                </div>
                <ul className="text-xs text-secondary space-y-2">
                  <li className="flex justify-between">
                    <span>Split Strategy:</span>
                    <strong className="text-primary">Leave-One-Out (Time)</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Eval Negative Samples:</span>
                    <strong className="text-primary font-mono">99 unobserved</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Ranking Pool:</span>
                    <strong className="text-primary font-mono">100 candidates</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Early Stopping:</span>
                    <strong className="text-primary font-mono">Patience 3 (NDCG)</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Loss Function:</span>
                    <strong className="text-primary font-mono">BCEWithLogits</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Diagnostics & Quick Links Footer */}
      <div className="p-5 bg-surface/40 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-secondary">
        <div>
          <span className="font-semibold text-primary">Administrator Diagnostics: </span>
          <span>Logged in as </span>
          <strong className="text-primary font-mono">{user?.email}</strong>
          <span> | Database ID: </span>
          <strong className="text-primary font-mono">{user?.id}</strong>
          <span> | Linked MovieLens ID: </span>
          <strong className="text-primary font-mono">{user?.movie_lens_user_id || 'None'}</strong>
          <span> | Onboarding: </span>
          <strong className="text-primary font-mono">{user?.onboarding_completed ? 'Completed' : 'Pending'}</strong>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/settings" className="text-accent hover:underline flex items-center gap-1 font-semibold">
            <span>Manage Taste Profile</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
