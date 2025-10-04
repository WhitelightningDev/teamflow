import { Card, CardBody, CardHeader, Avatar, Chip, Button } from '@heroui/react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const userName = 'Jane'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <nav className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 backdrop-blur p-3 sm:p-4">
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <span className="inline-block h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500"></span>
                <span className="text-base font-semibold tracking-tight">Teamflow</span>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                <li>
                  <Link to="/dashboard" className="group flex items-center gap-3 rounded-lg px-3 py-2 bg-blue-600 text-white">
                    <DashboardIcon className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <a href="#employees" className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
                    <EmployeesIcon className="h-5 w-5 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
                    <span>Employees</span>
                  </a>
                </li>
                <li>
                  <a href="#leaves" className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
                    <LeavesIcon className="h-5 w-5 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
                    <span>Leaves</span>
                  </a>
                </li>
                <li>
                  <a href="#documents" className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
                    <DocumentsIcon className="h-5 w-5 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
                    <span>Documents</span>
                  </a>
                </li>
                <li>
                  <a href="#settings" className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
                    <SettingsIcon className="h-5 w-5 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
                    <span>Settings</span>
                  </a>
                </li>
              </ul>
              <div className="mt-4 rounded-lg bg-black/5 dark:bg-white/5 p-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">Quick actions</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" color="primary" className="px-3">Add Employee</Button>
                  <Button size="sm" variant="bordered" className="px-3">New Leave</Button>
                </div>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <section className="lg:col-span-9 space-y-6">
            {/* Greeting */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {userName}</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">Here’s what’s happening with your team today.</p>
              </div>
              <Avatar name={userName} className="hidden sm:inline-flex" />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <Card className="shadow-sm">
                <CardHeader className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <EmployeesIcon className="h-6 w-6 text-blue-600" />
                    <span className="font-medium">Employees</span>
                  </div>
                  <Chip color="primary" variant="flat" size="sm">Active</Chip>
                </CardHeader>
                <CardBody>
                  <p className="text-3xl font-bold">18</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Total team members</p>
                </CardBody>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LeavesIcon className="h-6 w-6 text-emerald-600" />
                    <span className="font-medium">Pending Leave</span>
                  </div>
                  <Chip color="success" variant="flat" size="sm">Today</Chip>
                </CardHeader>
                <CardBody>
                  <p className="text-3xl font-bold">3</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Awaiting approval</p>
                </CardBody>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DocumentsIcon className="h-6 w-6 text-violet-600" />
                    <span className="font-medium">Documents</span>
                  </div>
                  <Chip color="warning" variant="flat" size="sm">Action</Chip>
                </CardHeader>
                <CardBody>
                  <p className="text-3xl font-bold">2</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Needing attention</p>
                </CardBody>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-sm">
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                <Button size="sm" variant="light">View all</Button>
              </CardHeader>
              <CardBody>
                <ul className="divide-y divide-black/5 dark:divide-white/10">
                  <ActivityItem
                    name="Alex Johnson"
                    action="submitted a leave request"
                    time="2h ago"
                  />
                  <ActivityItem
                    name="Priya Patel"
                    action="updated employee profile"
                    time="5h ago"
                  />
                  <ActivityItem
                    name="Sam Lee"
                    action="uploaded a new policy document"
                    time="1d ago"
                  />
                </ul>
              </CardBody>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ name, action, time }: { name: string; action: string; time: string }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <Avatar name={name} size="sm" />
      <div className="flex-1">
        <p className="text-sm"><span className="font-medium">{name}</span> {action}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{time}</p>
      </div>
      <Button size="sm" variant="bordered" className="hidden sm:inline-flex">Open</Button>
    </li>
  )
}

function DashboardIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z" />
    </svg>
  )
}

function EmployeesIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4m-7 8a7 7 0 0 1 14 0v1H5z" />
    </svg>
  )
}

function LeavesIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 0 0-9-9m1 4c2.76 0 5 2.24 5 5 0 2.21-1.79 4-4 4h-2v-2h2a2 2 0 0 0 0-4h-2V6z" />
    </svg>
  )
}

function DocumentsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m7 1.5V8h4.5" />
    </svg>
  )
}

function SettingsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 8a4 4 0 1 1-4 4 4 4 0 0 1 4-4m8.94 4a7.93 7.93 0 0 0-.11-1.31l2.11-1.65-2-3.46-2.49 1a7.77 7.77 0 0 0-2.27-1.32l-.38-2.65h-4l-.38 2.65A7.77 7.77 0 0 0 7.45 4.3l-2.49-1-2 3.46L5.07 8.4A7.93 7.93 0 0 0 5 12a7.93 7.93 0 0 0 .11 1.31l-2.11 1.65 2 3.46 2.49-1a7.77 7.77 0 0 0 2.27 1.32l.38 2.65h4l.38-2.65a7.77 7.77 0 0 0 2.27-1.32l2.49 1 2-3.46-2.11-1.65c.07-.43.11-.87.11-1.31Z" />
    </svg>
  )
}

