import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface NavItem { to: string; icon: string; label: string }

const NAV: NavItem[] = [
  { to: '/dashboard', icon: '◈', label: 'Dashboard' },
  { to: '/patients',  icon: '🫀', label: 'Patients' },
  { to: '/staff',     icon: '👨‍⚕️', label: 'Doctors & Staff' },
  { to: '/revenue',   icon: '💳', label: 'Revenue' },
  { to: '/supplies',  icon: '💊', label: 'Supplies' },
]

export default function DashboardLayout() {
  const location = useLocation()
  const [time, setTime] = useState<Date>(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const pageTitle = NAV.find(n => location.pathname.startsWith(n.to))?.label ?? 'MediCare'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 'var(--sidebar-w)', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Logo */}
        <div style={{ padding: '1.1rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent)22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚕️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>MediCare</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>Care Center</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0.75rem 0.5rem', flex: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', padding: '4px 10px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Menu</div>
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 'var(--radius-md)', marginBottom: 2,
                fontSize: 13, fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                background: isActive ? 'var(--accent)18' : 'transparent',
                textDecoration: 'none', transition: 'all var(--transition)',
              })}
            >
              <span style={{ fontSize: 15 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
            System Online
          </div>
          <div>{time.toLocaleTimeString()}</div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{ height: 'var(--topbar-h)', background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{pageTitle}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              {time.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '6px 12px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--purple)22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--purple)' }}>AD</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>Admin</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>Administrator</div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
