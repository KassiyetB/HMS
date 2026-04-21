import { useState } from 'react'
import { Badge, StatCard, Toast, Avatar, Modal, Field } from '../components/ui'
import {
  INITIAL_PATIENTS, DOCTORS, CONDITIONS, STATUSES, WARDS, BLOOD_TYPES,
  type Patient, type PatientStatus, type Ward, type BloodType,
} from '../data/mockData'

// ── Types ─────────────────────────────────────────
interface PatientFormData {
  name:      string
  age:       string | number
  gender:    string
  blood:     BloodType
  condition: string
  doctor:    string
  status:    PatientStatus
  ward:      Ward
  phone:     string
  admit:     string
  notes:     string
}

type ModalState =
  | { type: 'add' }
  | { type: 'edit'   | 'delete' | 'view'; patient: Patient }
  | null

interface ToastState { msg: string; color: string }
interface FormErrors { name?: string; age?: string; condition?: string; phone?: string }

// ── Constants ─────────────────────────────────────
const EMPTY: PatientFormData = {
  name: '', age: '', gender: 'Male', blood: 'A+', condition: '',
  doctor: DOCTORS[0], status: 'Stable', ward: 'General',
  phone: '', admit: new Date().toISOString().slice(0, 10), notes: '',
}

let _nextId = INITIAL_PATIENTS.length
const genId = (): string => `P-${String(++_nextId).padStart(3, '0')}`

// ── PatientForm ───────────────────────────────────
interface PatientFormProps {
  initial:  PatientFormData
  onSave:   (form: PatientFormData) => void
  onCancel: () => void
  isEdit:   boolean
}

function PatientForm({ initial, onSave, onCancel, isEdit }: PatientFormProps) {
  const [form, setForm]     = useState<PatientFormData>({ ...initial })
  const [errors, setErrors] = useState<FormErrors>({})
  const set = <K extends keyof PatientFormData>(k: K, v: PatientFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.name.trim())                              e.name      = 'Name is required'
    if (!form.age || Number(form.age) < 1 || Number(form.age) > 120) e.age = 'Enter a valid age'
    if (!form.condition)                                e.condition = 'Select a condition'
    if (!form.phone.trim())                             e.phone     = 'Phone is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div>
      <div className="form-grid">
        <Field label="Full Name" error={errors.name}>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={errors.name ? 'error' : ''} placeholder="e.g. Aisha Nurlanovna" />
        </Field>

        <Field label="Age" half error={errors.age}>
          <input type="number" value={form.age} onChange={e => set('age', e.target.value)} className={errors.age ? 'error' : ''} min={1} max={120} placeholder="Age" />
        </Field>

        <Field label="Gender" half>
          <select value={form.gender} onChange={e => set('gender', e.target.value)}>
            {['Male', 'Female', 'Other'].map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>

        <Field label="Blood Type" half>
          <select value={form.blood} onChange={e => set('blood', e.target.value as BloodType)}>
            {BLOOD_TYPES.map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>

        <Field label="Phone" half error={errors.phone}>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className={errors.phone ? 'error' : ''} placeholder="+7 700 000 0000" />
        </Field>

        <Field label="Condition" error={errors.condition}>
          <select value={form.condition} onChange={e => set('condition', e.target.value)} className={errors.condition ? 'error' : ''}>
            <option value="">Select condition…</option>
            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Assigned Doctor" half>
          <select value={form.doctor} onChange={e => set('doctor', e.target.value)}>
            {DOCTORS.map(d => <option key={d}>{d}</option>)}
          </select>
        </Field>

        <Field label="Ward" half>
          <select value={form.ward} onChange={e => set('ward', e.target.value as Ward)}>
            {WARDS.map(w => <option key={w}>{w}</option>)}
          </select>
        </Field>

        <Field label="Status" half>
          <select value={form.status} onChange={e => set('status', e.target.value as PatientStatus)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Admission Date" half>
          <input type="date" value={form.admit} onChange={e => set('admit', e.target.value)} />
        </Field>

        <Field label="Clinical Notes">
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes…" />
        </Field>
      </div>

      <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
        <button className="btn btn-ghost"   onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (validate()) onSave(form) }}>
          {isEdit ? 'Save Changes' : 'Add Patient'}
        </button>
      </div>
    </div>
  )
}

// ── ViewModal ─────────────────────────────────────
interface ViewModalProps { patient: Patient; onClose: () => void; onEdit: () => void }

function ViewModal({ patient, onClose, onEdit }: ViewModalProps) {
  const rows: [string, string | number][] = [
    ['Patient ID', patient.id], ['Age', patient.age], ['Gender', patient.gender],
    ['Blood Type', patient.blood], ['Phone', patient.phone],
    ['Ward', patient.ward], ['Doctor', patient.doctor], ['Admitted', patient.admit],
  ]
  return (
    <Modal title="Patient Details" onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <Avatar name={patient.name} size={48} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{patient.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{patient.condition}</div>
        </div>
        <Badge status={patient.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: 16 }}>
        {rows.map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>

      {patient.notes && (
        <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Clinical Notes</div>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>{patient.notes}</div>
        </div>
      )}

      <div className="modal-footer" style={{ padding: 0 }}>
        <button className="btn btn-ghost"   onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={onEdit}>Edit Patient</button>
      </div>
    </Modal>
  )
}

// ── DeleteConfirm ─────────────────────────────────
interface DeleteConfirmProps { patient: Patient; onConfirm: () => void; onCancel: () => void }

function DeleteConfirm({ patient, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <Modal title="Delete Patient" onClose={onCancel} maxWidth={420}>
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
          Remove <span style={{ color: 'var(--accent)' }}>{patient.name}</span>?
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
          This will permanently delete the patient record and cannot be undone.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-ghost"  onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main Page ─────────────────────────────────────
export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS)
  const [modal, setModal]       = useState<ModalState>(null)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDoctor, setFilterDoctor] = useState('All')
  const [toast, setToast]       = useState<ToastState | null>(null)

  const showToast = (msg: string, color = 'var(--green)') => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 2800)
  }

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    return (
      (!q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.condition.toLowerCase().includes(q)) &&
      (filterStatus === 'All' || p.status === filterStatus) &&
      (filterDoctor === 'All' || p.doctor === filterDoctor)
    )
  })

  const handleAdd = (form: PatientFormData) => {
    const p: Patient = { ...form, id: genId(), age: Number(form.age), blood: form.blood, status: form.status, ward: form.ward }
    setPatients(ps => [p, ...ps])
    setModal(null)
    showToast(`${p.name} added successfully`)
  }

  const handleEdit = (form: PatientFormData) => {
    if (modal?.type !== 'edit') return
    setPatients(ps => ps.map(p => p.id === modal.patient.id ? { ...p, ...form, age: Number(form.age) } : p))
    setModal(null)
    showToast(`${form.name} updated`)
  }

  const handleDelete = () => {
    if (modal?.type !== 'delete') return
    const name = modal.patient.name
    setPatients(ps => ps.filter(p => p.id !== modal.patient.id))
    setModal(null)
    showToast(`${name} removed`, 'var(--red)')
  }

  const stats = {
    total:      patients.length,
    critical:   patients.filter(p => p.status === 'Critical').length,
    stable:     patients.filter(p => p.status === 'Stable').length,
    recovering: patients.filter(p => ['Recovering', 'Post-Op'].includes(p.status)).length,
  }

  return (
    <div className="page">
      {toast && <Toast message={toast.msg} color={toast.color} />}

      <div className="page-header">
        <div>
          <div className="page-header__title">Patient Management</div>
          <div className="page-header__sub">Add, view, edit and remove patient records</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
          + Add Patient
        </button>
      </div>

      <div className="stat-row">
        <StatCard label="Total"      value={stats.total}      sub="Admitted"        color="var(--accent)" />
        <StatCard label="Critical"   value={stats.critical}   sub="Needs attention" color="var(--red)" />
        <StatCard label="Stable"     value={stats.stable}     sub="Doing well"      color="var(--green)" />
        <StatCard label="Recovering" value={stats.recovering} sub="Post-treatment"  color="var(--amber)" />
      </div>

      <div className="filter-bar">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by name, ID or condition…" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}>
          <option>All</option>
          {DOCTORS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>{['ID', 'Patient', 'Age', 'Condition', 'Doctor', 'Ward', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="empty-state">No patients found matching your search.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td className="text-accent text-mono" style={{ fontSize: 12 }}>{p.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <Avatar name={p.name} size={30} />
                      <div>
                        <div className="fw-500">{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.gender} · {p.blood}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">{p.age}</td>
                  <td>{p.condition}</td>
                  <td className="text-muted fs-12">{p.doctor}</td>
                  <td className="text-muted fs-12">{p.ward}</td>
                  <td><Badge status={p.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setModal({ type: 'view',   patient: p })} style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid var(--border-2)', background: 'none', color: 'var(--muted)',  cursor: 'pointer', fontSize: 13 }}>👁</button>
                      <button onClick={() => setModal({ type: 'edit',   patient: p })} style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid var(--border-2)', background: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13 }}>✏️</button>
                      <button onClick={() => setModal({ type: 'delete', patient: p })} style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid var(--red)33',    background: 'none', color: 'var(--red)',    cursor: 'pointer', fontSize: 13 }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing {filtered.length} of {patients.length} patients</span>
          {(search || filterStatus !== 'All' || filterDoctor !== 'All') && (
            <button onClick={() => { setSearch(''); setFilterStatus('All'); setFilterDoctor('All') }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {modal?.type === 'add' && (
        <Modal title="Add New Patient" onClose={() => setModal(null)}>
          <PatientForm initial={{ ...EMPTY }} onSave={handleAdd} onCancel={() => setModal(null)} isEdit={false} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Edit Patient" onClose={() => setModal(null)}>
          <PatientForm initial={{ ...modal.patient, age: String(modal.patient.age) }} onSave={handleEdit} onCancel={() => setModal(null)} isEdit={true} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirm patient={modal.patient} onConfirm={handleDelete} onCancel={() => setModal(null)} />
      )}
      {modal?.type === 'view' && (
        <ViewModal patient={modal.patient} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'edit', patient: modal.patient })} />
      )}
    </div>
  )
}
