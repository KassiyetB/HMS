import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard  from './pages/Dashboard'
import Patients   from './pages/Patients'
import Staff      from './pages/Staff'
import Revenue    from './pages/Revenue'
import Supplies   from './pages/Supplies'
import NotFound   from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients"  element={<Patients />} />
        <Route path="staff"     element={<Staff />} />
        <Route path="revenue"   element={<Revenue />} />
        <Route path="supplies"  element={<Supplies />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
