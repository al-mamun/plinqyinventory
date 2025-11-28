import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const data = [
  { category: 'Electronics', products: 450, sales: 2400 },
  { category: 'Fashion', products: 380, sales: 1800 },
  { category: 'Books', products: 290, sales: 1200 },
  { category: 'Home & Garden', products: 320, sales: 1600 },
  { category: 'Sports', products: 210, sales: 900 },
]

export default function ProductsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="category"
          stroke="#94a3b8"
          style={{ fontSize: '11px' }}
          angle={-15}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
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
        />
        <Bar dataKey="products" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
