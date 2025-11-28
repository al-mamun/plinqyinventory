import { searchDemo } from '@/data/demoData'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Loader2, MapPin, Package, Search, ShoppingBag, Sparkles, Store } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products')
  const { location, loading: locationLoading } = useGeolocation()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsLoading(true)
      setHasSearched(true)
      // Simulate API delay
      setTimeout(() => {
        const searchResults = searchDemo(searchQuery.trim())
        setResults(searchResults)
        setIsLoading(false)
      }, 500)
    }
  }

  const productResults = results.filter(r => r.type === 'product')
  const storeResults = results.filter(r => r.type === 'store')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Plinqy
                </h1>
                <p className="text-xs text-gray-500">AI-Powered Local Search</p>
              </div>
            </div>

            {/* Location Status */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              {locationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">Locating...</span>
                </>
              ) : location ? (
                <>
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700 font-medium">Location Active</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Enable Location</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto pt-20 pb-16 text-center">
          {/* Main Heading */}
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-6 border border-blue-200/50">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">AI-Powered Search Engine</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Find Everything You Need,
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Right Around You
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover local products and stores with intelligent AI-powered search that understands your needs
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-12">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
                <div className="flex items-center">
                  <div className="pl-6 pr-4">
                    <Search className="w-6 h-6 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, stores, or categories..."
                    className="flex-1 py-5 pr-4 text-lg bg-transparent outline-none placeholder-gray-400 text-gray-900"
                  />
                  <button
                    type="submit"
                    className="m-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Searching...</p>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && hasSearched && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 px-6 py-4 font-semibold transition-all ${
                      activeTab === 'products'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Package className="w-5 h-5" />
                      <span>Products ({productResults.length})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('stores')}
                    className={`flex-1 px-6 py-4 font-semibold transition-all ${
                      activeTab === 'stores'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Store className="w-5 h-5" />
                      <span>Stores ({storeResults.length})</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                {activeTab === 'products' ? (
                  productResults.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Store</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {productResults.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <Link 
                                to={`/product/${product.id}`}
                                className="font-semibold text-blue-600 hover:text-blue-800"
                              >
                                {product.name}
                              </Link>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-600 text-sm">{product.description}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-blue-600">${product.price?.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <MapPin className="w-4 h-4 text-green-500" />
                                {product.storeName}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                to={`/product/${product.id}`}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors inline-block"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-16">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No products found</p>
                    </div>
                  )
                ) : (
                  storeResults.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Store Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Address</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {storeResults.map((store) => (
                          <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <Link
                                to={`/store/${store.id}`}
                                className="font-semibold text-blue-600 hover:text-blue-800"
                              >
                                {store.name}
                              </Link>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-600 text-sm">{store.description}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-600 text-sm">{store.address || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-600 text-sm">{store.phone || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                to={`/store/${store.id}`}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors inline-block"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-16">
                      <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No stores found</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features Section - Only show when no search has been performed */}
        {!hasSearched && (
          <div className="max-w-6xl mx-auto pb-20">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Search className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Search</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced AI algorithms understand natural language queries to find exactly what you're looking for
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Location-Based</h3>
                <p className="text-gray-600 leading-relaxed">
                  Discover stores and products near you with precise geolocation technology
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Store className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Data</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get up-to-date product availability, pricing, and store information instantly
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default HomePage
