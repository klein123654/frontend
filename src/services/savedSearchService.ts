import { apiRequest } from './api'

export interface SavedSearchFilters {
  search?: string
  property_type?: string
  listing_type?: string
  barangay?: string
  min_price?: number
  max_price?: number
}

export interface SavedSearch {
  id: number
  name: string
  filters: SavedSearchFilters
  last_alerted_at: string | null
  created_at: string
}

export async function fetchSavedSearches(): Promise<SavedSearch[]> {
  return (await apiRequest<{ data: SavedSearch[] }>('my/saved-searches')).data
}

export async function createSavedSearch(name: string, filters: SavedSearchFilters): Promise<SavedSearch> {
  return (await apiRequest<{ data: SavedSearch }>('my/saved-searches', {
    method: 'POST',
    body: JSON.stringify({ name, filters }),
  })).data
}

export async function deleteSavedSearch(id: number): Promise<void> {
  await apiRequest(`my/saved-searches/${id}`, { method: 'DELETE' })
}
