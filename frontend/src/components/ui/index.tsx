import { useEffect, type ReactNode, type CSSProperties } from 'react'
import type { PatientStatus, StaffStatus } from '../../data/mockData'

type AnyStatus = PatientStatus | StaffStatus

export const statusColor = (s: AnyStatus): string =>
  ({
    Stable:       'var(--green)',
    Critical:     'var(--red)',
    Recovering:   'var(--amber)',
    'Post-Op':    'var(--purple)',
    Discharged:   'var(--muted)',
    'On Duty':    'var(--green)',
    'Off Duty':   'var(--muted)',
    'On Leave':   'var(--amber)',
  }[s] ?? 'var(--muted)')

// ── Badge ─────────────────────────────────────────
interface BadgeProps { status: AnyStatus }

export function Badge({ status }: BadgeProps) {
  const color = statusColor(status)
  return (
    <span className="badge" style={{ background: `${color}22`, color, border: `1px solid ${color}33` }}>
      {status}
    </span>
  )
}

// ── StatCard ──────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  sub?:  string
  color?: string
}

export function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value" style={{ color: color ?? 'var(--text)' }}>{value}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  )
}

// ── Toast ─────────────────────────────────────────
interface ToastProps { message: string; color?: string }

export function Toast({ message, color = 'var(--green)' }: ToastProps) {
  const textColor = color === 'var(--red)' ? '#fff' : '#000'
  return (
    <div className="toast" style={{ background: color, color: textColor }}>
      {message}
    </div>
  )
}

// ── Avatar ────────────────────────────────────────
interface AvatarProps { name: string; size?: number; color?: string }

export function Avatar({ name, size = 34, color = 'var(--accent)' }: AvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}22`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 600, color,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────
interface ModalProps {
  title:    string
  onClose:  () => void
  children: ReactNode
  maxWidth?: number
}

export function Modal({ title, onClose, children, maxWidth = 560 }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <span>{title}</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, lineHeight: 1, padding: '2px 6px', borderRadius: 4, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

// ── Field ─────────────────────────────────────────
interface FieldProps {
  label:    string
  half?:    boolean
  error?:   string
  children: ReactNode
}

export function Field({ label, half, error, children }: FieldProps) {
  return (
    <div className={`form-field${half ? ' form-field--half' : ''}`}>
      <label>{label}</label>
      {children}
      {error && <span className="error-msg">{error}</span>}
    </div>
  )
}
