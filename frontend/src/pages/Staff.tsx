import { useState, useEffect, useCallback } from 'react'
import { Badge, StatCard, Toast, Avatar, Modal, Field } from '../components/ui'
import { Spinner, ErrorBox } from '../hooks/useApi'
import { staffApi, type StaffRow, type CreateStaffPayload } from '../services/api'
import { STAFF_ROLES, STAFF_STATUSES, SPECIALTIES } from '../data/mockData'

// ── Types ─────────────────────────────────────────
interface StaffFormData {
  name:       string
  role:       string
  specialty:  string
  status:     string
  experience: string
  rating:     string
  phone:      string
  email:      string
}

type ModalState =
  | { type: 'add' }
  | { type: 'edit' | 'delete' | 'view'; staff: StaffRow }
  | null

interface ToastState { msg: string; color: string }
interface FormErrors { name?: string; experience?: string; rating?: string; phone?: string; email?: string }
interface StatsData  { total: string; on_duty: string; off_duty: string; doctors: string; nurses: string; avg_rating: string }

const EMPTY: StaffFormData = {
  name: '', role: 'Doctor', specialty: SPECIALTIES[0],
  status: 'On Duty', experience: '', rating: '', phone: '', email: '',
}

// ── Staff Form ─────────────────────────────────────
interface StaffFormProps {
  initial:  StaffFormData
  onSave:   (form: StaffFormData) => Promise<void>
  onCancel: () => void
  isEdit:   boolean
  saving:   boolean
}

function StaffForm({ initial, onSave, onCancel, isEdit, saving }: StaffFormProps) {
  const [form, setForm]     = useState<StaffFormData>({ ...initial })
  const [errors, setErrors] = useState<FormErrors>({})
  const set = <K extends keyof StaffFormData>(k: K, v: string) => setForm(f => ({ ...f, [k]: v }))

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.name.trim())       e.name       = 'Name is required'
    if (!form.phone.trim())      e.phone      = 'Phone is required'
    if (!form.email.trim())      e.email      = 'Email is required'
    if (!form.experience.trim()) e.experience = 'Experience is required'
    const r = Number(form.rating)
    if (!form.rating || r < 1 || r > 5) e.rating = 'Rating must be 1–5'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div>
      <div className="form-grid">
        <Field label="Full Name" error={errors.name}>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={errors.name ? 'error' : ''} placeholder="e.g. Dr. Asel Bekova" />
        </Field>
        <Field label="Role" half>
          <select value={form.role} onChange={e => set('role', e.target.value)}>
            {STAFF_ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Status" half>
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            {STAFF_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Specialty">
          <select value={form.specialty} onChange={e => set('specialty', e.target.value)}>
            {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
            <option value="—">—</option>
          </select>
        </Field>
        <Field label="Experience" half error={errors.experience}>
          <input value={form.experience} onChange={e => set('experience', e.target.value)} className={errors.experience ? 'error' : ''} placeholder="e.g. 5 yrs" />
        </Field>
        <Field label="Rating (1–5)" half error={errors.rating}>
          <input type="number" value={form.rating} onChange={e => set('rating', e.target.value)} className={errors.rating ? 'error' : ''} min={1} max={5} step={0.1} placeholder="4.8" />
        </Field>
        <Field label="Phone" half error={errors.phone}>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className={errors.phone ? 'error' : ''} placeholder="+7 700 000 0000" />
        </Field>
        <Field label="Email" half error={errors.email}>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={errors.email ? 'error' : ''} placeholder="name@medicare.kz" />
        </Field>
      </div>
      <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (validate()) onSave(form) }} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Staff Member'}
        </button>
      </div>
    </div>
  )
}

// ── View Modal ─────────────────────────────────────
function ViewModal({ staff, onClose, onEdit }: { staff: StaffRow; onClose: () => void; onEdit: () => void }) {
  const rows: [string, string | number][] = [
    ['Staff ID', staff.staff_id], ['Role', staff.role], ['Specialty', staff.specialty],
    ['Experience', staff.experience], ['Rating', `${staff.rating} / 5`],
    ['Phone', staff.phone], ['Email', staff.email],
  ]
  return (
    <Modal title="Staff Details" onClose={onClose}>
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
      {staff.role === 'Doctor' && (
        <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Current Patients</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{staff.patients}</div>
        </div>
      )}
      <div className="modal-footer" style={{ padding: 0 }}>
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={onEdit}>Edit</button>
      </div>
    </Modal>
  )
}

// ── Delete Confirm ─────────────────────────────────
function DeleteConfirm({ staff, onConfirm, onCancel, deleting }: { staff: StaffRow; onConfirm: () => void; onCancel: () => void; deleting: boolean }) {
  return (
    <Modal title="Remove Staff Member" onClose={onCancel} maxWidth={420}>
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
          Remove <span style={{ color: 'var(--accent)' }}>{staff.name}</span>?
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>This cannot be undone.</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Removing…' : 'Yes, Remove'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Staff Card ─────────────────────────────────────
function StaffCard({ staff, onView, onEdit, onDelete }: { staff: StaffRow; onView: () => void; onEdit: () => void; onDelete: () => void }) {
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
        {staff.role === 'Doctor' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Patients</div>
            <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{staff.patients}</div>
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Exp</div>
          <div style={{ fontWeight: 600 }}>{staff.experience}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Rating</div>
          <div style={{ fontWeight: 700, color: 'var(--amber)' }}>{staff.rating} ★</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Role</div>
          <div style={{ fontWeight: 500, fontSize: 12 }}>{staff.role}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <button onClick={onView}   style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid var(--border-2)', background: 'none', color: 'var(--muted)',  cursor: 'pointer', fontSize: 12 }}>👁 View</button>
        <button onClick={onEdit}   style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid var(--border-2)', background: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>✏️ Edit</button>
        <button onClick={onDelete} style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid var(--red)33',    background: 'none', color: 'var(--red)',    cursor: 'pointer', fontSize: 12 }}>🗑 Remove</button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────
export default function Staff() {
  const [staff, setStaff]   = useState<StaffRow[]>([])
  const [stats, setStats]   = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [modal, setModal]   = useState<ModalState>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole]     = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [toast, setToast]   = useState<ToastState | null>(null)

  const showToast = (msg: string, color = 'var(--green)') => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 2800)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (search)                 params.search = search
      if (filterRole !== 'All')   params.role   = filterRole
      if (filterStatus !== 'All') params.status = filterStatus

      const [listRes, statsRes] = await Promise.all([
        staffApi.getAll(params),
        staffApi.getStats(),
      ])
      setStaff(listRes.data)
      setStats(statsRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }, [search, filterRole, filterStatus])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAdd = async (form: StaffFormData) => {
    setSaving(true)
    try {
      const payload: CreateStaffPayload = { ...form, rating: Number(form.rating) }
      const res = await staffApi.create(payload)
      setStaff(ps => [res.data, ...ps])
      setModal(null)
      showToast(`${res.data.name} added`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add', 'var(--red)')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (form: StaffFormData) => {
    if (modal?.type !== 'edit') return
    setSaving(true)
    try {
      const res = await staffApi.update(modal.staff.staff_id, { ...form, rating: Number(form.rating) })
      setStaff(ps => ps.map(s => s.staff_id === res.data.staff_id ? res.data : s))
      setModal(null)
      showToast(`${res.data.name} updated`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update', 'var(--red)')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (modal?.type !== 'delete') return
    setDeleting(true)
    try {
      const { staff_id, name } = modal.staff
      await staffApi.delete(staff_id)
      setStaff(ps => ps.filter(s => s.staff_id !== staff_id))
      setModal(null)
      showToast(`${name} removed`, 'var(--red)')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete', 'var(--red)')
    } finally {
      setDeleting(false)
    }
  }

  const toFormData = (s: StaffRow): StaffFormData => ({
    name:       s.name,
    role:       s.role,
    specialty:  s.specialty,
    status:     s.status,
    experience: s.experience,
    rating:     String(s.rating),
    phone:      s.phone,
    email:      s.email,
  })

  return (
    <div className="page">
      {toast && <Toast message={toast.msg} color={toast.color} />}

      <div className="page-header">
        <div>
          <div className="page-header__title">Doctors & Staff</div>
          <div className="page-header__sub">Manage your medical team</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>+ Add Staff Member</button>
      </div>

      <div className="stat-row">
        <StatCard label="Total Staff" value={stats?.total    ?? '—'} sub="All roles"         color="var(--accent)" />
        <StatCard label="On Duty"     value={stats?.on_duty  ?? '—'} sub="Currently working" color="var(--green)" />
        <StatCard label="Doctors"     value={stats?.doctors  ?? '—'} sub="Medical doctors"   color="var(--purple)" />
        <StatCard label="Nurses"      value={stats?.nurses   ?? '—'} sub="Nursing staff"     color="var(--amber)" />
      </div>

      <div className="filter-bar">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by name, ID or specialty…" />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option>All</option>
          {STAFF_ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option>
          {STAFF_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {error ? (
        <ErrorBox message={error} onRetry={fetchData} />
      ) : loading ? (
        <Spinner />
      ) : staff.length === 0 ? (
        <div className="card empty-state">No staff members found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {staff.map(s => (
            <StaffCard
              key={s.staff_id}
              staff={s}
              onView={()   => setModal({ type: 'view',   staff: s })}
              onEdit={()   => setModal({ type: 'edit',   staff: s })}
              onDelete={()  => setModal({ type: 'delete', staff: s })}
            />
          ))}
        </div>
      )}

      {modal?.type === 'add' && (
        <Modal title="Add Staff Member" onClose={() => setModal(null)}>
          <StaffForm initial={{ ...EMPTY }} onSave={handleAdd} onCancel={() => setModal(null)} isEdit={false} saving={saving} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Edit Staff Member" onClose={() => setModal(null)}>
          <StaffForm initial={toFormData(modal.staff)} onSave={handleEdit} onCancel={() => setModal(null)} isEdit={true} saving={saving} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirm staff={modal.staff} onConfirm={handleDelete} onCancel={() => setModal(null)} deleting={deleting} />
      )}
      {modal?.type === 'view' && (
        <ViewModal staff={modal.staff} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'edit', staff: modal.staff })} />
      )}
    </div>
  )
}
