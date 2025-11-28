import api from './api'

export interface Store {
  id: number
  name: string
  address: string
  lat: number
  lng: number
  createdAt: string
  updatedAt: string
}

export interface NearbyStoresParams {
  lat: number
  lng: number
  radius?: number
}

export const storeService = {
  async getNearbyStores(params: NearbyStoresParams): Promise<Store[]> {
    const { data } = await api.get('/stores/nearby', { params })
    return data
  },

  async getStoreById(id: number): Promise<Store> {
    const { data } = await api.get(`/stores/${id}`)
    return data
  },

  async getAllStores(): Promise<Store[]> {
    const { data } = await api.get('/stores')
    return data
  },
}
