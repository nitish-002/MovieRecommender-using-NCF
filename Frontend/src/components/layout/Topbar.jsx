import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Menu, User, LogOut, ChevronDown, Sparkles, Settings, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { SearchInput } from '../ui/SharedComponents'
import { cn } from '../../utils/cn'

export function Topbar({ onMenuClick, collapsed = false }) {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    setShowProfileMenu(false)
    navigate('/login')
  }

  return (
    <header className={cn(
      'fixed top-0 right-0 z-30 h-16 bg-surface/90 backdrop-blur-xl border-b border-border',
      'transition-all duration-300 left-0',
      collapsed ? 'lg:left-20' : 'lg:left-72'
    )}>
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile menu toggle + Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-secondary hover:text-primary hover:bg-card transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <form onSubmit={handleSearch} className="w-full max-w-md hidden sm:block">
            <SearchInput
              placeholder="Search MovieLens 25M catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-card/70 border-border/80"
            />
          </form>
        </div>

        {/* Right: User Menu or Auth CTAs */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={cn(
                  'flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-border/70',
                  'bg-card/80 text-secondary hover:text-primary hover:border-accent/40',
                  'transition-all cursor-pointer focus-visible-ring'
                )}
                aria-expanded={showProfileMenu}
                aria-haspopup="true"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent font-bold text-xs">
                  {user?.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-primary truncate max-w-[130px]">
                      {user?.email?.split('@')[0]}
                    </span>
                    {user?.role === 'admin' && (
                      <span className="px-1 py-0.2 rounded text-[8px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-accent font-medium">
                    {user?.onboarding_completed ? 'Taste Profile Active' : 'Personalized Profile'}
                  </span>
                </div>
                <ChevronDown className={cn('h-3.5 w-3.5 text-secondary transition-transform', showProfileMenu && 'rotate-180')} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-card rounded-2xl border border-border shadow-2xl py-2 animate-scale-in z-50">
                  <div className="px-4 py-3 border-b border-border/70">
                    <p className="text-[11px] text-secondary">Signed in as</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-xs font-semibold text-primary truncate">{user?.email}</p>
                      {user?.role === 'admin' && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface text-[10px] text-accent font-medium border border-border">
                      <Sparkles className="h-3 w-3" />
                      {user?.onboarding_completed ? 'Dynamic Taste Active' : 'Personalized Cinema Profile'}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-secondary hover:text-primary hover:bg-surface transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Account Settings</span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center justify-between px-4 py-2 text-xs text-secondary hover:text-primary hover:bg-surface transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="h-4 w-4 text-amber-400" />
                          <span>Admin Console</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Active
                        </span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-border/70">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-secondary hover:text-primary hover:bg-card border border-transparent hover:border-border transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-accent text-white hover:bg-accent-hover shadow-sm shadow-accent/25 transition-all"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
