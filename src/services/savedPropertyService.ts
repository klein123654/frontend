import { apiRequest } from './api'
import { mapListing, type BackendProperty } from './propertyService'
import type { OwnerProperty } from '@/data/owner/ownerProperties'

export async function fetchSavedProperties(): Promise<OwnerProperty[]> {
  const response = await apiRequest<{ data: BackendProperty[] }>('my/saved-properties')
  return response.data.map(mapListing)
}

export async function saveProperty(id: number): Promise<void> {
  await apiRequest(`my/saved-properties/${id}`, { method: 'POST' })
}

export async function removeSavedProperty(id: number): Promise<void> {
  await apiRequest(`my/saved-properties/${id}`, { method: 'DELETE' })
}
