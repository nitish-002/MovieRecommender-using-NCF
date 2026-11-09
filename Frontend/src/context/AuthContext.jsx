import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return null
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await api.get('/auth/me')
      setUser(response.data)
      return response.data
    } catch {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { access_token } = response.data
    localStorage.setItem('token', access_token)
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    await fetchProfile()
    return response.data
  }

  const register = async (email, password) => {
    const response = await api.post('/auth/register', { email, password })
    const { access_token } = response.data
    localStorage.setItem('token', access_token)
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    await fetchProfile()
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    refetch: fetchProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
