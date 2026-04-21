import { useState } from 'react'
import { StatCard, Toast, Modal, Field } from '../components/ui'
import { INITIAL_SUPPLIES, type Supply } from '../data/mockData'

// ── Types ─────────────────────────────────────────
interface SupplyFormData {
  name:     string
  category: string
  stock:    string | number
  reorder:  string | number
  unit:     string
  cost:     string | number
  expiry:   string
}

type ModalState = { type: 'add' } | { type: 'edit' | 'delete' | 'view'; supply: Supply } | null
interface FormErrors { name?: string; stock?: string; reorder?: string; cost?: string; unit?: string }
interface ToastState { msg: string; color: string }

const CATEGORIES = ['Analgesics', 'Antibiotics', 'Endocrine', 'Fluids', 'PPE', 'GI', 'Diabetes', 'Cardiology', 'Other']
const UNITS      = ['tablets', 'capsules', 'vials', 'bags', 'boxes', 'bottles', 'ampoules', 'sachets']

const EMPTY: SupplyFormData = {
  name: '', category: CATEGORIES[0], stock: '', reorder: '',
  unit: UNITS[0], cost: '', expiry: '',
}

let _nextId = INITIAL_SUPPLIES.length
const genId = () => `M-${String(++_nextId).padStart(3, '0')}`

const stockStatus = (stock: number, reorder: number): 'Critical' | 'Low' | 'OK' => {
  if (stock === 0)          return 'Critical'
  if (stock < reorder)      return 'Low'
  return 'OK'
}

const stockColor = (status: 'Critical' | 'Low' | 'OK') =>
  ({ Critical: 'var(--red)', Low: 'var(--amber)', OK: 'var(--green)' }[status])

function StockBadge({ stock, reorder }: { stock: number; reorder: number }) {
  const s = stockStatus(stock, reorder)
  const c = stockColor(s)
  return <span className="badge" style={{ background: `${c}22`, color: c, border: `1px solid ${c}33` }}>{s}</span>
}

// ── Supply Form ───────────────────────────────────
interface SupplyFormProps { initial: SupplyFormData; onSave: (f: SupplyFormData) => void; onCancel: () => void; isEdit: boolean }

function SupplyForm({ initial, onSave, onCancel, isEdit }: SupplyFormProps) {
  const [form, setForm]     = useState<SupplyFormData>({ ...initial })
  const [errors, setErrors] = useState<FormErrors>({})
  const set = <K extends keyof SupplyFormData>(k: K, v: SupplyFormData[K]) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e: FormErrors = {}
    if (!form.name.trim())                   e.name    = 'Name is required'
    if (!form.unit.trim())                   e.unit    = 'Unit is required'
    if (Number(form.stock)  < 0 || form.stock  === '') e.stock   = 'Enter valid stock quantity'
    if (Number(form.reorder) <= 0 || form.reorder === '') e.reorder = 'Enter valid reorder level'
    if (Number(form.cost)   <= 0 || form.cost   === '') e.cost    = 'Enter valid cost'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div>
      <div className="form-grid">
        <Field label="Item Name" error={errors.name}>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={errors.name ? 'error' : ''} placeholder="e.g. Paracetamol 500mg" />
        </Field>
        <Field label="Category" half>
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Unit" half error={errors.unit}>
          <select value={form.unit} onChange={e => set('unit', e.target.value)}>
            {UNITS.map(u => <option key={u}>{u}</option>)}
          </select>
        </Field>
        <Field label="Current Stock" half error={errors.stock}>
          <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className={errors.stock ? 'error' : ''} min={0} placeholder="0" />
        </Field>
        <Field label="Reorder At" half error={errors.reorder}>
          <input type="number" value={form.reorder} onChange={e => set('reorder', e.target.value)} className={errors.reorder ? 'error' : ''} min={1} placeholder="50" />
        </Field>
        <Field label="Unit Cost (₸)" half error={errors.cost}>
          <input type="number" value={form.cost} onChange={e => set('cost', e.target.value)} className={errors.cost ? 'error' : ''} min={0} step={0.01} placeholder="0.00" />
        </Field>
        <Field label="Expiry (YYYY-MM)" half>
          <input value={form.expiry} onChange={e => set('expiry', e.target.value)} placeholder="2027-06" />
        </Field>
      </div>
      <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
        <button className="btn btn-ghost"   onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (validate()) onSave(form) }}>
          {isEdit ? 'Save Changes' : 'Add Item'}
        </button>
      </div>
    </div>
  )
}

// ── View Modal ────────────────────────────────────
function ViewModal({ supply, onClose, onEdit }: { supply: Supply; onClose: () => void; onEdit: () => void }) {
  const s      = stockStatus(supply.stock, supply.reorder)
  const pct    = Math.min(100, Math.round((supply.stock / supply.reorder) * 100))
  const color  = stockColor(s)
  return (
    <Modal title="Supply Details" onClose={onClose} maxWidth={420}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{supply.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{supply.category} · {supply.unit}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: 16 }}>
        {([['Item ID', supply.id], ['Expiry', supply.expiry], ['Unit Cost', `₸${supply.cost.toFixed(2)}`], ['Total Value', `₸${(supply.stock * supply.cost).toFixed(2)}`]] as [string, string][]).map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px', border: '1px solid var(--border)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Stock Level</span>
          <StockBadge stock={supply.stock} reorder={supply.reorder} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 30 }}>{supply.stock}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Reorder when below {supply.reorder} {supply.unit}</div>
      </div>
      <div className="modal-footer" style={{ padding: 0 }}>
        <button className="btn btn-ghost"   onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={onEdit}>Edit</button>
      </div>
    </Modal>
  )
}

// ── Delete Confirm ────────────────────────────────
function DeleteConfirm({ supply, onConfirm, onCancel }: { supply: Supply; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal title="Delete Item" onClose={onCancel} maxWidth={400}>
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Delete <span style={{ color: 'var(--accent)' }}>{supply.name}</span>?</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>This cannot be undone.</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-ghost"  onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main Page ─────────────────────────────────────
export default function Supplies() {
  const [supplies, setSupplies] = useState<Supply[]>(INITIAL_SUPPLIES)
  const [modal, setModal]       = useState<ModalState>(null)
  const [search, setSearch]     = useState('')
  const [filterCat, setFilterCat]       = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [toast, setToast]       = useState<ToastState | null>(null)

  const showToast = (msg: string, color = 'var(--green)') => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 2800)
  }

  const filtered = supplies.filter(s => {
    const q   = search.toLowerCase()
    const st  = stockStatus(s.stock, s.reorder)
    return (
      (!q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) &&
      (filterCat    === 'All' || s.category === filterCat) &&
      (filterStatus === 'All' || st === filterStatus)
    )
  })

  const lowStock   = supplies.filter(s => s.stock < s.reorder)
  const outOfStock = supplies.filter(s => s.stock === 0)
  const totalValue = supplies.reduce((sum, s) => sum + s.stock * s.cost, 0)

  const handleAdd = (form: SupplyFormData) => {
    const s: Supply = { ...form, id: genId(), stock: Number(form.stock), reorder: Number(form.reorder), cost: Number(form.cost) }
    setSupplies(ps => [s, ...ps])
    setModal(null)
    showToast(`${s.name} added`)
  }

  const handleEdit = (form: SupplyFormData) => {
    if (modal?.type !== 'edit') return
    setSupplies(ps => ps.map(s => s.id === modal.supply.id ? { ...s, ...form, stock: Number(form.stock), reorder: Number(form.reorder), cost: Number(form.cost) } : s))
    setModal(null)
    showToast(`${form.name} updated`)
  }

  const handleDelete = () => {
    if (modal?.type !== 'delete') return
    const name = modal.supply.name
    setSupplies(ps => ps.filter(s => s.id !== modal.supply.id))
    setModal(null)
    showToast(`${name} removed`, 'var(--red)')
  }

  return (
    <div className="page">
      {toast && <Toast message={toast.msg} color={toast.color} />}

      <div className="page-header">
        <div>
          <div className="page-header__title">Medical Supplies</div>
          <div className="page-header__sub">Monitor inventory levels and reorder points</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>+ Add Item</button>
      </div>

      <div className="stat-row">
        <StatCard label="Total Items"   value={supplies.length}                          sub="Unique items"          color="var(--accent)" />
        <StatCard label="Low Stock"     value={lowStock.length}                          sub="Below reorder point"   color="var(--amber)" />
        <StatCard label="Out of Stock"  value={outOfStock.length}                        sub="Need urgent reorder"   color="var(--red)" />
        <StatCard label="Inventory Value" value={`₸${(totalValue / 1000).toFixed(1)}K`} sub="Current stock value"   color="var(--green)" />
      </div>

      {/* Low stock alert banner */}
      {lowStock.length > 0 && (
        <div style={{ background: 'var(--red)11', border: '1px solid var(--red)44', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--red)', fontWeight: 500 }}>Low stock alert:</span>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{lowStock.map(s => s.name).join(', ')}</span>
        </div>
      )}

      <div className="filter-bar">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by name, ID or category…" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option>All</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option>
          <option>OK</option>
          <option>Low</option>
          <option>Critical</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>{['ID', 'Item Name', 'Category', 'Stock', 'Reorder At', 'Unit Cost', 'Expiry', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="empty-state">No items found.</td></tr>
              ) : filtered.map(s => {
                const pct   = Math.min(100, Math.round((s.stock / s.reorder) * 100))
                const color = stockColor(stockStatus(s.stock, s.reorder))
                return (
                  <tr key={s.id}>
                    <td className="text-accent text-mono" style={{ fontSize: 12 }}>{s.id}</td>
                    <td className="fw-500">{s.name}</td>
                    <td className="text-muted fs-12">{s.category}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
                        <span style={{ fontWeight: 600, color, minWidth: 28 }}>{s.stock}</span>
                        <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} />
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{s.reorder} {s.unit}</td>
                    <td className="text-muted fs-12">₸{s.cost.toFixed(2)}</td>
                    <td className="text-muted fs-12">{s.expiry}</td>
                    <td><StockBadge stock={s.stock} reorder={s.reorder} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setModal({ type: 'view',   supply: s })} style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid var(--border-2)', background: 'none', color: 'var(--muted)',  cursor: 'pointer', fontSize: 13 }}>👁</button>
                        <button onClick={() => setModal({ type: 'edit',   supply: s })} style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid var(--border-2)', background: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13 }}>✏️</button>
                        <button onClick={() => setModal({ type: 'delete', supply: s })} style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid var(--red)33',    background: 'none', color: 'var(--red)',    cursor: 'pointer', fontSize: 13 }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing {filtered.length} of {supplies.length} items</span>
          {(search || filterCat !== 'All' || filterStatus !== 'All') && (
            <button onClick={() => { setSearch(''); setFilterCat('All'); setFilterStatus('All') }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>Clear filters</button>
          )}
        </div>
      </div>

      {modal?.type === 'add'    && <Modal title="Add Supply Item" onClose={() => setModal(null)}><SupplyForm initial={{ ...EMPTY }} onSave={handleAdd} onCancel={() => setModal(null)} isEdit={false} /></Modal>}
      {modal?.type === 'edit'   && <Modal title="Edit Supply Item" onClose={() => setModal(null)}><SupplyForm initial={{ ...modal.supply, stock: String(modal.supply.stock), reorder: String(modal.supply.reorder), cost: String(modal.supply.cost) }} onSave={handleEdit} onCancel={() => setModal(null)} isEdit={true} /></Modal>}
      {modal?.type === 'delete' && <DeleteConfirm supply={modal.supply} onConfirm={handleDelete} onCancel={() => setModal(null)} />}
      {modal?.type === 'view'   && <ViewModal supply={modal.supply} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'edit', supply: modal.supply })} />}
    </div>
  )
}
