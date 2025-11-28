import { useState } from 'react'
import { Plus, Search, DollarSign, Package as PackageIcon, Filter, TrendingUp, AlertCircle } from 'lucide-react'
import { demoProducts } from '@/data/demoData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all')

  const filteredProducts = demoProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.storeName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'in-stock' && product.stock > 20) ||
      (stockFilter === 'low-stock' && product.stock > 0 && product.stock <= 20) ||
      (stockFilter === 'out-of-stock' && product.stock === 0)

    return matchesSearch && matchesStock
  })

  const lowStockCount = demoProducts.filter(p => p.stock > 0 && p.stock <= 20).length
  const outOfStockCount = demoProducts.filter(p => p.stock === 0).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-slate-400">Manage all products across stores</p>
        </div>
        <Button>
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {lowStockCount > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-semibold">{lowStockCount} Low Stock Items</p>
                    <p className="text-sm text-slate-400">Products need restocking</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {outOfStockCount > 0 && (
            <Card className="border-red-500/50 bg-red-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-white font-semibold">{outOfStockCount} Out of Stock</p>
                    <p className="text-sm text-slate-400">Products unavailable</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, description, or store..."
                className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              >
                <option value="all">All Products</option>
                <option value="in-stock">In Stock (20+)</option>
                <option value="low-stock">Low Stock (1-20)</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Products</p>
                <p className="text-3xl font-bold text-white">{demoProducts.length}</p>
              </div>
              <PackageIcon className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Stock</p>
                <p className="text-3xl font-bold text-white">
                  {demoProducts.reduce((acc, p) => acc + p.stock, 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Avg Price</p>
                <p className="text-3xl font-bold text-white">
                  ${(demoProducts.reduce((acc, p) => acc + p.price, 0) / demoProducts.length).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="hover:border-blue-500/50 transition-all group overflow-hidden"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-blue-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PackageIcon className="w-7 h-7 text-blue-400" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.stock > 20
                      ? 'bg-green-500/20 text-green-400'
                      : product.stock > 10
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : product.stock > 0
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{product.description}</p>

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-2xl font-bold text-white">{product.price.toFixed(2)}</span>
                </div>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                  {product.storeName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredProducts.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <PackageIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No products found matching your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
