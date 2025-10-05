import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { listEmployees, listLeaves, listDocuments, getUser, updateLeaveStatus } from '../../lib/api'

type SummaryCard = {
  key: string
  label: string
  value: string
  sublabel: string
  color: string
  Icon: (props: { className?: string }) => JSX.Element
}

export default function AdminDashboard() {
  const user = getUser()
  const userName = user ? user.first_name : 'User'

  const [summary, setSummary] = useState<SummaryCard[]>([
    { key: 'employees', label: 'Employees', value: '—', sublabel: 'Total team members', color: 'text-blue-600', Icon: UsersIcon },
    { key: 'pending', label: 'Pending Leave', value: '—', sublabel: 'Awaiting approval', color: 'text-emerald-600', Icon: CalendarIcon },
    { key: 'docs', label: 'Documents', value: '—', sublabel: 'Uploaded this week', color: 'text-violet-600', Icon: FileIcon },
    { key: 'onLeave', label: 'On Leave Today', value: '—', sublabel: 'Team members out', color: 'text-amber-600', Icon: SunIcon },
  ])
  const [pending, setPending] = useState<{ id: string | number; text: string }[]>([])
  const [recent, setRecent] = useState<{ id: string | number; name: string; event: string }[]>([])
  const [, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [emps, leaves, docs] = await Promise.all([
          listEmployees({ page: 1, size: 1 }),
          listLeaves({ page: 1, size: 5, status: 'requested' }),
          listDocuments({ page: 1, size: 5 }),
        ])
        if (!cancelled) {
          setSummary((prev) => prev.map((c) => {
            if (c.key === 'employees') return { ...c, value: String(emps.total) }
            if (c.key === 'pending') return { ...c, value: String(leaves.total) }
            if (c.key === 'docs') return { ...c, value: String(docs.total) }
            if (c.key === 'onLeave') return { ...c, value: '0' }
            return c
          }))
          setPending(leaves.items.map((l) => ({ id: l.id, text: `Leave #${l.id} (${l.leave_type})` })))
          setRecent([
            ...docs.items.map((d) => ({ id: `d-${d.id}`, name: 'Document', event: `uploaded ${d.filename}` })),
            ...leaves.items.map((l) => ({ id: `l-${l.id}`, name: 'Leave', event: `requested ${l.leave_type}` })),
          ].slice(0, 10))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function refreshPending() {
    const leaves = await listLeaves({ page: 1, size: 5, status: 'requested' })
    setPending(leaves.items.map((l) => ({ id: l.id, text: `Leave #${l.id} (${l.leave_type})` })))
  }

  async function onApprove(id: string | number) {
    try {
      await updateLeaveStatus(id, 'approved')
      await refreshPending()
    } catch (e) {
      alert('Failed to approve leave')
    }
  }

  async function onReject(id: string | number) {
    try {
      const input = window.prompt('Please provide a reason for rejection:')
      if (!input || !input.trim()) {
        alert('A rejection reason is required.')
        return
      }
      await updateLeaveStatus(id, 'rejected', input.trim())
      await refreshPending()
    } catch (e) {
      alert('Failed to reject leave')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {userName}</h1>
        <div className="flex gap-2">
          <Link to="/employees" className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-blue-700">Invite Employee</Link>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {summary.map(({ key, label, value, sublabel, color, Icon }) => (
          <div key={key} className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-slate-500">{label}</div>
                <div className="text-2xl font-semibold">{value}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500">{sublabel}</div>
          </div>
        ))}
      </section>

      {/* Pending Actions */}
      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Pending Actions</h2>
          <Link to="/leaves" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {pending.length === 0 ? (
          <div className="text-sm text-slate-500">No pending requests.</div>
        ) : (
          <ul className="space-y-2">
            {pending.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm rounded-lg border border-black/5 dark:border-white/10 px-3 py-2">
                <span>{p.text}</span>
                <div className="flex gap-2">
                  <button onClick={() => onApprove(p.id)} className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">Approve</button>
                  <button onClick={() => onReject(p.id)} className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent Activity */}
      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Link to="#" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-sm text-slate-500">No recent activity.</div>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {recent.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={userName} size="sm" />
                <div className="flex-1 text-sm">
                  {a.name} {a.event}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const sizeCls = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-8 w-8 text-sm'
  return <div className={`${sizeCls} rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500 text-white flex items-center justify-center font-semibold`}>{initials}</div>
}

function UsersIcon({ className = '' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4m-7 8a7 7 0 0 1 14 0v1H5z" /></svg>) }
function CalendarIcon({ className = '' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1m10 5H7v2h10zM4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9z" /></svg>) }
function FileIcon({ className = '' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m7 1.5V8h4.5" /></svg>) }
function SunIcon({ className = '' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M12 7a5 5 0 1 1-5 5 5 5 0 0 1 5-5m0-5h1v3h-1zm0 17h1v3h-1zM1 11h3v1H1zm19 0h3v1h-3zM4.22 4.22l.71-.71 2.12 2.12-.71.71zM16.95 16.95l.71-.71 2.12 2.12-.71.71zM4.22 19.78l2.12-2.12.71.71-2.12 2.12zM16.95 7.05l2.12-2.12.71.71-2.12 2.12z" /></svg>) }
