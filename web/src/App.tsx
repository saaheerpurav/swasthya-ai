import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import LandingPage from './pages/landing/LandingPage'
import PublicDashboardPage from './pages/dashboard/PublicDashboardPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminAlertsPage from './pages/admin/AdminAlertsPage'
import AdminOutbreaksPage from './pages/admin/AdminOutbreaksPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage'
import AdminQueriesPage from './pages/admin/AdminQueriesPage'
import AdminVaccinationPage from './pages/admin/AdminVaccinationPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<PublicDashboardPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="alerts" element={<AdminAlertsPage />} />
          <Route path="outbreaks" element={<AdminOutbreaksPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:userId" element={<AdminUserDetailPage />} />
          <Route path="queries" element={<AdminQueriesPage />} />
          <Route path="vaccination" element={<AdminVaccinationPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App

