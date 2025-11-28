import api from './api'

export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  storeId: number
  storeName?: string
  createdAt: string
  updatedAt: string
}

export const productService = {
  getAll: async () => {
    const response = await api.get('/products')
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  create: async (data: Partial<Product>) => {
    const response = await api.post('/products', data)
    return response.data
  },

  update: async (id: number, data: Partial<Product>) => {
    const response = await api.put(`/products/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    await api.delete(`/products/${id}`)
  },
}
