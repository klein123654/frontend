
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Expand, X } from '@lucide/vue'

const props = defineProps<{
  images: string[]
  title: string
}>()

const activeIndex = ref(0)

const currentImage = computed(() => {
  return props.images[activeIndex.value] ?? ''
})

const hasMultipleImages = computed(() => {
  return props.images.length > 1
})

function nextImage() {
  if (!props.images.length) return

  activeIndex.value =
    (activeIndex.value + 1) % props.images.length
}

function previousImage() {
  if (!props.images.length) return

  activeIndex.value =
    (activeIndex.value - 1 + props.images.length)
    % props.images.length
}

function selectImage(index: number) {
  activeIndex.value = index
}

watch(
  () => props.images,
  () => {
    activeIndex.value = 0
  }
)

// FULL-SCREEN VIEWER (native <dialog>: focus trap and Esc come for free)

const viewer = ref<HTMLDialogElement | null>(null)
let touchStartX: number | null = null

function openViewer() {
  viewer.value?.showModal()
}

function closeViewer() {
  viewer.value?.close()
}

function onViewerKey(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') nextImage()
  else if (event.key === 'ArrowLeft') previousImage()
}

function onViewerClick(event: MouseEvent) {
  // Clicking the dark backdrop (the dialog itself) closes it.
  if (event.target === viewer.value) closeViewer()
}

function onTouchStart(event: TouchEvent) {
  touchStartX = event.touches[0]?.clientX ?? null
}

function onTouchEnd(event: TouchEvent) {
  if (touchStartX === null) return
  const distance = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX
  touchStartX = null
  if (Math.abs(distance) < 40) return
  if (distance < 0) nextImage()
  else previousImage()
}
</script>

<template>
  <section class="property-gallery">

    <!-- MAIN IMAGE -->
    <div v-if="images.length" class="main-image">

      <button type="button" class="open-viewer" aria-label="View photo full screen" @click="openViewer">
        <img decoding="async"
          :src="currentImage"
          :alt="`${title} - Photo ${activeIndex + 1}`"
        />
        <span class="expand-hint" aria-hidden="true"><Expand :size="16" /> Full screen</span>
      </button>

      <!-- IMAGE COUNTER -->
      <div class="image-counter">
        {{ activeIndex + 1 }} / {{ images.length }}
      </div>

      <!-- NAVIGATION BUTTONS -->
      <template v-if="hasMultipleImages">

        <button
          type="button"
          class="gallery-arrow previous"
          aria-label="Previous image"
          @click="previousImage"
        >
          &#10094;
        </button>

        <button
          type="button"
          class="gallery-arrow next"
          aria-label="Next image"
          @click="nextImage"
        >
          &#10095;
        </button>

      </template>

    </div>

    <!-- NO IMAGES -->
    <div v-else class="empty-gallery">
      <span class="empty-icon">▧</span>
      <p>No property images available.</p>
    </div>

    <!-- THUMBNAILS -->
    <div
      v-if="hasMultipleImages"
      class="thumbnail-list"
    >

      <button
        v-for="(image, index) in images"
        :key="index"
        type="button"
        class="thumbnail"
        :class="{ selected: activeIndex === index }"
        :aria-label="`View image ${index + 1}`"
        :aria-pressed="activeIndex === index"
        @click="selectImage(index)"
      >
        <img loading="lazy" decoding="async"
          :src="image"
          :alt="`${title} thumbnail ${index + 1}`"
        />
      </button>

    </div>

    <dialog
      ref="viewer"
      class="viewer"
      :aria-label="`${title} photos`"
      @keydown="onViewerKey"
      @click="onViewerClick"
      @touchstart.passive="onTouchStart"
      @touchend="onTouchEnd"
    >
      <button type="button" class="viewer-close" aria-label="Close full-screen photos" @click="closeViewer">
        <X :size="26" aria-hidden="true" />
      </button>
      <img v-if="currentImage" :src="currentImage" :alt="`${title} - Photo ${activeIndex + 1}`" class="viewer-image" />
      <div class="viewer-counter" aria-live="polite">{{ activeIndex + 1 }} / {{ images.length }}</div>
      <template v-if="hasMultipleImages">
        <button type="button" class="viewer-arrow previous" aria-label="Previous image" @click="previousImage">&#10094;</button>
        <button type="button" class="viewer-arrow next" aria-label="Next image" @click="nextImage">&#10095;</button>
      </template>
    </dialog>
  </section>
</template>

<style scoped>
.property-gallery {
  width: 100%;
}

.open-viewer {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: zoom-in;
}

.expand-hint {
  position: absolute;
  top: 14px;
  right: 14px;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgb(15 23 42 / 70%);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.viewer {
  width: 100vw;
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  margin: 0;
  padding: 0;
  border: 0;
  background: rgb(2 6 23 / 94%);
  overscroll-behavior: contain;
}

.viewer::backdrop {
  background: rgb(2 6 23 / 70%);
}

.viewer[open] {
  display: grid;
  place-items: center;
}

.viewer-image {
  max-width: min(96vw, 1600px);
  max-height: 86dvh;
  object-fit: contain;
  user-select: none;
}

.viewer-close,
.viewer-arrow {
  position: absolute;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 14%);
  color: #fff;
  cursor: pointer;
}

.viewer-close {
  top: 16px;
  right: 16px;
  width: 46px;
  height: 46px;
}

.viewer-arrow {
  top: 50%;
  width: 52px;
  height: 52px;
  font-size: 22px;
  transform: translateY(-50%);
}

.viewer-arrow.previous { left: 16px; }
.viewer-arrow.next { right: 16px; }

.viewer-close:hover,
.viewer-arrow:hover {
  background: rgb(255 255 255 / 26%);
}

.viewer-counter {
  position: absolute;
  bottom: 18px;
  left: 50%;
  color: #e2e8f0;
  font-size: 14px;
  transform: translateX(-50%);
}

@media (max-width: 640px) {
  .viewer-arrow {
    top: auto;
    bottom: 10px;
    transform: none;
  }
}

.main-image {
  position: relative;
  width: 100%;
  height: 440px;
  overflow: hidden;
  border-radius: 16px;
  background: #f1f5f9;
}

.open-viewer > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* IMAGE COUNTER */

.image-counter {
  position: absolute;
  bottom: 18px;
  right: 18px;
  padding: 8px 14px;
  background: rgba(20, 45, 78, 0.85);
  color: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

/* NAVIGATION ARROWS */

.gallery-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: #142d4e;
  font-size: 20px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition:
    background 0.2s,
    color 0.2s;
}

.gallery-arrow:hover {
  background: #142d4e;
  color: white;
}

.previous {
  left: 18px;
}

.next {
  right: 18px;
}

/* THUMBNAILS */

.thumbnail-list {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  overflow-x: auto;
  padding: 4px 2px 10px;
}

.thumbnail {
  flex: 0 0 110px;
  height: 80px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 10px;
  background: #f1f5f9;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.7;
  transition:
    opacity 0.2s,
    border-color 0.2s;
}

.thumbnail:hover {
  opacity: 1;
}

.thumbnail.selected {
  border-color: #2563eb;
  opacity: 1;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* EMPTY GALLERY */

.empty-gallery {
  height: 350px;
  background: #f3f6fb;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #5e6d82;
}

.empty-icon {
  font-size: 42px;
  color: #5e6d82;
}

/* RESPONSIVE */

@media (max-width: 768px) {
  .main-image {
    height: 300px;
    border-radius: 12px;
  }

  .thumbnail {
    flex-basis: 85px;
    height: 65px;
  }

  .gallery-arrow {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .main-image {
    height: 240px;
  }

  .image-counter {
    bottom: 12px;
    right: 12px;
  }
}
</style>
