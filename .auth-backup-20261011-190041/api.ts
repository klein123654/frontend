const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '')

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const normalizedPath = path.replace(/^\/+/, '')

  const response = await fetch(`${API_BASE_URL}/${normalizedPath}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
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
    const body = payload as { message?: string } | null
    throw new Error(
      body?.message || `API request failed with status ${response.status}.`,
    )
  }

  return payload as T
}
