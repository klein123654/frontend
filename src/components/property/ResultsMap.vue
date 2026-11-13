<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { formatPeso } from '@/utils/format'
import type { Property } from '@/types/property'

const BUTUAN_CENTER: L.LatLngExpression = [8.9475, 125.5406]

const props = defineProps<{ properties: Property[] }>()
const router = useRouter()

const mapElement = ref<HTMLDivElement | null>(null)
let map: L.Map | undefined
let layer: L.LayerGroup | undefined

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character)
}

function render() {
  if (!map || !layer) return
  layer.clearLayers()
  const points: L.LatLngTuple[] = []

  for (const property of props.properties) {
    if (property.latitude == null || property.longitude == null) continue
    const point: L.LatLngTuple = [property.latitude, property.longitude]
    points.push(point)

    const popup = document.createElement('div')
    popup.className = 'map-popup'
    popup.innerHTML = `
      <strong>${escapeHtml(property.title)}</strong>
      <span>${escapeHtml(property.type)} · ${escapeHtml(property.barangay || 'Butuan City')}</span>
      <b>${escapeHtml(formatPeso(property.price))}${property.listingType === 'For Rent' ? ' / month' : ''}</b>
      <a href="/properties/${property.id}">View details →</a>`
    popup.querySelector('a')?.addEventListener('click', (event) => {
      event.preventDefault()
      void router.push(`/properties/${property.id}`)
    })

    L.circleMarker(point, { radius: 10, color: '#ffffff', weight: 2, fillColor: '#2563eb', fillOpacity: 0.95 })
      .bindPopup(popup)
      .bindTooltip(escapeHtml(property.title))
      .addTo(layer)
  }

  if (points.length === 1) map.setView(points[0] as L.LatLngTuple, 15)
  else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 })
  else map.setView(BUTUAN_CENTER, 12)
}

onMounted(() => {
  if (!mapElement.value) return
  map = L.map(mapElement.value, { scrollWheelZoom: false }).setView(BUTUAN_CENTER, 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  }).addTo(map)
  layer = L.layerGroup().addTo(map)
  render()
})

watch(() => props.properties, render)

onBeforeUnmount(() => {
  map?.remove()
  map = undefined
  layer = undefined
})
</script>

<template>
  <div ref="mapElement" class="results-map" role="region" aria-label="Map of listings on this page" />
</template>

<style scoped>
.results-map {
  height: min(620px, 70vh);
  min-height: 380px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  z-index: 0;
}

:deep(.map-popup) {
  display: grid;
  gap: 4px;
  min-width: 180px;
  font-family: Inter, Arial, sans-serif;
}

:deep(.map-popup strong) {
  color: #142d4e;
  font-size: 14px;
}

:deep(.map-popup span) {
  color: #64748b;
  font-size: 12px;
}

:deep(.map-popup b) {
  color: #142d4e;
}

:deep(.map-popup a) {
  color: #1d4ed8;
  font-weight: 700;
}
</style>
