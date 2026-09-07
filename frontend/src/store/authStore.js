import { create } from 'zustand'
import api from '../api/axios'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('access'),
  
  logout: () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')
    set({ user: null, isAuthenticated: false })
    window.location.href = '/login'
  },
  
  fetchProfile: async () => {
    try {
      const res = await api.get('/accounts/profile/')
      set({ user: res.data })
      localStorage.setItem('user', JSON.stringify(res.data))
    } catch {
      // ignore
    }
  }
}))

export default useAuthStore