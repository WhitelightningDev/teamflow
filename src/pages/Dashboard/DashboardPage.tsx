import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

type SummaryCard = {
  key: string
  label: string
  value: string
  sublabel: string
  color: string
  Icon: (props: { className?: string }) => JSX.Element
}

export default function DashboardPage() {
  const userName = 'Jane'

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Redirect legacy hash anchors to proper routes
  useEffect(() => {
    const h = location.hash.toLowerCase()
    if (h === '#employees') navigate('/employees', { replace: true })
    else if (h === '#leaves') navigate('/leaves', { replace: true })
    else if (h === '#documents') navigate('/documents', { replace: true })
    else if (h === '#settings') navigate('/settings', { replace: true })
  }, [location.hash, navigate])

  const summary: SummaryCard[] = [
    { key: 'employees', label: 'Employees', value: '18', sublabel: 'Total team members', color: 'text-blue-600', Icon: UsersIcon },
    { key: 'pendingLeave', label: 'Pending Leave', value: '3', sublabel: 'Awaiting approval', color: 'text-emerald-600', Icon: CalendarIcon },
    { key: 'docs', label: 'Documents', value: '2', sublabel: 'Needing review', color: 'text-violet-600', Icon: FileIcon },
    { key: 'onLeave', label: 'On Leave Today', value: '1', sublabel: 'Team members out', color: 'text-amber-600', Icon: SunIcon },
  ]

  const pendingTasks = [
    { id: 1, text: 'Approve leave for John Doe', action: 'Approve' },
    { id: 2, text: 'Upload missing contract for Jane Smith', action: 'Upload' },
    { id: 3, text: 'Review policy update draft', action: 'Review' },
  ]

  const recentActivity = [
    { id: 1, name: 'Alice', event: 'added a new employee', time: '1h ago' },
    { id: 2, name: 'Daniel', event: 'approved a leave request', time: '3h ago' },
    { id: 3, name: 'Priya', event: 'uploaded a policy document', time: '1d ago' },
  ]

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
            <Link to="/" className="hidden sm:inline-flex items-center gap-2">
              <span className="inline-block h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500"></span>
              <span className="text-base font-semibold tracking-tight">Teamflow</span>
            </Link>
            <span className="sm:ml-3 text-sm sm:text-base">Welcome, <span className="font-semibold">{userName}</span></span>
          </div>
          <div className="relative">
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
                <Link to="#" className="block px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">Profile</Link>
                <Link to="#" className="block px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">Settings</Link>
                <div className="my-1 h-px bg-black/5 dark:bg-white/10" />
                <button className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-rose-600">Logout</button>
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
                  <span className="inline-block h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500"></span>
                  <span className="text-base font-semibold tracking-tight">Teamflow</span>
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
          {/* Summary cards */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {summary.map(({ key, label, value, sublabel, color, Icon }) => (
                <div key={key} className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center ${color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{label}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-3xl font-bold">{value}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{sublabel}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pending Tasks + Recent Activity */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Pending Tasks */}
            <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10">
                <h2 className="text-lg font-semibold">Pending Tasks</h2>
                <Link to="#" className="text-sm text-blue-600 hover:underline">View all</Link>
              </div>
              <ul className="divide-y divide-black/5 dark:divide-white/10">
                {pendingTasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <CircleDotIcon className="h-4 w-4 text-amber-500" />
                    <span className="flex-1 text-sm">{t.text}</span>
                    <button className="rounded-md border border-black/10 dark:border-white/15 px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10">
                      {t.action}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                <Link to="#" className="text-sm text-blue-600 hover:underline">View all</Link>
              </div>
              <ul className="divide-y divide-black/5 dark:divide-white/10">
                {recentActivity.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar name={a.name} size="sm" />
                    <div className="flex-1 text-sm">
                      <span className="font-medium">{a.name}</span> {a.event}
                      <div className="text-xs text-slate-500 dark:text-slate-400">{a.time}</div>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400" />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const NavItem = ({ to, label, Icon, active = false }: { to: string; label: string; Icon: (p: { className?: string }) => JSX.Element; active?: boolean }) => (
    <Link
      to={to}
      onClick={onNavigate}
      className={`${active ? 'bg-blue-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200'} group flex items-center gap-3 rounded-lg px-3 py-2`}
    >
      <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'}`} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )

  return (
    <nav className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 backdrop-blur p-3 sm:p-4 space-y-1">
      <NavItem to="/dashboard" label="Dashboard" Icon={GridIcon} active />
      <NavItem to="/employees" label="Employees" Icon={UsersIcon} />
      <NavItem to="/leaves" label="Leaves" Icon={CalendarIcon} />
      <NavItem to="/documents" label="Documents" Icon={FileIcon} />
      <NavItem to="/settings" label="Settings" Icon={SettingsIcon} />
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
function GridIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z" />
    </svg>
  )
}
function UsersIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4m-7 8a7 7 0 0 1 14 0v1H5z" />
    </svg>
  )
}
function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1m10 5H7v2h10zM4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9z" />
    </svg>
  )
}
function FileIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m7 1.5V8h4.5" />
    </svg>
  )
}
function SunIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 7a5 5 0 1 1-5 5 5 5 0 0 1 5-5m0-5h1v3h-1zm0 17h1v3h-1zM1 11h3v1H1zm19 0h3v1h-3zM4.22 4.22l.71-.71 2.12 2.12-.71.71zM16.95 16.95l.71-.71 2.12 2.12-.71.71zM4.22 19.78l2.12-2.12.71.71-2.12 2.12zM16.95 7.05l2.12-2.12.71.71-2.12 2.12z" />
    </svg>
  )
}
function CircleDotIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m0 5a5 5 0 1 1-5 5 5 5 0 0 1 5-5" />
    </svg>
  )
}
function ArrowRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M10 17l5-5-5-5v10z" />
    </svg>
  )
}
function SettingsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 8a4 4 0 1 1-4 4 4 4 0 0 1 4-4m8.94 4a7.93 7.93 0 0 0-.11-1.31l2.11-1.65-2-3.46-2.49 1a7.77 7.77 0 0 0-2.27-1.32l-.38-2.65h-4l-.38 2.65A7.77 7.77 0 0 0 7.45 4.3l-2.49-1-2 3.46L5.07 8.4A7.93 7.93 0 0 0 5 12a7.93 7.93 0 0 0 .11 1.31l-2.11 1.65 2 3.46 2.49-1a7.77 7.77 0 0 0 2.27 1.32l.38 2.65h4l.38-2.65a7.77 7.77 0 0 0 2.27-1.32l2.49 1 2-3.46-2.11-1.65c.07-.43.11-.87.11-1.31Z" />
    </svg>
  )
}
