<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, ArrowRight, Star, Trash2, Undo2 } from '@lucide/vue'
import type { ListingPhoto, PhotoChanges } from '@/types/listingPhotos'

const props = defineProps<{ photos: ListingPhoto[] }>()
const changes = defineModel<PhotoChanges>({ required: true })

const byId = computed(() => new Map(props.photos.map((photo) => [photo.id, photo])))
const ordered = computed(() =>
  changes.value.imageOrder.map((id) => byId.value.get(id)).filter((photo): photo is ListingPhoto => Boolean(photo)),
)
const keptIds = computed(() => changes.value.imageOrder.filter((id) => !changes.value.removeImageIds.includes(id)))

function isRemoved(id: number) {
  return changes.value.removeImageIds.includes(id)
}

function update(next: Partial<PhotoChanges>) {
  changes.value = { ...changes.value, ...next }
}

function makeCover(id: number) {
  // The cover photo also moves to the front so the order matches what buyers see.
  update({ primaryImageId: id, imageOrder: [id, ...changes.value.imageOrder.filter((other) => other !== id)] })
}

function move(id: number, step: -1 | 1) {
  const order = [...changes.value.imageOrder]
  const from = order.indexOf(id)
  const to = from + step
  if (from < 0 || to < 0 || to >= order.length) return
  const [moved] = order.splice(from, 1)
  order.splice(to, 0, moved as number)
  update({ imageOrder: order })
}

function remove(id: number) {
  const removeImageIds = [...changes.value.removeImageIds, id]
  const primaryImageId = changes.value.primaryImageId === id
    ? changes.value.imageOrder.find((other) => !removeImageIds.includes(other)) ?? null
    : changes.value.primaryImageId
  update({ removeImageIds, primaryImageId })
}

function restore(id: number) {
  update({
    removeImageIds: changes.value.removeImageIds.filter((other) => other !== id),
    primaryImageId: changes.value.primaryImageId ?? id,
  })
}
</script>

<template>
  <div class="photo-manager">
    <p class="photo-help">
      The <strong>cover photo</strong> appears first in search results. Removing or rearranging photos does not send a live listing back for review; new photos do.
    </p>
    <ul class="photo-grid" aria-label="Current listing photos">
      <li
        v-for="(photo, index) in ordered"
        :key="photo.id"
        class="photo"
        :class="{ 'photo--removed': isRemoved(photo.id), 'photo--cover': changes.primaryImageId === photo.id }"
      >
        <img :src="photo.url" :alt="`Listing photo ${index + 1}`" loading="lazy" />
        <span v-if="changes.primaryImageId === photo.id && !isRemoved(photo.id)" class="cover-tag">Cover</span>
        <span v-if="isRemoved(photo.id)" class="removed-tag">Will be removed</span>

        <div class="photo-actions">
          <template v-if="!isRemoved(photo.id)">
            <button
              v-if="changes.primaryImageId !== photo.id"
              type="button"
              :aria-label="`Make photo ${index + 1} the cover`"
              title="Make cover"
              @click="makeCover(photo.id)"
            ><Star :size="15" aria-hidden="true" /></button>
            <button type="button" :aria-label="`Move photo ${index + 1} earlier`" title="Move earlier" :disabled="index === 0" @click="move(photo.id, -1)">
              <ArrowLeft :size="15" aria-hidden="true" />
            </button>
            <button type="button" :aria-label="`Move photo ${index + 1} later`" title="Move later" :disabled="index === ordered.length - 1" @click="move(photo.id, 1)">
              <ArrowRight :size="15" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="danger"
              :aria-label="`Remove photo ${index + 1}`"
              title="Remove"
              @click="remove(photo.id)"
            ><Trash2 :size="15" aria-hidden="true" /></button>
          </template>
          <button v-else type="button" :aria-label="`Keep photo ${index + 1}`" @click="restore(photo.id)">
            <Undo2 :size="15" aria-hidden="true" /> Undo
          </button>
        </div>
      </li>
    </ul>
    <p v-if="keptIds.length === 0" class="photo-warning" role="alert">
      Add at least one new photo below, or undo a removal. A listing needs at least one photo.
    </p>
  </div>
</template>

<style scoped>
.photo-manager {
  margin-bottom: 18px;
}

.photo-help {
  margin: 0 0 12px;
  color: #475569;
  font-size: 13px;
  line-height: 1.6;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.photo {
  position: relative;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.photo--cover {
  border-color: #2563eb;
}

.photo img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.photo--removed img {
  opacity: 0.35;
  filter: grayscale(1);
}

.cover-tag,
.removed-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.cover-tag {
  background: #2563eb;
  color: #fff;
}

.removed-tag {
  background: #fee2e2;
  color: #991b1b;
}

.photo-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding: 8px;
}

.photo-actions button {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  min-width: 32px;
  min-height: 32px;
  justify-content: center;
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  background: #fff;
  color: #142d4e;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.photo-actions button:hover:not(:disabled) {
  border-color: #2563eb;
  color: #1d4ed8;
}

.photo-actions button.danger:hover {
  border-color: #dc2626;
  color: #b91c1c;
}

.photo-actions button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.photo-warning {
  margin: 10px 0 0;
  color: #b91c1c;
  font-size: 13px;
}
</style>
