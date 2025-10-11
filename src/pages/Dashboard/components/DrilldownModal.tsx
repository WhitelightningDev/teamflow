import type { JSX } from 'react'

export default function DrilldownModal({
  metric,
  onClose,
}: {
  metric: string
  onClose: () => void
}): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal className="relative w-full max-w-lg rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Details: {humanize(metric)}</h3>
          <button onClick={onClose} className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">Close</button>
        </div>
        <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          <p>This is a simple drilldown placeholder for the “{metric}” metric. Hook this up to real data when ready.</p>
        </div>
      </div>
    </div>
  )
}

function humanize(key: string): string {
  return key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

