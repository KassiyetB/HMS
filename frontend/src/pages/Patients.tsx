import { useState, useEffect, useCallback } from 'react'
import { Badge, StatCard, Toast, Avatar, Modal, Field } from '../components/ui'
import { Spinner, ErrorBox } from '../hooks/useApi'
import { patientApi, type PatientRow, type CreatePatientPayload } from '../services/api'
import { DOCTORS, CONDITIONS, STATUSES, WARDS, BLOOD_TYPES, GENDERS } from '../data/mockData'
import { kz } from '../i18n/kz'

interface PatientFormData {
  name: string; age: string; gender: string; blood: string; condition: string
  doctor: string; status: string; ward: string; phone: string; admit_date: string; notes: string
}
type ModalState = { type: 'add' } | { type: 'edit' | 'delete' | 'view'; patient: PatientRow } | null
interface ToastState { msg: string; color: string }
interface FormErrors { name?: string; age?: string; condition?: string; phone?: string }
interface StatsData  { total: string; critical: string; stable: string; recovering: string }

const EMPTY: PatientFormData = {
  name: '', age: '', gender: GENDERS[0], blood: 'A+', condition: '',
  doctor: DOCTORS[0], status: STATUSES[0], ward: WARDS[0],
  phone: '', admit_date: new Date().toISOString().slice(0, 10), notes: '',
}

function PatientForm({ initial, onSave, onCancel, isEdit, saving }: { initial: PatientFormData; onSave: (f: PatientFormData) => Promise<void>; onCancel: () => void; isEdit: boolean; saving: boolean }) {
  const [form, setForm]     = useState<PatientFormData>({ ...initial })
  const [errors, setErrors] = useState<FormErrors>({})
  const set = <K extends keyof PatientFormData>(k: K, v: string) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e: FormErrors = {}
    if (!form.name.trim())                                        e.name      = kz.patients.errors.nameRequired
    if (!form.age || Number(form.age) < 1 || Number(form.age) > 130) e.age   = kz.patients.errors.ageInvalid
    if (!form.condition)                                          e.condition = kz.patients.errors.conditionRequired
    if (!form.phone.trim())                                       e.phone     = kz.patients.errors.phoneRequired
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div>
      <div className="form-grid">
        <Field label={kz.patients.form.fullName} error={errors.name}>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={errors.name ? 'error' : ''} placeholder={kz.patients.form.namePlaceholder} />
        </Field>
        <Field label={kz.patients.form.age} half error={errors.age}>
          <input type="number" value={form.age} onChange={e => set('age', e.target.value)} className={errors.age ? 'error' : ''} min={1} max={130} />
        </Field>
        <Field label={kz.patients.form.gender} half>
          <select value={form.gender} onChange={e => set('gender', e.target.value)}>
            {GENDERS.map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label={kz.patients.form.bloodType} half>
          <select value={form.blood} onChange={e => set('blood', e.target.value)}>
            {BLOOD_TYPES.map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label={kz.patients.form.phone} half error={errors.phone}>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className={errors.phone ? 'error' : ''} placeholder={kz.patients.form.phonePlaceholder} />
        </Field>
        <Field label={kz.patients.form.condition} error={errors.condition}>
          <select value={form.condition} onChange={e => set('condition', e.target.value)} className={errors.condition ? 'error' : ''}>
            <option value="">{kz.patients.form.conditionPlaceholder}</option>
            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label={kz.patients.form.assignedDoctor} half>
          <select value={form.doctor} onChange={e => set('doctor', e.target.value)}>
            {DOCTORS.map(d => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field label={kz.patients.form.ward} half>
          <select value={form.ward} onChange={e => set('ward', e.target.value)}>
            {WARDS.map(w => <option key={w}>{w}</option>)}
          </select>
        </Field>
        <Field label={kz.patients.form.status} half>
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label={kz.patients.form.admissionDate} half>
          <input type="date" value={form.admit_date} onChange={e => set('admit_date', e.target.value)} />
        </Field>
        <Field label={kz.patients.form.clinicalNotes}>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder={kz.patients.form.notesPlaceholder} />
        </Field>
      </div>
      <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>{kz.cancel}</button>
        <button className="btn btn-primary" onClick={() => { if (validate()) onSave(form) }} disabled={saving}>
          {saving ? kz.saving : isEdit ? kz.saveChanges : kz.patients.addPatient}
        </button>
      </div>
    </div>
  )
}

function ViewModal({ patient, onClose, onEdit }: { patient: PatientRow; onClose: () => void; onEdit: () => void }) {
  const t = kz.patients.detail
  const rows: [string, string | number][] = [
    [t.patientId, patient.patient_id], [t.age, patient.age], [t.gender, patient.gender],
    [t.bloodType, patient.blood], [t.phone, patient.phone],
    [t.ward, patient.ward], [t.doctor, patient.doctor],
    [t.admitted, patient.admit_date?.slice(0, 10)],
  ]
  return (
    <Modal title={kz.patients.patientDetails} onClose={onClose}>
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
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{t.clinicalNotes}</div>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>{patient.notes}</div>
        </div>
      )}
      <div className="modal-footer" style={{ padding: 0 }}>
        <button className="btn btn-ghost" onClick={onClose}>{kz.close}</button>
        <button className="btn btn-primary" onClick={onEdit}>{kz.patients.editPatient}</button>
      </div>
    </Modal>
  )
}

function DeleteConfirm({ patient, onConfirm, onCancel, deleting }: { patient: PatientRow; onConfirm: () => void; onCancel: () => void; deleting: boolean }) {
  return (
    <Modal title={kz.patients.deletePatient} onClose={onCancel} maxWidth={420}>
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
          <span style={{ color: 'var(--accent)' }}>{patient.name}</span> {kz.patients.confirmDelete}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>{kz.patients.deleteWarning}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={onCancel} disabled={deleting}>{kz.cancel}</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? kz.deleting : kz.patients.yesDelete}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function Patients() {
  const [patients, setPatients] = useState<PatientRow[]>([])
  const [stats, setStats]       = useState<StatsData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [modal, setModal]       = useState<ModalState>(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState(kz.all)
  const [filterDoctor, setFilterDoctor] = useState(kz.all)
  const [toast, setToast]       = useState<ToastState | null>(null)

  const showToast = (msg: string, color = 'var(--green)') => { setToast({ msg, color }); setTimeout(() => setToast(null), 2800) }

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params: Record<string, string> = {}
      if (search)                          params.search = search
      if (filterStatus !== kz.all)         params.status = filterStatus
      if (filterDoctor !== kz.all)         params.doctor = filterDoctor
      const [listRes, statsRes] = await Promise.all([patientApi.getAll(params), patientApi.getStats()])
      setPatients(listRes.data)
      setStats(statsRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : kz.error.loadPatients)
    } finally { setLoading(false) }
  }, [search, filterStatus, filterDoctor])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAdd = async (form: PatientFormData) => {
    setSaving(true)
    try {
      const payload: CreatePatientPayload = { ...form, age: Number(form.age) }
      const res = await patientApi.create(payload)
      setPatients(ps => [res.data, ...ps])
      setModal(null)
      showToast(`${res.data.name} ${kz.patients.toast.added}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : kz.patients.toast.addFail, 'var(--red)')
    } finally { setSaving(false) }
  }

  const handleEdit = async (form: PatientFormData) => {
    if (modal?.type !== 'edit') return
    setSaving(true)
    try {
      const res = await patientApi.update(modal.patient.patient_id, { ...form, age: Number(form.age) })
      setPatients(ps => ps.map(p => p.patient_id === res.data.patient_id ? res.data : p))
      setModal(null)
      showToast(`${res.data.name} ${kz.patients.toast.updated}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : kz.patients.toast.updFail, 'var(--red)')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (modal?.type !== 'delete') return
    setDeleting(true)
    try {
      const { patient_id, name } = modal.patient
      await patientApi.delete(patient_id)
      setPatients(ps => ps.filter(p => p.patient_id !== patient_id))
      setModal(null)
      showToast(`${name} ${kz.patients.toast.removed}`, 'var(--red)')
    } catch (err) {
      showToast(err instanceof Error ? err.message : kz.patients.toast.delFail, 'var(--red)')
    } finally { setDeleting(false) }
  }

  const toFormData = (p: PatientRow): PatientFormData => ({
    name: p.name, age: String(p.age), gender: p.gender, blood: p.blood,
    condition: p.condition, doctor: p.doctor, status: p.status, ward: p.ward,
    phone: p.phone, admit_date: p.admit_date?.slice(0, 10) ?? '', notes: p.notes ?? '',
  })

  const t  = kz.patients
  const tc = kz.patients.col

  return (
    <div className="page">
      {toast && <Toast message={toast.msg} color={toast.color} />}

      <div className="page-header">
        <div>
          <div className="page-header__title">{t.title}</div>
          <div className="page-header__sub">{t.subtitle}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>{t.addPatient}</button>
      </div>

      <div className="stat-row">
        <StatCard label={kz.patients.total}      value={stats?.total      ?? '—'} sub={t.admitted}     color="var(--accent)" />
        <StatCard label={kz.status.critical}      value={stats?.critical   ?? '—'} sub={t.needsAttention ?? ''} color="var(--red)" />
        <StatCard label={kz.status.stable}        value={stats?.stable     ?? '—'} sub={t.doingWell ?? ''} color="var(--green)" />
        <StatCard label={kz.patients.recovering}  value={stats?.recovering ?? '—'} sub={t.postTreatment ?? ''} color="var(--amber)" />
      </div>

      <div className="filter-bar">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>{kz.all}</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}>
          <option>{kz.all}</option>
          {DOCTORS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {error ? <ErrorBox message={error} onRetry={fetchData} /> : loading ? <Spinner /> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead><tr>{[tc.id, tc.patient, tc.age, tc.condition, tc.doctor, tc.ward, tc.status, tc.actions].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr><td colSpan={8} className="empty-state">{t.noPatients}</td></tr>
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
            <span>{patients.length} {t.patients} {t.showing}</span>
            {(search || filterStatus !== kz.all || filterDoctor !== kz.all) && (
              <button onClick={() => { setSearch(''); setFilterStatus(kz.all); setFilterDoctor(kz.all) }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>{kz.clearFilters}</button>
            )}
          </div>
        </div>
      )}

      {modal?.type === 'add'    && <Modal title={t.addNewPatient} onClose={() => setModal(null)}><PatientForm initial={{ ...EMPTY }} onSave={handleAdd} onCancel={() => setModal(null)} isEdit={false} saving={saving} /></Modal>}
      {modal?.type === 'edit'   && <Modal title={t.editPatient}   onClose={() => setModal(null)}><PatientForm initial={toFormData(modal.patient)} onSave={handleEdit} onCancel={() => setModal(null)} isEdit={true} saving={saving} /></Modal>}
      {modal?.type === 'delete' && <DeleteConfirm patient={modal.patient} onConfirm={handleDelete} onCancel={() => setModal(null)} deleting={deleting} />}
      {modal?.type === 'view'   && <ViewModal patient={modal.patient} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'edit', patient: modal.patient })} />}
    </div>
  )
}
