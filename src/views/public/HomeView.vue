<script setup lang="ts">
import { formatPeso } from '@/utils/format'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight,
  Building2,
  Building,
  Factory,
  MapPin,
  RefreshCw,
  Search,
  Store,
} from '@lucide/vue'
import PropertyCard from '@/components/property/PropertyCard.vue'
import { useProperties } from '@/composables/useProperties'
import { useFormDraft } from '@/composables/useFormDraft'
import type { ListingType, PropertyType } from '@/types/property'

const router = useRouter()
const search = ref('')
const category = ref('All Types')
const transactionType = ref('All Listings')
const formDraft = useFormDraft('home-search', { search, category })

const categories: Array<{
  name: PropertyType
  description: string
  icon: typeof Building2
}> = [
  { name: 'Office Spaces', description: 'Workspaces for growing teams', icon: Building },
  { name: 'Retail Spaces', description: 'Storefronts and customer-facing units', icon: Store },
  { name: 'Warehouses', description: 'Storage and distribution space', icon: Factory },
  { name: 'Commercial Lots', description: 'Sites for your next development', icon: Building2 },
]

const transactionTypes = ['All Listings', 'For Sale', 'For Rent', 'For Lease'] as const
const { properties, loading, error, total, load } = useProperties()
const featuredProperty = computed(() => properties.value[0] ?? null)
const otherProperties = computed(() => properties.value.slice(1, 5))
const propertyCountLabel = computed(() => `${total.value} published ${total.value === 1 ? 'property' : 'properties'}`)

onMounted(() => {
  void load()
})

function searchProperties() {
  formDraft.clear()
  void router.push({
    path: '/properties',
    query: {
      ...(search.value.trim() ? { search: search.value.trim() } : {}),
      ...(category.value !== 'All Types' ? { type: category.value } : {}),
      ...(transactionType.value !== 'All Listings' ? { listing: transactionType.value } : {}),
    },
  })
}

function selectCategory(name: PropertyType) {
  category.value = name
  searchProperties()
}

function setTransactionType(value: string) {
  transactionType.value = value
}

function formatPrice(price: number, listingType: ListingType): string {
  if (!price) return 'Contact for pricing'

  const formatted = formatPeso(price)

  return listingType === 'For Rent' ? `${formatted} / month` : formatted
}
</script>

<template>
  <main id="home">
    <section class="hero" aria-labelledby="home-title">
      <img
        class="hero-image"
        src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=75"
        srcset="
          https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=75 800w,
          https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=75 1600w,
          https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=75 2200w
        "
        sizes="100vw"
        alt=""
        fetchpriority="high"
      />
      <div class="hero-shade"></div>

      <div class="container hero-inner">
        <div class="hero-copy">
          <span class="eyebrow">BUTUAN CITY · COMMERCIAL PROPERTY</span>
          <h1 id="home-title">Make room for<br />what your business does next.</h1>
          <p>Find offices, retail units, warehouses, and development sites from local owners and brokers.</p>
        </div>

        <form class="search-panel" @submit.prevent="searchProperties">
          <div class="transaction-tabs" role="group" aria-label="Listing transaction type">
            <button
              v-for="type in transactionTypes"
              :key="type"
              type="button"
              :class="{ active: transactionType === type }"
              :aria-pressed="transactionType === type"
              @click="setTransactionType(type)"
            >
              {{ type }}
            </button>
          </div>

          <div class="search-controls">
            <label class="sr-only" for="home-category">Property type</label>
            <select id="home-category" v-model="category">
              <option>All Types</option>
              <option v-for="item in categories" :key="item.name">{{ item.name }}</option>
            </select>

            <label class="sr-only" for="home-search">Search property or location</label>
            <div class="search-input-wrap">
              <Search :size="17" aria-hidden="true" />
              <input
                id="home-search"
                v-model="search"
                type="search"
                placeholder="Location, property, or business need"
              />
            </div>

            <button class="search-button" type="submit">
              <Search :size="17" aria-hidden="true" />
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>
      <div class="hero-caption">Commercial spaces across Butuan City</div>
    </section>

    <section id="categories" class="category-strip container" aria-labelledby="category-heading">
      <div class="section-intro">
        <span class="eyebrow">START WITH THE SPACE</span>
        <h2 id="category-heading">Browse commercial property</h2>
      </div>
      <div class="category-list">
        <button
          v-for="item in categories"
          :key="item.name"
          class="category-link"
          type="button"
          @click="selectCategory(item.name)"
        >
          <span class="category-icon"><component :is="item.icon" :size="20" aria-hidden="true" /></span>
          <span class="category-copy">
            <strong>{{ item.name }}</strong>
            <small>{{ item.description }}</small>
          </span>
          <ArrowRight :size="16" class="category-arrow" aria-hidden="true" />
        </button>
      </div>
    </section>

    <section id="properties" class="listing-section" aria-labelledby="listing-heading">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="eyebrow">LIVE LOCAL INVENTORY</span>
            <h2 id="listing-heading">Commercial spaces in Butuan</h2>
            <p>Listings published by property owners and brokers.</p>
          </div>
          <div class="section-action">
            <span v-if="!loading && !error" class="inventory-count">{{ propertyCountLabel }}</span>
            <RouterLink to="/properties" class="text-link">Browse all <ArrowRight :size="16" /></RouterLink>
          </div>
        </div>

        <div v-if="loading" class="listing-loading" role="status" aria-live="polite">
          <span v-for="index in 4" :key="index" class="listing-skeleton"></span>
          <span class="sr-only">Loading commercial properties</span>
        </div>

        <div v-else-if="error" class="listing-state error-state" role="alert">
          <div>
            <strong>We couldn’t load current listings.</strong>
            <p>{{ error }}</p>
          </div>
          <button type="button" class="retry-button" @click="load()">
            <RefreshCw :size="16" /> Retry
          </button>
        </div>

        <template v-else-if="featuredProperty">
          <RouterLink :to="`/properties/${featuredProperty.id}`" class="featured-property">
            <div class="featured-image-wrap">
              <img decoding="async"
                v-if="featuredProperty.images[0]"
                :src="featuredProperty.images[0]"
                :alt="featuredProperty.title"
                loading="lazy"
              />
              <div v-else class="featured-placeholder"><Building2 :size="34" /></div>
              <span class="featured-label">FEATURED LISTING</span>
            </div>
            <div class="featured-details">
              <span class="property-type">{{ featuredProperty.type }}</span>
              <h3>{{ featuredProperty.title }}</h3>
              <p class="featured-location"><MapPin :size="15" /> {{ featuredProperty.location }}</p>
              <p class="featured-description">{{ featuredProperty.description }}</p>
              <div class="featured-bottom">
                <strong>{{ formatPrice(featuredProperty.price, featuredProperty.listingType) }}</strong>
                <span>{{ featuredProperty.area ? `${featuredProperty.area} sqm` : featuredProperty.listingType }}</span>
              </div>
              <span class="featured-cta">View listing <ArrowRight :size="16" /></span>
            </div>
          </RouterLink>

          <div v-if="otherProperties.length" class="property-grid">
            <PropertyCard
              v-for="property in otherProperties"
              :key="property.id"
              :property="property"
            />
          </div>
        </template>

        <div v-else class="listing-state empty-state">
          <div class="empty-icon"><Building2 :size="23" /></div>
          <div>
            <strong>New commercial listings are on the way.</strong>
            <p>There are no published properties to display right now. Check back soon or browse by property type.</p>
          </div>
          <RouterLink to="/properties" class="retry-button">Explore search <ArrowRight :size="16" /></RouterLink>
        </div>
      </div>
    </section>

    <section class="publisher-band">
      <div class="container publisher-content">
        <div>
          <span class="eyebrow">FOR OWNERS, DEVELOPERS & BROKERS</span>
          <h2>Put your commercial property in front of local businesses.</h2>
          <p>Create a listing, manage inquiries, and connect with prospective tenants and buyers.</p>
        </div>
        <RouterLink to="/publisher/apply" class="publisher-button">List a property <ArrowRight :size="17" /></RouterLink>
      </div>
    </section>

    <section class="how-section container" aria-labelledby="how-heading">
      <div class="section-intro">
        <span class="eyebrow">A CLEARER WAY TO CONNECT</span>
        <h2 id="how-heading">From property search to first conversation.</h2>
      </div>
      <div class="steps-row">
        <article class="step-item">
          <span class="step-index">01</span>
          <h3>Search the market</h3>
          <p>Filter commercial spaces by property type, location, and listing details.</p>
        </article>
        <article class="step-item">
          <span class="step-index">02</span>
          <h3>Compare listings</h3>
          <p>Review published information and find properties that fit your operation.</p>
        </article>
        <article class="step-item">
          <span class="step-index">03</span>
          <h3>Contact the listing</h3>
          <p>Send an inquiry directly to the property owner or representing broker.</p>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.container {
  width: min(1200px, 100% - 48px);
  margin-inline: auto;
}

.hero {
  position: relative;
  display: flex;
  min-height: 470px;
  align-items: center;
  overflow: hidden;
  isolation: isolate;
  background: #253c3a;
}

.hero-image,
.hero-shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-image {
  z-index: -2;
  object-fit: cover;
  object-position: center 52%;
}

.hero-shade {
  z-index: -1;
  background: linear-gradient(90deg, rgb(14 29 31 / 76%) 0%, rgb(14 29 31 / 51%) 52%, rgb(14 29 31 / 16%) 100%);
}

.hero-inner {
  padding-block: 54px 68px;
}

.hero-copy {
  max-width: 660px;
  color: #fff;
}

.eyebrow {
  display: block;
  color: #087e75;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.4;
  text-transform: uppercase;
}

.hero .eyebrow { color: #c5e8df; }

.hero h1 {
  max-width: 640px;
  margin: 14px 0 10px;
  color: #fff;
  font-size: 48px;
  line-height: 1.08;
  font-weight: 750;
}

.hero-copy > p {
  max-width: 530px;
  margin: 0;
  color: #f1f5f2;
  font-size: 15px;
  line-height: 1.65;
}

.search-panel {
  max-width: 880px;
  margin-top: 27px;
  padding: 0 16px 15px;
  border-radius: 7px;
  background: rgb(21 31 32 / 83%);
  box-shadow: 0 10px 28px rgb(0 0 0 / 15%);
  backdrop-filter: blur(8px);
}

.transaction-tabs {
  display: flex;
  min-height: 44px;
  gap: 20px;
  border-bottom: 1px solid rgb(255 255 255 / 23%);
}

.transaction-tabs button {
  position: relative;
  padding: 0 2px;
  border: 0;
  background: transparent;
  color: #d8e0dc;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}

.transaction-tabs button.active {
  color: #fff;
  font-weight: 700;
}

.transaction-tabs button.active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: #55b9a4;
  content: '';
}

.search-controls {
  display: grid;
  grid-template-columns: 180px minmax(180px, 1fr) auto;
  gap: 9px;
  padding-top: 12px;
}

.search-controls select,
.search-input-wrap,
.search-button {
  min-height: 44px;
  border: 0;
  border-radius: 4px;
}

.search-controls select,
.search-input-wrap {
  background: #fff;
  color: #334155;
}

.search-controls select {
  padding: 0 13px;
  font: inherit;
  font-size: 12px;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  color: #81908d;
}

.search-input-wrap input {
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #263c39;
  font: inherit;
  font-size: 12px;
}

.search-button,
.publisher-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-inline: 17px;
  background: #087e75;
  color: white;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: background .18s ease;
}

.search-button:hover,
.publisher-button:hover { background: #06665f; }

.hero-caption {
  position: absolute;
  right: max(24px, calc((100vw - 1200px) / 2));
  bottom: 15px;
  color: rgb(255 255 255 / 82%);
  font-size: 10px;
}

.category-strip {
  padding-block: 34px 38px;
}

.section-intro h2,
.section-heading h2,
.publisher-content h2 {
  margin: 8px 0 7px;
  color: #173a39;
  font-size: 24px;
  line-height: 1.2;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 18px;
  border: 1px solid #e2eae7;
  border-radius: 7px;
  background: #fff;
}

.category-link {
  display: flex;
  min-width: 0;
  min-height: 78px;
  align-items: center;
  gap: 11px;
  padding: 13px 15px;
  border: 0;
  border-right: 1px solid #e8eeeb;
  background: transparent;
  color: #253d3a;
  cursor: pointer;
  text-align: left;
}

.category-link:last-child { border-right: 0; }
.category-link:hover { background: #f4f9f7; }

.category-icon {
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 6px;
  background: #e9f4f0;
  color: #087e75;
}

.category-copy { display: grid; min-width: 0; gap: 4px; }
.category-copy strong { font-size: 12px; }
.category-copy small { color: #626f6c; font-size: 10px; line-height: 1.35; }
.category-arrow { flex: 0 0 auto; margin-left: auto; color: #899893; }

.listing-section {
  padding-block: 36px 48px;
  background: #f6f8f7;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.section-heading h2 { margin-bottom: 5px; }
.section-heading p { margin: 0; color: #616f6b; font-size: 12px; }

.section-action {
  display: flex;
  align-items: center;
  gap: 18px;
  flex: 0 0 auto;
}

.inventory-count { color: #5f6b67; font-size: 11px; }

.text-link,
.featured-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #087e75;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.featured-property {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, .8fr);
  min-height: 300px;
  overflow: hidden;
  border: 1px solid #e0e7e4;
  border-radius: 7px;
  background: #fff;
  color: inherit;
  text-decoration: none;
}

.featured-image-wrap { position: relative; min-height: 300px; background: #dce8e2; }
.featured-image-wrap > img { width: 100%; height: 100%; position: absolute; inset: 0; object-fit: cover; }
.featured-placeholder { display: grid; width: 100%; height: 100%; min-height: 300px; place-items: center; color: #658079; }

.featured-label {
  position: absolute;
  top: 13px;
  left: 13px;
  padding: 7px 9px;
  border-radius: 3px;
  background: #173a39;
  color: white;
  font-size: 9px;
  font-weight: 800;
}

.featured-details { display: flex; flex-direction: column; align-items: flex-start; padding: 25px 23px; }
.property-type { color: #087e75; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.featured-details h3 { margin: 9px 0; color: #173a39; font-size: 21px; line-height: 1.25; }
.featured-location { display: flex; align-items: center; gap: 5px; color: #616f6b; font-size: 11px; }
.featured-description { display: -webkit-box; overflow: hidden; margin: 13px 0; color: #596b67; font-size: 12px; line-height: 1.6; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.featured-bottom { display: flex; width: 100%; align-items: baseline; justify-content: space-between; gap: 10px; margin-top: auto; padding-top: 13px; border-top: 1px solid #e9efec; }
.featured-bottom strong { color: #173a39; font-size: 17px; }
.featured-bottom span { color: #646e6b; font-size: 10px; }
.featured-cta { margin-top: 16px; }

.property-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 17px;
}

.listing-loading {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.listing-skeleton {
  height: 260px;
  border-radius: 7px;
  background: linear-gradient(100deg, #e8eeeb 20%, #f4f7f5 40%, #e8eeeb 60%);
  background-size: 200% 100%;
  animation: skeleton 1.4s ease-in-out infinite;
}

.listing-state {
  display: flex;
  min-height: 112px;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border: 1px solid #e0e7e4;
  border-radius: 7px;
  background: white;
}

.listing-state > div:nth-child(2),
.listing-state > div:first-child { flex: 1; min-width: 0; }
.listing-state strong { color: #173a39; font-size: 13px; }
.listing-state p { margin: 5px 0 0; color: #616f6b; font-size: 12px; line-height: 1.55; }
.error-state { border-color: #e7c5be; background: #fffaf9; }
.error-state strong { color: #913d30; }

.retry-button {
  display: inline-flex;
  min-height: 37px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid #b8d7cf;
  border-radius: 5px;
  background: white;
  color: #087e75;
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
}

.empty-icon { display: grid; width: 42px; height: 42px; flex: 0 0 42px; place-items: center; border-radius: 6px; background: #edf5f1; color: #087e75; }

.publisher-band { padding-block: 39px; background: #e8f2ef; }
.publisher-band .eyebrow { color: #066b63; }
.publisher-content { display: flex; align-items: center; justify-content: space-between; gap: 30px; }
.publisher-content > div { max-width: 680px; }
.publisher-content h2 { margin: 8px 0; font-size: 25px; }
.publisher-content p { margin: 0; color: #5e716c; font-size: 12px; line-height: 1.6; }
.publisher-button { min-height: 42px; flex: 0 0 auto; border-radius: 4px; }

.how-section { padding-block: 48px 62px; }
.steps-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; margin-top: 23px; }
.step-item { position: relative; padding: 16px 18px 10px 0; border-top: 1px solid #dce6e2; }
.step-index { color: #087e75; font-size: 10px; font-weight: 800; }
.step-item h3 { margin: 8px 0 6px; color: #173a39; font-size: 15px; }
.step-item p { max-width: 310px; margin: 0; color: #616f6b; font-size: 12px; line-height: 1.6; }

.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

@keyframes skeleton { to { background-position-x: -200%; } }

@media (max-width: 950px) {
  .category-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .category-link:nth-child(2) { border-right: 0; }
  .category-link:nth-child(-n + 2) { border-bottom: 1px solid #e8eeeb; }
  .property-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .listing-loading { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 650px) {
  .container { width: min(100% - 32px, 1200px); }
  .hero { min-height: 540px; align-items: flex-start; }
  .hero-image { object-position: 58% center; }
  .hero-shade { background: linear-gradient(90deg, rgb(14 29 31 / 80%), rgb(14 29 31 / 43%)); }
  .hero-inner { padding-block: 54px 66px; }
  .hero h1 { max-width: 440px; font-size: 38px; }
  .hero-copy > p { max-width: 390px; font-size: 13px; }
  .search-panel { margin-top: 24px; padding-inline: 11px; }
  .transaction-tabs { gap: 16px; }
  .transaction-tabs button { font-size: 11px; }
  .search-controls { grid-template-columns: minmax(0, 1fr) auto; }
  .search-controls select { grid-column: 1 / -1; }
  .search-input-wrap { min-height: 43px; }
  .search-button { padding-inline: 12px; }
  .search-button span { display: none; }
  .hero-caption { right: 16px; bottom: 12px; }
  .category-strip { padding-block: 28px; }
  .section-intro h2, .section-heading h2 { font-size: 21px; }
  .category-link { min-height: 71px; padding: 10px; gap: 8px; }
  .category-icon { width: 32px; height: 32px; flex-basis: 32px; }
  .category-copy strong { font-size: 10px; }
  .category-copy small { font-size: 9px; }
  .category-arrow { display: none; }
  .listing-section { padding-block: 30px 34px; }
  .section-heading { align-items: flex-start; flex-direction: column; gap: 12px; }
  .section-action { width: 100%; justify-content: space-between; }
  .featured-property { grid-template-columns: 1fr; }
  .featured-image-wrap { min-height: 220px; }
  .featured-placeholder { min-height: 220px; }
  .featured-details { padding: 19px; }
  .featured-details h3 { font-size: 18px; }
  .property-grid { grid-template-columns: 1fr; }
  .listing-loading { grid-template-columns: 1fr 1fr; gap: 10px; }
  .listing-skeleton { height: 200px; }
  .listing-state { align-items: flex-start; flex-wrap: wrap; padding: 16px; }
  .listing-state .retry-button { margin-left: 56px; }
  .publisher-content { align-items: flex-start; flex-direction: column; gap: 17px; }
  .publisher-content h2 { font-size: 21px; }
  .steps-row { grid-template-columns: 1fr; gap: 10px; }
  .how-section { padding-block: 36px 45px; }
}
</style>
