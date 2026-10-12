export type UserRole = 'buyer' | 'owner' | 'broker' | 'developer' | 'admin'

export interface AuthUser {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
  account_status: string
  created_at?: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}
