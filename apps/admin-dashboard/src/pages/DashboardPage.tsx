import { Store, Package, Users, DollarSign, TrendingUp, MapPin, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import RevenueChart from '@/components/charts/RevenueChart'
import ProductsChart from '@/components/charts/ProductsChart'
import CategoryPieChart from '@/components/charts/CategoryPieChart'
import UserGrowthChart from '@/components/charts/UserGrowthChart'
import StoreStatusChart from '@/components/charts/StoreStatusChart'
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Products by Category
            </CardTitle>
            <CardDescription>Product inventory and sales by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductsChart />
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics - Category Distribution & User Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-400" />
              Category Distribution
            </CardTitle>
            <CardDescription>Products breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              User Growth
            </CardTitle>
            <CardDescription>Total and new users over 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <UserGrowthChart />
          </CardContent>
        </Card>
      </div>

      {/* Store Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-green-400" />
              Store Status
            </CardTitle>
            <CardDescription>Stores by verification status</CardDescription>
          </CardHeader>
          <CardContent>
            <StoreStatusChart />
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Today's Activity
            </CardTitle>
            <CardDescription>Real-time platform statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Visits</span>
              <span className="text-white font-semibold">{demoStats.todayVisits.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active Users</span>
              <span className="text-white font-semibold">{demoStats.activeUsers}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              Quick Stats
            </CardTitle>
            <CardDescription>Platform overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Recent Stores */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Stores</CardTitle>
          <CardDescription>Latest stores added to the platform</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}
