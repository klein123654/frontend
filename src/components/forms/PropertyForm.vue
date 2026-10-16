
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'

import {
  Building2,
  MapPin,
  PhilippinePeso,
  ImagePlus,
  FileText,
  Save,
  Send,
  Info,
  CircleAlert
} from '@lucide/vue'

import type {
  PropertyType,
  ListingType
} from '@/types/property'

import type {
  OwnerProperty
} from '@/data/owner/ownerProperties'
import LocationMap from '@/components/property/LocationMap.vue'
import { useFormDraft } from '@/composables/useFormDraft'
import { BUTUAN_BARANGAYS, BUTUAN_CITY, BUTUAN_PROVINCE, canonicalButuanBarangay, isButuanBarangay } from '@/data/butuanLocation'

type SaveStatus = 'Draft' | 'Pending'

interface PropertyFormPayload {
  title: string
  propertyType: PropertyType | null
  listingType: ListingType | null
  barangay: string
  location: string
  city: string
  province: string
  latitude: number | null
  longitude: number | null
  area: number | null
  price: number | null
  description: string
  images: File[]
  status: SaveStatus
}

type FieldName =
  | 'title'
  | 'propertyType'
  | 'listingType'
  | 'barangay'
  | 'location'
  | 'coordinates'
  | 'price'
  | 'area'
  | 'description'
  | 'images'

const props = withDefaults(
  defineProps<{
    mode?: 'create' | 'edit'
    initialValues?: OwnerProperty | null
  }>(),
  {
    mode: 'create',
    initialValues: null
  }
)

const emit = defineEmits<{
  save: [property: PropertyFormPayload]
}>()

const isEditMode = computed(
  () => props.mode === 'edit'
)

// FORM VALUES

const title = ref('')
const propertyType = ref<PropertyType | null>(null)
const listingType = ref<ListingType | null>(null)
const barangay = ref('')
const location = ref('')
const latitude = ref<number | null>(null)
const longitude = ref<number | null>(null)
const price = ref<number | null>(null)
const area = ref<number | null>(null)
const description = ref('')
const route = useRoute()
const formDraft = useFormDraft(`property-${route.fullPath}`, {
  title, propertyType, listingType, barangay, location, latitude, longitude, price, area, description,
})
const images = ref<File[]>([])

// VALIDATION STATE

const attemptedSubmit = ref(false)
const attemptedDraft = ref(false)
const errorMessage = ref('')
const imageError = ref('')

const propertyTypes: PropertyType[] = [
  'Office Spaces',
  'Retail Spaces',
  'Warehouses',
  'Commercial Lots'
]

const listingTypes: ListingType[] = [
  'For Rent',
  'For Lease',
  'For Sale'
]

// FILL THE FORM WHEN EDITING AN EXISTING PROPERTY

watch(
  () => props.initialValues,
  (property) => {
    if (!property || formDraft.hasDraft) return
    title.value = property?.title ?? ''
    propertyType.value = property?.propertyType ?? null
    listingType.value = property?.listingType ?? null
    barangay.value = property?.barangay ?? ''
    location.value = property?.location ?? ''
    latitude.value = property?.latitude ?? null
    longitude.value = property?.longitude ?? null
    // Empty draft values should appear as blank inputs,
    // rather than displaying PHP 0 or area 0.
    price.value =
      property && property.price > 0
        ? property.price
        : null

    area.value =
      property && property.area > 0
        ? property.area
        : null

    description.value = property?.description ?? ''

    images.value = []
    attemptedSubmit.value = false
    attemptedDraft.value = false
    errorMessage.value = ''
    imageError.value = ''
  },
  { immediate: true }
)

// DETERMINE INVALID FIELDS

const fieldErrors = computed(() => ({
  title: !title.value.trim(),
  propertyType: !propertyType.value || !propertyTypes.includes(propertyType.value),
  listingType: !listingType.value || !listingTypes.includes(listingType.value),
  barangay: !isButuanBarangay(barangay.value),
  location: !location.value.trim(),
  coordinates: latitude.value === null || longitude.value === null,
  price: price.value === null || price.value <= 0,
  area: area.value === null || area.value <= 0,
  description: !description.value.trim(),

  // Editing an existing draft does not require
  // selecting photos again.
  images:
    images.value.length === 0 && (props.initialValues?.images.length ?? 0) === 0
}))

function isInvalid(field: FieldName): boolean {
  if (field === 'title') {
    return (
      attemptedSubmit.value || attemptedDraft.value
    ) && fieldErrors.value.title
  }

  return attemptedSubmit.value && fieldErrors.value[field]
}

const imageNames = computed(() =>
  images.value.map((file) => file.name)
)

// IMAGE SELECTION

function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const selected = Array.from(input.files ?? [])

  imageError.value = ''
  errorMessage.value = ''

  if (selected.length === 0) {
    images.value = []
    return
  }

  if (selected.length > 5) {
    imageError.value =
      'Please select a maximum of 5 images.'
    images.value = []
    input.value = ''
    return
  }

  if (
    selected.some(
      (file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    )
  ) {
    imageError.value =
      'Only JPG, PNG, WebP or GIF files are allowed.'
    images.value = []
    input.value = ''
    return
  }

  if (
    selected.some(
      (file) => file.size > 5 * 1024 * 1024
    )
  ) {
    imageError.value =
      'Each image must be 5 MB or smaller.'
    images.value = []
    input.value = ''
    return
  }

  images.value = selected
}

// VALIDATION FOR FULL SUBMISSION

function validateForSubmission(): boolean {
  errorMessage.value = ''

  const hasMissingFields = Object.values(
    fieldErrors.value
  ).some(Boolean)

  if (hasMissingFields) {
    errorMessage.value =
      'Please correct the highlighted fields before submitting.'
    return false
  }

  if (imageError.value) {
    errorMessage.value =
      'Please correct the image selection error.'
    return false
  }

  return true
}

// PREPARE FORM VALUES

function buildPayload(
  status: SaveStatus
): PropertyFormPayload {
  return {
    title: title.value.trim(),
    propertyType: propertyType.value,
    listingType: listingType.value,
    barangay: canonicalButuanBarangay(barangay.value) ?? '',
    location: location.value.trim(),
    city: BUTUAN_CITY,
    province: BUTUAN_PROVINCE,
    latitude: latitude.value,
    longitude: longitude.value,
    price: price.value,
    area: area.value,
    description: description.value.trim(),
    images: [...images.value],
    status
  }
}

function setCoordinates(coordinates: { latitude: number; longitude: number }) {
  latitude.value = coordinates.latitude
  longitude.value = coordinates.longitude
}

// SAVE DRAFT OR SAVE CHANGES

function saveDraft() {
  attemptedDraft.value = true
  errorMessage.value = ''

  const incomplete = Object.entries(fieldErrors.value)
    .some(([field, invalid]) => field !== 'images' && field !== 'coordinates' && invalid)
  if (incomplete) {
    errorMessage.value = 'Complete the property details before saving your draft.'
    return
  }

  emit('save', buildPayload('Draft'))
}

// SUBMIT A NEW LISTING FOR REVIEW

function submitForReview() {
  attemptedSubmit.value = true
  errorMessage.value = ''

  if (!validateForSubmission()) {
    return
  }

  emit('save', buildPayload('Pending'))
}
</script>

<template>
  <form
    class="property-form"
    novalidate
    @submit.prevent="submitForReview"
  >
    <!-- BASIC INFORMATION -->
    <section class="form-card">
      <div class="section-heading">
        <div class="section-icon">
          <Building2 :size="20" />
        </div>

        <div>
          <h2>Basic Information</h2>
          <p>
            Enter the main details of your commercial property.
          </p>
        </div>
      </div>

      <div class="fields-grid">

        <!-- PROPERTY TITLE -->
        <div class="field full-width">
          <label for="property-title">
            Property Title <span>*</span>
          </label>

          <InputText
            id="property-title"
            v-model="title"
            :invalid="isInvalid('title')"
            :aria-describedby="
              isInvalid('title') ? 'title-error' : undefined
            "
            placeholder="e.g. Modern Commercial Office Space"
            fluid
          />

          <small
            v-if="isInvalid('title')"
            id="title-error"
            class="field-error"
          >
            <CircleAlert :size="13" />
            Property title is required.
          </small>
        </div>

        <!-- PROPERTY TYPE -->
        <div class="field">
          <label for="property-type">
            Property Type <span>*</span>
          </label>

          <Select
            id="property-type"
            v-model="propertyType"
            :options="propertyTypes"
            :invalid="isInvalid('propertyType')"
            placeholder="Select property type"
            fluid
          />

          <small
            v-if="isInvalid('propertyType')"
            class="field-error"
          >
            <CircleAlert :size="13" />
            Please select a property type.
          </small>
        </div>

        <!-- LISTING TYPE -->
        <div class="field">
          <label for="listing-type">
            Listing Type <span>*</span>
          </label>

          <Select
            id="listing-type"
            v-model="listingType"
            :options="listingTypes"
            :invalid="isInvalid('listingType')"
            placeholder="Select listing type"
            fluid
          />

          <small
            v-if="isInvalid('listingType')"
            class="field-error"
          >
            <CircleAlert :size="13" />
            Please select a listing type.
          </small>
        </div>

      </div>
    </section>

    <!-- PROPERTY LOCATION -->
    <section class="form-card">
      <div class="section-heading">
        <div class="section-icon">
          <MapPin :size="20" />
        </div>

        <div>
          <h2>Property Location</h2>
          <p>
            Specify where the property is located in Butuan City.
          </p>
        </div>
      </div>

      <div class="fields-grid">

        <!-- BARANGAY -->
        <div class="field">
          <label for="property-barangay">
            Barangay <span>*</span>
          </label>

          <InputText
            id="property-barangay"
            v-model="barangay"
            list="butuan-barangays"
            :invalid="isInvalid('barangay')"
            placeholder="Start typing a barangay"
            fluid
          />
          <datalist id="butuan-barangays"><option v-for="name in BUTUAN_BARANGAYS" :key="name" :value="name" /></datalist>
          <small class="field-hint">Type a few letters to see Butuan barangay suggestions.</small>

          <small
            v-if="isInvalid('barangay')"
            class="field-error"
          >
            <CircleAlert :size="13" />
            Choose a valid Butuan barangay from the suggestions.
          </small>
        </div>

        <!-- STREET / LOCATION -->
        <div class="field">
          <label for="property-location">
            Street / Location <span>*</span>
          </label>

          <InputText
            id="property-location"
            v-model="location"
            :invalid="isInvalid('location')"
            placeholder="e.g. J.C. Aquino Avenue, Butuan City"
            fluid
          />

          <small
            v-if="isInvalid('location')"
            class="field-error"
          >
            <CircleAlert :size="13" />
            Property location is required.
          </small>
        </div>

        <p class="location-scope full-width">Location coverage: <strong>Butuan City, Agusan del Norte</strong></p>

        <div class="field full-width">
          <label for="property-map">Map Pin <span>*</span></label>
          <LocationMap
            id="property-map"
            :latitude="latitude"
            :longitude="longitude"
            selectable
            @select="setCoordinates"
          />
          <small v-if="isInvalid('coordinates')" class="field-error">
            <CircleAlert :size="13" />Choose the property location on the map before submitting for review.
          </small>
        </div>

      </div>
    </section>

    <!-- PRICING AND AREA -->
    <section class="form-card">
      <div class="section-heading">
        <div class="section-icon">
          <PhilippinePeso :size="20" />
        </div>

        <div>
          <h2>Pricing & Area</h2>
          <p>
            Provide the property's asking price and floor or lot area.
          </p>
        </div>
      </div>

      <div class="fields-grid">

        <!-- PRICE -->
        <div class="field">
          <label for="property-price">
            {{
              listingType === 'For Rent'
                ? 'Monthly Rent'
                : listingType === 'For Lease'
                  ? 'Lease Price'
                  : 'Selling Price'
            }}
            (PHP) <span>*</span>
          </label>

          <InputNumber
            input-id="property-price"
            v-model="price"
            :invalid="isInvalid('price')"
            :class="{
              'invalid-number': isInvalid('price')
            }"
            mode="currency"
            currency="PHP"
            locale="en-PH"
            :min="0"
            :min-fraction-digits="0"
            :max-fraction-digits="0"
            placeholder="Enter property price"
            fluid
          />

          <small
            v-if="isInvalid('price')"
            class="field-error"
          >
            <CircleAlert :size="13" />
            Enter a price greater than zero.
          </small>
        </div>

        <!-- AREA -->
        <div class="field">
          <label for="property-area">
            Property Area (sq. m.) <span>*</span>
          </label>

          <InputNumber
            input-id="property-area"
            v-model="area"
            :invalid="isInvalid('area')"
            :class="{
              'invalid-number': isInvalid('area')
            }"
            :min="0"
            :min-fraction-digits="0"
            :max-fraction-digits="2"
            placeholder="Enter area in square meters"
            fluid
          />

          <small
            v-if="isInvalid('area')"
            class="field-error"
          >
            <CircleAlert :size="13" />
            Enter an area greater than zero.
          </small>
        </div>

      </div>
    </section>

    <!-- PROPERTY DESCRIPTION -->
    <section class="form-card">
      <div class="section-heading">
        <div class="section-icon">
          <FileText :size="20" />
        </div>

        <div>
          <h2>Property Description</h2>
          <p>
            Describe its features, accessibility, and intended use.
          </p>
        </div>
      </div>

      <div class="field">
        <label for="property-description">
          Description <span>*</span>
        </label>

        <Textarea
          id="property-description"
          v-model="description"
          :invalid="isInvalid('description')"
          rows="6"
          placeholder="Describe the property's features, nearby landmarks, accessibility, and other relevant details..."
          fluid
          auto-resize
        />

        <small
          v-if="isInvalid('description')"
          class="field-error"
        >
          <CircleAlert :size="13" />
          Please provide a property description.
        </small>
      </div>
    </section>

    <!-- PROPERTY IMAGES -->
    <section class="form-card">
      <div class="section-heading">
        <div class="section-icon">
          <ImagePlus :size="20" />
        </div>

        <div>
          <h2>Property Images</h2>
          <p>
            {{
              isEditMode
                ? 'Keep the existing photos or upload additional property images.'
                : 'Select clear photos of your commercial property.'
            }}
          </p>
        </div>
      </div>

      <!-- PROPERTY PHOTO SELECTION -->
        <div
          class="upload-area"
          :class="{
            'upload-invalid':
              isInvalid('images') || Boolean(imageError)
          }"
        >
          <ImagePlus :size="32" :stroke-width="1.5" />

          <strong>Select Property Photos</strong>

          <p>
            Select up to 5 JPG, PNG, or WebP photos (5 MB each). Images are uploaded securely to the application storage.
          </p>

          <input
            id="property-images"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            aria-label="Select property images"
            :aria-invalid="
              isInvalid('images') || Boolean(imageError)
            "
            @change="onFilesSelected"
          />
        </div>

        <small
          v-if="imageError || isInvalid('images')"
          class="field-error image-field-error"
        >
          <CircleAlert :size="13" />
          {{
            imageError ||
            'Please select at least one property image.'
          }}
        </small>

        <div
          v-if="imageNames.length"
          class="selected-images"
        >
          <strong>Selected images:</strong>

          <ul>
            <li
              v-for="(name, index) in imageNames"
              :key="`${index}-${name}`"
            >
              {{ name }}
            </li>
          </ul>
        </div>

      <div class="info-note">
        <Info :size="17" />

        <span v-if="isEditMode">
          Existing photos remain on the listing. New images are uploaded to the application storage.
        </span>

        <span v-else>
          Selected photos are uploaded when you save or submit the listing.
        </span>
      </div>
    </section>

    <!-- GENERAL VALIDATION MESSAGE -->
    <div
      v-if="errorMessage"
      class="form-error"
      role="alert"
    >
      <CircleAlert :size="19" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="form-actions">

      <!-- EDIT MODE: SAVE DRAFT OR SUBMIT FOR REVIEW -->
      <template v-if="isEditMode">
        <button type="button" class="draft-button" @click="saveDraft">
          <Save :size="18" /> Save Changes
        </button>
        <button type="submit" class="submit-button">
          <Send :size="18" /> Submit for Review
        </button>
      </template>

      <!-- CREATE MODE -->
      <template v-else>
        <button
          type="button"
          class="draft-button"
          @click="saveDraft"
        >
          <Save :size="18" />
          Save Draft
        </button>

        <button
          type="submit"
          class="submit-button"
        >
          <Send :size="18" />
          Submit for Review
        </button>
      </template>

    </div>

  </form>
</template>

<style scoped>
/* FORM LAYOUT */

.property-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
}

/* FORM CARDS */

.form-card {
  padding: 28px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #ffffff;
}

/* SECTION HEADINGS */

.section-heading {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 23px;
  margin-bottom: 24px;
  border-bottom: 1px solid #edf2f7;
}

.section-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 11px;
  background: #eaf1fc;
  color: #2563eb;
}

.section-heading h2 {
  margin: 0 0 7px;
  color: #142d4e;
  font-size: 17px;
  font-weight: 750;
}

.section-heading p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

/* FIELD GRID */

.fields-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.full-width {
  grid-column: 1 / -1;
}

.location-scope {
  margin: 0;
  color: #64748b;
  font-size: 12px;
}

.location-scope strong {
  color: #334155;
}

/* FIELD LABELS */

.field label {
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.field label span {
  color: #dc2626;
}

/* PRIMEVUE FIELD SIZING */

.field :deep(.p-inputtext),
.field :deep(.p-inputnumber),
.field :deep(.p-select),
.field :deep(.p-textarea) {
  width: 100%;
}

.field :deep(.p-inputtext),
.field :deep(.p-select),
.field :deep(.p-inputnumber-input) {
  min-height: 46px;
}

.field :deep(.p-inputtext),
.field :deep(.p-inputnumber-input),
.field :deep(.p-select-label),
.field :deep(.p-textarea) {
  font-size: 13px;
}

/* RED VALIDATION HIGHLIGHT */

.field :deep(.p-inputtext.p-invalid),
.field :deep(.p-select.p-invalid),
.field :deep(.p-textarea.p-invalid) {
  border-color: #ef4444 !important;
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.12) !important;
}

/* INPUTNUMBER USES A NESTED INPUT */

.field :deep(.invalid-number .p-inputnumber-input),
.field :deep(.p-inputnumber.p-invalid .p-inputnumber-input) {
  border-color: #ef4444 !important;
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.12) !important;
}

/* RED FOCUS GLOW */

.field :deep(.p-inputtext.p-invalid:focus),
.field :deep(.p-select.p-invalid.p-focus),
.field :deep(.p-textarea.p-invalid:focus),
.field :deep(.invalid-number:focus-within .p-inputnumber-input) {
  border-color: #dc2626 !important;
  box-shadow:
    0 0 0 4px rgba(239, 68, 68, 0.17) !important;
}

/* FIELD ERROR TEXT */

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

.image-field-error {
  margin-top: 10px;
}

/* IMAGE UPLOAD */

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
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.upload-area input {
  max-width: 100%;
  color: #475569;
  font-size: 12px;
}

/* INVALID IMAGE UPLOAD */

.upload-area.upload-invalid {
  border-color: #ef4444;
  background: #fffafa;
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* IMAGE AREA WHEN EDITING */

.image-unavailable {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 24px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
}

.image-unavailable > svg {
  flex-shrink: 0;
  color: #2563eb;
}

.image-unavailable strong {
  color: #142d4e;
  font-size: 13px;
}

.image-unavailable p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.7;
}

/* SELECTED IMAGES */

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

/* INFORMATION NOTE */

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

/* GENERAL VALIDATION MESSAGE */

.form-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid #fecaca;
  border-radius: 9px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 13px;
  line-height: 1.6;
}

.form-error svg {
  flex-shrink: 0;
}

/* ACTION BUTTONS */

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 13px;
  padding-bottom: 20px;
}

.draft-button,
.submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 14px 21px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.draft-button {
  background: white;
  color: #142d4e;
  border: 1px solid #cbd5e1;
}

.draft-button:hover {
  background: #f1f5f9;
}

.submit-button {
  background: #142d4e;
  border: 1px solid #142d4e;
  color: white;
}

.submit-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* RESPONSIVE DESIGN */

@media (max-width: 650px) {
  .form-card {
    padding: 20px 17px;
  }

  .fields-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .full-width {
    grid-column: auto;
  }

  .section-heading {
    align-items: flex-start;
  }

  .form-actions {
    flex-direction: column;
  }

  .draft-button,
  .submit-button {
    width: 100%;
  }

  .image-unavailable {
    padding: 18px;
  }
}
</style>
