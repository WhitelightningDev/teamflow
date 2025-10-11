import { useEffect, useState } from 'react'
import Breadcrumbs from '../../components/Breadcrumbs'
import { getCompany, updateCompany, getProfile, updateProfile, getNotifications, updateNotifications, changePasswordApi } from '../../lib/api'
import { useAlerts } from '../../components/AlertsProvider'
import { Skeleton } from '@heroui/react'

type Tab = 'Profile' | 'Account' | 'Notifications' | 'Security'

export default function SettingsPage() {
  const alerts = useAlerts()
  const [tab, setTab] = useState<Tab>('Profile')

  // Profile
  const [companyName, setCompanyName] = useState('')
  const [companyDomain, setCompanyDomain] = useState('')
  const [companyTz, setCompanyTz] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [logoFileName, setLogoFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Account / Security
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFactor, setTwoFactor] = useState(false)

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [appNotifs, setAppNotifs] = useState(true)

  // Load settings
  useEffect(() => {
    let cancelled = false
    async function load() {
      setPageLoading(true)
      setError(null)
      try {
        const [company, profile, notifs] = await Promise.all([
          getCompany(),
          getProfile(),
          getNotifications(),
        ])
        if (cancelled) return
        setCompanyName(company.name)
        setCompanyDomain(company.domain)
        setCompanyTz(company.timezone)
        setContactEmail(profile.email)
        setEmailNotifs(!!notifs.email_notifications)
        setAppNotifs(!!notifs.push_notifications)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load settings')
      } finally {
        if (!cancelled) setPageLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const saveProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      await updateCompany({ name: companyName, domain: companyDomain || undefined, timezone: companyTz || undefined })
      await updateProfile({ email: contactEmail })
      alerts.success('Profile saved')
    } catch (e: any) {
      setError(e?.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }
  const changePassword = async () => {
    if (newPassword.length < 8) { alerts.warning('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { alerts.warning('Passwords do not match.'); return }
    try {
      setLoading(true)
      setError(null)
      await changePasswordApi({ current_password: currentPassword, new_password: newPassword })
      alerts.success('Password changed')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: any) {
      setError(e?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  async function onToggleEmailNotifications(checked: boolean) {
    setEmailNotifs(checked)
    try {
      await updateNotifications({ email_notifications: checked })
    } catch {
      // revert on error
      setEmailNotifs(!checked)
      alerts.error('Failed to update email notifications')
    }
  }
  async function onToggleAppNotifications(checked: boolean) {
    setAppNotifs(checked)
    try {
      await updateNotifications({ push_notifications: checked })
    } catch {
      setAppNotifs(!checked)
      alerts.error('Failed to update app notifications')
    }
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
        <div className="rounded-3xl bg-white/80 dark:bg-neutral-900/60 border border-black/5 dark:border-white/10 shadow-sm p-6 backdrop-blur">
          {pageLoading && (
            <div className="space-y-6" aria-busy>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0,1,2,3].map((i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <Skeleton className="w-40 rounded"><div className="h-4 w-full rounded bg-black/10 dark:bg-white/10" /></Skeleton>
                    <Skeleton className="w-full rounded"><div className="h-9 w-full rounded bg-black/10 dark:bg-white/10" /></Skeleton>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="w-full rounded-xl"><div className="h-24 w-full rounded-xl bg-black/10 dark:bg-white/10" /></Skeleton>
                ))}
              </div>
            </div>
          )}
          {!pageLoading && (
          <>
          {loading && <p className="text-sm text-slate-500 mb-3">Saving…</p>}
          {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}
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
              <div>
                <label className="block text-sm font-medium">Domain</label>
                <input
                  placeholder="example.com"
                  value={companyDomain}
                  onChange={(e) => setCompanyDomain(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Timezone</label>
                <input
                  placeholder="Africa/Johannesburg"
                  value={companyTz}
                  onChange={(e) => setCompanyTz(e.target.value)}
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
                <button onClick={saveProfile} disabled={loading} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50">{loading ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </div>
          )}

          {tab === 'Account' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <h2 className="text-lg font-semibold">Change Password</h2>
              </div>
              <div>
                <label className="block text-sm font-medium">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/60 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
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
                <input type="checkbox" checked={emailNotifs} onChange={(e) => onToggleEmailNotifications(e.target.checked)} className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-blue-600" />
                <span>Email notifications</span>
              </label>
              <label className="inline-flex items-center gap-3">
                <input type="checkbox" checked={appNotifs} onChange={(e) => onToggleAppNotifications(e.target.checked)} className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-blue-600" />
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
          </>
          )}
        </div>
      </div>
    </div>
  )
}
