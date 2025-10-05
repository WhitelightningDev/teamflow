import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AnnouncementsCreate() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<'company'|'managers'|'employees'>('company')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!title.trim()) return setError('Title is required')
    setLoading(true)
    try {
      const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000'
      const res = await fetch(`${base}/api/v1/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, audience }),
      })
      if (!res.ok) {
        const d = await res.json().catch(()=>({})) as any
        throw new Error(d?.detail || 'Failed to create')
      }
      // simple toast
      alert('Announcement published!')
      navigate('/announcements')
    } catch (err: any) {
      setError(err?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Create Announcement</h1>
      {error && <div className="text-sm text-rose-600">{error}</div>}
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Body</label>
          <textarea value={body} onChange={(e)=>setBody(e.target.value)} rows={6} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Audience</label>
          <select value={audience} onChange={(e)=>setAudience(e.target.value as any)} className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2">
            <option value="company">Whole Company</option>
            <option value="managers">Managers</option>
            <option value="employees">Employees</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={()=>navigate('/announcements')} className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2">Cancel</button>
          <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700">{loading? 'Publishing…':'Publish'}</button>
        </div>
      </form>
    </div>
  )
}

