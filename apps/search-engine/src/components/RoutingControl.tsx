import L from 'leaflet'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface RoutingControlProps {
  start: [number, number]
  end: [number, number]
}

// Get OSRM service URL from environment variable
const getOSRMServiceUrl = () => {
  // In production, use environment variable
  // In development, use demo server
  return import.meta.env.VITE_OSRM_SERVICE_URL || 'https://router.project-osrm.org/route/v1'
}

export function RoutingControl({ start, end }: RoutingControlProps) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const serviceUrl = getOSRMServiceUrl()

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      router: L.Routing.osrmv1({
        serviceUrl: serviceUrl
      }),
      lineOptions: {
        styles: [
          { color: '#3b82f6', opacity: 0.8, weight: 6 }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      show: false, // Hide the instruction panel
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: () => null // Don't create default markers, we have our own
    }).addTo(map)

    return () => {
      if (map && routingControl) {
        try {
          map.removeControl(routingControl)
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    }
  }, [map, start, end])

  return null
}
