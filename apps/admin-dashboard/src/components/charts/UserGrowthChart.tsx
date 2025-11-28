import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', users: 1200, newUsers: 420 },
  { month: 'Feb', users: 1680, newUsers: 480 },
  { month: 'Mar', users: 2340, newUsers: 660 },
  { month: 'Apr', users: 2920, newUsers: 580 },
  { month: 'May', users: 3680, newUsers: 760 },
  { month: 'Jun', users: 4580, newUsers: 900 },
]

export default function UserGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="month"
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#fff'
          }}
        />
        <Area
          type="monotone"
          dataKey="users"
          stroke="#3b82f6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorUsers)"
          name="Total Users"
        />
        <Area
          type="monotone"
          dataKey="newUsers"
          stroke="#10b981"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorNewUsers)"
          name="New Users"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
