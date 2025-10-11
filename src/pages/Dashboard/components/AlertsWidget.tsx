import { useEffect, useState } from 'react'
import type { AlertItem } from '../../../lib/api'
import { dashboardAlerts } from '../../../lib/api'

export default function AlertsWidget() {
  const [items, setItems] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await dashboardAlerts()
        if (!cancelled) setItems(res)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm" aria-busy>
        <div className="h-4 w-40 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
      </section>
    )
  }
  if (items.length === 0) return null
  return (
    <section className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Alerts</h2>
      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a.key} className="text-sm">
            <span className={`font-medium ${a.severity === 'critical' ? 'text-rose-600 dark:text-rose-300' : 'text-amber-700 dark:text-amber-200'}`}>
              {a.label}
            </span>
            : {a.value} (threshold {a.threshold})
            {a.hint ? <span className="text-slate-500 dark:text-slate-400"> — {a.hint}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

