import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { BUTUAN_BARANGAYS } from '../butuanLocation'
import { BARANGAY_CENTERS, barangayZoom } from '../butuanBarangayCenters'
import { useBarangayMapFocus } from '@/composables/useBarangayMapFocus'

describe('barangay map centres', () => {
  it('has a centre inside Butuan City for every barangay', () => {
    const missing = BUTUAN_BARANGAYS.filter((name) => !BARANGAY_CENTERS[name])
    const outside = BUTUAN_BARANGAYS.filter((name) => {
      const center = BARANGAY_CENTERS[name]
      if (!center) return false
      const [lat, lng] = center
      return lat < 8.7 || lat > 9.1 || lng < 125.4 || lng > 125.75
    })
    expect(missing).toEqual([])
    expect(outside).toEqual([])
    expect(Object.keys(BARANGAY_CENTERS)).toHaveLength(BUTUAN_BARANGAYS.length)
  })

  it('zooms closer for poblacion barangays', () => {
    expect(barangayZoom('Golden Ribbon Pob.')).toBe(17)
    expect(barangayZoom('Bancasi')).toBe(16)
  })

  it('updates the focus only when a known barangay is chosen', async () => {
    const typed = ref('')
    const focus = useBarangayMapFocus(typed)

    typed.value = 'Banc'
    await nextTick()
    expect(focus.value).toBeNull()

    typed.value = 'bancasi'
    await nextTick()
    expect(focus.value).toEqual({ name: 'Bancasi', center: BARANGAY_CENTERS.Bancasi, zoom: 16 })
  })
})
