import { computed, ref } from 'vue'
import {
  clearSession,
  fetchCurrentUser,
  getStoredUser,
  getToken,
  loginUser,
  logoutUser,
  registerUser,
} from '@/services/authService'
import type { AuthUser } from '@/types/user'

const user = ref<AuthUser | null>(getStoredUser())
const loading = ref(false)

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(getToken() && user.value))

  async function login(email: string, password: string) {
    loading.value = true
    try {
      user.value = await loginUser(email, password)
      return user.value
    } finally {
      loading.value = false
    }
  }

  async function register(input: {
    name: string
    email: string
    phone: string
    password: string
    password_confirmation: string
    role?: 'buyer' | 'owner' | 'broker'
    license_number?: string
    agency_name?: string
  }) {
    loading.value = true
    try {
      user.value = await registerUser(input)
      return user.value
    } finally {
      loading.value = false
    }
  }

  async function refreshUser() {
    if (!getToken()) {
      user.value = null
      return null
    }

    try {
      user.value = await fetchCurrentUser()
      return user.value
    } catch (error) {
      clearSession()
      user.value = null
      throw error
    }
  }

  async function logout() {
    try {
      await logoutUser()
    } finally {
      user.value = null
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    refreshUser,
    logout,
  }
}
