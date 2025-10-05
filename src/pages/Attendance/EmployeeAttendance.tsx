import { useEffect, useState } from 'react'
import { getUser } from '../../lib/api'

export default function EmployeeAttendance() {
  const [today, setToday] = useState<any | null>(null)
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function reload() {
    setLoading(true)
    try {
      const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000'
      const res = await fetch(`${base}/api/v1/attendance/me`)
      const data = await res.json()
      setList(data.items || [])
    } finally {
      setLoading(false)
    }
  }

  async function clockIn() {
    const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000'
    await fetch(`${base}/api/v1/attendance/clock-in`, { method: 'POST' })
    reload()
  }
  async function clockOut() {
    const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000'
    await fetch(`${base}/api/v1/attendance/clock-out`, { method: 'POST' })
    reload()
  }

  useEffect(() => { reload() }, [])

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">My Attendance</h1>
      <div className="flex gap-2">
        <button onClick={clockIn} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700">Clock In</button>
        <button onClick={clockOut} className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10">Clock Out</button>
      </div>
      {loading ? (
        <div className="text-sm text-slate-500">Loading…</div>
      ) : (
        <table className="w-full text-sm rounded-2xl overflow-hidden border border-black/5 dark:border-white/10">
          <thead className="bg-slate-50/80 dark:bg-neutral-800/50">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Clock In</th>
              <th className="px-3 py-2 text-left">Clock Out</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {list.map(r => (
              <tr key={r.id}>
                <td className="px-3 py-2">{String(r.date).slice(0,10)}</td>
                <td className="px-3 py-2">{r.clock_in_ts ? String(r.clock_in_ts).slice(11,19) : '—'}</td>
                <td className="px-3 py-2">{r.clock_out_ts ? String(r.clock_out_ts).slice(11,19) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

