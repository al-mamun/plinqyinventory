import api from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: number
  email: string
  name: string
  role: string
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  logout: async () => {
    await api.post('/auth/logout')
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },
}
