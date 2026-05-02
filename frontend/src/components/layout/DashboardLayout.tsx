import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { kz } from '../../i18n/kz'

interface NavItem { to: string; icon: string; label: string; route: string }

const ALL_NAV: NavItem[] = [
  { to: '/dashboard', icon: '◈',   label: kz.nav.dashboard, route: '/dashboard' },
  { to: '/patients',  icon: '🫀',  label: kz.nav.patients,  route: '/patients'  },
  { to: '/staff',     icon: '👨‍⚕️', label: kz.nav.staff,     route: '/staff'     },
  { to: '/revenue',   icon: '💳',  label: kz.nav.revenue,   route: '/revenue'   },
  { to: '/supplies',  icon: '💊',  label: kz.nav.supplies,  route: '/supplies'  },
]

const roleColors: Record<string, string> = {
  'Әкімші':      'var(--purple)',
  'Дәрігер':     'var(--accent)',
  'Мейіргер':    'var(--green)',
  'Зертханашы':  'var(--amber)',
  'Регистратор': 'var(--teal)',
  'Фармацевт':   'var(--red)',
}

export default function DashboardLayout() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user, logout, canAccess } = useAuth()
  const [time, setTime] = useState<Date>(new Date())
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Only show nav items the current user can access
  const visibleNav = ALL_NAV.filter(n => canAccess(n.route))
  const pageTitle  = ALL_NAV.find(n => location.pathname.startsWith(n.to))?.label ?? 'МедиКер'
  const roleColor  = roleColors[user?.role ?? ''] ?? 'var(--accent)'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Бүйір тақтасы ── */}
      <aside style={{ width: 'var(--sidebar-w)', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Logo */}
        <div style={{ padding: '1.1rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent)22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚕️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>ErentauMed</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>Медициналық орталық</div>
          </div>
        </div>

        {/* Nav — only allowed routes */}
        <nav style={{ padding: '0.75rem 0.5rem', flex: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', padding: '4px 10px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Мәзір</div>
          {visibleNav.map(({ to, icon, label }) => (
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

        {/* Role badge + System status */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{kz.systemOnline}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>{time.toLocaleTimeString('kk-KZ')}</div>
          {/* Role tag */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: `${roleColor}18`, border: `1px solid ${roleColor}33`, fontSize: 11, color: roleColor, fontWeight: 500 }}>
            {user?.role}
          </div>
        </div>
      </aside>

      {/* ── Негізгі аймақ ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{ height: 'var(--topbar-h)', background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{pageTitle}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              {time.toLocaleDateString('kk-KZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(s => !s)}
              style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '6px 12px', cursor: 'pointer' }}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${roleColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: roleColor }}>
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{user?.name}</div>
                <div style={{ fontSize: 10, color: roleColor }}>{user?.role}</div>
              </div>
              <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 4 }}>▼</span>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', minWidth: 180, zIndex: 50, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: 13, color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--red)11')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  🚪 Жүйеден шығу
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Close dropdown on outside click */}
        {showUserMenu && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowUserMenu(false)} />
        )}

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
