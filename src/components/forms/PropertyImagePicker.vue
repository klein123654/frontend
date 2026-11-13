<script setup lang="ts">
import { computed } from 'vue'
import { CircleAlert, ImagePlus, Info } from '@lucide/vue'
import { ALLOWED_IMAGE_TYPES, MAX_PROPERTY_IMAGES, validatePropertyImages } from '@/utils/propertyImages'

const props = defineProps<{
  /** Show the "at least one image" error (set after a submit attempt). */
  required: boolean
  isEditMode: boolean
}>()

const files = defineModel<File[]>('files', { required: true })
const error = defineModel<string>('error', { required: true })

const hasError = computed(() => props.required || Boolean(error.value))

function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const selected = Array.from(input.files ?? [])
  const message = validatePropertyImages(selected)

  error.value = message
  if (message) {
    files.value = []
    input.value = ''
    return
  }

  files.value = selected
}
</script>

<template>
  <div class="upload-area" :class="{ 'upload-invalid': hasError }">
    <ImagePlus :size="32" :stroke-width="1.5" />

    <strong>Select Property Photos</strong>

    <p>
      Select up to {{ MAX_PROPERTY_IMAGES }} JPG, PNG, or WebP photos (5 MB each). Large photos are resized
      automatically before they are uploaded.
    </p>

    <input
      id="property-images"
      type="file"
      :accept="ALLOWED_IMAGE_TYPES.join(',')"
      multiple
      aria-label="Select property images"
      :aria-invalid="hasError"
      @change="onFilesSelected"
    />
  </div>

  <small v-if="hasError" class="field-error image-field-error">
    <CircleAlert :size="13" />
    {{ error || 'Please select at least one property image.' }}
  </small>

  <div v-if="files.length" class="selected-images">
    <strong>Selected images:</strong>
    <ul>
      <li v-for="(file, index) in files" :key="`${index}-${file.name}`">
        {{ file.name }}
      </li>
    </ul>
  </div>

  <div class="info-note">
    <Info :size="17" />
    <span v-if="isEditMode">
      New photos are added after your current ones. Photos marked for removal are deleted when you save.
    </span>
    <span v-else>
      Selected photos are uploaded when you save or submit the listing.
    </span>
  </div>
</template>

<style scoped>
.image-field-error {
  margin-top: 10px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 13px;
  padding: 30px 18px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  color: #2563eb;
  text-align: center;
  transition:
    border-color 0.2s,
    background 0.2s,
    box-shadow 0.2s;
}

.upload-area strong {
  color: #142d4e;
  font-size: 14px;
}

.upload-area p {
  margin: 0;
  color: #5e6d82;
  font-size: 12px;
  line-height: 1.6;
}

.upload-area input {
  max-width: 100%;
  color: #475569;
  font-size: 12px;
}

.upload-area.upload-invalid {
  border-color: #ef4444;
  background: #fffafa;
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.1);
}

.selected-images {
  margin-top: 17px;
  color: #334155;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.selected-images ul {
  padding-left: 22px;
  line-height: 1.9;
}

.info-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 18px;
  padding: 14px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 9px;
  color: #47617f;
  font-size: 12px;
  line-height: 1.6;
}

.info-note svg {
  flex-shrink: 0;
  color: #2563eb;
}

.field-error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #dc2626;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
}

.field-error svg {
  flex-shrink: 0;
}
</style>
