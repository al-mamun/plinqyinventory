import { useState, useEffect } from 'react'
import { authService, User } from '@/services/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userData = await authService.getProfile()
      setUser(userData)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const userData = await authService.login({ email, password })
    setUser(userData)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  return { user, loading, login, logout }
}
