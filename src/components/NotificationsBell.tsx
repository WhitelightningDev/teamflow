import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNotifications } from '../hooks/useNotifications'

export default function NotificationsBell() {
  const { data, isLoading, markRead, refetch } = useNotifications()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'new' | 'read'>('new')
  const ref = useRef<HTMLDivElement | null>(null)
  const qc = useQueryClient()
  const items = data?.items || []
  const newItems = items.filter((n: any) => !n.read)
  const readItems = items.filter((n: any) => n.read)
  const unread = newItems.length

  async function markAll() {
    const toMark = newItems
    if (toMark.length === 0) return
    // Optimistic UI: move all to Read immediately
    const key = ['notifications'] as const
    const prev = qc.getQueryData<{ items: any[]; total: number }>(key)
    qc.setQueryData(key, (old: any) => {
      if (!old) return old
      return { ...old, items: old.items.map((n: any) => (n.read ? n : { ...n, read: true })) }
    })
    try {
      await Promise.all(toMark.map((n: any) => markRead(n.id)))
      await refetch()
    } catch {
      // rollback if something failed
      if (prev) qc.setQueryData(key, prev)
    }
  }

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent | TouchEvent) {
      const el = ref.current
      if (!el) return
      const target = e.target as Node
      if (el && !el.contains(target)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('touchstart', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('touchstart', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(v=>!v)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 hover:bg-black/5 dark:hover:bg-white/10" aria-haspopup="menu" aria-expanded={open} aria-controls="notifications-popover">
        <BellIcon className="h-5 w-5 text-slate-500" />
        {unread > 0 && <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-xs">{unread}</span>}
      </button>
      {open && (
        <div id="notifications-popover" role="menu" className="absolute right-0 mt-2 w-80 rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg py-1 text-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b border-black/5 dark:border-white/10">
            <span className="font-medium">Notifications</span>
            {unread > 0 ? (
              <button onClick={markAll} className="text-xs text-blue-600 hover:underline">Mark all read</button>
            ) : (
              <span className="text-xs text-slate-500">All caught up</span>
            )}
          </div>
          {/* Tabs */}
          <div className="px-3 pt-2 pb-1 flex items-center gap-1">
            <button
              className={`px-2.5 py-1 rounded-md text-xs ${tab==='new' ? 'bg-blue-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
              onClick={() => setTab('new')}
            >New</button>
            <button
              className={`px-2.5 py-1 rounded-md text-xs ${tab==='read' ? 'bg-blue-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
              onClick={() => setTab('read')}
            >Read</button>
          </div>
          <ul className="max-h-72 overflow-auto">
            {isLoading && <li className="px-3 py-2 text-slate-500">Loading…</li>}
            {(!isLoading && items.length === 0) && <li className="px-3 py-2 text-slate-500">No notifications.</li>}
            {(tab === 'new' ? newItems : readItems).map((n:any) => {
              let text: string
              if (n.type === 'announcement') {
                text = `Announcement: ${n.payload?.title}`
              } else if (n.type === 'job_assignment') {
                const act = (n.payload?.action || '').toLowerCase()
                const job = n.payload?.job_name || (n.payload?.job_id ? `Job #${n.payload.job_id}` : 'a job')
                text = act === 'unassigned' || act === 'canceled' ? `Canceled ${job}` : `Assigned to ${job}`
              } else {
                // Leave notifications (requested/status)
                const status = n.payload?.status || n.type
                const extra = n.payload?.status === 'rejected' && n.payload?.comment ? ` — ${n.payload.comment}` : ''
                text = `Leave ${status}${extra}`
              }
              return (
                <li key={n.id} className={`px-3 py-2 flex items-start gap-2 ${n.read ? 'opacity-70' : ''}`}>
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" />
                  <div className="flex-1">
                    <div className="text-sm">{text}</div>
                    <div className="text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function BellIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2m6-6v-5a6 6 0 0 0-5-5.91V4a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 11v5l-2 2v1h16v-1z" />
    </svg>
  )
}
