<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Mail, MessageCircle, Phone } from '@lucide/vue'
import VerifiedBadge from './VerifiedBadge.vue'
import type { Publisher } from '@/types/property'

const props = defineProps<{
  publisher: Publisher
  propertyTitle: string
}>()

const hasDirectContact = computed(() =>
  Object.values(props.publisher.contact).some(Boolean),
)

const emailLink = computed(() => {
  const email = props.publisher.contact.email
  if (!email) return null
  const subject = encodeURIComponent(`Inquiry: ${props.propertyTitle} (ButuanSpaces)`)
  return `mailto:${email}?subject=${subject}`
})
</script>

<template>
  <section class="contact-card" aria-labelledby="publisher-contact-heading">
    <p class="contact-card__eyebrow">Listed by</p>
    <h2 id="publisher-contact-heading">{{ publisher.name }}</h2>
    <VerifiedBadge :publisher="publisher" />
    <p v-if="publisher.agencyName" class="contact-card__agency">{{ publisher.agencyName }}</p>

    <div v-if="hasDirectContact" class="contact-card__actions">
      <a v-if="publisher.contact.phone" :href="`tel:${publisher.contact.phone}`" class="contact-card__button contact-card__button--primary">
        <Phone :size="17" aria-hidden="true" />
        Call {{ publisher.contact.phone }}
      </a>
      <a v-if="publisher.contact.messengerUrl" :href="publisher.contact.messengerUrl" target="_blank" rel="noopener noreferrer" class="contact-card__button">
        <MessageCircle :size="17" aria-hidden="true" />
        Messenger
      </a>
      <a v-if="publisher.contact.viberUrl" :href="publisher.contact.viberUrl" class="contact-card__button">
        <Phone :size="17" aria-hidden="true" />
        Viber
      </a>
      <a v-if="emailLink" :href="emailLink" class="contact-card__button">
        <Mail :size="17" aria-hidden="true" />
        Email
      </a>
    </div>
    <p v-else class="contact-card__note">
      This publisher hasn’t added direct contact details. Send a message with the form below.
    </p>

    <RouterLink :to="`/publishers/${publisher.id}`" class="contact-card__profile">
      View profile and other listings →
    </RouterLink>
  </section>
</template>

<style scoped>
.contact-card {
  display: grid;
  gap: 10px;
  justify-items: start;
  padding: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
}

.contact-card__eyebrow {
  margin: 0;
  color: #5e6d82;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #142d4e;
  font-size: 20px;
}

.contact-card__agency {
  margin: 0;
  color: #334155;
  font-size: 14px;
}

.contact-card__actions {
  display: grid;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
}

.contact-card__button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  color: #142d4e;
  font-weight: 700;
  text-decoration: none;
}

.contact-card__button:hover {
  border-color: #1d4ed8;
  color: #1d4ed8;
}

.contact-card__button--primary {
  border-color: #1d4ed8;
  background: #1d4ed8;
  color: #ffffff;
}

.contact-card__button--primary:hover {
  background: #1e40af;
  color: #ffffff;
}

.contact-card__note {
  margin: 0;
  color: #475569;
  font-size: 14px;
}

.contact-card__profile {
  color: #1d4ed8;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}
</style>
