import { useCallback, useRef, useState } from 'react'

type Doc = { id: string; name: string; uploadedAt: string; owner?: string; category?: string }

export default function DocumentsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [docs, setDocs] = useState<Doc[]>(() => initialDocs)

  const openPicker = () => fileInputRef.current?.click()

  const onFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const additions: Doc[] = Array.from(files).map((f) => ({
      id: `${Date.now()}-${f.name}`,
      name: f.name,
      uploadedAt: new Date().toISOString().slice(0, 10),
      owner: 'Unassigned',
      category: 'General',
    }))
    setDocs((prev) => [...additions, ...prev])
  }, [])

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    onFiles(e.dataTransfer.files)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Documents</h1>
            <p className="text-slate-600 dark:text-slate-300">Upload and manage your HR documents.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={openPicker} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700">Upload Files</button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
          </div>
        </div>

        {/* Upload area */}
        <div
          onDragOver={(e) => {
            e.preventDefault(); setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${isDragging ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10' : 'border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60'}`}
        >
          <p className="font-medium">Drag & drop files here</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">or</p>
          <button onClick={openPicker} className="mt-2 rounded-md border border-black/10 dark:border-white/15 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">Browse</button>
        </div>

        {/* List/Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((d) => (
            <div key={d.id} className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <FileIcon className="h-9 w-9 text-violet-600" />
                  <div>
                    <div className="font-medium break-words">{d.name}</div>
                    <div className="text-xs text-slate-500">Uploaded {d.uploadedAt}</div>
                    <div className="text-xs text-slate-500">{d.owner} • {d.category}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10">View</button>
                  <button className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10">Download</button>
                  <button onClick={() => setDocs((prev) => prev.filter((x) => x.id !== d.id))} className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10 text-rose-600">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const initialDocs: Doc[] = [
  { id: 'd1', name: 'Employee Handbook.pdf', uploadedAt: '2025-09-10', owner: 'HR', category: 'Policy' },
  { id: 'd2', name: 'Alex_Johnson_Contract.pdf', uploadedAt: '2025-08-22', owner: 'Alex Johnson', category: 'Contract' },
  { id: 'd3', name: 'Holiday_Schedule_2025.xlsx', uploadedAt: '2025-08-01', owner: 'HR', category: 'Schedule' },
]

function FileIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m7 1.5V8h4.5" />
    </svg>
  )
}
