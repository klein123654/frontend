<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { CalendarDays, Mail, MessageCircle, Phone } from '@lucide/vue'
import PropertyCard from '@/components/property/PropertyCard.vue'
import VerifiedBadge from '@/components/publisher/VerifiedBadge.vue'
import ShareListing from '@/components/property/ShareListing.vue'
import { fetchPublicProperties, fetchPublisher } from '@/services/propertyService'
import { setPageMeta } from '@/utils/pageMeta'
import type { Property, Publisher } from '@/types/property'

const route = useRoute()
const publisher = ref<Publisher | null>(null)
const listings = ref<Property[]>([])
const loading = ref(true)
const error = ref('')

const memberSince = computed(() =>
  publisher.value?.memberSince
    ? new Date(publisher.value.memberSince).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
    : '',
)
const profileUrl = computed(() =>
  publisher.value && typeof window !== 'undefined' ? `${window.location.origin}/publishers/${publisher.value.id}` : '',
)

async function load() {
  const id = String(route.params.id ?? '')
  loading.value = true
  error.value = ''
  publisher.value = null
  listings.value = []
  try {
    const [profile, results] = await Promise.all([
      fetchPublisher(id),
      fetchPublicProperties({ publisherId: Number(id), perPage: 50 }),
    ])
    publisher.value = profile
    listings.value = results.properties
    setPageMeta(
      `${profile.name} – ${profile.roleLabel} in Butuan City`,
      `${profile.name}${profile.agencyName ? ` (${profile.agencyName})` : ''} is a verified ${profile.roleLabel.toLowerCase()} on ButuanSpaces with ${results.total} active commercial listings in Butuan City.`,
    )
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'This profile could not be loaded.'
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })
</script>

<template>
  <main class="profile-page">
    <RouterLink to="/properties" class="back">← Browse all properties</RouterLink>

    <p v-if="loading" class="status" role="status">Loading profile…</p>

    <section v-else-if="!publisher" class="missing">
      <h1>Profile not found</h1>
      <p>This publisher doesn’t exist or isn’t verified.</p>
      <p v-if="error" class="error">{{ error }}</p>
    </section>

    <template v-else>
      <header class="profile-header">
        <div class="avatar" aria-hidden="true">{{ publisher.name.charAt(0).toUpperCase() }}</div>
        <div class="identity">
          <h1>{{ publisher.name }}</h1>
          <VerifiedBadge :publisher="publisher" />
          <p v-if="publisher.agencyName" class="agency">{{ publisher.agencyName }}</p>
          <p v-if="memberSince" class="since">
            <CalendarDays :size="15" aria-hidden="true" /> On ButuanSpaces since {{ memberSince }}
          </p>
        </div>
      </header>

      <section class="contact" aria-labelledby="contact-heading">
        <h2 id="contact-heading">Contact</h2>
        <div v-if="Object.values(publisher.contact).some(Boolean)" class="contact-links">
          <a v-if="publisher.contact.phone" :href="`tel:${publisher.contact.phone}`" class="contact-link contact-link--primary">
            <Phone :size="17" aria-hidden="true" /> Call {{ publisher.contact.phone }}
          </a>
          <a v-if="publisher.contact.messengerUrl" :href="publisher.contact.messengerUrl" target="_blank" rel="noopener noreferrer" class="contact-link">
            <MessageCircle :size="17" aria-hidden="true" /> Messenger
          </a>
          <a v-if="publisher.contact.viberUrl" :href="publisher.contact.viberUrl" class="contact-link">
            <Phone :size="17" aria-hidden="true" /> Viber
          </a>
          <a v-if="publisher.contact.email" :href="`mailto:${publisher.contact.email}`" class="contact-link">
            <Mail :size="17" aria-hidden="true" /> {{ publisher.contact.email }}
          </a>
        </div>
        <p v-else class="muted">No direct contact details yet. Open any listing below to send a message.</p>
        <ShareListing :title="`${publisher.name} on ButuanSpaces`" :url="profileUrl" class="share" />
      </section>

      <section aria-labelledby="listings-heading">
        <h2 id="listings-heading">Active listings ({{ listings.length }})</h2>
        <div v-if="listings.length" class="grid">
          <PropertyCard v-for="listing in listings" :key="listing.id" :property="listing" />
        </div>
        <p v-else class="muted">No active listings right now.</p>
      </section>
    </template>
  </main>
</template>

<style scoped>
.profile-page {
  display: grid;
  gap: 28px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 16px 80px;
}

.back {
  color: #1d4ed8;
  font-size: 14px;
  text-decoration: none;
}

.status,
.muted {
  color: #475569;
}

.error {
  color: #b91c1c;
}

.profile-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}

.avatar {
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: #142d4e;
  color: #ffffff;
  font-size: 34px;
  font-weight: 800;
}

.identity {
  display: grid;
  gap: 8px;
  justify-items: start;
}

h1 {
  margin: 0;
  color: #142d4e;
  font-size: clamp(26px, 4vw, 36px);
}

h2 {
  margin: 0 0 14px;
  color: #142d4e;
  font-size: 20px;
}

.agency {
  margin: 0;
  color: #334155;
  font-weight: 600;
}

.since {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: #475569;
  font-size: 14px;
}

.contact {
  padding: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.contact-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  color: #142d4e;
  font-weight: 700;
  text-decoration: none;
}

.contact-link--primary {
  border-color: #1d4ed8;
  background: #1d4ed8;
  color: #ffffff;
}

.share {
  margin-top: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 22px;
}
</style>
