import { forwardRef, useState } from 'react'

export const Button = forwardRef(
  ({ children, variant = 'primary', size = 'md', className = '', disabled, loading, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center font-medium rounded-xl
      transition-all duration-200 focus-visible-ring cursor-pointer
      disabled:opacity-50 disabled:cursor-not-allowed select-none
    `

    const variants = {
      primary: 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20 active:scale-[0.98]',
      secondary: 'bg-surface text-primary border border-border hover:bg-card hover:border-accent/40 active:scale-[0.98]',
      ghost: 'text-secondary hover:text-primary hover:bg-surface active:scale-[0.98]',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
      outline: 'bg-transparent text-primary border border-border hover:border-accent hover:text-accent',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export const SearchInput = forwardRef(
  ({ placeholder = 'Search movies...', className = '', value, onChange, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary h-4 w-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full pl-10 pr-4 py-2 text-sm
            bg-surface border border-border
            rounded-xl text-primary placeholder:text-secondary/70
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            transition-all duration-200
            ${className}
          `}
          {...props}
        />
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

export const LoadingSkeleton = ({ className = '', variant = 'card' }) => {
  const base = 'animate-pulse bg-gradient-to-r from-surface via-card to-surface bg-[length:200%_100%] animate-shimmer'
  
  const variants = {
    card: 'h-72 w-full rounded-xl',
    poster: 'aspect-[2/3] w-full rounded-xl',
    text: 'h-4 w-3/4 rounded-lg',
    title: 'h-5 w-1/2 rounded-lg',
    chip: 'h-7 w-20 rounded-full',
    avatar: 'h-9 w-9 rounded-full',
  }

  return (
    <div className={`${base} ${variants[variant] || ''} ${className}`} />
  )
}

export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface/30 rounded-2xl border border-border">
      {icon && (
        <div className="text-secondary/60 p-4 rounded-2xl bg-card/60 mb-4 border border-border/50">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-primary mb-1.5">{title}</h3>
      <p className="text-secondary text-sm max-w-md mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  )
}

export const ErrorState = ({ message, onRetry, retryLabel = 'Try Again' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-red-500/5 rounded-2xl border border-red-500/20">
      <div className="text-red-400 p-3 rounded-full bg-red-500/10 mb-3">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-primary mb-1">Failed to load</h3>
      <p className="text-secondary text-sm max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}

export const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className={`
            relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl
            border border-border/80 text-left overflow-hidden animate-scale-in z-10 ${className}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
              <h2 id="modal-title" className="text-lg font-semibold text-primary">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-surface"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export const Tooltip = ({ children, content, position = 'top' }) => {
  const [visible, setVisible] = useState(false)

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div className="relative inline-block" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div className={`
          absolute ${positions[position]} z-20 px-2.5 py-1
          bg-surface text-primary border border-border text-xs font-medium rounded-lg
          whitespace-nowrap shadow-xl animate-fade-in pointer-events-none
        `}>
          {content}
        </div>
      )}
    </div>
  )
}
