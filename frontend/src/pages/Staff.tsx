import { useState, useEffect, useCallback } from 'react'
import { Badge, StatCard, Toast, Avatar, Modal, Field } from '../components/ui'
import { Spinner, ErrorBox } from '../hooks/useApi'
import { staffApi, userApi, type StaffRow, type CreateStaffPayload, type UserRecord } from '../services/api'
import { STAFF_ROLES, STAFF_STATUSES, SPECIALTIES } from '../data/mockData'
import { kz } from '../i18n/kz'
import { useAuth } from '../context/AuthContext'

// ── Types ─────────────────────────────────────────
interface StaffFormData { name: string; role: string; specialty: string; status: string; experience: string; rating: string; phone: string; email: string }
type ModalState = { type: 'add' } | { type: 'edit' | 'delete' | 'view' | 'permissions'; staff: StaffRow } | null
interface ToastState { msg: string; color: string }
interface FormErrors { name?: string; experience?: string; rating?: string; phone?: string; email?: string }
interface StatsData  { total: string; on_duty: string; doctors: string; nurses: string }

const EMPTY: StaffFormData = { name: '', role: STAFF_ROLES[0], specialty: SPECIALTIES[0], status: STAFF_STATUSES[0], experience: '', rating: '', phone: '', email: '' }

// All routes a user could potentially access
const ALL_ROUTES: { route: string; label: string; icon: string }[] = [
  { route: '/dashboard', label: 'Басқару тақтасы', icon: '◈' },
  { route: '/patients',  label: 'Науқастар',        icon: '🫀' },
  { route: '/staff',     label: 'Қызметкерлер',     icon: '👨‍⚕️' },
  { route: '/revenue',   label: 'Кіріс',             icon: '💳' },
  { route: '/supplies',  label: 'Дәрі-дәрмектер',   icon: '💊' },
]

// Role defaults (mirrors backend ROLE_PERMISSIONS)
const ROLE_DEFAULTS: Record<string, string[]> = {
  'Дәрігер':    ['/dashboard', '/patients', '/staff'],
  'Мейіргер':   ['/dashboard', '/patients'],
  'Зертханашы': ['/dashboard', '/supplies'],
  'Регистратор':['/dashboard', '/patients', '/revenue'],
  'Фармацевт':  ['/dashboard', '/supplies'],
  'Әкімші':     ['/dashboard', '/patients', '/staff', '/revenue', '/supplies'],
}

// ── Staff Form ─────────────────────────────────────
function StaffForm({ initial, onSave, onCancel, isEdit, saving }: { initial: StaffFormData; onSave: (f: StaffFormData) => Promise<void>; onCancel: () => void; isEdit: boolean; saving: boolean }) {
  const [form, setForm]     = useState<StaffFormData>({ ...initial })
  const [errors, setErrors] = useState<FormErrors>({})
  const set = <K extends keyof StaffFormData>(k: K, v: string) => setForm(f => ({ ...f, [k]: v }))
  const t   = kz.staff

  const validate = () => {
    const e: FormErrors = {}
    if (!form.name.trim())       e.name       = t.errors.nameRequired
    if (!form.phone.trim())      e.phone      = t.errors.phoneRequired
    if (!form.email.trim())      e.email      = t.errors.emailRequired
    if (!form.experience.trim()) e.experience = t.errors.expRequired
    const r = Number(form.rating)
    if (!form.rating || r < 1 || r > 5) e.rating = t.errors.ratingInvalid
    setErrors(e); return Object.keys(e).length === 0
  }

  return (
    <div>
      <div className="form-grid">
        <Field label={t.form.fullName} error={errors.name}>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={errors.name ? 'error' : ''} placeholder={t.form.namePlaceholder} />
        </Field>
        <Field label={t.form.role} half>
          <select value={form.role} onChange={e => set('role', e.target.value)}>{STAFF_ROLES.map(r => <option key={r}>{r}</option>)}</select>
        </Field>
        <Field label={t.form.status} half>
          <select value={form.status} onChange={e => set('status', e.target.value)}>{STAFF_STATUSES.map(s => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label={t.form.specialty}>
          <select value={form.specialty} onChange={e => set('specialty', e.target.value)}>
            {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
            <option value="—">—</option>
          </select>
        </Field>
        <Field label={t.form.experience} half error={errors.experience}>
          <input value={form.experience} onChange={e => set('experience', e.target.value)} className={errors.experience ? 'error' : ''} placeholder={t.form.expPlaceholder} />
        </Field>
        <Field label={t.form.rating} half error={errors.rating}>
          <input type="number" value={form.rating} onChange={e => set('rating', e.target.value)} className={errors.rating ? 'error' : ''} min={1} max={5} step={0.1} placeholder="4.8" />
        </Field>
        <Field label={t.form.phone} half error={errors.phone}>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className={errors.phone ? 'error' : ''} placeholder={t.form.phonePlaceholder} />
        </Field>
        <Field label={t.form.email} half error={errors.email}>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={errors.email ? 'error' : ''} placeholder={t.form.emailPlaceholder} />
        </Field>
      </div>
      <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>{kz.cancel}</button>
        <button className="btn btn-primary" onClick={() => { if (validate()) onSave(form) }} disabled={saving}>
          {saving ? kz.saving : isEdit ? kz.saveChanges : t.addStaff}
        </button>
      </div>
    </div>
  )
}

// ── Permissions Modal ──────────────────────────────
function PermissionsModal({ staff, onClose, onSaved, showToast }: {
  staff: StaffRow
  onClose: () => void
  onSaved: () => void
  showToast: (msg: string, color?: string) => void
}) {
  const [users, setUsers]       = useState<UserRecord[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [isCustom, setIsCustom] = useState(false)   // true = custom override active
  const [matchedUser, setMatchedUser] = useState<UserRecord | null>(null)

  useEffect(() => {
    userApi.getAll().then(res => {
      setUsers(res.data)
      // Find the user account linked to this staff member
      const u = res.data.find(u => u.staff_id === staff.staff_id) ?? null
      setMatchedUser(u)
      if (u) {
        if (u.allowed_routes !== null) {
          // Has custom override
          setIsCustom(true)
          setSelected(u.allowed_routes)
        } else {
          // Using role default
          setIsCustom(false)
          setSelected(ROLE_DEFAULTS[staff.role] ?? ['/dashboard'])
        }
      } else {
        setSelected(ROLE_DEFAULTS[staff.role] ?? ['/dashboard'])
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [staff])

  const toggle = (route: string) => {
    // /dashboard is always required
    if (route === '/dashboard') return
    setSelected(prev =>
      prev.includes(route) ? prev.filter(r => r !== route) : [...prev, route]
    )
  }

  const handleSave = async () => {
    if (!matchedUser) {
      showToast('Бұл қызметкердің жүйелік аккаунты жоқ', 'var(--red)'); return
    }
    setSaving(true)
    try {
      await userApi.updatePermissions(matchedUser.id, isCustom ? selected : null)
      showToast(`${staff.name} рұқсаттары жаңартылды`)
      onSaved()
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Сақтау сәтсіз', 'var(--red)')
    } finally {
      setSaving(false)
    }
  }

  const roleDefaults = ROLE_DEFAULTS[staff.role] ?? ['/dashboard']

  return (
    <Modal title="Қатынас рұқсаттары" onClose={onClose} maxWidth={480}>
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Жүктелуде…</div>
      ) : (
        <>
          {/* Staff info header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 0 16px', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
            <Avatar name={staff.name} size={40} color="var(--purple)" />
            <div>
              <div style={{ fontWeight: 600 }}>{staff.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{staff.role}</div>
            </div>
            {!matchedUser && (
              <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--amber)', background: 'var(--amber)18', border: '1px solid var(--amber)33', borderRadius: 6, padding: '3px 9px' }}>
                ⚠ Аккаунт жоқ
              </div>
            )}
          </div>

          {/* Toggle: role default vs custom */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button
              onClick={() => { setIsCustom(false); setSelected(roleDefaults) }}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${!isCustom ? 'var(--accent)' : 'var(--border-2)'}`,
                background: !isCustom ? 'var(--accent)18' : 'none',
                color: !isCustom ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              Рөл бойынша әдепкі
            </button>
            <button
              onClick={() => setIsCustom(true)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${isCustom ? 'var(--purple)' : 'var(--border-2)'}`,
                background: isCustom ? 'var(--purple)18' : 'none',
                color: isCustom ? 'var(--purple)' : 'var(--muted)',
              }}
            >
              Жеке рұқсат
            </button>
          </div>

          {/* Role default info */}
          {!isCustom && (
            <div style={{ background: 'var(--accent)0d', border: '1px solid var(--accent)22', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--accent)' }}>{staff.role}</strong> рөлінің әдепкі рұқсаттары қолданылады. Жеке рұқсат орнату үшін "Жеке рұқсат" таңдаңыз.
            </div>
          )}

          {/* Route toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {ALL_ROUTES.map(({ route, label, icon }) => {
              const isDefault    = roleDefaults.includes(route)
              const isChecked    = isCustom ? selected.includes(route) : isDefault
              const isLocked     = route === '/dashboard'
              const isDisabled   = !isCustom || isLocked

              return (
                <button
                  key={route}
                  onClick={() => !isDisabled && toggle(route)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 8, border: '1px solid',
                    borderColor: isChecked ? (isCustom ? 'var(--purple)44' : 'var(--accent)44') : 'var(--border)',
                    background: isChecked ? (isCustom ? 'var(--purple)0d' : 'var(--accent)0d') : 'none',
                    cursor: isDisabled ? 'default' : 'pointer',
                    textAlign: 'left', width: '100%',
                    opacity: isDisabled && !isChecked ? 0.45 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: `2px solid ${isChecked ? (isCustom ? 'var(--purple)' : 'var(--accent)') : 'var(--border-2)'}`,
                    background: isChecked ? (isCustom ? 'var(--purple)' : 'var(--accent)') : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isChecked && <span style={{ color: '#000', fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>

                  <span style={{ fontSize: 16 }}>{icon}</span>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{route}</div>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {isLocked && (
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--border)', color: 'var(--muted)' }}>міндетті</span>
                    )}
                    {isDefault && !isLocked && (
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--accent)18', color: 'var(--accent)' }}>рөл</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* No account warning */}
          {!matchedUser && (
            <div style={{ background: 'var(--amber)11', border: '1px solid var(--amber)44', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--amber)' }}>
              ⚠ Бұл қызметкерге тіркелген жүйелік аккаунт табылмады. Рұқсаттарды сақтау үшін алдымен аккаунт жасалуы қажет.
            </div>
          )}

          <div className="modal-footer" style={{ padding: 0 }}>
            <button className="btn btn-ghost" onClick={onClose}>{kz.cancel}</button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || !matchedUser}
              style={{ opacity: !matchedUser ? 0.5 : 1 }}
            >
              {saving ? kz.saving : 'Рұқсаттарды сақтау'}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

// ── View Modal ─────────────────────────────────────
function ViewModal({ staff, onClose, onEdit, onPermissions, canEdit }: { staff: StaffRow; onClose: () => void; onEdit: () => void; onPermissions: () => void; canEdit: boolean }) {
  const t = kz.staff.detail
  const rows: [string, string | number][] = [
    [t.staffId, staff.staff_id], [t.role, staff.role], [t.specialty, staff.specialty],
    [t.experience, staff.experience], [t.rating, `${staff.rating} / 5`],
    [t.phone, staff.phone], [t.email, staff.email],
  ]
  return (
    <Modal title={kz.staff.staffDetails} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <Avatar name={staff.name} size={48} color="var(--purple)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{staff.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{staff.specialty}</div>
        </div>
        <Badge status={staff.status as any} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: 16 }}>
        {rows.map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>
      {staff.role === STAFF_ROLES[0] && (
        <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{kz.staff.currentPatients}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{staff.patients}</div>
        </div>
      )}
      <div className="modal-footer" style={{ padding: 0 }}>
        <button className="btn btn-ghost" onClick={onClose}>{kz.close}</button>
        {canEdit && (
          <>
            <button onClick={onPermissions} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--purple)44', background: 'var(--purple)18', color: 'var(--purple)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
              🔐 Рұқсаттар
            </button>
            <button className="btn btn-primary" onClick={onEdit}>{kz.edit}</button>
          </>
        )}
      </div>
    </Modal>
  )
}

// ── Delete Confirm ─────────────────────────────────
function DeleteConfirm({ staff, onConfirm, onCancel, deleting }: { staff: StaffRow; onConfirm: () => void; onCancel: () => void; deleting: boolean }) {
  return (
    <Modal title={kz.staff.deleteStaff} onClose={onCancel} maxWidth={420}>
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
          <span style={{ color: 'var(--accent)' }}>{staff.name}</span> {kz.staff.confirmDelete}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>{kz.staff.deleteWarning}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={onCancel} disabled={deleting}>{kz.cancel}</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>{deleting ? kz.removing : kz.staff.yesRemove}</button>
        </div>
      </div>
    </Modal>
  )
}

// ── Staff Card ─────────────────────────────────────
function StaffCard({ staff, onView, onEdit, onDelete, onPermissions, canEdit }: { staff: StaffRow; onView: () => void; onEdit: () => void; onDelete: () => void; onPermissions: () => void; canEdit: boolean }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar name={staff.name} size={42} color="var(--purple)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{staff.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{staff.specialty}</div>
        </div>
        <Badge status={staff.status as any} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        {staff.role === STAFF_ROLES[0] && <div style={{ textAlign: 'center' }}><div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Науқас</div><div style={{ fontWeight: 700, color: 'var(--accent)' }}>{staff.patients}</div></div>}
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Тәжірибе</div><div style={{ fontWeight: 600 }}>{staff.experience}</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Рейтинг</div><div style={{ fontWeight: 700, color: 'var(--amber)' }}>{staff.rating} ★</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Лауазым</div><div style={{ fontWeight: 500, fontSize: 12 }}>{staff.role}</div></div>
      </div>

      <div style={{ display: 'flex', gap: 6, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <button onClick={onView} style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid var(--border-2)', background: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12 }}>
          👁 {kz.view}
        </button>
        {canEdit && (
          <>
            <button onClick={onPermissions} title="Рұқсаттар" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--purple)44', background: 'none', color: 'var(--purple)', cursor: 'pointer', fontSize: 13 }}>🔐</button>
            <button onClick={onEdit}   style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid var(--border-2)', background: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>✏️ {kz.edit}</button>
            <button onClick={onDelete} style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid var(--red)33',    background: 'none', color: 'var(--red)',    cursor: 'pointer', fontSize: 12 }}>🗑 {kz.delete}</button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────
export default function Staff() {
  const { user } = useAuth()
  const canEdit  = user?.role === 'Әкімші'

  const [staff, setStaff]       = useState<StaffRow[]>([])
  const [stats, setStats]       = useState<StatsData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [modal, setModal]       = useState<ModalState>(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch]     = useState('')
  const [filterRole, setFilterRole]     = useState(kz.all)
  const [filterStatus, setFilterStatus] = useState(kz.all)
  const [toast, setToast]       = useState<ToastState | null>(null)
  const t = kz.staff

  const showToast = (msg: string, color = 'var(--green)') => { setToast({ msg, color }); setTimeout(() => setToast(null), 2800) }

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params: Record<string, string> = {}
      if (search)                  params.search = search
      if (filterRole !== kz.all)   params.role   = filterRole
      if (filterStatus !== kz.all) params.status = filterStatus
      const [listRes, statsRes] = await Promise.all([staffApi.getAll(params), staffApi.getStats()])
      setStaff(listRes.data); setStats(statsRes.data)
    } catch (err) { setError(err instanceof Error ? err.message : kz.error.loadStaff) }
    finally { setLoading(false) }
  }, [search, filterRole, filterStatus])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAdd = async (form: StaffFormData) => {
    setSaving(true)
    try {
      const payload: CreateStaffPayload = { ...form, rating: Number(form.rating) }
      const res = await staffApi.create(payload)
      setStaff(ps => [res.data, ...ps]); setModal(null)
      showToast(`${res.data.name} ${t.toast.added}`)
    } catch (err) { showToast(err instanceof Error ? err.message : t.toast.addFail, 'var(--red)') }
    finally { setSaving(false) }
  }

  const handleEdit = async (form: StaffFormData) => {
    if (modal?.type !== 'edit') return
    setSaving(true)
    try {
      const res = await staffApi.update(modal.staff.staff_id, { ...form, rating: Number(form.rating) })
      setStaff(ps => ps.map(s => s.staff_id === res.data.staff_id ? res.data : s)); setModal(null)
      showToast(`${res.data.name} ${t.toast.updated}`)
    } catch (err) { showToast(err instanceof Error ? err.message : t.toast.updFail, 'var(--red)') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (modal?.type !== 'delete') return
    setDeleting(true)
    try {
      const { staff_id, name } = modal.staff
      await staffApi.delete(staff_id)
      setStaff(ps => ps.filter(s => s.staff_id !== staff_id)); setModal(null)
      showToast(`${name} ${t.toast.removed}`, 'var(--red)')
    } catch (err) { showToast(err instanceof Error ? err.message : t.toast.delFail, 'var(--red)') }
    finally { setDeleting(false) }
  }

  const toFormData = (s: StaffRow): StaffFormData => ({ name: s.name, role: s.role, specialty: s.specialty, status: s.status, experience: s.experience, rating: String(s.rating), phone: s.phone, email: s.email })

  return (
    <div className="page">
      {toast && <Toast message={toast.msg} color={toast.color} />}

      <div className="page-header">
        <div>
          <div className="page-header__title">{t.title}</div>
          <div className="page-header__sub">
            {t.subtitle}
            {!canEdit && (
              <span style={{ marginLeft: 10, fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--accent)18', color: 'var(--accent)', border: '1px solid var(--accent)33' }}>
                👁 Тек қарау
              </span>
            )}
          </div>
        </div>
        {canEdit && <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>{t.addStaff}</button>}
      </div>

      <div className="stat-row">
        <StatCard label={t.totalStaff}  value={stats?.total   ?? '—'} sub={t.allRoles}        color="var(--accent)" />
        <StatCard label={t.onDuty}      value={stats?.on_duty ?? '—'} sub={t.currentlyWorking} color="var(--green)" />
        <StatCard label={t.doctors}     value={stats?.doctors ?? '—'} sub={t.medicalDoctors}   color="var(--purple)" />
        <StatCard label={t.nurses}      value={stats?.nurses  ?? '—'} sub={t.nursingStaff}     color="var(--amber)" />
      </div>

      <div className="filter-bar">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder} />
        <select value={filterRole}   onChange={e => setFilterRole(e.target.value)}><option>{kz.all}</option>{STAFF_ROLES.map(r => <option key={r}>{r}</option>)}</select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option>{kz.all}</option>{STAFF_STATUSES.map(s => <option key={s}>{s}</option>)}</select>
      </div>

      {error ? <ErrorBox message={error} onRetry={fetchData} /> : loading ? <Spinner /> : staff.length === 0 ? (
        <div className="card empty-state">{t.noStaff}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {staff.map(s => (
            <StaffCard
              key={s.staff_id} staff={s} canEdit={canEdit}
              onView={()        => setModal({ type: 'view',        staff: s })}
              onEdit={()        => setModal({ type: 'edit',        staff: s })}
              onDelete={()      => setModal({ type: 'delete',      staff: s })}
              onPermissions={() => setModal({ type: 'permissions', staff: s })}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {canEdit && modal?.type === 'add' && (
        <Modal title={t.addNewStaff} onClose={() => setModal(null)}>
          <StaffForm initial={{ ...EMPTY }} onSave={handleAdd} onCancel={() => setModal(null)} isEdit={false} saving={saving} />
        </Modal>
      )}
      {canEdit && modal?.type === 'edit' && (
        <Modal title={t.editStaff} onClose={() => setModal(null)}>
          <StaffForm initial={toFormData(modal.staff)} onSave={handleEdit} onCancel={() => setModal(null)} isEdit={true} saving={saving} />
        </Modal>
      )}
      {canEdit && modal?.type === 'delete' && (
        <DeleteConfirm staff={modal.staff} onConfirm={handleDelete} onCancel={() => setModal(null)} deleting={deleting} />
      )}
      {modal?.type === 'view' && (
        <ViewModal
          staff={modal.staff} canEdit={canEdit}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ type: 'edit', staff: modal.staff })}
          onPermissions={() => setModal({ type: 'permissions', staff: modal.staff })}
        />
      )}
      {canEdit && modal?.type === 'permissions' && (
        <PermissionsModal
          staff={modal.staff}
          onClose={() => setModal(null)}
          onSaved={fetchData}
          showToast={showToast}
        />
      )}
    </div>
  )
}
