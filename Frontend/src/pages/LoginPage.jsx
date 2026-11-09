import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Film, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '../utils/cn'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/recommendations')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password)
      setSuccess('Welcome back! Loading your profile...')
      setTimeout(() => navigate('/recommendations'), 500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-scale-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/30 group-hover:scale-105 transition-transform">
              <Film className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-primary tracking-tight">CineMatch</span>
          </Link>
          <h1 className="text-2xl font-bold text-primary">Welcome Back</h1>
          <p className="text-secondary text-xs mt-1">Sign in to access your MovieLens 25M recommendations</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary h-4 w-4 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 text-sm',
                    'bg-surface border border-border rounded-xl',
                    'text-primary placeholder:text-secondary/60',
                    'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all'
                  )}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary h-4 w-4 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className={cn(
                    'w-full pl-10 pr-11 py-2.5 text-sm',
                    'bg-surface border border-border rounded-xl',
                    'text-primary placeholder:text-secondary/60',
                    'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all'
                  )}
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
              disabled={loading}
              className={cn(
                'w-full py-3 px-4 rounded-xl font-semibold text-sm',
                'flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer',
                'focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed',
                'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/25 active:scale-[0.99]'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-secondary text-xs">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-accent hover:underline font-semibold">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
