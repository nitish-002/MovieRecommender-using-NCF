import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Film, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Key, Loader2, Sparkles } from 'lucide-react'
import { cn } from '../utils/cn'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/recommendations')
    }
  }, [isAuthenticated, navigate])

  const getPasswordStrength = (pwd) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return Math.min(strength, 4)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (getPasswordStrength(password) < 2) {
      setError('Password is too weak. Please use at least 8 characters with numbers and letters.')
      return
    }

    setLoading(true)

    try {
      await register(email, password)
      setSuccess('Account created and linked to MovieLens! Redirecting...')
      setTimeout(() => navigate('/recommendations'), 600)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to register. Please check that the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-400']

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
          <h1 className="text-2xl font-bold text-primary">Create Your Account</h1>
          <p className="text-secondary text-xs mt-1">Bind your taste profile to MovieLens 25M latent embeddings</p>
        </div>

        {/* Register Form Card */}
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
              <label htmlFor="reg-email" className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary h-4 w-4 pointer-events-none" />
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password" className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary h-4 w-4 pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
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

              {password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-300 rounded-full',
                        strengthColors[passwordStrength] || 'bg-border'
                      )}
                      style={{ width: `${Math.max((passwordStrength / 4) * 100, 15)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-secondary">
                    Strength: <strong className="text-primary">{strengthLabels[passwordStrength]}</strong>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="reg-confirmPassword" className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary h-4 w-4 pointer-events-none" />
                <input
                  id="reg-confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  autoComplete="new-password"
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 text-sm',
                    'bg-surface border border-border rounded-xl',
                    'text-primary placeholder:text-secondary/60',
                    'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all',
                    confirmPassword && password !== confirmPassword ? 'border-red-500' : ''
                  )}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
              )}
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
                  <span>Binding MovieLens Embedding...</span>
                </>
              ) : (
                'Create Account & Start'
              )}
            </button>
          </form>

          {/* Feature explanation pill */}
          <div className="p-3 bg-surface/50 rounded-xl border border-border text-xs text-secondary flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Upon registration, your account is automatically bound to a unique MovieLens 25M profile to enable full neural recommendation features.
            </p>
          </div>

          <div className="text-center pt-2">
            <p className="text-secondary text-xs">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:underline font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
