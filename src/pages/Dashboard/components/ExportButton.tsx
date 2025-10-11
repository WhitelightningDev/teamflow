export default function ExportButton() {
  function handleExport() {
    const rows = [
      ['date', 'event', 'detail'],
      [new Date().toISOString(), 'export', 'dashboard-summary'],
    ]
    const csv = rows.map((r) => r.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `teamflow-dashboard-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button onClick={handleExport} className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10">
      Export CSV
    </button>
  )
}

function escapeCsv(v: string) {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return '"' + v.replace(/"/g, '""') + '"'
  }
  return v
}

