import { ref, watch, type WatchSource } from 'vue'
import { BARANGAY_CENTERS, barangayZoom } from '@/data/butuanBarangayCenters'
import { canonicalButuanBarangay } from '@/data/butuanLocation'
import type { MapFocus } from '@/components/property/LocationMap.vue'

/**
 * Map view for the barangay typed in a listing form. It updates only when the
 * value becomes a known barangay, so partial typing does not move the map.
 */
export function useBarangayMapFocus(barangay: WatchSource<string>) {
  const focus = ref<MapFocus | null>(null)

  watch(barangay, (value) => {
    const name = canonicalButuanBarangay(value ?? '')
    const center = name ? BARANGAY_CENTERS[name] : undefined
    if (!name || !center || focus.value?.name === name) return
    focus.value = { name, center, zoom: barangayZoom(name) }
  })

  return focus
}
