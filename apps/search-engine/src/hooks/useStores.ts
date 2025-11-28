import { useQuery } from '@tanstack/react-query'
import { storeService, NearbyStoresParams } from '@/services/storeService'

export function useNearbyStores(params: NearbyStoresParams) {
  return useQuery({
    queryKey: ['stores', 'nearby', params],
    queryFn: () => storeService.getNearbyStores(params),
    enabled: !!params.lat && !!params.lng,
  })
}

export function useStore(id: number) {
  return useQuery({
    queryKey: ['stores', id],
    queryFn: () => storeService.getStoreById(id),
    enabled: !!id,
  })
}

export function useAllStores() {
  return useQuery({
    queryKey: ['stores', 'all'],
    queryFn: () => storeService.getAllStores(),
  })
}
