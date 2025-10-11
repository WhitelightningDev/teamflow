import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo'
import { getUser, clearAuth } from '../../lib/api'
import NotificationsBell from '../../components/NotificationsBell'
import AdminDashboard from './AdminDashboard'
import EmployeeDashboard from './EmployeeDashboard'
import Breadcrumbs from '../../components/Breadcrumbs'
import { LayoutGrid, Clock, Briefcase, DollarSign, Users, CalendarDays, FileText, Settings as LucideSettings, User as UserIcon } from 'lucide-react'

export default function DashboardPage() {
  const storedUser = getUser()
  const userName = storedUser ? `${storedUser.first_name}` : 'Guest'
  const role = ((storedUser as any)?.role) || 'employee'
  const isAdminLikeRole = ['admin','manager','hr'].includes(role)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  function onLogout() {
    try { clearAuth() } catch {}
    setUserMenuOpen(false)
    navigate('/login')
  }

  // Redirect legacy hash anchors to proper routes
  useEffect(() => {
    const h = location.hash.toLowerCase()
    if (h === '#employees') navigate('/employees', { replace: true })
    else if (h === '#leaves') navigate('/leaves', { replace: true })
    else if (h === '#documents') navigate('/documents', { replace: true })
    else if (h === '#settings') navigate(isAdminLikeRole ? '/settings' : '/profile', { replace: true })
  }, [location.hash, navigate, isAdminLikeRole])

  // Role-specific dashboards are rendered below; removing legacy summary code

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-30 bg-white/80 dark:bg-neutral-950/70 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <Link to="/" className="inline-flex items-center gap-2">
              <Logo height={120} withText={false} />
            </Link>
            <span className="sm:ml-3 text-sm sm:text-base">Welcome, <span className="font-semibold">{userName}</span></span>
          </div>
          <div className="relative flex items-center gap-2">
            <NotificationsBell />
            <button
              className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
            >
              <Avatar name={userName} />
              <ChevronDownIcon className="h-4 w-4 text-slate-500" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg py-1 text-sm">
                <Link to="/profile" className="block px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">Profile</Link>
                {isAdminLikeRole && (
                  <Link to="/settings" className="block px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">Settings</Link>
                )}
                <div className="my-1 h-px bg-black/5 dark:bg-white/10" />
                <button onClick={onLogout} className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-rose-600">Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block lg:col-span-3">
          <SidebarNav />
        </aside>

        {/* Sidebar (mobile overlay) */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-neutral-900 border-r border-black/5 dark:border-white/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Logo height={28} />
                </div>
                <button className="h-8 w-8 rounded-md hover:bg-black/5 dark:hover:bg-white/10 inline-flex items-center justify-center" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <SidebarNav onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="lg:col-span-9 space-y-6">
          <Breadcrumbs items={[{ label: 'Dashboard' }]} />
          {isAdminLikeRole ? <AdminDashboard /> : <EmployeeDashboard />}
        </main>
      </div>
    </div>
  )
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()
  const role = ((getUser() as any)?.role) || 'employee'
  const NavItem = ({ to, label, Icon, active = false }: { to: string; label: string; Icon: ComponentType<{ className?: string }>; active?: boolean }) => (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`${
        active
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-600/30 dark:text-blue-50'
          : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200'
      } group flex items-center gap-3 rounded-lg px-3 py-2`}
    >
      <Icon className={`h-5 w-5 ${active ? 'text-blue-700 dark:text-blue-50' : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'}`} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )

  const isAdminLikeRole = ['admin','manager','hr'].includes(role)
  const items = isAdminLikeRole
    ? [
        { to: '/dashboard', label: 'Dashboard', Icon: LayoutGrid },
        { to: '/time', label: 'Time', Icon: Clock },
        { to: '/time/jobs', label: 'Job Types', Icon: Briefcase },
        { to: '/time/billing', label: 'Billing', Icon: DollarSign },
        { to: '/employees', label: 'Employees', Icon: Users },
        { to: '/leaves', label: 'Leaves', Icon: CalendarDays },
        { to: '/documents', label: 'Documents', Icon: FileText },
        { to: '/settings', label: 'Settings', Icon: LucideSettings },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard', Icon: LayoutGrid },
        { to: '/time', label: 'My Timesheet', Icon: Clock },
        { to: '/leaves', label: 'My Leaves', Icon: CalendarDays },
        { to: '/documents', label: 'My Documents', Icon: FileText },
        { to: '/profile', label: 'Profile', Icon: UserIcon },
      ]
  return (
    <nav className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 backdrop-blur p-3 sm:p-4 space-y-1">
      {items.map(({ to, label, Icon }) => (
        <NavItem key={to} to={to} label={label} Icon={Icon} active={pathname === to} />
      ))}
    </nav>
  )
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const sizeCls = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-8 w-8 text-sm'
  return (
    <div className={`${sizeCls} rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500 text-white flex items-center justify-center font-semibold`}>{initials}</div>
  )
}

// Icons (inline SVG to avoid extra deps)
function MenuIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
    </svg>
  )
}
function XMarkIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z" />
    </svg>
  )
}
function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
    </svg>
  )
}
// Removed legacy summary-only icons to prefer Lucide icons in nav
