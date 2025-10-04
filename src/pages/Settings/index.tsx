import { useState } from 'react'
import Breadcrumbs from '../../components/Breadcrumbs'

type Tab = 'Profile' | 'Account' | 'Notifications' | 'Security'

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('Profile')

  // Profile
  const [companyName, setCompanyName] = useState('Acme Co.')
  const [contactEmail, setContactEmail] = useState('hr@acme.co')
  const [logoFileName, setLogoFileName] = useState<string | null>(null)

  // Account / Security
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFactor, setTwoFactor] = useState(false)

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [appNotifs, setAppNotifs] = useState(true)

  const saveProfile = () => alert('Profile saved')
  const changePassword = () => {
    if (newPassword.length < 8) return alert('Password must be at least 8 characters.')
    if (newPassword !== confirmPassword) return alert('Passwords do not match.')
    alert('Password changed')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Settings' }]} />
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {(['Profile', 'Account', 'Notifications', 'Security'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm ${tab === t ? 'bg-blue-600 text-white' : 'border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 hover:bg-black/5 dark:hover:bg-white/10'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 shadow-sm p-6">
          {tab === 'Profile' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Company name</label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Contact email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Logo</label>
                <div className="mt-1 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500" aria-hidden></div>
                  <button
                    onClick={() => document.getElementById('logoInput')?.click()}
                    className="rounded-md border border-black/10 dark:border-white/15 px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    Upload Logo
                  </button>
                  <input id="logoInput" type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFileName(e.target.files?.[0]?.name ?? null)} />
                  {logoFileName && <span className="text-sm text-slate-500">{logoFileName}</span>}
                </div>
              </div>
              <div className="sm:col-span-2">
                <button onClick={saveProfile} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700">Save Changes</button>
              </div>
            </div>
          )}

          {tab === 'Account' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <h2 className="text-lg font-semibold">Change Password</h2>
              </div>
              <div>
                <label className="block text-sm font-medium">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="sm:col-span-2">
                <button onClick={changePassword} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700">Update Password</button>
              </div>
            </div>
          )}

          {tab === 'Notifications' && (
            <div className="grid grid-cols-1 gap-4">
              <label className="inline-flex items-center gap-3">
                <input type="checkbox" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-blue-600" />
                <span>Email notifications</span>
              </label>
              <label className="inline-flex items-center gap-3">
                <input type="checkbox" checked={appNotifs} onChange={(e) => setAppNotifs(e.target.checked)} className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-blue-600" />
                <span>App notifications</span>
              </label>
            </div>
          )}

          {tab === 'Security' && (
            <div className="grid grid-cols-1 gap-4">
              <label className="inline-flex items-center gap-3">
                <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-blue-600" />
                <span>Enable two-factor authentication</span>
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-300">Use an authenticator app for enhanced security.</p>
              <button className="w-fit rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10">Manage devices</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
