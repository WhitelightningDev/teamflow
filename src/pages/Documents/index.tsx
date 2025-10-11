import { useCallback, useEffect, useRef, useState } from 'react'
import Breadcrumbs from '../../components/Breadcrumbs'
import { useAlerts } from '../../components/AlertsProvider'
import { listDocuments, uploadDocument, deleteDocument, type DocumentOut } from '../../lib/api'

type Doc = { id: number | string; name: string; uploadedAt: string; owner?: string; category?: string }

export default function DocumentsPage() {
  const alerts = useAlerts()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [docs, setDocs] = useState<Doc[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await listDocuments({ page: 1, size: 50 })
        if (!cancelled) setDocs(res.items.map(mapDoc))
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load documents')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const openPicker = () => fileInputRef.current?.click()

  const onFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const uploaded: Doc[] = []
      for (const f of Array.from(files)) {
        const created = await uploadDocument(f)
        uploaded.push(mapDoc(created))
      }
      setDocs((prev) => [...uploaded, ...prev])
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
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
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Documents' }]} />
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
        {loading && (
          <div className="text-sm text-slate-500">Loading…</div>
        )}
        {error && (
          <div className="text-sm text-rose-600">{error}</div>
        )}
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
                  <button className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10" onClick={() => alerts.success('Preview coming soon')}>View</button>
                  <button className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10" onClick={() => alerts.success('Download coming soon')}>Download</button>
                  <button onClick={async () => { try { await deleteDocument(d.id); setDocs((prev) => prev.filter((x) => x.id !== d.id)) } catch { alert('Delete failed') } }} className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10 text-rose-600">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


function FileIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m7 1.5V8h4.5" />
    </svg>
  )
}

function mapDoc(d: DocumentOut): Doc {
  const uploaded = typeof d.uploaded_at === 'string' ? d.uploaded_at.slice(0, 10) : d.uploaded_at ? new Date(d.uploaded_at).toISOString().slice(0, 10) : ''
  return {
    id: d.id,
    name: d.filename,
    uploadedAt: uploaded,
    owner: d.uploaded_by ? `User #${d.uploaded_by}` : 'Unknown',
    category: d.content_type || 'Document',
  }
}
