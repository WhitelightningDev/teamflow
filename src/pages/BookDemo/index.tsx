import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../../components/Logo'

export default function BookDemoPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [teamSize, setTeamSize] = useState('1-5')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !email.trim() || !company.trim()) {
      setError('Please fill in name, work email, and company.')
      return
    }
    // Best-effort: open email client with prefilled request
    try {
      const subject = encodeURIComponent(`Teamflow Demo Request: ${company}`)
      const body = encodeURIComponent(
        [`Name: ${name}`, `Email: ${email}`, `Company: ${company}`, `Team size: ${teamSize}`, `Preferred: ${date || 'any'} ${time || ''}`, '', notes ? `Notes:\n${notes}` : ''].join('\n')
      )
      window.location.href = `mailto:support@teamflow.app?subject=${subject}&body=${body}`
    } catch {}
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-neutral-950 dark:to-neutral-900 text-slate-900 dark:text-slate-100">
      {/* Navbar (simple) */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 dark:bg-neutral-950/70 border-b border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              {/* //logo needs to stay 200px  */}
              <Link to="/" className="inline-flex items-center gap-2"><Logo height={200} withText={false} /></Link>
              <span className="hidden sm:inline text-sm text-slate-600 dark:text-slate-300">Book a Demo</span>
            </div>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <a href="#contact" className="hover:text-blue-600">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-6 sm:p-8 backdrop-blur">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Book a Demo</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">Tell us a bit about your team and when you’d like to meet. We’ll follow up with a calendar invite.</p>

          {submitted ? (
            <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 p-6">
              <h2 className="text-lg font-semibold">Thanks! Your demo request was noted.</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">We’ve opened your email client with the details. If it didn’t open, you can email us directly at <a href="mailto:support@teamflow.app" className="underline">support@teamflow.app</a>.</p>
              <div className="mt-4">
                <Link to="/" className="inline-flex items-center justify-center rounded-lg px-4 py-2 border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10">Back to Home</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
              {error && <div className="rounded-md border border-rose-300/40 bg-rose-50/80 dark:bg-rose-900/20 px-3 py-2 text-rose-700 dark:text-rose-200 text-sm">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Work email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} required className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Team size</label>
                  <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)} className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option>1-5</option>
                    <option>6-20</option>
                    <option>21-50</option>
                    <option>51-200</option>
                    <option>200+</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred time</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Anything specific you’d like to see?" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 !text-white font-medium hover:bg-blue-700">Book Demo</button>
                <a href="mailto:support@teamflow.app" className="text-sm text-slate-600 dark:text-slate-300 hover:underline">Or email us: support@teamflow.app</a>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}

