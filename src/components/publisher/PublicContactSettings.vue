<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Contact } from '@lucide/vue'
import { useAuth } from '@/composables/useAuth'
import { updatePublicContact } from '@/services/authService'

const { user } = useAuth()
const form = reactive({ contactPhone: '', contactEmail: '', messengerUsername: '', viberNumber: '' })
const saving = ref(false)
const message = ref('')
const isError = ref(false)

watch(user, (current) => {
  form.contactPhone = current?.contact_phone ?? ''
  form.contactEmail = current?.contact_email ?? ''
  form.messengerUsername = current?.messenger_username ?? ''
  form.viberNumber = current?.viber_number ?? ''
}, { immediate: true })

/** Accept a full Facebook/Messenger link and keep only the username. */
function normaliseMessenger(value: string): string {
  return value.trim().replace(/^https?:\/\/(www\.|m\.)?(facebook\.com|m\.me|messenger\.com\/t)\//i, '').replace(/[/?#].*$/, '')
}

async function save() {
  saving.value = true
  message.value = ''
  try {
    user.value = await updatePublicContact({
      contact_phone: form.contactPhone.trim() || null,
      contact_email: form.contactEmail.trim() || null,
      messenger_username: normaliseMessenger(form.messengerUsername) || null,
      viber_number: form.viberNumber.trim() || null,
    })
    message.value = 'Saved. These details now appear on your listings and public profile.'
    isError.value = false
  } catch (cause) {
    message.value = cause instanceof Error ? cause.message : 'Unable to save your contact details.'
    isError.value = true
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="contact-settings" aria-labelledby="public-contact-heading">
    <Contact :size="25" aria-hidden="true" />
    <h2 id="public-contact-heading">Public contact details</h2>
    <p>
      Buyers can reach you directly from your listings without creating an account.
      Fill in only what you want shown publicly; leave a field empty to hide it.
    </p>

    <form @submit.prevent="save">
      <label for="contact-phone">Mobile number (tap to call)</label>
      <input id="contact-phone" v-model="form.contactPhone" type="tel" inputmode="tel" placeholder="09171234567" autocomplete="tel" />

      <label for="contact-email">Email</label>
      <input id="contact-email" v-model="form.contactEmail" type="email" placeholder="leasing@example.com" autocomplete="email" />

      <label for="messenger-username">Facebook / Messenger username or page link</label>
      <input id="messenger-username" v-model="form.messengerUsername" placeholder="facebook.com/yourpage" />

      <label for="viber-number">Viber number</label>
      <input id="viber-number" v-model="form.viberNumber" type="tel" inputmode="tel" placeholder="09171234567" />

      <button type="submit" :disabled="saving">{{ saving ? 'Saving…' : 'Save contact details' }}</button>
    </form>

    <p v-if="message" :class="{ error: isError }" role="status">{{ message }}</p>
    <RouterLink v-if="user" :to="`/publishers/${user.id}`" class="profile-link">View your public profile →</RouterLink>
  </section>
</template>

<style scoped>
.contact-settings {
  padding: 28px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #ffffff;
}

.contact-settings > svg {
  color: #2563eb;
}

h2 {
  margin: 10px 0;
  color: #142d4e;
  font-size: 18px;
}

p {
  color: #475569;
  font-size: 13px;
  line-height: 1.7;
}

p.error {
  color: #b91c1c;
}

form {
  display: grid;
  gap: 9px;
  margin-top: 16px;
}

label {
  color: #142d4e;
  font-size: 12px;
  font-weight: 700;
}

input {
  min-height: 42px;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

button {
  margin-top: 8px;
  padding: 12px;
  border: 0;
  border-radius: 8px;
  background: #142d4e;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
}

.profile-link {
  color: #1d4ed8;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}
</style>
