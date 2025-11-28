import { RoutingControl } from '@/components/RoutingControl'
import { demoProducts, demoStores } from '@/data/demoData'
import { useGeolocation } from '@/hooks/useGeolocation'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ArrowLeft, MapPin, Navigation, Package, Phone, Star } from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { Link, useParams } from 'react-router-dom'

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function StoreDetailPage() {
  const { id } = useParams<{ id: string }>()
  const store = demoStores.find((s) => s.id === Number(id))
  const storeProducts = demoProducts.filter((p) => p.storeId === Number(id))
  const { location } = useGeolocation()

  const getDistance = () => {
    if (!location || !store) return null
    return calculateDistance(location.lat, location.lng, store.latitude, store.longitude).toFixed(2)
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Store not found</p>
          <Link to="/" className="text-blue-600 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Search</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Store Info Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{store.name}</h1>
            <p className="text-gray-600 text-lg mb-6">{store.description}</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200/50">
              <div>
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="font-semibold text-gray-900 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <span>{store.address}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  {store.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Rating</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {store.rating} / 5.0
                </p>
              </div>
              {location && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Distance</p>
                  <p className="font-semibold text-blue-600 flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    {getDistance()} km away
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Store Location & Route</h2>
              {location && (
                <p className="text-gray-600 text-sm mt-1">Blue line shows the realistic road route from your location to the store</p>
              )}
            </div>
            <div className="h-96">
              <MapContainer
                center={[store.latitude, store.longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Realistic road route from user to store */}
                {location && (
                  <RoutingControl
                    start={[location.lat, location.lng]}
                    end={[store.latitude, store.longitude]}
                  />
                )}
                
                <Marker position={[store.latitude, store.longitude]}>
                  <Popup>
                    <strong>{store.name}</strong><br />
                    {store.address}
                  </Popup>
                </Marker>
                {location && (
                  <Marker position={[location.lat, location.lng]}>
                    <Popup>Your Location</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            <div className="bg-blue-50 p-4 border-t border-blue-200">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${location?.lat},${location?.lng}&destination=${store.latitude},${store.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
              >
                <Navigation className="w-5 h-5" />
                Get Turn-by-Turn Directions in Google Maps
              </a>
            </div>
          </div>

          {/* Products Section */}
          {storeProducts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  Available Products ({storeProducts.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {storeProducts.map((product) => (
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
                          <div className="font-bold text-blue-600">${product.price.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            product.stock > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock} units
                          </span>
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
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default StoreDetailPage
