import { apiRequest } from './api'
import { clearSession } from './authService'
import type { AuthUser } from '@/types/user'

const USER_KEY = 'butuanspaces_auth_user'

function remember(user: AuthUser): AuthUser {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export async function updateProfile(input: { name: string; phone: string | null }): Promise<AuthUser> {
  const response = await apiRequest<{ user: AuthUser }>('user', { method: 'PATCH', body: JSON.stringify(input) })
  return remember(response.user)
}

export async function changePassword(input: { current_password: string; password: string; password_confirmation: string }): Promise<string> {
  const response = await apiRequest<{ message: string }>('user/password', { method: 'PUT', body: JSON.stringify(input) })
  return response.message
}

export async function requestEmailChange(input: { email: string; password: string }): Promise<string> {
  const response = await apiRequest<{ message: string }>('user/email', { method: 'POST', body: JSON.stringify(input) })
  return response.message
}

export async function resendVerificationEmail(): Promise<string> {
  const response = await apiRequest<{ message: string }>('email/verification-notification', { method: 'POST' })
  return response.message
}

export async function deleteAccount(password: string): Promise<void> {
  await apiRequest('user', { method: 'DELETE', body: JSON.stringify({ password }) })
  clearSession()
}
