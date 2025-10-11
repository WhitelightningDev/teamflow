import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-neutral-950 dark:to-neutral-900 text-slate-900 dark:text-slate-100">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">About Teamflow</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Teamflow is a simple, modern HR platform for small businesses. It helps teams onboard faster,
            manage time and leave, keep documents organized, and stay aligned — all in one place.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/register" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 !text-white font-medium shadow-sm hover:bg-blue-700">Get Started</Link>
            <Link to="/book-demo" className="inline-flex items-center justify-center rounded-lg px-5 py-3 font-medium border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10">Book a Demo</Link>
          </div>
        </section>

        {/* What it does */}
        <section className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 p-6 sm:p-8 backdrop-blur">
          <h2 className="text-xl font-semibold">What You Can Do with Teamflow</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <Feature title="Employee Directory" desc="Find people fast with roles, titles and contact details." />
            <Feature title="Leave Management" desc="Request, approve and track time off with clear status." />
            <Feature title="Time & Jobs" desc="Clock in/out, track assignments and view billed hours." />
            <Feature title="Documents" desc="Store policies and HR files with quick, secure access." />
            <Feature title="Announcements" desc="Share updates company‑wide so everyone stays in sync." />
            <Feature title="Dashboards" desc="See KPIs and trends for staffing, leaves and workload." />
          </div>
        </section>

        {/* How it works */}
        <section className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 p-6 sm:p-8 backdrop-blur">
          <h2 className="text-xl font-semibold">How It Works</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li>1. Create your company and invite your team.</li>
            <li>2. Add job types and set rates if you track time.</li>
            <li>3. Employees request leave, upload docs and clock time.</li>
            <li>4. Admins review requests, manage assignments and export reports.</li>
          </ul>
        </section>

        {/* Trust */}
        <section className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 p-6 sm:p-8 backdrop-blur">
          <h2 className="text-xl font-semibold">Why Teams Choose Teamflow</h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
            <li className="rounded-xl border border-black/5 dark:border-white/10 p-4">Clean, fast UI your team will actually use.</li>
            <li className="rounded-xl border border-black/5 dark:border-white/10 p-4">Role‑based access for admins, managers and employees.</li>
            <li className="rounded-xl border border-black/5 dark:border-white/10 p-4">Exports for reporting and billing.</li>
            <li className="rounded-xl border border-black/5 dark:border-white/10 p-4">Built with modern, open web standards.</li>
          </ul>
          <div className="mt-6 flex justify-center">
            <Link to="/register" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 !text-white font-medium shadow-sm hover:bg-blue-700">Create your free account</Link>
          </div>
        </section>

        <div className="text-center">
          <Link className="text-blue-600 hover:underline" to="/">Back to Home</Link>
        </div>
      </main>
    </div>
  )
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 p-4">
      <div className="font-medium">{title}</div>
      <p className="mt-1 text-slate-600 dark:text-slate-300">{desc}</p>
    </div>
  )
}
