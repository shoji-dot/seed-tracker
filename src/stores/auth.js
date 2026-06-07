import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/client.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('st_token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('st_user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin    = computed(() => user.value?.role === 'admin')

  async function login(username, password) {
    const data = await api.post('/auth/login', { username, password })
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('st_token', data.token)
    localStorage.setItem('st_user',  JSON.stringify(data.user))
  }

  async function register(username, password, displayName, adminSecret) {
    await api.post('/auth/register', { username, password, displayName, adminSecret })
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('st_token')
    localStorage.removeItem('st_user')
  }

  return { token, user, isLoggedIn, isAdmin, login, register, logout }
})
