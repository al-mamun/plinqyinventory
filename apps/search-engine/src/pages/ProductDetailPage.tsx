import { RoutingControl } from '@/components/RoutingControl'
import { demoProducts, demoStores } from '@/data/demoData'
import { useGeolocation } from '@/hooks/useGeolocation'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ArrowLeft, MapPin, Navigation, Package, Phone } from 'lucide-react'
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

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const product = demoProducts.find((p) => p.id === Number(id))
  const store = product ? demoStores.find((s) => s.id === product.storeId) : null
  const { location } = useGeolocation()

  const getDistance = () => {
    if (!location || !store) return null
    return calculateDistance(location.lat, location.lng, store.latitude, store.longitude).toFixed(2)
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Product not found</p>
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
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Product Image Placeholder */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 h-96 flex items-center justify-center">
              <Package className="w-32 h-32 text-gray-300" />
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="mb-6">
                <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Stock:</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    product.stock > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {store && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200/50">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Available at
                  </h3>
                  <Link
                    to={`/store/${store.id}`}
                    className="block hover:bg-white/50 rounded-lg p-3 transition-colors"
                  >
                    <p className="font-semibold text-blue-600 text-lg mb-2">{store.name}</p>
                    <p className="text-gray-600 text-sm mb-2">{store.address}</p>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Phone className="w-4 h-4 text-green-500" />
                      {store.phone}
                    </div>
                    {location && (
                      <div className="mt-3 flex items-center gap-2 text-blue-600 font-semibold">
                        <Navigation className="w-4 h-4" />
                        {getDistance()} km away
                      </div>
                    )}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Map Section */}
          {store && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
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
          )}
        </div>
      </main>
    </div>
  )
}

export default ProductDetailPage
