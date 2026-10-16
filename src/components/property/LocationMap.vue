<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const BUTUAN_CENTER: L.LatLngExpression = [8.9475, 125.5406]

const props = withDefaults(defineProps<{
  latitude?: number | null
  longitude?: number | null
  selectable?: boolean
}>(), {
  latitude: null,
  longitude: null,
  selectable: false,
})

const emit = defineEmits<{
  select: [coordinates: { latitude: number; longitude: number }]
}>()

const mapElement = ref<HTMLDivElement | null>(null)
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
  map = L.map(mapElement.value, { scrollWheelZoom: false }).setView(
    initialPoint ?? BUTUAN_CENTER,
    initialPoint ? 16 : 12,
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  }).addTo(map)

  if (initialPoint) showMarker(initialPoint[0], initialPoint[1])

  if (props.selectable) {
    map.on('click', (event: L.LeafletMouseEvent) => {
      showMarker(event.latlng.lat, event.latlng.lng)
      emit('select', { latitude: event.latlng.lat, longitude: event.latlng.lng })
    })
  }
})

watch(() => [props.latitude, props.longitude] as const, ([latitude, longitude]) => {
  const point = coordinates(latitude, longitude)
  if (map && point) showMarker(point[0], point[1], true)
})

onBeforeUnmount(() => {
  map?.remove()
  map = undefined
  marker = undefined
})
</script>

<template>
  <div class="location-map-wrap">
    <div ref="mapElement" class="location-map" role="application" :aria-label="selectable ? 'Choose the property location on the map' : 'Map showing the property location'" />
    <p v-if="selectable" class="map-hint">Click the map to place or move the property marker. Zoom in for a more precise location.</p>
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

.map-hint {
  margin: 9px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .location-map {
    height: 280px;
  }
}
</style>
