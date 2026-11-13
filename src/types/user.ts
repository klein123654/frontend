export type UserRole = 'buyer' | 'owner' | 'broker' | 'developer' | 'admin'

export interface AuthUser {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
  account_status: string
  created_at?: string
  /** False until the person opens the confirmation link sent at sign-up. */
  email_verified?: boolean
  /** Public contact details shown on a publisher's listings and profile. */
  contact_phone?: string | null
  contact_email?: string | null
  messenger_username?: string | null
  viber_number?: string | null
}

export type PublicContactInput = Pick<AuthUser, 'contact_phone' | 'contact_email' | 'messenger_username' | 'viber_number'>

export interface AuthResponse {
  token: string
  user: AuthUser
}
