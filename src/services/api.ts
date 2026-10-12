const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '')

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const normalizedPath = path.replace(/^\/+/, '')
  const token = localStorage.getItem('butuanspaces_auth_token')

  const response = await fetch(`${API_BASE_URL}/${normalizedPath}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const body = payload as {
      message?: string
      errors?: Record<string, string[]>
    } | null

    const firstValidationError = body?.errors
      ? Object.values(body.errors).flat()[0]
      : undefined

    throw new Error(
      firstValidationError ||
      body?.message ||
      `API request failed with status ${response.status}.`,
    )
  }

  return payload as T
}
