import { Store, Package, Users, DollarSign, TrendingUp, MapPin } from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import { demoStats, demoStores, demoProducts } from '@/data/demoData'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back! Here's an overview of your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Stores"
          value={demoStats.totalStores}
          icon={Store}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Total Products"
          value={demoStats.totalProducts}
          icon={Package}
          trend={{ value: 8.3, isPositive: true }}
        />
        <StatsCard
          title="Total Users"
          value={demoStats.totalUsers}
          icon={Users}
          trend={{ value: 5.7, isPositive: true }}
        />
        <StatsCard
          title="Revenue"
          value={`$${demoStats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={{ value: 15.2, isPositive: true }}
        />
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Today's Activity</h3>
              <p className="text-sm text-slate-400">Real-time platform statistics</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Visits</span>
              <span className="text-white font-semibold">{demoStats.todayVisits.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active Users</span>
              <span className="text-white font-semibold">{demoStats.activeUsers}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
              <p className="text-sm text-slate-400">Platform overview</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Avg Store Rating</span>
              <span className="text-white font-semibold">
                {(demoStores.reduce((acc, s) => acc + s.rating, 0) / demoStores.length).toFixed(1)} ⭐
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Avg Product Price</span>
              <span className="text-white font-semibold">
                ${(demoProducts.reduce((acc, p) => acc + p.price, 0) / demoProducts.length).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Stores */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Stores</h3>
        <div className="space-y-3">
          {demoStores.slice(0, 3).map((store) => (
            <div
              key={store.id}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all"
            >
              <div>
                <h4 className="font-semibold text-white">{store.name}</h4>
                <p className="text-sm text-slate-400">{store.address}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{store.rating} ⭐</p>
                <p className="text-xs text-slate-400">{store.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
