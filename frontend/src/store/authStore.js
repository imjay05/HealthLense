import { create } from 'zustand'
import api from '../api/axios'
import { disconnectSocket } from '../hooks/useSocket'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token, loading: false })
  },

  logout: () => {
    localStorage.removeItem('token')
    disconnectSocket()          // clean up WebSocket on logout
    set({ user: null, token: null, loading: false })
  },

  fetchMe: async () => {
    const token = get().token
    if (!token) return set({ loading: false })
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data, loading: false })
    } catch {
      localStorage.removeItem('token')
      disconnectSocket()
      set({ user: null, token: null, loading: false })
    }
  },
}))

export default useAuthStore