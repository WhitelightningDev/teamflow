import { useEffect, useState } from 'react'
import type { ScorecardRow } from '../../../lib/api'
import { dashboardScorecards } from '../../../lib/api'

export default function ScorecardsWidget() {
  const [rows, setRows] = useState<ScorecardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await dashboardScorecards()
        if (!cancelled) setRows(res)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load scorecards')
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
        <div className="h-4 w-48 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
      </section>
    )
  }
  if (error) return null
  if (!rows.length) return null
  return (
    <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Department Scorecards</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-lg overflow-hidden">
          <thead className="bg-slate-50/80 dark:bg-neutral-800/50">
            <tr>
              <th className="px-3 py-2 text-left">Department</th>
              <th className="px-3 py-2 text-left">Employees</th>
              <th className="px-3 py-2 text-left">Pending Leaves</th>
              <th className="px-3 py-2 text-left">Active Assignments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {rows.map((r) => (
              <tr key={r.group}>
                <td className="px-3 py-2">{r.group}</td>
                <td className="px-3 py-2">{r.employees}</td>
                <td className="px-3 py-2">{r.pending_leaves}</td>
                <td className="px-3 py-2">{r.active_assignments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

