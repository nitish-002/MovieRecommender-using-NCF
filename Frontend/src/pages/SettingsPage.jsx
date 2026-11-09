import { useState } from 'react'
import { User, Lock, Key, Film, Brain, LogOut, AlertCircle, Info, Check, Shield } from 'lucide-react'
import { cn } from '../utils/cn'
import { useAuth } from '../context/AuthContext'

export function SettingsPage() {
  const { user, logout, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [message, setMessage] = useState(null)

  // Local user preference mock states
  const [topNPreference, setTopNPreference] = useState(10)
  const [showScores, setShowScores] = useState(true)
  const [compactCards, setCompactCards] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Brain },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'about', label: 'About & Model', icon: Info },
  ]

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
        <p className="text-secondary text-sm mt-1">Manage your MovieLens linkage and platform preferences</p>
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
                    MovieLens 25M User ID #{user?.movie_lens_user_id}
                  </p>
                  <p className="text-[11px] text-secondary mt-1">
                    Bound to 32-dimensional user latent embedding
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
                  <p className="text-[11px] text-secondary/60 mt-1">Account identifier for session authentication</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    MovieLens Profile ID
                  </label>
                  <input
                    type="text"
                    value={`User #${user?.movie_lens_user_id || ''}`}
                    disabled
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-secondary cursor-not-allowed"
                  />
                  <p className="text-[11px] text-secondary/60 mt-1">Bound from MovieLens 25M training corpus</p>
                </div>
              </div>
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
                    <h4 className="font-semibold text-sm text-primary">Display Neural Affinity Scores</h4>
                    <p className="text-xs text-secondary mt-0.5">Show predicted interaction confidence percentages</p>
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

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-surface/60 border border-border space-y-2">
                <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                  <Film className="h-4 w-4 text-accent" />
                  CineMatch • Neural Collaborative Filtering
                </h4>
                <p className="text-xs text-secondary leading-relaxed">
                  End-to-end movie recommendation engine powered by PyTorch NeuMF, serving 25M MovieLens ratings through FastAPI and React 19.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div className="p-3 bg-surface/50 rounded-xl border border-border">
                  <span className="text-secondary block mb-1">Architecture</span>
                  <strong className="text-primary font-semibold">NeuMF (GMF + MLP)</strong>
                </div>
                <div className="p-3 bg-surface/50 rounded-xl border border-border">
                  <span className="text-secondary block mb-1">Dataset</span>
                  <strong className="text-primary font-semibold">MovieLens 25M</strong>
                </div>
                <div className="p-3 bg-surface/50 rounded-xl border border-border">
                  <span className="text-secondary block mb-1">Backend Stack</span>
                  <strong className="text-primary font-semibold">FastAPI + PyTorch</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-surface/40 border-t border-border flex items-center justify-between">
          <span className="text-xs text-secondary">CineMatch Engine v1.0.0</span>
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
