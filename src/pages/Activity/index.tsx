import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'
import { listDocuments, listLeaves, type DocumentOut, type LeaveOut } from '../../lib/api'
import { FileText, Calendar, Filter } from 'lucide-react'

type ActivityItem = {
  id: string
  type: 'document' | 'leave'
  when: Date
  title: string
  detail: string
}

export default function RecentActivityPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<ActivityItem[]>([])
  const [filter, setFilter] = useState<'all' | 'documents' | 'leaves'>('all')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [docs, leaves] = await Promise.all([
          listDocuments({ page: 1, size: 100 }),
          listLeaves({ page: 1, size: 100 }),
        ])
        if (cancelled) return
        const mapped: ActivityItem[] = [
          ...docs.items.map(mapDoc),
          ...leaves.items.map(mapLeave),
        ]
        mapped.sort((a, b) => b.when.getTime() - a.when.getTime())
        setItems(mapped)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load activity')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    if (filter === 'documents') return items.filter((i) => i.type === 'document')
    return items.filter((i) => i.type === 'leave')
  }, [items, filter])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Recent Activity' }]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Recent Activity</h1>
            <p className="text-slate-600 dark:text-slate-300">A detailed timeline of company-wide updates, document uploads, and leave requests.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard" className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">Back to Dashboard</Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"><Filter className="h-4 w-4" /> Filter:</span>
          <FilterChip active={filter==='all'} onClick={() => setFilter('all')}>All</FilterChip>
          <FilterChip active={filter==='documents'} onClick={() => setFilter('documents')}>Documents</FilterChip>
          <FilterChip active={filter==='leaves'} onClick={() => setFilter('leaves')}>Leaves</FilterChip>
        </div>

        {/* Timeline */}
        <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm">
          {loading && <div className="text-center text-slate-500">Loading…</div>}
          {!loading && error && <div className="text-center text-rose-600">{error}</div>}
          {!loading && !error && (
            <ul className="divide-y divide-black/5 dark:divide-white/10">
              {filtered.map((it) => (
                <li key={it.id} className="flex items-start gap-3 py-4">
                  <div className={`mt-1 h-8 w-8 flex items-center justify-center rounded-lg ${it.type === 'document' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'}`}>
                    {it.type === 'document' ? <FileText className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{it.title}</h3>
                      <time className="text-xs text-slate-500">{formatDate(it.when)}</time>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{it.detail}</p>
                  </div>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="py-4 text-center text-slate-500">No matching activity.</li>
              )}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

// Helpers
function mapDoc(d: DocumentOut): ActivityItem {
  const when = toDate(d.uploaded_at) || new Date()
  const title = 'Document uploaded'
  const detail = `${d.filename}${d.category ? ` • ${d.category}` : ''}`
  return { id: `doc-${d.id}`, type: 'document', when, title, detail }
}

function mapLeave(l: LeaveOut): ActivityItem {
  const start = toDate(l.start_date)
  const end = toDate(l.end_date)
  const when = start || new Date()
  const title = `Leave ${l.status || 'request'}`
  const range = [start, end].filter(Boolean).map((d) => formatDate(d!)).join(' – ')
  const detail = `${l.leave_type}${range ? ` • ${range}` : ''}`
  return { id: `leave-${l.id}`, type: 'leave', when, title, detail }
}

function toDate(v: string | Date | undefined | null): Date | null {
  if (!v) return null
  try { return new Date(v as any) } catch { return null }
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: undefined }).format(d)
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: any }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs border ${active ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10'}`}
    >
      {children}
    </button>
  )
}

