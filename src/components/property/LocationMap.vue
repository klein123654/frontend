<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const BUTUAN_CENTER: L.LatLngExpression = [8.9475, 125.5406]

/** Where the publisher wants to look, e.g. the centre of the chosen barangay. */
export interface MapFocus {
  name: string
  center: [number, number]
  zoom: number
}

/** A pin farther than this from the chosen barangay's centre is probably in the wrong place. */
const FAR_FROM_FOCUS_METRES = 2000

const props = withDefaults(defineProps<{
  latitude?: number | null
  longitude?: number | null
  selectable?: boolean
  focus?: MapFocus | null
}>(), {
  latitude: null,
  longitude: null,
  selectable: false,
  focus: null,
})

const emit = defineEmits<{
  select: [coordinates: { latitude: number; longitude: number }]
}>()

const mapElement = ref<HTMLDivElement | null>(null)
/** Barangay the pin seems to be far from, shown as a note until the pin is moved. */
const farFrom = ref('')
/** Current view, exposed on the element for tests and assistive checks. */
const view = ref({ lat: 0, lng: 0, zoom: 0 })
let map: L.Map | undefined
let marker: L.CircleMarker | undefined

function coordinates(latitude: number | null | undefined, longitude: number | null | undefined): L.LatLngTuple | null {
  if (latitude == null || longitude == null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return [latitude, longitude]
}

function showMarker(latitude: number, longitude: number, pan = false) {
  if (!map) return

  const point: L.LatLngExpression = [latitude, longitude]
  if (marker) {
    marker.setLatLng(point)
  } else {
    marker = L.circleMarker(point, {
      radius: 9,
      color: '#fff',
      weight: 3,
      fillColor: '#c2410c',
      fillOpacity: 1,
    }).addTo(map)
  }

  if (pan) map.setView(point, Math.max(map.getZoom(), 16), { animate: false })
}

onMounted(() => {
  if (!mapElement.value) return

  const initialPoint = coordinates(props.latitude, props.longitude)
  // Scroll-to-zoom only in the pin picker; public maps keep normal page scrolling.
  map = L.map(mapElement.value, { scrollWheelZoom: props.selectable }).setView(
    initialPoint ?? props.focus?.center ?? BUTUAN_CENTER,
    initialPoint ? 16 : props.focus?.zoom ?? 12,
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  }).addTo(map)

  if (initialPoint) showMarker(initialPoint[0], initialPoint[1])

  const recordView = () => {
    if (!map) return
    const center = map.getCenter()
    view.value = { lat: center.lat, lng: center.lng, zoom: map.getZoom() }
  }
  map.on('moveend zoomend', recordView)
  recordView()

  if (props.selectable) {
    map.on('click', (event: L.LeafletMouseEvent) => {
      showMarker(event.latlng.lat, event.latlng.lng)
      farFrom.value = ''
      emit('select', { latitude: event.latlng.lat, longitude: event.latlng.lng })
    })
  }
})

watch(() => [props.latitude, props.longitude] as const, ([latitude, longitude]) => {
  const point = coordinates(latitude, longitude)
  if (map && point) showMarker(point[0], point[1], true)
})

/**
 * Move to a newly chosen barangay. A pin already inside it (for example when
 * editing a listing) keeps the current view; a pin far away gets a note.
 */
watch(() => props.focus, (focus) => {
  if (!map || !focus) return
  if (marker) {
    const far = map.distance(marker.getLatLng(), focus.center) > FAR_FROM_FOCUS_METRES
    farFrom.value = far ? focus.name : ''
    if (!far) return
  }
  map.setView(focus.center, focus.zoom)
})

onBeforeUnmount(() => {
  map?.remove()
  map = undefined
  marker = undefined
})
</script>

<template>
  <div class="location-map-wrap">
    <div
      ref="mapElement"
      class="location-map"
      role="application"
      :aria-label="selectable ? 'Choose the property location on the map' : 'Map showing the property location'"
      :data-center="`${view.lat.toFixed(4)},${view.lng.toFixed(4)}`"
      :data-zoom="view.zoom"
    />
    <p v-if="farFrom" class="map-far" role="status" data-testid="map-far-note">
      Your pin looks far from {{ farFrom }}. Check it, or click the map to move it.
    </p>
    <p v-if="selectable" class="map-hint">
      Choose the barangay first and the map will jump there. Scroll to zoom in, then click the street to place the marker.
    </p>
  </div>
</template>

<style scoped>
.location-map-wrap {
  min-width: 0;
}

.location-map {
  width: 100%;
  height: 340px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #e7ece8;
  z-index: 0;
}

.map-far {
  margin: 9px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: #fef3c7;
  color: #92400e;
  font-size: 12px;
}

.map-hint {
  margin: 9px 0 0;
  color: #5e6d82;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .location-map {
    height: 280px;
  }
}
</style>
