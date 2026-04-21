import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16, color: 'var(--muted)' }}>
      <div style={{ fontSize: 64 }}>🏥</div>
      <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--border-2)' }}>404</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>Page not found</div>
      <div style={{ fontSize: 13 }}>The page you're looking for doesn't exist.</div>
      <Link to="/dashboard" style={{ marginTop: 8, padding: '9px 20px', borderRadius: 8, background: 'var(--accent)', color: '#000', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}>
        Back to Dashboard
      </Link>
    </div>
  )
}
