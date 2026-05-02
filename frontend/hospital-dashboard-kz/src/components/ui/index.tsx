import { useEffect, type ReactNode } from 'react'

type AnyStatus = string

export const statusColor = (s: AnyStatus): string =>
  ({
    // Kazakh statuses
    'Тұрақты':            'var(--green)',
    'Ауыр':               'var(--red)',
    'Сауығуда':           'var(--amber)',
    'Операциядан кейін':  'var(--purple)',
    'Шығарылды':          'var(--muted)',
    'Кезекте':            'var(--green)',
    'Кезектен тыс':       'var(--muted)',
    'Демалыста':          'var(--amber)',
    'Төленді':            'var(--green)',
    'Күтуде':             'var(--amber)',
    'Мерзімі өткен':      'var(--red)',
    // English fallbacks
    Stable:               'var(--green)',
    Critical:             'var(--red)',
    Recovering:           'var(--amber)',
    'Post-Op':            'var(--purple)',
    Discharged:           'var(--muted)',
    'On Duty':            'var(--green)',
    'Off Duty':           'var(--muted)',
    'On Leave':           'var(--amber)',
  }[s] ?? 'var(--muted)')

export function Badge({ status }: { status: string }) {
  const color = statusColor(status)
  return (
    <span className="badge" style={{ background: `${color}22`, color, border: `1px solid ${color}33` }}>
      {status}
    </span>
  )
}

export function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value" style={{ color: color ?? 'var(--text)' }}>{value}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  )
}

export function Toast({ message, color = 'var(--green)' }: { message: string; color?: string }) {
  const textColor = color === 'var(--red)' ? '#fff' : '#000'
  return <div className="toast" style={{ background: color, color: textColor }}>{message}</div>
}

export function Avatar({ name, size = 34, color = 'var(--accent)' }: { name: string; size?: number; color?: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 600, color, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

export function Modal({ title, onClose, children, maxWidth = 560 }: { title: string; onClose: () => void; children: ReactNode; maxWidth?: number }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <span>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, lineHeight: 1, padding: '2px 6px', borderRadius: 4, cursor: 'pointer' }}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, half, error, children }: { label: string; half?: boolean; error?: string; children: ReactNode }) {
  return (
    <div className={`form-field${half ? ' form-field--half' : ''}`}>
      <label>{label}</label>
      {children}
      {error && <span className="error-msg">{error}</span>}
    </div>
  )
}
