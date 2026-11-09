import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { cn } from '../../utils/cn'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background text-primary">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Top Header */}
      <Topbar 
        onMenuClick={() => setSidebarOpen(true)} 
        collapsed={sidebarCollapsed}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}
        id="main-content"
      >
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden animate-fade-in cursor-pointer"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
