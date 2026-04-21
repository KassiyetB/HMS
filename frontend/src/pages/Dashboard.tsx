import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { StatCard } from '../components/ui'
import { REVENUE_DATA, DEPT_REVENUE, ADMIT_DATA, INITIAL_PATIENTS, INITIAL_STAFF, INITIAL_SUPPLIES } from '../data/mockData'

const PIE_COLORS = ['#58a6ff', '#3fb950', '#bc8cff', '#d29922', '#39d353']
const TIP_STYLE  = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }

export default function Dashboard() {
  const critical   = INITIAL_PATIENTS.filter(p => p.status === 'Critical').length
  const onDuty     = INITIAL_STAFF.filter(s => s.status === 'On Duty').length
  const lowStock   = INITIAL_SUPPLIES.filter(s => s.stock < s.reorder).length
  const last       = REVENUE_DATA.at(-1)!
  const net        = ((last.revenue - last.expenses) / 1000).toFixed(0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-header__title">Overview</div>
          <div className="page-header__sub">Welcome back — here's what's happening today</div>
        </div>
      </div>

      <div className="stat-row">
        <StatCard label="Total Patients"  value={INITIAL_PATIENTS.length} sub="Currently admitted"        color="var(--accent)" />
        <StatCard label="Critical"        value={critical}                sub="Needs attention"           color="var(--red)" />
        <StatCard label="Staff On Duty"   value={onDuty}                  sub={`of ${INITIAL_STAFF.length} total`} color="var(--green)" />
        <StatCard label="Low Stock Items" value={lowStock}                sub="Below reorder point"       color="var(--amber)" />
        <StatCard label="Apr Revenue"     value={`$${(last.revenue / 1000).toFixed(0)}K`} sub={`$${net}K net`} color="var(--purple)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">Revenue vs Expenses (7 months)</div>
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
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={TIP_STYLE} formatter={(v: number | string) => [`$${(Number(v) / 1000).toFixed(0)}K`]} />
                <Area type="monotone" dataKey="revenue"  stroke="#58a6ff" strokeWidth={2} fill="url(#rv)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#f85149" strokeWidth={2} fill="url(#ex)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">Revenue by Department</div>
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
        <div className="card-header">Weekly Admissions</div>
        <div style={{ padding: '1rem', height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ADMIT_DATA} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day"    tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TIP_STYLE} />
              <Bar dataKey="admits" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Admissions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
