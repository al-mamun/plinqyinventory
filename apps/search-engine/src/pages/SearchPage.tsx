import { searchDemo } from '@/data/demoData'
import {
    ArrowLeft,
    ChevronDown,
    Filter,
    Heart,
    Loader2,
    MapPin,
    Search,
    ShoppingCart,
    Star
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

interface LocationState {
  query: string
  location: { lat: number; lng: number } | null
}

function SearchPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState

  const [searchInput, setSearchInput] = useState(state?.query || '')
  const [query, setQuery] = useState(state?.query || '')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])

  useEffect(() => {
    if (!state?.query) {
      // Optional: Don't redirect if user just wants to browse
      // navigate('/') 
    }
    performSearch(state?.query || '')
  }, [state, navigate])

  const performSearch = (searchQuery: string) => {
    setIsLoading(true)
    // Simulate API delay
    setTimeout(() => {
      const searchResults = searchDemo(searchQuery)
      setResults(searchResults)
      setIsLoading(false)
    }, 500)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setQuery(searchInput.trim())
      performSearch(searchInput.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-500 hover:text-primary-600 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            
            <div className="flex-1 max-w-2xl">
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for products, brands, or stores..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent focus:bg-white border-2 focus:border-primary-500 rounded-xl outline-none transition-all duration-200 shadow-sm group-hover:shadow-md"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              </form>
            </div>

            <div className="hidden md:flex items-center gap-4">
               <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                 <Heart className="w-6 h-6" />
               </button>
               <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                 <ShoppingCart className="w-6 h-6" />
               </button>
               <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                 JD
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2">
                  {['All', 'Electronics', 'Clothing', 'Home & Garden', 'Sports'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="category" 
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-gray-600 group-hover:text-gray-900 transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  />
                  <span className="text-gray-400">-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Rating</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2].map((stars) => (
                    <label key={stars} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < stars ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">& Up</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {query ? `Results for "${query}"` : 'All Products'}
                </h1>
                {!isLoading && (
                  <p className="text-gray-500 text-sm mt-1">
                    Showing {results.length} results
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <button className="flex items-center gap-1 text-sm font-medium text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  Relevance <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
                <p className="text-gray-500 font-medium">Searching best matches...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    to={result.type === 'product' ? `/product/${result.id}` : `/store/${result.id}`}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Image Placeholder */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-500">
                        {result.type === 'product' ? (
                          <ShoppingCart className="w-12 h-12 opacity-50" />
                        ) : (
                          <MapPin className="w-12 h-12 opacity-50" />
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full backdrop-blur-md ${
                          result.type === 'product'
                            ? 'bg-blue-500/10 text-blue-700 border border-blue-200/50'
                            : 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/50'
                        }`}>
                          {result.type === 'product' ? 'Product' : 'Store'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {result.name}
                      </h3>
                      
                      {result.description && (
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                          {result.description}
                        </p>
                      )}

                      <div className="flex items-end justify-between mt-auto">
                        <div>
                          {result.type === 'product' && result.price && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400">Price</span>
                              <span className="text-xl font-bold text-gray-900">
                                ${result.price.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {result.storeName && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="line-clamp-1">{result.storeName}</span>
                            </div>
                          )}
                        </div>
                        
                        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors">
                          View
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No results found</h3>
                <p className="text-gray-500">We couldn't find anything matching "{query}"</p>
                <button 
                  onClick={() => {
                    setSearchInput('')
                    setQuery('')
                    performSearch('')
                  }}
                  className="mt-6 px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default SearchPage
