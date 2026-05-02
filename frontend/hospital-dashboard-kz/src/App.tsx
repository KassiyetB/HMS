import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout  from './components/layout/DashboardLayout'
import ProtectedRoute   from './components/ProtectedRoute'
import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Patients   from './pages/Patients'
import Staff      from './pages/Staff'
import Revenue    from './pages/Revenue'
import Supplies   from './pages/Supplies'
import NotFound   from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected — all inside the layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={
          <ProtectedRoute requiredRoute="/dashboard"><Dashboard /></ProtectedRoute>
        } />
        <Route path="patients" element={
          <ProtectedRoute requiredRoute="/patients"><Patients /></ProtectedRoute>
        } />
        <Route path="staff" element={
          <ProtectedRoute requiredRoute="/staff"><Staff /></ProtectedRoute>
        } />
        <Route path="revenue" element={
          <ProtectedRoute requiredRoute="/revenue"><Revenue /></ProtectedRoute>
        } />
        <Route path="supplies" element={
          <ProtectedRoute requiredRoute="/supplies"><Supplies /></ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
