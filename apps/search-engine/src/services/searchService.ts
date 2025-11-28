import api from './api'

export interface SearchResult {
  id: number
  name: string
  description: string
  price: number
  storeName: string
  storeId: number
  type: 'product' | 'store'
}

export interface SearchParams {
  query: string
  type?: 'products' | 'stores' | 'all'
  lat?: number
  lng?: number
  radius?: number
}

export const searchService = {
  async search(params: SearchParams): Promise<SearchResult[]> {
    const { data } = await api.get('/search', { params })
    return data
  },
}
