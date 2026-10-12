import { apiRequest } from './api'
import type { AuthResponse, AuthUser } from '@/types/user'

const TOKEN_KEY = 'butuanspaces_auth_token'
const USER_KEY = 'butuanspaces_auth_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  const stored = localStorage.getItem(USER_KEY)

  if (!stored) return null

  try {
    return JSON.parse(stored) as AuthUser
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

function saveSession(response: AuthResponse): AuthUser {
  localStorage.setItem(TOKEN_KEY, response.token)
  localStorage.setItem(USER_KEY, JSON.stringify(response.user))
  return response.user
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>('login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  return saveSession(response)
}

export async function registerUser(input: {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  role?: 'buyer' | 'owner' | 'broker'
  license_number?: string
  agency_name?: string
}): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>('register', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return saveSession(response)
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<{ user: AuthUser }>('user')
  const user = response.user
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiRequest('forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
}

export async function resetPassword(input: { token: string; email: string; password: string; password_confirmation: string }): Promise<void> {
  await apiRequest('reset-password', { method: 'POST', body: JSON.stringify(input) })
}

export async function logoutUser(): Promise<void> {
  try {
    if (getToken()) {
      await apiRequest('logout', { method: 'POST' })
    }
  } finally {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
