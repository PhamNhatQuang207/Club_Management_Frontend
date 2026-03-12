import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import { LoginResponse } from '../types'
import { useNavigate } from 'react-router-dom'

export const useLogin = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const { data } = await api.post<LoginResponse>('/auth/login', credentials)
      return data
    },
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token)
      navigate('/admin') // Redirect to admin panel on success
    },
  })
}

export const useAuth = () => {
  const token = localStorage.getItem('access_token')
  const logout = () => {
    localStorage.removeItem('access_token')
    window.location.href = '/login'
  }
  return { isAuthenticated: !!token, logout }
}
