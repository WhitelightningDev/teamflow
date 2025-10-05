// src/router.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import AcceptInvite from './pages/AcceptInvite'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import EmployeesPage from './pages/Employees'
import LeavesPage from './pages/Leaves'
import DocumentsPage from './pages/Documents'
import SettingsPage from './pages/Settings'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/leaves" element={<LeavesPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
