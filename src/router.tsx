// src/router.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AcceptInvite from './pages/AcceptInvite'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AttendancePage from './pages/Attendance'
import AnnouncementsList from './pages/Announcements/AnnouncementsList'
import AnnouncementsCreate from './pages/Announcements/AnnouncementsCreate'
import RequireRole from './lib/auth/RequireRole'
import EmployeesPage from './pages/Employees'
import LeavesPage from './pages/Leaves'
import DocumentsPage from './pages/Documents'
import SettingsPage from './pages/Settings'
import ProfilePage from './pages/Profile'
import TimesheetsPage from './pages/Time/Timesheets'
import JobsPage from './pages/Time/Jobs'
import BillingPage from './pages/Time/Billing'
import RequireAuth from './lib/auth/RequireAuth'
import BookDemoPage from './pages/BookDemo'
import RecentActivityPage from './pages/Activity'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book-demo" element={<BookDemoPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<RequireRole allow={["admin","manager","hr"]}><EmployeesPage /></RequireRole>} />
        <Route path="/leaves" element={<LeavesPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/announcements" element={<AnnouncementsList />} />
        <Route path="/announcements/new" element={<RequireRole allow={["admin","manager","hr"]}><AnnouncementsCreate /></RequireRole>} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/activity" element={<RequireRole allow={["admin","manager","hr"]}><RecentActivityPage /></RequireRole>} />
        <Route path="/time" element={<RequireAuth><TimesheetsPage /></RequireAuth>} />
        <Route path="/time/jobs" element={<RequireRole allow={["admin","manager","hr"]}><RequireAuth><JobsPage /></RequireAuth></RequireRole>} />
        <Route path="/time/billing" element={<RequireRole allow={["admin","manager","hr"]}><RequireAuth><BillingPage /></RequireAuth></RequireRole>} />
        <Route path="/not-authorized" element={<div className='p-6 text-center text-slate-600'>Not authorized</div>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/settings" element={<RequireRole allow={["admin","manager","hr"]}><SettingsPage /></RequireRole>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
