
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { createInquiry } from '@/services/inquiryService'
import { useAuth } from '@/composables/useAuth'
import { useFormDraft } from '@/composables/useFormDraft'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const props = defineProps<{
  propertyId: number
  propertyTitle: string
  contactName: string
  contactRole: 'Owner' | 'Broker'
}>()

const route = useRoute()
const { user } = useAuth()
const canInquire = computed(() => Boolean(user.value && user.value.role !== 'admin'))

const form = reactive({
  name: '',
  email: '',
  phone: '',
  message: ''
})
const formDraft = useFormDraft(`inquiry-${props.propertyId}`, form)

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  message: ''
})

const submitted = ref(false)
const submitting = ref(false)
const submitError = ref('')

watch(user, (account) => {
  if (!account || account.role === 'admin' || formDraft.hasDraft) return
  form.name = account.name
  form.email = account.email
  form.phone = account.phone || ''
}, { immediate: true })

function validateForm() {
  errors.name = ''
  errors.email = ''
  errors.phone = ''
  errors.message = ''

  let valid = true

  if (!form.name.trim()) {
    errors.name = 'Please enter your name.'
    valid = false
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.'
    valid = false
  }

  if (
    form.phone.trim() &&
    !/^(?:\+63|0)9\d{9}$/.test(form.phone.trim())
  ) {
    errors.phone = 'Enter a valid Philippine mobile number.'
    valid = false
  }

  if (form.message.trim().length < 10) {
    errors.message = 'Message must contain at least 10 characters.'
    valid = false
  }

  return valid
}

async function submitInquiry() {
  submitted.value = false
  submitError.value = ''

  if (!validateForm()) return

  submitting.value = true
  try {
    await createInquiry(props.propertyId, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      message: form.message.trim(),
    })
    submitted.value = true
    formDraft.clear()
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'Unable to send your inquiry.'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.message = ''

  submitted.value = false

  errors.name = ''
  errors.email = ''
  errors.phone = ''
  errors.message = ''
}
</script>

<template>
  <div class="inquiry-container">

    <!-- HEADER -->
    <div class="inquiry-header">
      <span class="eyebrow">PROPERTY INQUIRY</span>

      <h2>Interested in this property?</h2>

      <p>
        Contact the {{ contactRole.toLowerCase() }}
        responsible for this listing.
      </p>
    </div>

    <!-- CONTACT INFORMATION -->
    <div class="contact-profile">

      <div class="avatar">
        {{ contactName.charAt(0).toUpperCase() }}
      </div>

      <div class="contact-details">
        <strong>{{ contactName }}</strong>

        <span>
          {{ contactRole === 'Owner'
            ? 'Property Owner'
            : 'Licensed Broker' }}
        </span>
      </div>

    </div>

    <section v-if="!canInquire" class="sign-in-required">
      <h3>{{ user?.role === 'admin' ? 'Member account required' : 'Sign in to inquire' }}</h3>
      <p>{{ user?.role === 'admin' ? 'Administrator accounts cannot send buyer inquiries.' : 'Create an account or sign in to send this inquiry and keep it in your account.' }}</p>
      <div v-if="!user" class="account-actions">
        <RouterLink :to="{ name: 'login', query: { redirect: route.fullPath } }" class="account-button">Sign In</RouterLink>
        <RouterLink :to="{ name: 'register', query: { redirect: route.fullPath } }" class="account-link">Create an account</RouterLink>
      </div>
    </section>

    <!-- SUCCESS MESSAGE -->
    <div
      v-else-if="submitted"
      class="success-message"
      role="status"
    >
      <div class="success-icon">✓</div>

      <h3>Your inquiry has been sent.</h3>

      <p>
        Your inquiry for "{{ propertyTitle }}" has been saved. The listing contact can follow up using the information you provided.
      </p>

      <Button
        label="Create Another Inquiry"
        outlined
        class="reset-button"
        @click="resetForm"
      />
    </div>

    <!-- INQUIRY FORM -->
    <form
      v-else
      class="inquiry-form"
      novalidate
      @submit.prevent="submitInquiry"
    >

      <div class="form-group">
        <label for="inquiry-name">
          Full Name <span>*</span>
        </label>

        <InputText
          id="inquiry-name"
          v-model="form.name"
          placeholder="Enter your full name"
          :invalid="!!errors.name"
          autocomplete="name"
        />

        <small v-if="errors.name" class="error">
          {{ errors.name }}
        </small>
      </div>

      <div class="form-group">
        <label for="inquiry-email">
          Email Address <span>*</span>
        </label>

        <InputText
          id="inquiry-email"
          v-model="form.email"
          type="email"
          placeholder="example@email.com"
          :invalid="!!errors.email"
          autocomplete="email"
        />

        <small v-if="errors.email" class="error">
          {{ errors.email }}
        </small>
      </div>

      <div class="form-group">
        <label for="inquiry-phone">
          Contact Number
          <span class="optional">(Optional)</span>
        </label>

        <InputText
          id="inquiry-phone"
          v-model="form.phone"
          type="tel"
          placeholder="09XXXXXXXXX"
          :invalid="!!errors.phone"
          autocomplete="tel"
        />

        <small v-if="errors.phone" class="error">
          {{ errors.phone }}
        </small>
      </div>

      <div class="form-group">
        <label for="inquiry-message">
          Your Message <span>*</span>
        </label>

        <Textarea
          id="inquiry-message"
          v-model="form.message"
          rows="5"
          autoResize
          placeholder="Hello, I'm interested in this commercial property. Could you provide more information?"
          :invalid="!!errors.message"
        />

        <small v-if="errors.message" class="error">
          {{ errors.message }}
        </small>
      </div>

      <div class="privacy-notice">
        Your contact information will be shared with the listing contact to respond to this inquiry.
      </div>

      <p v-if="submitError" class="error" role="alert">{{ submitError }}</p>

      <Button
        :label="submitting ? 'Sending…' : 'Send Inquiry'"
        type="submit"
        class="submit-button"
        :disabled="submitting"
      />

    </form>

  </div>
</template>

<style scoped>
.inquiry-container {
  background: white;
  width: 100%;
}

.sign-in-required { padding: 20px; border: 1px solid #dbeafe; border-radius: 10px; background: #f8fbff; }
.sign-in-required h3 { margin: 0 0 8px; color: #142d4e; }
.sign-in-required p { color: #64748b; font-size: 13px; line-height: 1.6; }
.account-actions { display: flex; align-items: center; gap: 14px; margin-top: 16px; }
.account-button { padding: 10px 14px; border-radius: 8px; background: #142d4e; color: #fff; font-size: 12px; font-weight: 700; text-decoration: none; }
.account-link { color: #2563eb; font-size: 12px; font-weight: 700; text-decoration: none; }

.eyebrow {
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.inquiry-header h2 {
  color: #142d4e;
  font-size: 22px;
  margin: 12px 0;
}

.inquiry-header p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

/* CONTACT PROFILE */

.contact-profile {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 20px 0;
  margin: 22px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #eaf1fc;
  color: #142d4e;
  display: grid;
  place-items: center;
  font-size: 19px;
  font-weight: 800;
  flex-shrink: 0;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.contact-details strong {
  color: #142d4e;
  font-size: 14px;
}

.contact-details span {
  color: #64748b;
  font-size: 12px;
}

/* FORM */

.inquiry-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.form-group label > span {
  color: #dc2626;
}

.form-group label .optional {
  color: #94a3b8;
  font-weight: 400;
}

.form-group :deep(.p-inputtext),
.form-group :deep(.p-textarea) {
  width: 100%;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 13px;
}

.form-group :deep(.p-inputtext:focus),
.form-group :deep(.p-textarea:focus) {
  border-color: #2563eb;
}

.error {
  color: #dc2626;
  font-size: 12px;
}

.privacy-notice {
  background: #f3f6fb;
  padding: 13px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.7;
  color: #64748b;
}

/* BUTTONS */

.submit-button {
  width: 100%;
  justify-content: center;
  background: #142d4e;
  border: 1px solid #142d4e;
  border-radius: 9px;
  padding: 13px;
  font-weight: 600;
}

.submit-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* SUCCESS MESSAGE */

.success-message {
  text-align: center;
  padding: 30px 5px;
}

.success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #e8f5ec;
  color: #15803d;
  font-size: 28px;
  display: grid;
  place-items: center;
  margin: 0 auto 18px;
}

.success-message h3 {
  color: #142d4e;
  font-size: 18px;
}

.success-message p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.reset-button {
  margin-top: 15px;
}

@media (max-width: 600px) {
  .inquiry-header h2 {
    font-size: 20px;
  }
}
</style>
