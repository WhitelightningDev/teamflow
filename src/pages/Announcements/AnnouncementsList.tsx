import { useEffect, useState } from 'react'

export default function AnnouncementsList() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000'}/api/v1/announcements?audience=me`)
        const data = await res.json()
        if (!cancelled) setItems(data.items || [])
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4">
      <h1 className="text-2xl font-bold">Announcements</h1>
      {loading && <div className="text-sm text-slate-500">Loading…</div>}
      {error && <div className="text-sm text-rose-600">{error}</div>}
      {(!loading && items.length === 0) && <div className="text-sm text-slate-500">No announcements.</div>}
      {items.map(a => (
        <div key={a.id} className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{a.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{a.body}</p>
        </div>
      ))}
    </div>
  )
}
