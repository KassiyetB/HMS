import { useState } from 'react'
import { StatCard, Toast, Modal, Field } from '../components/ui'
import { INITIAL_SUPPLIES, type Supply, CATEGORIES, UNITS } from '../data/mockData'
import { kz } from '../i18n/kz'

const INITIAL_SUPPLIES_KZ: Supply[] = [
  { id: 'Д-001', name: 'Парацетамол 500мг',   category: 'Ауырсынуды басатын', stock: 420, reorder: 100, unit: 'таблетка', cost: 0.05,  expiry: '2027-06' },
  { id: 'Д-002', name: 'Амоксициллин 250мг',  category: 'Антибиотик',          stock: 85,  reorder: 100, unit: 'капсула',  cost: 0.18,  expiry: '2026-12' },
  { id: 'Д-003', name: 'Инсулин Гларгин',     category: 'Эндокрин',            stock: 32,  reorder: 50,  unit: 'флакон',  cost: 24.50, expiry: '2026-09' },
  { id: 'Д-004', name: 'Физиологиялық ерітінді 0.9%', category: 'Сұйықтық',   stock: 210, reorder: 80,  unit: 'қап',     cost: 1.20,  expiry: '2027-01' },
  { id: 'Д-005', name: 'Хирургиялық қолғап (L)', category: 'ЖҚЗ',             stock: 18,  reorder: 30,  unit: 'қорап',   cost: 4.80,  expiry: '2028-06' },
  { id: 'Д-006', name: 'Омепразол 20мг',      category: 'АІЖ',                 stock: 155, reorder: 60,  unit: 'капсула', cost: 0.12,  expiry: '2027-03' },
  { id: 'Д-007', name: 'Метформин 500мг',     category: 'Диабет',              stock: 9,   reorder: 120, unit: 'таблетка',cost: 0.08,  expiry: '2026-11' },
]

interface SupplyFormData { name: string; category: string; stock: string; reorder: string; unit: string; cost: string; expiry: string }
type ModalState = { type: 'add' } | { type: 'edit' | 'delete' | 'view'; supply: Supply } | null
interface FormErrors { name?: string; stock?: string; reorder?: string; cost?: string; unit?: string }
interface ToastState { msg: string; color: string }

const EMPTY: SupplyFormData = { name: '', category: CATEGORIES[0], stock: '', reorder: '', unit: UNITS[0], cost: '', expiry: '' }
let _nextId = INITIAL_SUPPLIES_KZ.length
const genId = () => `Д-${String(++_nextId).padStart(3, '0')}`

type StockLevel = 'Сын деңгей' | 'Аз қалды' | 'Жеткілікті'
const stockStatus = (stock: number, reorder: number): StockLevel => stock === 0 ? 'Сын деңгей' : stock < reorder ? 'Аз қалды' : 'Жеткілікті'
const stockColor  = (s: StockLevel) => ({ 'Сын деңгей': 'var(--red)', 'Аз қалды': 'var(--amber)', 'Жеткілікті': 'var(--green)' }[s])

function StockBadge({ stock, reorder }: { stock: number; reorder: number }) {
  const s = stockStatus(stock, reorder); const c = stockColor(s)
  return <span className="badge" style={{ background: `${c}22`, color: c, border: `1px solid ${c}33` }}>{s}</span>
}

function SupplyForm({ initial, onSave, onCancel, isEdit }: { initial: SupplyFormData; onSave: (f: SupplyFormData) => void; onCancel: () => void; isEdit: boolean }) {
  const [form, setForm]     = useState<SupplyFormData>({ ...initial })
  const [errors, setErrors] = useState<FormErrors>({})
  const set = <K extends keyof SupplyFormData>(k: K, v: string) => setForm(f => ({ ...f, [k]: v }))
  const t   = kz.supplies.form

  const validate = () => {
    const e: FormErrors = {}
    if (!form.name.trim())  e.name    = kz.supplies.errors.nameRequired
    if (!form.unit.trim())  e.unit    = kz.supplies.errors.unitRequired
    if (form.stock   === '' || Number(form.stock)   < 0)  e.stock   = kz.supplies.errors.stockInvalid
    if (form.reorder === '' || Number(form.reorder) <= 0) e.reorder = kz.supplies.errors.reorderInvalid
    if (form.cost    === '' || Number(form.cost)    <= 0) e.cost    = kz.supplies.errors.costInvalid
    setErrors(e); return Object.keys(e).length === 0
  }

  return (
    <div>
      <div className="form-grid">
        <Field label={t.itemName} error={errors.name}><input value={form.name} onChange={e => set('name', e.target.value)} className={errors.name ? 'error' : ''} placeholder={t.namePlaceholder} /></Field>
        <Field label={t.category} half><select value={form.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
        <Field label={t.unit} half error={errors.unit}><select value={form.unit} onChange={e => set('unit', e.target.value)}>{UNITS.map(u => <option key={u}>{u}</option>)}</select></Field>
        <Field label={t.currentStock} half error={errors.stock}><input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className={errors.stock ? 'error' : ''} min={0} placeholder="0" /></Field>
        <Field label={t.reorderAt} half error={errors.reorder}><input type="number" value={form.reorder} onChange={e => set('reorder', e.target.value)} className={errors.reorder ? 'error' : ''} min={1} placeholder="50" /></Field>
        <Field label={t.unitCost} half error={errors.cost}><input type="number" value={form.cost} onChange={e => set('cost', e.target.value)} className={errors.cost ? 'error' : ''} min={0} step={0.01} placeholder="0.00" /></Field>
        <Field label={t.expiry} half><input value={form.expiry} onChange={e => set('expiry', e.target.value)} placeholder={t.expiryPlaceholder} /></Field>
      </div>
      <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onCancel}>{kz.cancel}</button>
        <button className="btn btn-primary" onClick={() => { if (validate()) onSave(form) }}>{isEdit ? kz.saveChanges : kz.supplies.addItem}</button>
      </div>
    </div>
  )
}

function ViewModal({ supply, onClose, onEdit }: { supply: Supply; onClose: () => void; onEdit: () => void }) {
  const s = stockStatus(supply.stock, supply.reorder); const color = stockColor(s)
  const pct = Math.min(100, Math.round((supply.stock / supply.reorder) * 100))
  const t   = kz.supplies
  return (
    <Modal title={t.itemDetails} onClose={onClose} maxWidth={420}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{supply.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{supply.category} · {supply.unit}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: 16 }}>
        {([['ID', supply.id], [kz.supplies.col.expiry, supply.expiry], [kz.supplies.col.unitCost, `₸${supply.cost.toFixed(2)}`], [kz.supplies.totalValue, `₸${(supply.stock * supply.cost).toFixed(2)}`]] as [string,string][]).map(([k,v]) => (
          <div key={k}><div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{k}</div><div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div></div>
        ))}
      </div>
      <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px', border: '1px solid var(--border)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t.stockLevel}</span><StockBadge stock={supply.stock} reorder={supply.reorder} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3 }}><div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} /></div>
          <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 30 }}>{supply.stock}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{t.reorderWhen} {supply.reorder} {supply.unit}</div>
      </div>
      <div className="modal-footer" style={{ padding: 0 }}>
        <button className="btn btn-ghost" onClick={onClose}>{kz.close}</button>
        <button className="btn btn-primary" onClick={onEdit}>{kz.edit}</button>
      </div>
    </Modal>
  )
}

function DeleteConfirm({ supply, onConfirm, onCancel }: { supply: Supply; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal title={kz.supplies.deleteItem} onClose={onCancel} maxWidth={400}>
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}><span style={{ color: 'var(--accent)' }}>{supply.name}</span> {kz.supplies.confirmDelete}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>{kz.supplies.deleteWarning}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={onCancel}>{kz.cancel}</button>
          <button className="btn btn-danger" onClick={onConfirm}>{kz.supplies.yesDelete}</button>
        </div>
      </div>
    </Modal>
  )
}

export default function Supplies() {
  const [supplies, setSupplies] = useState<Supply[]>(INITIAL_SUPPLIES_KZ)
  const [modal, setModal]       = useState<ModalState>(null)
  const [search, setSearch]     = useState('')
  const [filterCat, setFilterCat]       = useState(kz.all)
  const [filterStatus, setFilterStatus] = useState(kz.all)
  const [toast, setToast]       = useState<ToastState | null>(null)
  const t = kz.supplies

  const showToast = (msg: string, color = 'var(--green)') => { setToast({ msg, color }); setTimeout(() => setToast(null), 2800) }

  const filtered = supplies.filter(s => {
    const q = search.toLowerCase(); const st = stockStatus(s.stock, s.reorder)
    return (!q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) &&
      (filterCat === kz.all || s.category === filterCat) &&
      (filterStatus === kz.all || st === filterStatus)
  })

  const lowStock   = supplies.filter(s => s.stock < s.reorder)
  const outOfStock = supplies.filter(s => s.stock === 0)
  const totalValue = supplies.reduce((sum, s) => sum + s.stock * s.cost, 0)

  const handleAdd    = (form: SupplyFormData) => { const s: Supply = { ...form, id: genId(), stock: Number(form.stock), reorder: Number(form.reorder), cost: Number(form.cost) }; setSupplies(ps => [s, ...ps]); setModal(null); showToast(`${s.name} ${t.toast.added}`) }
  const handleEdit   = (form: SupplyFormData) => { if (modal?.type !== 'edit') return; setSupplies(ps => ps.map(s => s.id === modal.supply.id ? { ...s, ...form, stock: Number(form.stock), reorder: Number(form.reorder), cost: Number(form.cost) } : s)); setModal(null); showToast(`${form.name} ${t.toast.updated}`) }
  const handleDelete = () => { if (modal?.type !== 'delete') return; const name = modal.supply.name; setSupplies(ps => ps.filter(s => s.id !== modal.supply.id)); setModal(null); showToast(`${name} ${t.toast.removed}`, 'var(--red)') }

  const col = t.col

  return (
    <div className="page">
      {toast && <Toast message={toast.msg} color={toast.color} />}
      <div className="page-header">
        <div><div className="page-header__title">{t.title}</div><div className="page-header__sub">{t.subtitle}</div></div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>{t.addItem}</button>
      </div>
      <div className="stat-row">
        <StatCard label={t.totalItems}      value={supplies.length}                          sub={t.uniqueItems}   color="var(--accent)" />
        <StatCard label={t.lowStock}        value={lowStock.length}                          sub={t.belowReorder}  color="var(--amber)" />
        <StatCard label={t.outOfStock}      value={outOfStock.length}                        sub={t.urgentReorder} color="var(--red)" />
        <StatCard label={t.inventoryValue}  value={`₸${(totalValue / 1000).toFixed(1)}К`}   sub={t.currentValue}  color="var(--green)" />
      </div>
      {lowStock.length > 0 && (
        <div style={{ background: 'var(--red)11', border: '1px solid var(--red)44', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--red)', fontWeight: 500 }}>{t.lowStockAlert}</span>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{lowStock.map(s => s.name).join(', ')}</span>
        </div>
      )}
      <div className="filter-bar">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}><option>{kz.all}</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>{kz.all}</option>
          <option>{t.status.ok}</option>
          <option>{t.status.low}</option>
          <option>{t.status.critical}</option>
        </select>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr>{[col.id, col.name, col.category, col.stock, col.reorder, col.unitCost, col.expiry, col.status, col.actions].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={9} className="empty-state">{t.noItems}</td></tr>
                : filtered.map(s => {
                  const pct = Math.min(100, Math.round((s.stock / s.reorder) * 100))
                  const color = stockColor(stockStatus(s.stock, s.reorder))
                  return (
                    <tr key={s.id}>
                      <td className="text-accent text-mono" style={{ fontSize: 12 }}>{s.id}</td>
                      <td className="fw-500">{s.name}</td>
                      <td className="text-muted fs-12">{s.category}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
                          <span style={{ fontWeight: 600, color, minWidth: 28 }}>{s.stock}</span>
                          <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2 }}><div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} /></div>
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
          <span>{filtered.length} {t.of} {supplies.length} {t.items}</span>
          {(search || filterCat !== kz.all || filterStatus !== kz.all) && <button onClick={() => { setSearch(''); setFilterCat(kz.all); setFilterStatus(kz.all) }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>{kz.clearFilters}</button>}
        </div>
      </div>
      {modal?.type === 'add'    && <Modal title={t.addNewItem}  onClose={() => setModal(null)}><SupplyForm initial={{ ...EMPTY }} onSave={handleAdd} onCancel={() => setModal(null)} isEdit={false} /></Modal>}
      {modal?.type === 'edit'   && <Modal title={t.editItem}    onClose={() => setModal(null)}><SupplyForm initial={{ ...modal.supply, stock: String(modal.supply.stock), reorder: String(modal.supply.reorder), cost: String(modal.supply.cost) }} onSave={handleEdit} onCancel={() => setModal(null)} isEdit={true} /></Modal>}
      {modal?.type === 'delete' && <DeleteConfirm supply={modal.supply} onConfirm={handleDelete} onCancel={() => setModal(null)} />}
      {modal?.type === 'view'   && <ViewModal supply={modal.supply} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'edit', supply: modal.supply })} />}
    </div>
  )
}
