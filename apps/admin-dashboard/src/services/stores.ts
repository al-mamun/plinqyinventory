import api from './api'

export interface Store {
  id: number
  name: string
  description: string
  address: string
  phone: string
  latitude: number
  longitude: number
  rating: number
  createdAt: string
  updatedAt: string
}

export const storeService = {
  getAll: async () => {
    const response = await api.get('/stores')
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/stores/${id}`)
    return response.data
  },

  create: async (data: Partial<Store>) => {
    const response = await api.post('/stores', data)
    return response.data
  },

  update: async (id: number, data: Partial<Store>) => {
    const response = await api.put(`/stores/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    await api.delete(`/stores/${id}`)
  },
}
