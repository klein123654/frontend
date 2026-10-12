
<script setup lang="ts">
import { computed, ref, watch } from 'vue'

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
</script>

<template>
  <section class="property-gallery">

    <!-- MAIN IMAGE -->
    <div v-if="images.length" class="main-image">

      <img
        :src="currentImage"
        :alt="`${title} - Photo ${activeIndex + 1}`"
      />

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
        <img
          :src="image"
          :alt="`${title} thumbnail ${index + 1}`"
        />
      </button>

    </div>

  </section>
</template>

<style scoped>
.property-gallery {
  width: 100%;
}

.main-image {
  position: relative;
  width: 100%;
  height: 440px;
  overflow: hidden;
  border-radius: 16px;
  background: #f1f5f9;
}

.main-image > img {
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
  color: #64748b;
}

.empty-icon {
  font-size: 42px;
  color: #94a3b8;
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
