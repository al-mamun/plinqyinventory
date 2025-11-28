import { useState } from 'react'
import { Plus, Search, MapPin, Phone, Star, Filter } from 'lucide-react'
import { demoStores } from '@/data/demoData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function StoresPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRating, setFilterRating] = useState<number | null>(null)

  const filteredStores = demoStores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRating = filterRating === null || store.rating >= filterRating

    return matchesSearch && matchesRating
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Stores</h1>
          <p className="text-slate-400">Manage all stores on the platform</p>
        </div>
        <Button>
          <Plus className="w-5 h-5 mr-2" />
          Add Store
        </Button>
      </div>

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
                placeholder="Search stores by name or address..."
                className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filterRating ?? ''}
                onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
                className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              >
                <option value="">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm mb-1">Total Stores</p>
            <p className="text-3xl font-bold text-white">{demoStores.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm mb-1">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-white">
                {(demoStores.reduce((acc, s) => acc + s.rating, 0) / demoStores.length).toFixed(1)}
              </p>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm mb-1">Search Results</p>
            <p className="text-3xl font-bold text-white">{filteredStores.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Stores List */}
      <div className="space-y-4">
        {filteredStores.map((store) => (
          <Card key={store.id} className="hover:border-blue-500/50 transition-all group">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {store.name}
                  </h3>
                  <p className="text-slate-400 mb-3">{store.description}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 rounded-full">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-semibold">{store.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Address</p>
                    <p className="text-white">{store.address}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {store.latitude.toFixed(6)}, {store.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Phone</p>
                    <p className="text-white">{store.phone}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-700">
                <Button variant="default" size="sm">
                  Edit
                </Button>
                <Button variant="secondary" size="sm">
                  View Products
                </Button>
                <Button variant="destructive" size="sm" className="ml-auto">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredStores.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">No stores found matching your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
