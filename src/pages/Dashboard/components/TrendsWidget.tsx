import { useEffect, useMemo, useState } from 'react'
import type { TrendSeries } from '../../../lib/api'
import { dashboardTrends } from '../../../lib/api'

function Sparkline({ points, width = 260, height = 60 }: { points: { x: number; y: number }[]; width?: number; height?: number }) {
  if (points.length === 0) return null
  const minY = Math.min(...points.map((p) => p.y))
  const maxY = Math.max(...points.map((p) => p.y))
  const spanY = Math.max(1, maxY - minY)
  const stepX = width / Math.max(1, points.length - 1)
  const d = points
    .map((p, i) => {
      const x = i * stepX
      const y = height - ((p.y - minY) / spanY) * height
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2} className="text-blue-600 dark:text-blue-400" />
    </svg>
  )
}

export default function TrendsWidget() {
  const [series, setSeries] = useState<TrendSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [window, setWindow] = useState<'6m' | '3m' | '1m' | '7d'>('6m')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await dashboardTrends({ window })
        if (!cancelled) setSeries(res)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [window])

  const pts = useMemo(() => {
    const s = series[0]
    if (!s) return [] as { x: number; y: number }[]
    return s.points.map((p, i) => ({ x: i, y: p.value }))
  }, [series])

  if (loading) {
    return (
      <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm" aria-busy>
        <div className="h-4 w-40 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
      </section>
    )
  }
  if (!series.length) return null
  return (
    <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Headcount Trend</h2>
        <div className="flex items-center gap-2 text-xs">
          <button onClick={() => setWindow('6m')} className={`rounded px-2 py-1 border ${window==='6m' ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10'}`}>6m</button>
          <button onClick={() => setWindow('3m')} className={`rounded px-2 py-1 border ${window==='3m' ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10'}`}>3m</button>
          <button onClick={() => setWindow('1m')} className={`rounded px-2 py-1 border ${window==='1m' ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10'}`}>1m</button>
          <button onClick={() => setWindow('7d')} className={`rounded px-2 py-1 border ${window==='7d' ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10'}`}>7d</button>
        </div>
      </div>
      <Sparkline points={pts} />
    </section>
  )
}
