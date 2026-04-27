import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { StatCard } from '../components/ui'
import { REVENUE_DATA, DEPT_REVENUE, ADMIT_DATA } from '../data/mockData'
import { kz } from '../i18n/kz'
import { useApi } from '../hooks/useApi'
import { patientApi, staffApi } from '../services/api'

const PIE_COLORS = ['#58a6ff', '#3fb950', '#bc8cff', '#d29922', '#39d353']
const TIP_STYLE  = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }

export default function Dashboard() {
  const pStats = useApi(() => patientApi.getStats(), [])
  const sStats = useApi(() => staffApi.getStats(),   [])

  const last    = REVENUE_DATA.at(-1)!
  const net     = ((last.revenue - last.expenses) / 1000).toFixed(0)
  const lowStock = 2 // placeholder until supplies API is added

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-header__title">{kz.dashboard.title}</div>
          <div className="page-header__sub">{kz.dashboard.subtitle}</div>
        </div>
      </div>

      <div className="stat-row">
        <StatCard label={kz.dashboard.totalPatients} value={pStats.data?.data.total      ?? '—'} sub={kz.dashboard.admitted}       color="var(--accent)" />
        <StatCard label={kz.dashboard.critical}      value={pStats.data?.data.critical    ?? '—'} sub={kz.dashboard.needsAttention}  color="var(--red)" />
        <StatCard label={kz.dashboard.staffOnDuty}   value={sStats.data?.data.on_duty     ?? '—'} sub={`${sStats.data?.data.total ?? '—'} ${kz.dashboard.ofTotal}`} color="var(--green)" />
        <StatCard label={kz.dashboard.lowStock}      value={lowStock}                             sub={kz.dashboard.belowReorder}    color="var(--amber)" />
        <StatCard label={kz.dashboard.aprRevenue}    value={`₸${(last.revenue / 1000).toFixed(0)}К`} sub={`₸${net}К ${kz.dashboard.net}`} color="var(--purple)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">{kz.dashboard.revenueChart}</div>
          <div style={{ padding: '1rem', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#58a6ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#58a6ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ex" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f85149" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f85149" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number | string) => `₸${(Number(v) / 1000).toFixed(0)}К`} />
                <Tooltip contentStyle={TIP_STYLE} formatter={(v: number | string) => [`₸${(Number(v) / 1000).toFixed(0)}К`]} />
                <Area type="monotone" dataKey="revenue"  stroke="#58a6ff" strokeWidth={2} fill="url(#rv)" name={kz.dashboard.revenue} />
                <Area type="monotone" dataKey="expenses" stroke="#f85149" strokeWidth={2} fill="url(#ex)" name={kz.dashboard.expenses} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">{kz.dashboard.revenueByDept}</div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', height: 220 }}>
            <PieChart width={150} height={130}>
              <Pie data={DEPT_REVENUE} cx={75} cy={65} innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                {DEPT_REVENUE.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', marginTop: 8 }}>
              {DEPT_REVENUE.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i], flexShrink: 0 }} />
                  <span style={{ color: 'var(--muted)', flex: 1 }}>{d.name}</span>
                  <span style={{ fontWeight: 500 }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="card-header">{kz.dashboard.weeklyAdmissions}</div>
        <div style={{ padding: '1rem', height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ADMIT_DATA} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day"   tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TIP_STYLE} />
              <Bar dataKey="admits" fill="var(--accent)" radius={[4, 4, 0, 0]} name={kz.dashboard.admissions} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
