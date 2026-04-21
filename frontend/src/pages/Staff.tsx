import { useState } from 'react'
import { Badge, StatCard, Toast, Avatar, Modal, Field } from '../components/ui'
import {
  INITIAL_STAFF, STAFF_ROLES, STAFF_STATUSES, SPECIALTIES,
  type StaffMember, type StaffStatus, type StaffRole,
} from '@/data/mockData'

// ── Types ─────────────────────────────────────────
interface StaffFormData {
  name:      string
  role:      StaffRole
  specialty: string
  status:    StaffStatus
  exp:       string
  rating:    string | number
  phone:     string
  email:     string
}

type ModalState =
  | { type: 'add' }
  | { type: 'edit' | 'delete' | 'view'; staff: StaffMember }
  | null

interface FormErrors { name?: string; exp?: string; phone?: string; email?: string; rating?: string }
interface ToastState { msg: string; color: string }

const EMPTY: StaffFormData = {
  name: '', role: 'Doctor', specialty: SPECIALTIES[0], status: 'On Duty',
  exp: '', rating: '', phone: '', email: '',
}

let _nextId = INITIAL_STAFF.length
const genId = (): string => `S-${String(++_nextId).padStart(3, '0')}`

// ── Staff Form ────────────────────────────────────
interface StaffFormProps {
  initial:  StaffFormData
  onSave:   (form: StaffFormData) => void
  onCancel: () => void
  isEdit:   boolean
}

function StaffForm({ initial, onSave, onCancel, isEdit }: StaffFormProps) {
  const [form, setForm]     = useState<StaffFormData>({ ...initial })
  const [errors, setErrors] = useState<FormErrors>({})
  const set = <K extends keyof StaffFormData>(k: K, v: StaffFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.name.trim())  e.name   = 'Name is required'
    if (!form.phone.trim()) e.phone  = 'Phone is required'
    if (!form.email.trim()) e.email  = 'Email is required'
    if (!form.exp.trim())   e.exp    = 'Experience is required'
    const r = Number(form.rating)
    if (!form.rating || r < 1 || r > 5) e.rating = 'Rating must be between 1 and 5'
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
          <select value={form.role} onChange={e => set('role', e.target.value as StaffRole)}>
            {STAFF_ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </Field>

        <Field label="Status" half>
          <select value={form.status} onChange={e => set('status', e.target.value as StaffStatus)}>
            {STAFF_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Specialty">
          <select value={form.specialty} onChange={e => set('specialty', e.target.value)}>
            {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
            <option value="—">—</option>
          </select>
        </Field>

        <Field label="Experience" half error={errors.exp}>
          <input value={form.exp} onChange={e => set('exp', e.target.value)} className={errors.exp ? 'error' : ''} placeholder="e.g. 5 yrs" />
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
        <button className="btn btn-ghost"   onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (validate()) onSave(form) }}>
          {isEdit ? 'Save Changes' : 'Add Staff Member'}
        </button>
      </div>
    </div>
  )
}

// ── View Modal ────────────────────────────────────
interface ViewModalProps { staff: StaffMember; onClose: () => void; onEdit: () => void }

function ViewModal({ staff, onClose, onEdit }: ViewModalProps) {
  const rows: [string, string | number][] = [
    ['Staff ID', staff.id], ['Role', staff.role], ['Specialty', staff.specialty],
    ['Experience', staff.exp], ['Rating', `${staff.rating} / 5`],
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
        <Badge status={staff.status} />
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
        <button className="btn btn-ghost"   onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={onEdit}>Edit</button>
      </div>
    </Modal>
  )
}

// ── Delete Confirm ────────────────────────────────
interface DeleteConfirmProps { staff: StaffMember; onConfirm: () => void; onCancel: () => void }

function DeleteConfirm({ staff, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <Modal title="Remove Staff Member" onClose={onCancel} maxWidth={420}>
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
          Remove <span style={{ color: 'var(--accent)' }}>{staff.name}</span>?
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
          This will permanently delete the staff record and cannot be undone.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-ghost"  onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Yes, Remove</button>
        </div>
      </div>
    </Modal>
  )
}

// ── Staff Card ────────────────────────────────────
interface StaffCardProps {
  staff:    StaffMember
  onView:   () => void
  onEdit:   () => void
  onDelete: () => void
}

function StaffCard({ staff, onView, onEdit, onDelete }: StaffCardProps) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar name={staff.name} size={42} color="var(--purple)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{staff.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{staff.specialty}</div>
        </div>
        <Badge status={staff.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        {staff.role === 'Doctor' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Patients</div>
            <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{staff.patients}</div>
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Experience</div>
          <div style={{ fontWeight: 600 }}>{staff.exp}</div>
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

// ── Main Page ─────────────────────────────────────
export default function Staff() {
  const [staff, setStaff]   = useState<StaffMember[]>(INITIAL_STAFF)
  const [modal, setModal]   = useState<ModalState>(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole]     = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [toast, setToast]   = useState<ToastState | null>(null)

  const showToast = (msg: string, color = 'var(--green)') => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 2800)
  }

  const filtered = staff.filter(s => {
    const q = search.toLowerCase()
    return (
      (!q || s.name.toLowerCase().includes(q) || s.specialty.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) &&
      (filterRole   === 'All' || s.role   === filterRole) &&
      (filterStatus === 'All' || s.status === filterStatus)
    )
  })

  const handleAdd = (form: StaffFormData) => {
    const s: StaffMember = { ...form, id: genId(), patients: 0, rating: Number(form.rating) }
    setStaff(ps => [s, ...ps])
    setModal(null)
    showToast(`${s.name} added`)
  }

  const handleEdit = (form: StaffFormData) => {
    if (modal?.type !== 'edit') return
    setStaff(ps => ps.map(s => s.id === modal.staff.id ? { ...s, ...form, rating: Number(form.rating) } : s))
    setModal(null)
    showToast(`${form.name} updated`)
  }

  const handleDelete = () => {
    if (modal?.type !== 'delete') return
    const name = modal.staff.name
    setStaff(ps => ps.filter(s => s.id !== modal.staff.id))
    setModal(null)
    showToast(`${name} removed`, 'var(--red)')
  }

  const onDuty    = staff.filter(s => s.status === 'On Duty').length
  const doctors   = staff.filter(s => s.role === 'Doctor').length
  const nurses    = staff.filter(s => s.role === 'Nurse').length

  return (
    <div className="page">
      {toast && <Toast message={toast.msg} color={toast.color} />}

      <div className="page-header">
        <div>
          <div className="page-header__title">Doctors & Staff</div>
          <div className="page-header__sub">Manage your medical team</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
          + Add Staff Member
        </button>
      </div>

      <div className="stat-row">
        <StatCard label="Total Staff" value={staff.length}  sub="All roles"         color="var(--accent)" />
        <StatCard label="On Duty"     value={onDuty}        sub="Currently working" color="var(--green)" />
        <StatCard label="Doctors"     value={doctors}       sub="Medical staff"     color="var(--purple)" />
        <StatCard label="Nurses"      value={nurses}        sub="Nursing staff"     color="var(--amber)" />
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

      {filtered.length === 0 ? (
        <div className="card empty-state">No staff members found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filtered.map(s => (
            <StaffCard
              key={s.id}
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
          <StaffForm initial={{ ...EMPTY }} onSave={handleAdd} onCancel={() => setModal(null)} isEdit={false} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Edit Staff Member" onClose={() => setModal(null)}>
          <StaffForm initial={{ ...modal.staff, rating: String(modal.staff.rating) }} onSave={handleEdit} onCancel={() => setModal(null)} isEdit={true} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirm staff={modal.staff} onConfirm={handleDelete} onCancel={() => setModal(null)} />
      )}
      {modal?.type === 'view' && (
        <ViewModal staff={modal.staff} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'edit', staff: modal.staff })} />
      )}
    </div>
  )
}
