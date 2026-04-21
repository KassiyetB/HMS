import { useState, useEffect, useCallback } from 'react'
import { Badge, StatCard, Toast, Avatar, Modal, Field } from '../components/ui'
import { Spinner, ErrorBox } from '../hooks/useApi'
import { patientApi, type PatientRow, type CreatePatientPayload } from '../services/api'
import { DOCTORS, CONDITIONS, STATUSES, WARDS, BLOOD_TYPES } from '../data/mockData'

// ── Types ─────────────────────────────────────────
interface PatientFormData {
  name:       string
  age:        string
  gender:     string
  blood:      string
  condition:  string
  doctor:     string
  status:     string
  ward:       string
  phone:      string
  admit_date: string
  notes:      string
}

type ModalState =
  | { type: 'add' }
  | { type: 'edit' | 'delete' | 'view'; patient: PatientRow }
  | null

interface ToastState  { msg: string; color: string }
interface FormErrors  { name?: string; age?: string; condition?: string; phone?: string }
interface StatsData   { total: string; critical: string; stable: string; recovering: string; post_op: string }

const EMPTY: PatientFormData = {
  name: '', age: '', gender: 'Male', blood: 'A+', condition: '',
  doctor: DOCTORS[0], status: 'Stable', ward: 'General',
  phone: '', admit_date: new Date().toISOString().slice(0, 10), notes: '',
}

// ── Patient Form ───────────────────────────────────
interface PatientFormProps {
  initial:  PatientFormData
  onSave:   (form: PatientFormData) => Promise<void>
  onCancel: () => void
  isEdit:   boolean
  saving:   boolean
}

function PatientForm({ initial, onSave, onCancel, isEdit, saving }: PatientFormProps) {
  const [form, setForm]     = useState<PatientFormData>({ ...initial })
  const [errors, setErrors] = useState<FormErrors>({})
  const set = <K extends keyof PatientFormData>(k: K, v: string) => setForm(f => ({ ...f, [k]: v }))

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.name.trim())                                    e.name      = 'Name is required'
    if (!form.age || Number(form.age) < 1 || Number(form.age) > 130) e.age = 'Enter a valid age'
    if (!form.condition)                                      e.condition = 'Select a condition'
    if (!form.phone.trim())                                   e.phone     = 'Phone is required'
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
          <input type="number" value={form.age} onChange={e => set('age', e.target.value)} className={errors.age ? 'error' : ''} min={1} max={130} placeholder="Age" />
        </Field>
        <Field label="Gender" half>
          <select value={form.gender} onChange={e => set('gender', e.target.value)}>
            {['Male', 'Female', 'Other'].map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Blood Type" half>
          <select value={form.blood} onChange={e => set('blood', e.target.value)}>
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
          <select value={form.ward} onChange={e => set('ward', e.target.value)}>
            {WARDS.map(w => <option key={w}>{w}</option>)}
          </select>
        </Field>
        <Field label="Status" half>
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Admission Date" half>
          <input type="date" value={form.admit_date} onChange={e => set('admit_date', e.target.value)} />
        </Field>
        <Field label="Clinical Notes">
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes…" />
        </Field>
      </div>
      <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (validate()) onSave(form) }} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Patient'}
        </button>
      </div>
    </div>
  )
}

// ── View Modal ─────────────────────────────────────
function ViewModal({ patient, onClose, onEdit }: { patient: PatientRow; onClose: () => void; onEdit: () => void }) {
  const rows: [string, string | number][] = [
    ['Patient ID', patient.patient_id], ['Age', patient.age], ['Gender', patient.gender],
    ['Blood Type', patient.blood], ['Phone', patient.phone],
    ['Ward', patient.ward], ['Doctor', patient.doctor],
    ['Admitted', patient.admit_date?.slice(0, 10)],
  ]
  return (
    <Modal title="Patient Details" onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <Avatar name={patient.name} size={48} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{patient.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{patient.condition}</div>
        </div>
        <Badge status={patient.status as any} />
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
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={onEdit}>Edit Patient</button>
      </div>
    </Modal>
  )
}

// ── Delete Confirm ─────────────────────────────────
function DeleteConfirm({ patient, onConfirm, onCancel, deleting }: { patient: PatientRow; onConfirm: () => void; onCancel: () => void; deleting: boolean }) {
  return (
    <Modal title="Delete Patient" onClose={onCancel} maxWidth={420}>
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
          Remove <span style={{ color: 'var(--accent)' }}>{patient.name}</span>?
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>This will permanently delete the record.</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main Page ──────────────────────────────────────
export default function Patients() {
  const [patients, setPatients] = useState<PatientRow[]>([])
  const [stats, setStats]       = useState<StatsData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [modal, setModal]       = useState<ModalState>(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDoctor, setFilterDoctor] = useState('All')
  const [toast, setToast]       = useState<ToastState | null>(null)

  const showToast = (msg: string, color = 'var(--green)') => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 2800)
  }

  // ── Fetch patients + stats ────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (search)                    params.search = search
      if (filterStatus !== 'All')    params.status = filterStatus
      if (filterDoctor !== 'All')    params.doctor = filterDoctor

      const [listRes, statsRes] = await Promise.all([
        patientApi.getAll(params),
        patientApi.getStats(),
      ])
      setPatients(listRes.data)
      setStats(statsRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients')
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus, filterDoctor])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Handlers ──────────────────────────────────
  const handleAdd = async (form: PatientFormData) => {
    setSaving(true)
    try {
      const payload: CreatePatientPayload = {
        ...form,
        age: Number(form.age),
      }
      const res = await patientApi.create(payload)
      setPatients(ps => [res.data, ...ps])
      setModal(null)
      showToast(`${res.data.name} added`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add patient', 'var(--red)')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (form: PatientFormData) => {
    if (modal?.type !== 'edit') return
    setSaving(true)
    try {
      const res = await patientApi.update(modal.patient.patient_id, { ...form, age: Number(form.age) })
      setPatients(ps => ps.map(p => p.patient_id === res.data.patient_id ? res.data : p))
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
      const { patient_id, name } = modal.patient
      await patientApi.delete(patient_id)
      setPatients(ps => ps.filter(p => p.patient_id !== patient_id))
      setModal(null)
      showToast(`${name} removed`, 'var(--red)')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete', 'var(--red)')
    } finally {
      setDeleting(false)
    }
  }

  const toFormData = (p: PatientRow): PatientFormData => ({
    name:       p.name,
    age:        String(p.age),
    gender:     p.gender,
    blood:      p.blood,
    condition:  p.condition,
    doctor:     p.doctor,
    status:     p.status,
    ward:       p.ward,
    phone:      p.phone,
    admit_date: p.admit_date?.slice(0, 10) ?? '',
    notes:      p.notes ?? '',
  })

  return (
    <div className="page">
      {toast && <Toast message={toast.msg} color={toast.color} />}

      <div className="page-header">
        <div>
          <div className="page-header__title">Patient Management</div>
          <div className="page-header__sub">Add, view, edit and remove patient records</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>+ Add Patient</button>
      </div>

      {/* Stats */}
      <div className="stat-row">
        <StatCard label="Total"      value={stats?.total      ?? '—'} sub="Admitted"        color="var(--accent)" />
        <StatCard label="Critical"   value={stats?.critical   ?? '—'} sub="Needs attention" color="var(--red)" />
        <StatCard label="Stable"     value={stats?.stable     ?? '—'} sub="Doing well"      color="var(--green)" />
        <StatCard label="Recovering" value={stats?.recovering ?? '—'} sub="Post-treatment"  color="var(--amber)" />
      </div>

      {/* Filters */}
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

      {/* Content */}
      {error ? (
        <ErrorBox message={error} onRetry={fetchData} />
      ) : loading ? (
        <Spinner />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>{['ID', 'Patient', 'Age', 'Condition', 'Doctor', 'Ward', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr><td colSpan={8} className="empty-state">No patients found.</td></tr>
                ) : patients.map(p => (
                  <tr key={p.patient_id}>
                    <td className="text-accent text-mono" style={{ fontSize: 12 }}>{p.patient_id}</td>
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
                    <td><Badge status={p.status as any} /></td>
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
            <span>{patients.length} patient{patients.length !== 1 ? 's' : ''} found</span>
            {(search || filterStatus !== 'All' || filterDoctor !== 'All') && (
              <button onClick={() => { setSearch(''); setFilterStatus('All'); setFilterDoctor('All') }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>Clear filters</button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'add' && (
        <Modal title="Add New Patient" onClose={() => setModal(null)}>
          <PatientForm initial={{ ...EMPTY }} onSave={handleAdd} onCancel={() => setModal(null)} isEdit={false} saving={saving} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Edit Patient" onClose={() => setModal(null)}>
          <PatientForm initial={toFormData(modal.patient)} onSave={handleEdit} onCancel={() => setModal(null)} isEdit={true} saving={saving} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirm patient={modal.patient} onConfirm={handleDelete} onCancel={() => setModal(null)} deleting={deleting} />
      )}
      {modal?.type === 'view' && (
        <ViewModal patient={modal.patient} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'edit', patient: modal.patient })} />
      )}
    </div>
  )
}
