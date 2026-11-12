import { trackPendingRequest } from './serverStatus'

const DEV_API_BASE_URL = 'http://127.0.0.1:8000/api'
const PROD_API_BASE_URL = 'https://backend1-3fwi.onrender.com/api'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? PROD_API_BASE_URL : DEV_API_BASE_URL)
).replace(/\/+$/, '')

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

interface ApiErrorBody {
  message?: string
  type?: string
  errors?: Record<string, string[]>
  details?: string
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly type?: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const normalizedPath = path.replace(/^\/+/, '')
  const token = localStorage.getItem('butuanspaces_auth_token')
  const headers = new Headers(options.headers)
  const hasBody = options.body !== undefined && options.body !== null
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  headers.set('Accept', 'application/json')

  if (isFormData) {
    headers.delete('Content-Type')
  } else if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response

  const settleRequest = trackPendingRequest()

  try {
    response = await fetch(`${API_BASE_URL}/${normalizedPath}`, {
      ...options,
      headers,
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw cause
    }

    throw new Error('Unable to reach the server. Check your connection and try again.')
  } finally {
    settleRequest()
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const body = payload as ApiErrorBody | null

    if (response.status === 422) {
      console.log('[API] Request rejected with 422', {
        path: normalizedPath,
        message: body?.message,
        errors: body?.errors,
      })
    }

    const firstValidationError = body?.errors
      ? Object.values(body.errors).flat()[0]
      : undefined

    const normalizedMessage = (body?.message ?? '').trim()
    const normalizedType = body?.type ?? 'server_error'

    if (normalizedType === 'authentication_error') {
      throw new Error('Please sign in again to continue.')
    }

    if (normalizedType === 'validation_error') {
      throw new Error(firstValidationError || normalizedMessage || 'Please review the form and fix the highlighted fields.')
    }

    if (normalizedType === 'storage_error') {
      throw new Error('Image upload failed. Please check the storage bucket, credentials, and permissions.')
    }

    if (response.status === 429) {
      throw new ApiRequestError('Too many requests. Please wait a moment and try again.', response.status, normalizedType)
    }

    if (response.status >= 500) {
      throw new ApiRequestError('The server is temporarily unavailable. Please try again shortly.', response.status, normalizedType)
    }

    throw new ApiRequestError(
      firstValidationError || normalizedMessage || body?.details || `Request failed with status ${response.status}.`,
      response.status,
      normalizedType,
      body?.errors,
    )
  }

  return payload as T
}
