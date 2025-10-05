import { Link } from 'react-router-dom'
import Logo from '../../components/Logo'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-neutral-950 dark:to-neutral-900 text-slate-900 dark:text-slate-100">
      {/* Navbar */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 dark:bg-neutral-950/70 border-b border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="inline-flex items-center gap-2">
                <Logo height={28} withText={false} />
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <a href="#features" className="hover:text-blue-600">Features</a>
              <a href="#pricing" className="hover:text-blue-600">Pricing</a>
              <a href="#contact" className="hover:text-blue-600">Contact</a>
            </nav>
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">Log in</Link>
              <Link to="/register" className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Get Started</Link>
            </div>
            {/* Simple mobile fallback: stack links below header using anchor list */}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Streamline HR for Small Businesses
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8">
              Onboard faster, manage time off, and keep your team aligned — all in one simple, modern HR platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-white font-medium shadow-sm hover:bg-blue-700">
                Get Started
              </Link>
              <a href="#features" className="inline-flex items-center justify-center rounded-lg px-5 py-3 font-medium border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10">
                Learn More
              </a>
            </div>
          </div>

          {/* Right: illustration / abstract graphic */}
          <div className="relative">
            <div className="relative mx-auto w-full max-w-md aspect-square">
              <div aria-hidden className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500 opacity-90 shadow-2xl"></div>
              <div aria-hidden className="absolute -inset-4 blur-2xl bg-gradient-to-tr from-blue-600/40 via-indigo-500/40 to-fuchsia-500/40"></div>
              <div className="relative h-full w-full rounded-3xl bg-white/70 dark:bg-neutral-950/60 p-6 ring-1 ring-black/10 dark:ring-white/10 backdrop-blur">
                <div className="grid h-full w-full grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 ring-1 ring-black/5 dark:ring-white/10"></div>
                  <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 ring-1 ring-black/5 dark:ring-white/10"></div>
                  <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 ring-1 ring-black/5 dark:ring-white/10"></div>
                  <div className="col-span-2 rounded-xl bg-white/80 dark:bg-neutral-900/80 ring-1 ring-black/5 dark:ring-white/10"></div>
                  <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 ring-1 ring-black/5 dark:ring-white/10"></div>
                  <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 ring-1 ring-black/5 dark:ring-white/10"></div>
                  <div className="col-span-2 rounded-xl bg-white/80 dark:bg-neutral-900/80 ring-1 ring-black/5 dark:ring-white/10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Anchor sections for navbar links */}
        <section id="features" className="mt-24">
          <h2 className="text-2xl font-semibold mb-6 text-center">Powerful Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Leave Management */}
            <div className="text-center rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/50 p-6 sm:p-8 backdrop-blur">
              <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500 text-white flex items-center justify-center shadow">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1m10 5H7v2h10zM4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">Leave Management</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Request, approve, and track time off with clear visibility for teams.
              </p>
            </div>

            {/* Employee Directory */}
            <div className="text-center rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/50 p-6 sm:p-8 backdrop-blur">
              <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500 text-white flex items-center justify-center shadow">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4m-7 8a7 7 0 0 1 14 0v1H5z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">Employee Directory</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Searchable profiles with roles and contact details to connect quickly.
              </p>
            </div>

            {/* Document Storage */}
            <div className="text-center rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/50 p-6 sm:p-8 backdrop-blur">
              <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500 text-white flex items-center justify-center shadow">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M3 6a3 3 0 0 1 3-3h4l2 2h6a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zm3 3h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">Document Storage</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Keep policies and documents organized with secure, easy access.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="mt-24">
          <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/50 p-6 sm:p-8 backdrop-blur">
            <h2 className="text-2xl font-semibold text-center mb-6">Loved by small teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <figure className="text-center flex flex-col items-center">
                <img
                  src="https://i.pravatar.cc/96?img=47"
                  alt="Jane Smith"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white/70 dark:ring-white/10 shadow"
                  loading="lazy"
                />
                <blockquote className="mt-4 text-sm text-slate-700 dark:text-slate-300 max-w-xs">
                  “Teamflow made leave approvals effortless and gave us clearer visibility across the team.”
                </blockquote>
                <figcaption className="mt-3 text-sm">
                  <div className="font-medium">Jane Smith</div>
                  <div className="text-slate-500 dark:text-slate-400">HR Manager, Acme Co.</div>
                </figcaption>
              </figure>

              <figure className="text-center flex flex-col items-center">
                <img
                  src="https://i.pravatar.cc/96?img=12"
                  alt="Carlos Mendes"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white/70 dark:ring-white/10 shadow"
                  loading="lazy"
                />
                <blockquote className="mt-4 text-sm text-slate-700 dark:text-slate-300 max-w-xs">
                  “The employee directory is fast and intuitive. Our onboarding speed improved immediately.”
                </blockquote>
                <figcaption className="mt-3 text-sm">
                  <div className="font-medium">Carlos Mendes</div>
                  <div className="text-slate-500 dark:text-slate-400">Operations Lead, BrightStart</div>
                </figcaption>
              </figure>

              <figure className="text-center flex flex-col items-center">
                <img
                  src="https://i.pravatar.cc/96?img=5"
                  alt="Amina Khan"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white/70 dark:ring-white/10 shadow"
                  loading="lazy"
                />
                <blockquote className="mt-4 text-sm text-slate-700 dark:text-slate-300 max-w-xs">
                  “Document storage keeps everything organized and accessible. No more lost policies.”
                </blockquote>
                <figcaption className="mt-3 text-sm">
                  <div className="font-medium">Amina Khan</div>
                  <div className="text-slate-500 dark:text-slate-400">Founder, Northbridge Studio</div>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="pricing" className="mt-16">
          <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
          <p className="text-slate-600 dark:text-slate-300">Straightforward, scalable pricing for small teams and growing startups.</p>
        </section>

        <section id="contact" className="mt-16">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p className="text-slate-600 dark:text-slate-300">Questions? Reach out — we’re here to help.</p>
        </section>
      </main>
    </div>
  )
}
