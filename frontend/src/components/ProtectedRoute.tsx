import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  children: React.ReactNode
  requiredRoute?: string // e.g. '/patients'
}

export default function ProtectedRoute({ children, requiredRoute }: Props) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Still restoring session from localStorage
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--muted)', fontSize: 14 }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          Жүктелуде…
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but no permission for this route → show 403
  if (requiredRoute && !user.allowedRoutes.includes(requiredRoute)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--muted)', padding: '2rem' }}>
        <div style={{ fontSize: 48 }}>🚫</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--red)' }}>403</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>Рұқсат жоқ</div>
        <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 300 }}>
          Сіздің рөліңіз (<strong style={{ color: 'var(--accent)' }}>{user.role}</strong>) бұл бетке кіру рұқсатына ие емес.
        </div>
      </div>
    )
  }

  return <>{children}</>
}
