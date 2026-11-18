import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { User, Lock, Key, Film, Brain, LogOut, AlertCircle, Info, Check, Shield, Heart, Wrench, RotateCcw, Trash2, ArrowRight } from 'lucide-react'
import { cn } from '../utils/cn'
import { useAuth } from '../context/AuthContext'
import { movieApi } from '../services/movieApi'

export function SettingsPage() {
  const { user, logout, isAuthenticated, refetch } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [message, setMessage] = useState(null)

  // Local user preference mock states
  const [topNPreference, setTopNPreference] = useState(10)
  const [showScores, setShowScores] = useState(true)
  const [compactCards, setCompactCards] = useState(false)

  // Dynamic taste profile state
  const [interactions, setInteractions] = useState([])
  const [interactionsLoading, setInteractionsLoading] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'taste', label: 'Taste Profile', icon: Heart },
    { id: 'preferences', label: 'Preferences', icon: Brain },
    { id: 'security', label: 'Security', icon: Lock },
  ]

  const fetchInteractions = useCallback(async () => {
    if (!isAuthenticated) return
    setInteractionsLoading(true)
    try {
      const data = await movieApi.getUserInteractions()
      setInteractions(data?.interactions || [])
    } catch (err) {
      console.error('Failed to load interactions:', err)
    } finally {
      setInteractionsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (activeTab === 'taste') {
      fetchInteractions()
    }
  }, [activeTab, fetchInteractions])

  const handleRemoveInteraction = async (movieId) => {
    try {
      await movieApi.removeInteraction(movieId)
      setMessage({ type: 'success', text: 'Movie removed from taste profile' })
      await fetchInteractions()
      await refetch?.()
    } catch {
      setMessage({ type: 'error', text: 'Failed to remove movie' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleResetTaste = async () => {
    if (!window.confirm('Reset your taste profile? This will clear all liked movies and reset onboarding.')) return
    try {
      await movieApi.resetUserInteractions()
      setMessage({ type: 'success', text: 'Taste profile reset successfully!' })
      await fetchInteractions()
      await refetch?.()
    } catch {
      setMessage({ type: 'error', text: 'Failed to reset taste profile' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
        <AlertCircle className="h-12 w-12 text-accent mb-4" />
        <h2 className="text-xl font-bold text-primary mb-2">Authentication Required</h2>
        <p className="text-secondary text-sm mb-6">
          Please sign in to access your profile settings and model preferences.
        </p>
        <a 
          href="/login" 
          className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-accent text-white hover:bg-accent-hover transition-colors shadow-md shadow-accent/25"
        >
          Sign In
        </a>
      </div>
    )
  }

  const handleSavePreferences = () => {
    setMessage({ type: 'success', text: 'Preferences updated successfully!' })
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Settings</h1>
        <p className="text-secondary text-sm mt-1">Manage your taste profile and platform preferences</p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
        {/* Navigation Tabs */}
        <nav className="flex border-b border-border bg-surface/40 overflow-x-auto scrollbar-hide" aria-label="Settings tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-4 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                  'relative',
                  isActive
                    ? 'text-accent bg-card'
                    : 'text-secondary hover:text-primary hover:bg-surface/60'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Tab Content */}
        <div className="p-6">
          {message && (
            <div className={cn(
              'mb-6 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-scale-in',
              message.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            )}>
              <Check className="h-4 w-4 shrink-0" />
              {message.text}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-surface/60 rounded-xl border border-border">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent font-bold text-xl border border-accent/25">
                  <Film className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-primary">{user?.email}</h3>
                  <p className="text-xs text-accent font-medium mt-0.5">
                    {user?.onboarding_completed ? 'Dynamic Taste Profile Active' : 'Personalized Profile'}
                  </p>
                  <p className="text-[11px] text-secondary mt-1">
                    Personalized movie recommendations enabled
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-secondary cursor-not-allowed"
                  />
                  <p className="text-[11px] text-secondary/60 mt-1">Your registered login email address</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Taste Profile Status
                  </label>
                  <input
                    type="text"
                    value={user?.onboarding_completed ? 'Calibrated (Likes Recorded)' : 'Calibration Pending'}
                    disabled
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-secondary cursor-not-allowed"
                  />
                  <p className="text-[11px] text-secondary/60 mt-1">Based on your liked and watched titles</p>
                </div>
              </div>
            </div>
          )}

          {/* Taste Profile Tab */}
          {activeTab === 'taste' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface/60 rounded-xl border border-border">
                <div>
                  <h3 className="font-bold text-base text-primary">Your Dynamic Taste Profile</h3>
                  <p className="text-xs text-secondary mt-0.5">
                    {interactions.length > 0 
                      ? `${interactions.length} recorded movies shaping your NeuMF surrogate embedding`
                      : 'No movies selected yet. Calibrate in onboarding to generate dynamic recommendations.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/onboarding"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent-hover transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>Calibrate Taste</span>
                    <ArrowRight className="h-3 w-3" />
                  </a>
                  {interactions.length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetTaste}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Clear all movie interactions"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {interactionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
                </div>
              ) : interactions.length === 0 ? (
                <div className="text-center py-12 px-4 bg-surface/30 rounded-2xl border border-border/60">
                  <Heart className="h-8 w-8 text-secondary/50 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-primary">No Taste Interactions Yet</p>
                  <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
                    Complete onboarding or click ❤️ on any movie card to begin building your personalized surrogate vector.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {interactions.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-surface/50 rounded-xl border border-border/80 hover:border-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                            item.interaction_type === 'liked'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          )}
                        >
                          {item.interaction_type}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-primary line-clamp-1">
                            {item.title || `Movie ID #${item.movie_id}`}
                          </p>
                          {item.genres && (
                            <p className="text-[10px] text-secondary">
                              {item.genres.slice(0, 3).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveInteraction(item.movie_id)}
                        className="p-1.5 rounded-lg text-secondary hover:text-red-400 hover:bg-surface transition-colors cursor-pointer"
                        title="Remove interaction"
                        aria-label="Remove interaction"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="bg-surface/50 rounded-xl p-4 border border-border flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-primary">Default Recommendations Count</h4>
                    <p className="text-xs text-secondary mt-0.5">Number of movies generated per ranking pass</p>
                  </div>
                  <select
                    value={topNPreference}
                    onChange={(e) => setTopNPreference(Number(e.target.value))}
                    className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
                  >
                    <option value={5}>Top 5</option>
                    <option value={10}>Top 10</option>
                    <option value={20}>Top 20</option>
                    <option value={50}>Top 50</option>
                  </select>
                </div>

                <div className="bg-surface/50 rounded-xl p-4 border border-border flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-primary">Display Match Confidence Scores</h4>
                    <p className="text-xs text-secondary mt-0.5">Show predicted recommendation match percentages</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showScores}
                    onChange={(e) => setShowScores(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
                  />
                </div>

                <div className="bg-surface/50 rounded-xl p-4 border border-border flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-primary">Compact Card Density</h4>
                    <p className="text-xs text-secondary mt-0.5">Display smaller cards in recommendation grids</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={compactCards}
                    onChange={(e) => setCompactCards(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-surface/50 rounded-xl p-4 border border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface text-secondary">
                    <Key className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-primary">Password</h4>
                    <p className="text-xs text-secondary">Secured with bcrypt hash salt</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-primary hover:bg-card transition-colors cursor-pointer"
                >
                  Change Password
                </button>
              </div>

              <div className="bg-surface/50 rounded-xl p-4 border border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface text-secondary">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-primary">JWT Session Token</h4>
                    <p className="text-xs text-secondary">Token expiration: 7 days</p>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  Active
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-surface/40 border-t border-border flex items-center justify-between">
          <span className="text-xs text-secondary">CineMatch</span>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
