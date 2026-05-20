import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Sidebar from './components/layout/sidebar/Sidebar'
import Navbar from './components/layout/navbar/Navbar'
import ToastContainer from './components/ToastContainer'
import LoginPage  from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import AnalyzePage   from './pages/analyze/AnalyzePage'
import SymptomsPage  from './pages/symptoms/SymptomsPage'
import HistoryPage   from './pages/history/HistoryPage'

function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">
        <Navbar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function ProtectedRoute() {
  const { token, loading } = useAuthStore()
  if (loading) return <div className="app-loading"><span className="spinner" />Loading...</div>
  if (!token) return <Navigate to="/signup" replace />
  return <Outlet />
}

function GuestRoute() {
  const { token, loading } = useAuthStore()
  if (loading) return <div className="app-loading"><span className="spinner" />Loading...</div>
  if (token) return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  const { fetchMe } = useAuthStore()
  useEffect(() => { fetchMe() }, [fetchMe])

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login"  element={<LoginPage  />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/"         element={<DashboardPage />} />
            <Route path="/analyze"  element={<AnalyzePage   />} />
            <Route path="/symptoms" element={<SymptomsPage  />} />
            <Route path="/history"  element={<HistoryPage   />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </BrowserRouter>
  )
}