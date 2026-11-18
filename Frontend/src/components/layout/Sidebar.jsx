import { NavLink, useLocation, Link } from 'react-router-dom'
import {
  Home,
  Compass,
  Heart,
  Brain,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Film,
  User,
  LogOut,
  X
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAuth } from '../../context/AuthContext'

const baseNavigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Discover', href: '/discover', icon: Compass },
  { name: 'For You', href: '/recommendations', icon: Heart },
  { name: 'Predictor', href: '/predictor', icon: Brain },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ 
  isOpen = false, 
  onClose, 
  collapsed = false, 
  onToggleCollapse 
}) {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-surface border-r border-border',
        'transition-all duration-300 ease-in-out flex flex-col',
        // Desktop collapse width
        collapsed ? 'lg:w-20' : 'lg:w-72',
        // Mobile drawer transform
        'w-72',
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {(!collapsed || isOpen) ? (
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent shadow-md shadow-accent/30 group-hover:scale-105 transition-transform">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-primary tracking-tight">CineMatch</span>
              <span className="text-[10px] text-accent font-semibold tracking-wider uppercase -mt-1">Movie Picks</span>
            </div>
          </Link>
        ) : (
          <Link to="/" className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
            <Film className="h-5 w-5 text-white" />
          </Link>
        )}

        <div className="flex items-center gap-1">
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-card transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Desktop collapse toggle */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cn(
                'hidden lg:flex p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-card',
                'transition-colors cursor-pointer'
              )}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5" aria-label="Main navigation">
        {[
          ...baseNavigation,
          ...(user?.role === 'admin' ? [{ name: 'Admin Console', href: '/admin', icon: ShieldCheck }] : []),
        ].map((item) => {
          const isActive = item.href === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none group',
                isActive
                  ? 'bg-accent/15 text-accent font-semibold shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-card/70'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={cn('h-5 w-5 shrink-0 transition-colors', isActive ? 'text-accent' : 'group-hover:text-primary')} />
              {(!collapsed || isOpen) && (
                <span className="truncate">{item.name}</span>
              )}
              {item.href === '/admin' && user?.role === 'admin' && (!collapsed || isOpen) ? (
                <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Admin
                </span>
              ) : (
                isActive && (!collapsed || isOpen) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                )
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User / Footer Section */}
      <div className="p-3 border-t border-border bg-surface/60">
        {(!collapsed || isOpen) ? (
          isAuthenticated ? (
            <div className="p-2.5 rounded-xl bg-card border border-border/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-primary truncate">{user?.email}</p>
                    {user?.role === 'admin' && (
                      <span className="px-1 py-0.2 rounded text-[8px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-secondary truncate">
                    {user?.onboarding_completed ? 'Taste Profile Active' : 'Personalized Profile'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-lg text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-card border border-border/80 text-center space-y-2">
              <p className="text-xs text-secondary">Sign in for personalized NeuMF picks</p>
              <Link
                to="/login"
                onClick={onClose}
                className="block w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm"
              >
                Sign In
              </Link>
            </div>
          )
        ) : (
          <div className="flex justify-center">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="p-2 rounded-xl text-accent hover:bg-accent/10 transition-colors"
                title="Sign In"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
