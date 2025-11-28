import api from './api'

export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  storeId: number
  createdAt: string
  updatedAt: string
  store?: {
    id: number
    name: string
    address: string
  }
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const { data} = await api.get('/products')
    return data
  },

  async getProductById(id: number): Promise<Product> {
    const { data } = await api.get(`/products/${id}`)
    return data
  },
}
