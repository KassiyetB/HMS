import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { StatCard, Modal, Field, Toast } from '../components/ui'
import { REVENUE_DATA, DEPT_REVENUE, SERVICES } from '../data/mockData'
import { kz } from '../i18n/kz'

type BillStatus = 'Төленді' | 'Күтуде' | 'Мерзімі өткен'
interface Bill { id: string; patient: string; service: string; amount: number; date: string; status: BillStatus }
interface BillFormData { patient: string; service: string; amount: string; date: string; status: BillStatus }
type ModalState = { type: 'add' } | { type: 'edit' | 'delete' | 'view'; bill: Bill } | null
interface FormErrors { patient?: string; service?: string; amount?: string }
interface ToastState { msg: string; color: string }

const PIE_COLORS = ['#58a6ff', '#3fb950', '#bc8cff', '#d29922', '#39d353']
const TIP_STYLE  = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }
const BILL_STATUSES: BillStatus[] = ['Төленді', 'Күтуде', 'Мерзімі өткен']

const INITIAL_BILLS: Bill[] = [
  { id: 'Ш-001', patient: 'Айша Нұрланова',  service: 'Кеңес беру',       amount: 4500,  date: '2026-04-15', status: 'Төленді' },
  { id: 'Ш-002', patient: 'Дәнияр Сейтқали', service: 'ЖҚББ орны',        amount: 85000, date: '2026-04-18', status: 'Күтуде' },
  { id: 'Ш-003', patient: 'Елена Марченко',   service: 'Хирургия',         amount: 62000, date: '2026-04-10', status: 'Төленді' },
  { id: 'Ш-004', patient: 'Марат Ахметов',    service: 'Хирургия',         amount: 48000, date: '2026-04-19', status: 'Күтуде' },
  { id: 'Ш-005', patient: 'Зарина Оспанова',  service: 'Зертханалық талдау',amount: 7200, date: '2026-04-12', status: 'Төленді' },
  { id: 'Ш-006', patient: 'Тимур Бекжанов',   service: 'Рентген / Бейнелеу',amount: 9800, date: '2026-04-17', status: 'Мерзімі өткен' },
]

const EMPTY: BillFormData = { patient: '', service: SERVICES[0], amount: '', date: new Date().toISOString().slice(0, 10), status: 'Күтуде' }
let _nextId = INITIAL_BILLS.length
const genId = () => `Ш-${String(++_nextId).padStart(3, '0')}`

const statusColor = (s: BillStatus) => ({ 'Төленді': 'var(--green)', 'Күтуде': 'var(--amber)', 'Мерзімі өткен': 'var(--red)' }[s])
function StatusBadge({ status }: { status: BillStatus }) {
  const c = statusColor(status)
  return <span className="badge" style={{ background: `${c}22`, color: c, border: `1px solid ${c}33` }}>{status}</span>
}

function BillForm({ initial, onSave, onCancel, isEdit }: { initial: BillFormData; onSave: (f: BillFormData) => void; onCancel: () => void; isEdit: boolean }) {
  const [form, setForm]     = useState<BillFormData>({ ...initial })
  const [errors, setErrors] = useState<FormErrors>({})
  const set = <K extends keyof BillFormData>(k: K, v: string) => setForm(f => ({ ...f, [k]: v }))
  const t   = kz.revenue

  const validate = () => {
    const e: FormErrors = {}
    if (!form.patient.trim()) e.patient = t.errors.patientRequired
    if (!form.service)        e.service = t.errors.serviceRequired
    if (!form.amount || Number(form.amount) <= 0) e.amount = t.errors.amountInvalid
    setErrors(e); return Object.keys(e).length === 0
  }

  return (
    <div>
      <div className="form-grid">
        <Field label={t.form.patientName} error={errors.patient}>
          <input value={form.patient} onChange={e => set('patient', e.target.value)} className={errors.patient ? 'error' : ''} placeholder={t.form.patientPlaceholder} />
        </Field>
        <Field label={t.form.service} error={errors.service}>
          <select value={form.service} onChange={e => set('service', e.target.value)}>{SERVICES.map(s => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label={t.form.amount} half error={errors.amount}>
          <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} className={errors.amount ? 'error' : ''} min={0} placeholder="0" />
        </Field>
        <Field label={t.form.date} half>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </Field>
        <Field label={t.form.status} half>
          <select value={form.status} onChange={e => set('status', e.target.value as BillStatus)}>{BILL_STATUSES.map(s => <option key={s}>{s}</option>)}</select>
        </Field>
      </div>
      <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onCancel}>{kz.cancel}</button>
        <button className="btn btn-primary" onClick={() => { if (validate()) onSave(form) }}>{isEdit ? kz.saveChanges : t.addBill}</button>
      </div>
    </div>
  )
}

function ViewModal({ bill, onClose, onEdit }: { bill: Bill; onClose: () => void; onEdit: () => void }) {
  const t = kz.revenue.detail
  return (
    <Modal title={kz.revenue.billDetails} onClose={onClose} maxWidth={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {([[ t.billId, bill.id ], [t.patient, bill.patient], [t.service, bill.service], [t.date, bill.date]] as [string,string][]).map(([k,v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>{k}</span>
            <span style={{ fontWeight: 500, fontSize: 13 }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>{t.amount}</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent)' }}>₸{bill.amount.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>{t.status}</span>
          <StatusBadge status={bill.status} />
        </div>
      </div>
      <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onClose}>{kz.close}</button>
        <button className="btn btn-primary" onClick={onEdit}>{kz.edit}</button>
      </div>
    </Modal>
  )
}

function DeleteConfirm({ bill, onConfirm, onCancel }: { bill: Bill; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal title={kz.revenue.deleteBill} onClose={onCancel} maxWidth={400}>
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}><span style={{ color: 'var(--accent)' }}>{bill.patient}</span> {kz.revenue.confirmDelete}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>{kz.revenue.deleteWarning}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={onCancel}>{kz.cancel}</button>
          <button className="btn btn-danger" onClick={onConfirm}>{kz.revenue.yesDelete}</button>
        </div>
      </div>
    </Modal>
  )
}

export default function Revenue() {
  const [bills, setBills]   = useState<Bill[]>(INITIAL_BILLS)
  const [modal, setModal]   = useState<ModalState>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState(kz.all)
  const [toast, setToast]   = useState<ToastState | null>(null)
  const t = kz.revenue

  const showToast = (msg: string, color = 'var(--green)') => { setToast({ msg, color }); setTimeout(() => setToast(null), 2800) }

  const filtered = bills.filter(b => {
    const q = search.toLowerCase()
    return (!q || b.patient.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.service.toLowerCase().includes(q)) &&
      (filterStatus === kz.all || b.status === filterStatus)
  })

  const collected = bills.filter(b => b.status === 'Төленді').reduce((s, b) => s + b.amount, 0)
  const pending   = bills.filter(b => b.status === 'Күтуде').reduce((s, b) => s + b.amount, 0)
  const overdue   = bills.filter(b => b.status === 'Мерзімі өткен').reduce((s, b) => s + b.amount, 0)

  const handleAdd  = (form: BillFormData) => { setBills(bs => [{ ...form, id: genId(), amount: Number(form.amount) }, ...bs]); setModal(null); showToast(t.toast.added) }
  const handleEdit = (form: BillFormData) => { if (modal?.type !== 'edit') return; setBills(bs => bs.map(b => b.id === modal.bill.id ? { ...b, ...form, amount: Number(form.amount) } : b)); setModal(null); showToast(t.toast.updated) }
  const handleDelete = () => { if (modal?.type !== 'delete') return; setBills(bs => bs.filter(b => b.id !== modal.bill.id)); setModal(null); showToast(t.toast.deleted, 'var(--red)') }

  const col = t.col

  return (
    <div className="page">
      {toast && <Toast message={toast.msg} color={toast.color} />}
      <div className="page-header">
        <div><div className="page-header__title">{t.title}</div><div className="page-header__sub">{t.subtitle}</div></div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>{t.addBill}</button>
      </div>
      <div className="stat-row">
        <StatCard label={t.collected}   value={`₸${(collected / 1000).toFixed(0)}К`} sub={`${bills.filter(b => b.status === 'Төленді').length} ${t.billsPaid}`}   color="var(--green)" />
        <StatCard label={t.pending}     value={`₸${(pending   / 1000).toFixed(0)}К`} sub={`${bills.filter(b => b.status === 'Күтуде').length} ${t.awaiting}`}       color="var(--amber)" />
        <StatCard label={t.overdue}     value={`₸${(overdue   / 1000).toFixed(0)}К`} sub={`${bills.filter(b => b.status === 'Мерзімі өткен').length} ${t.overdue}`} color="var(--red)" />
        <StatCard label={t.totalBilled} value={`₸${((collected + pending + overdue) / 1000).toFixed(0)}К`} sub={t.allBills} color="var(--accent)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">{kz.dashboard.revenueChart}</div>
          <div style={{ padding: '1rem', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="rv2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#58a6ff" stopOpacity={0.25}/><stop offset="95%" stopColor="#58a6ff" stopOpacity={0}/></linearGradient>
                  <linearGradient id="ex2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f85149" stopOpacity={0.2}/><stop offset="95%" stopColor="#f85149" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number | string) => `₸${(Number(v)/1000).toFixed(0)}К`} />
                <Tooltip contentStyle={TIP_STYLE} formatter={(v: any) => [`₸${(Number(v ?? 0)/1000).toFixed(0)}К`]} />
                <Area type="monotone" dataKey="revenue"  stroke="#58a6ff" strokeWidth={2} fill="url(#rv2)" name={kz.dashboard.revenue} />
                <Area type="monotone" dataKey="expenses" stroke="#f85149" strokeWidth={2} fill="url(#ex2)" name={kz.dashboard.expenses} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">{kz.dashboard.revenueByDept}</div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', height: 220 }}>
            <PieChart width={150} height={130}><Pie data={DEPT_REVENUE} cx={75} cy={65} innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">{DEPT_REVENUE.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}</Pie></PieChart>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', marginTop: 8 }}>
              {DEPT_REVENUE.map((d,i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i], flexShrink: 0 }}/><span style={{ color: 'var(--muted)', flex: 1 }}>{d.name}</span><span style={{ fontWeight: 500 }}>{d.value}%</span></div>)}
            </div>
          </div>
        </div>
      </div>
      <div className="filter-bar">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>{kz.all}</option>{BILL_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr>{[col.billId, col.patient, col.service, col.amount, col.date, col.status, col.actions].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={7} className="empty-state">{t.noBills}</td></tr>
                : filtered.map(b => (
                  <tr key={b.id}>
                    <td className="text-accent text-mono" style={{ fontSize: 12 }}>{b.id}</td>
                    <td className="fw-500">{b.patient}</td>
                    <td className="text-muted fs-13">{b.service}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>₸{b.amount.toLocaleString()}</td>
                    <td className="text-muted fs-12">{b.date}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setModal({ type: 'view',   bill: b })} style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid var(--border-2)', background: 'none', color: 'var(--muted)',  cursor: 'pointer', fontSize: 13 }}>👁</button>
                        <button onClick={() => setModal({ type: 'edit',   bill: b })} style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid var(--border-2)', background: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13 }}>✏️</button>
                        <button onClick={() => setModal({ type: 'delete', bill: b })} style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid var(--red)33',    background: 'none', color: 'var(--red)',    cursor: 'pointer', fontSize: 13 }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>{filtered.length} {t.of} {bills.length} {t.bills}</span>
          {(search || filterStatus !== kz.all) && <button onClick={() => { setSearch(''); setFilterStatus(kz.all) }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>{kz.clearFilters}</button>}
        </div>
      </div>
      {modal?.type === 'add'    && <Modal title={t.addNewBill} onClose={() => setModal(null)}><BillForm initial={{ ...EMPTY }} onSave={handleAdd} onCancel={() => setModal(null)} isEdit={false} /></Modal>}
      {modal?.type === 'edit'   && <Modal title={t.editBill}   onClose={() => setModal(null)}><BillForm initial={{ ...modal.bill, amount: String(modal.bill.amount) }} onSave={handleEdit} onCancel={() => setModal(null)} isEdit={true} /></Modal>}
      {modal?.type === 'delete' && <DeleteConfirm bill={modal.bill} onConfirm={handleDelete} onCancel={() => setModal(null)} />}
      {modal?.type === 'view'   && <ViewModal bill={modal.bill} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'edit', bill: modal.bill })} />}
    </div>
  )
}
