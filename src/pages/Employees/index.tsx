import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listEmployees, createEmployee, deleteEmployee, type EmployeeOut } from '../../lib/api'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Switch, Select, SelectItem } from '@heroui/react'
import Breadcrumbs from '../../components/Breadcrumbs'

type UIEmployee = { id: string | number; name: string; role: string; status: 'Active' | 'Inactive' }

export default function EmployeesPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<UIEmployee[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await listEmployees({ page: 1, size: 50 })
        if (cancelled) return
        const items = res.items.map(mapEmployee)
        setEmployees(items)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load employees')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return employees
    return employees.filter((e) =>
      [e.name, e.role, e.status].some((v) => v.toLowerCase().includes(q))
    )
  }, [employees, query])

  // Add Employee modal state
  const [addOpen, setAddOpen] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [emailNew, setEmailNew] = useState('')
  const [roleNew, setRoleNew] = useState('employee')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [activeNew, setActiveNew] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function openAdd() {
    setFirstName(''); setLastName(''); setEmailNew(''); setRoleNew('employee');
    setStartDate(new Date().toISOString().slice(0, 10)); setActiveNew(true); setFormError(null);
    setAddOpen(true)
  }

  async function submitAdd() {
    setFormError(null)
    setSubmitted(true)
    if (!firstName.trim() || !lastName.trim() || !/.+@.+\..+/.test(emailNew)) {
      setFormError('Please fill first name, last name and a valid email.')
      return
    }
    try {
      setSaving(true)
      await createEmployee({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: emailNew.trim(),
        role: roleNew || 'employee',
        start_date: startDate,
        is_active: activeNew,
      })
      const res = await listEmployees({ page: 1, size: 50 })
      setEmployees(res.items.map(mapEmployee))
      setAddOpen(false)
    } catch (e: any) {
      setFormError(e?.message || 'Failed to create employee')
    } finally {
      setSaving(false)
    }
  }

  async function removeEmployee(id: string | number) {
    try {
      await deleteEmployee(id)
      setEmployees((prev) => prev.filter((e) => e.id !== id))
    } catch (e) {
      alert('Failed to delete employee')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Employees' }]} />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Employees</h1>
            <p className="text-slate-600 dark:text-slate-300">Manage your team members and roles.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={openAdd} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700">Add Employee</button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-96">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 pl-9 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <SearchIcon className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Table (desktop) */}
        <div className="hidden md:block rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 dark:bg-neutral-800/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {loading && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Loading…</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-rose-600">{error}</td></tr>
              )}
              {!loading && !error && filtered.map((e) => (
                <tr key={e.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="px-4 py-3">{e.name}</td>
                  <td className="px-4 py-3">{e.role}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      e.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-600/20 dark:text-slate-300'
                    }`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Edit</button>
                      <button onClick={() => removeEmployee(e.id)} className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Delete</button>
                      <Link to="#" className="rounded-md bg-blue-600 text-white px-2.5 py-1 hover:bg-blue-700">Details</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden grid grid-cols-1 gap-3">
          {loading && (
            <div className="text-center text-slate-500">Loading…</div>
          )}
          {!loading && !error && filtered.map((e) => (
            <div key={e.id} className="rounded-xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-slate-500">{e.role}</div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  e.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-600/20 dark:text-slate-300'
                }`}>{e.status}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Edit</button>
                <button onClick={() => removeEmployee(e.id)} className="rounded-md border border-black/10 dark:border-white/15 px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10">Delete</button>
                <Link to="#" className="rounded-md bg-blue-600 text-white px-2.5 py-1 hover:bg-blue-700">Details</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        backdrop="blur"
        size="lg"
        radius="lg"
        classNames={{
          base: 'bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-2xl rounded-2xl',
          header: 'px-6 pt-6 pb-2',
          body: 'px-6 py-4',
          footer: 'px-6 pb-6',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Employee
                <p className="text-sm font-normal text-slate-600 dark:text-slate-300">Create a new team member profile.</p>
              </ModalHeader>
              <ModalBody>
                {formError && (
                  <div className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-500/10 rounded-md px-3 py-2">{formError}</div>
                )}
                <form className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label={
                      <span className="text-slate-700 dark:text-slate-200">
                        First name
                        <span className="block text-xs font-normal text-slate-500">e.g., Alex</span>
                      </span>
                    }
                    labelPlacement="outside"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    isRequired
                    isInvalid={submitted && !firstName.trim()}
                    errorMessage={submitted && !firstName.trim() ? 'Required' : undefined}
                    size="md"
                    variant="bordered"
                    classNames={{
                      inputWrapper: 'bg-white dark:bg-neutral-900/60 border border-black/10 dark:border-white/15 shadow-sm',
                      label: 'text-slate-700 dark:text-slate-200'
                    }}
                  />
                  <Input
                    label={
                      <span className="text-slate-700 dark:text-slate-200">
                        Last name
                        <span className="block text-xs font-normal text-slate-500">e.g., Johnson</span>
                      </span>
                    }
                    labelPlacement="outside"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    isRequired
                    isInvalid={submitted && !lastName.trim()}
                    errorMessage={submitted && !lastName.trim() ? 'Required' : undefined}
                    size="md"
                    variant="bordered"
                    classNames={{
                      inputWrapper: 'bg-white dark:bg-neutral-900/60 border border-black/10 dark:border-white/15 shadow-sm',
                      label: 'text-slate-700 dark:text-slate-200'
                    }}
                  />
                  <Input
                    className="sm:col-span-2"
                    type="email"
                    label={
                      <span className="text-slate-700 dark:text-slate-200">
                        Email
                        <span className="block text-xs font-normal text-slate-500">you@company.com</span>
                      </span>
                    }
                    labelPlacement="outside"
                    value={emailNew}
                    onChange={(e) => setEmailNew(e.target.value)}
                    isRequired
                    isInvalid={submitted && !!emailNew && !/.+@.+\..+/.test(emailNew)}
                    errorMessage={submitted && !!emailNew && !/.+@.+\..+/.test(emailNew) ? 'Enter a valid email' : undefined}
                    size="md"
                    variant="bordered"
                    classNames={{
                      inputWrapper: 'bg-white dark:bg-neutral-900/60 border border-black/10 dark:border-white/15 shadow-sm',
                      label: 'text-slate-700 dark:text-slate-200'
                    }}
                  />
                  <Select
                    label={
                      <span className="text-slate-700 dark:text-slate-200">
                        Role
                        <span className="block text-xs font-normal text-slate-500">choose access level</span>
                      </span>
                    }
                    labelPlacement="outside"
                    selectedKeys={new Set([roleNew])}
                    onSelectionChange={(keys) => setRoleNew(Array.from(keys)[0] as string)}
                    size="md"
                    variant="bordered"
                    classNames={{
                      trigger: 'bg-white dark:bg-neutral-900/60 border border-black/10 dark:border-white/15 shadow-sm',
                      label: 'text-slate-700 dark:text-slate-200'
                    }}
                  >
                    <SelectItem key="employee">Employee</SelectItem>
                    <SelectItem key="manager">Manager</SelectItem>
                    <SelectItem key="admin">Admin</SelectItem>
                  </Select>
                  <Input
                    type="date"
                    label={
                      <span className="text-slate-700 dark:text-slate-200">
                        Start date
                        <span className="block text-xs font-normal text-slate-500">YYYY-MM-DD</span>
                      </span>
                    }
                    labelPlacement="outside"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    size="md"
                    variant="bordered"
                    classNames={{
                      inputWrapper: 'bg-white dark:bg-neutral-900/60 border border-black/10 dark:border-white/15 shadow-sm',
                      label: 'text-slate-700 dark:text-slate-200'
                    }}
                  />
                  <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                    <Switch isSelected={activeNew} onValueChange={setActiveNew} size="sm">
                      Active
                    </Switch>
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} disabled={saving} className="shadow-sm">Cancel</Button>
                <Button color="primary" onPress={submitAdd} isLoading={saving} className="shadow-sm">Save</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

function mapEmployee(e: EmployeeOut): UIEmployee {
  const name = [e.first_name, e.last_name].filter(Boolean).join(' ') || e.email
  const role = e.role || 'employee'
  const status: 'Active' | 'Inactive' = e.is_active === false ? 'Inactive' : 'Active'
  return { id: e.id, name, role, status }
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  )
}
