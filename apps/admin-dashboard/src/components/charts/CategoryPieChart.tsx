import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const data = [
  { name: 'Electronics', value: 450, color: '#3b82f6' },
  { name: 'Fashion', value: 380, color: '#8b5cf6' },
  { name: 'Books', value: 290, color: '#10b981' },
  { name: 'Home & Garden', value: 320, color: '#f59e0b' },
  { name: 'Sports', value: 210, color: '#ef4444' },
]

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function CategoryPieChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#fff'
          }}
        />
        <Legend
          wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
          formatter={(value, entry: any) => (
            <span style={{ color: '#94a3b8' }}>
              {value}: {entry.payload.value} products
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
