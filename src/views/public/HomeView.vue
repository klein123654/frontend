
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PropertyCard from '@/components/property/PropertyCard.vue'
import { useProperties } from '@/composables/useProperties'
import { useFormDraft } from '@/composables/useFormDraft'

const router = useRouter()

const search = ref('')
const category = ref('All Types')
const formDraft = useFormDraft('home-search', { search, category })

const categories = [
  {
    name: 'Office Spaces',
    icon: '🏢',
    description: 'Professional workspaces'
  },
  {
    name: 'Retail Spaces',
    icon: '🏬',
    description: 'Shops and storefronts'
  },
  {
    name: 'Warehouses',
    icon: '📦',
    description: 'Storage and logistics'
  },
  {
    name: 'Commercial Lots',
    icon: '🏗️',
    description: 'Land for business development'
  }
]

const { properties: featuredProperties, load } = useProperties()
onMounted(() => load({}))
const recentProperties = computed(() => featuredProperties.value.slice(0, 3))

function searchProperties() {
  formDraft.clear()
  router.push({
    path: '/properties',
    query: {
      ...(search.value.trim() && {
        search: search.value.trim()
      }),
      ...(category.value !== 'All Types' && {
        type: category.value
      })
    }
  })
}

function selectCategory(name: string) {
  category.value = name
  searchProperties()
}
</script>

<template>
  <main id="home">

    <!-- HERO SECTION -->
    <section class="hero">
      <div class="container hero-content">

        <span class="eyebrow">
          COMMERCIAL REAL ESTATE IN BUTUAN CITY
        </span>

        <h1>
          Find the right space<br />
          for your <span>next big move.</span>
        </h1>

        <p>
          Discover commercial spaces, offices, retail properties,
          and business locations across Butuan City.
        </p>

        <form
          class="search-panel"
          @submit.prevent="searchProperties"
        >
          <input
            v-model="search"
            type="search"
            placeholder="Search property or location..."
            aria-label="Search properties"
          />

          <select
            v-model="category"
            aria-label="Property category"
          >
            <option value="All Types">All Types</option>

            <option
              v-for="item in categories"
              :key="item.name"
              :value="item.name"
            >
              {{ item.name }}
            </option>
          </select>

          <button
            class="primary-button"
            type="submit"
          >
            Search Properties →
          </button>
        </form>

      </div>
    </section>

    <!-- PROPERTY CATEGORIES -->
    <section
      id="categories"
      class="section container"
    >

      <div class="section-header">
        <div>
          <span class="eyebrow">
            EXPLORE PROPERTY TYPES
          </span>

          <h2>
            Find a space that fits your business.
          </h2>
        </div>
      </div>

      <div class="category-grid">

        <button
          v-for="item in categories"
          :key="item.name"
          class="category-card"
          type="button"
          @click="selectCategory(item.name)"
        >

          <span class="category-icon">
            {{ item.icon }}
          </span>

          <strong>
            {{ item.name }}
          </strong>

          <span class="category-description">
            {{ item.description }}
          </span>

          <span class="category-arrow">
            Explore →
          </span>

        </button>

      </div>

    </section>

    <!-- FEATURED PROPERTIES -->
    <section
      id="properties"
      class="section listings-section"
    >

      <div class="container">

        <div class="section-header">

          <div>
            <span class="eyebrow">
              DISCOVER SPACES
            </span>

            <h2>
              Recent Commercial Properties
            </h2>

            <p>
              Explore commercial property listings
              across Butuan City.
            </p>
          </div>

        </div>

        <!-- REUSABLE PROPERTY CARDS -->
        <div
          v-if="recentProperties.length"
          class="property-grid"
        >

          <PropertyCard
            v-for="property in recentProperties"
            :key="property.id"
            :property="property"
          />

        </div>

        <div
          v-else
          class="empty-results"
        >
          No published properties are available yet.
        </div>

        <!-- VIEW ALL PROPERTIES -->
        <div class="browse-action">

          <RouterLink
            to="/properties"
            class="browse-link"
          >
            View All Properties →
          </RouterLink>

        </div>

      </div>

    </section>

    <!-- ABOUT / HOW IT WORKS -->
    <section
      id="about"
      class="section container about-section"
    >

      <span class="eyebrow">
        SIMPLE PROPERTY DISCOVERY
      </span>

      <h2>
        Connecting businesses with the right spaces.
      </h2>

      <p class="about-description">
        ButuanSpaces is designed to simplify commercial
        property discovery by connecting interested
        customers with property owners and authorized
        real estate professionals.
      </p>

      <div class="steps-grid">

        <div class="step-card">

          <span class="step-number">
            01
          </span>

          <h3>Explore</h3>

          <p>
            Browse commercial properties
            available throughout Butuan City.
          </p>

        </div>

        <div class="step-card">

          <span class="step-number">
            02
          </span>

          <h3>Discover</h3>

          <p>
            Review property features,
            locations, prices, and specifications.
          </p>

        </div>

        <div class="step-card">

          <span class="step-number">
            03
          </span>

          <h3>Connect</h3>

          <p>
            Send inquiries directly to
            property owners or licensed brokers.
          </p>

        </div>

      </div>

    </section>

  </main>
</template>

<style scoped>

/* GENERAL LAYOUT */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.section {
  padding-top: 90px;
  padding-bottom: 90px;
}

.eyebrow {
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

/* HERO SECTION */

.hero {
  padding: 115px 0;
  background: linear-gradient(
    125deg,
    #f0f5fc,
    #ffffff 65%,
    #eaf1fc
  );
}

.hero-content {
  text-align: center;
}

.hero h1 {
  color: #142d4e;
  font-size: clamp(37px, 5vw, 64px);
  letter-spacing: -2px;
  line-height: 1.13;
  margin: 22px 0;
}

.hero h1 span {
  color: #2563eb;
}

.hero p {
  color: #64748b;
  font-size: 17px;
  line-height: 1.8;
  max-width: 640px;
  margin: 0 auto;
}

/* SEARCH */

.search-panel {
  display: flex;
  gap: 12px;
  background: white;
  padding: 12px;
  max-width: 850px;
  margin: 38px auto 0;
  border: 1px solid #e2e8f0;
  box-shadow: 0 14px 45px #142d4e12;
  border-radius: 14px;
}

.search-panel input,
.search-panel select {
  min-width: 0;
  flex: 1;
  border: 0;
  padding: 16px;
  font: inherit;
  background: white;
  color: #334155;
  outline-color: #2563eb;
}

.primary-button {
  border: 0;
  border-radius: 9px;
  padding: 16px 24px;
  color: white;
  background: #142d4e;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-button:hover {
  background: #2563eb;
}

/* SECTION HEADINGS */

.section-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
}

h2 {
  font-size: clamp(25px, 3vw, 37px);
  letter-spacing: -1px;
  color: #142d4e;
  margin: 13px 0;
}

.section-header p {
  color: #64748b;
  line-height: 1.8;
}

/* CATEGORIES */

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.category-card {
  text-align: left;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  font: inherit;
  color: #142d4e;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px #142d4e12;
}

.category-icon {
  font-size: 31px;
}

.category-card strong {
  font-size: 17px;
}

.category-description {
  color: #64748b;
  font-size: 13px;
}

.category-arrow {
  color: #2563eb;
  font-weight: 600;
  margin-top: 12px;
}

/* FEATURED PROPERTIES */

.listings-section {
  background: #f7f9fc;
}

.demo-label {
  color: #64748b;
  font-size: 13px;
}

.property-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.empty-results {
  padding: 36px;
  text-align: center;
  color: #64748b;
}

/* VIEW ALL BUTTON */

.browse-action {
  margin-top: 35px;
  text-align: center;
}

.browse-link {
  display: inline-block;
  padding: 14px 24px;
  background: #142d4e;
  border-radius: 9px;
  color: white;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}

.browse-link:hover {
  background: #2563eb;
}

/* ABOUT SECTION */

.about-section {
  text-align: center;
}

.about-description {
  max-width: 640px;
  margin: 0 auto 45px;
  color: #64748b;
  line-height: 1.8;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  text-align: left;
}

.step-card {
  border: 1px solid #e2e8f0;
  padding: 28px;
  border-radius: 14px;
}

.step-number {
  color: #2563eb;
  font-weight: 800;
  font-size: 24px;
}

.step-card h3 {
  color: #142d4e;
}

.step-card p {
  color: #64748b;
  line-height: 1.7;
}

/* RESPONSIVE DESIGN */

@media (max-width: 850px) {

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .property-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .search-panel {
    flex-direction: column;
  }

}

@media (max-width: 600px) {

  .hero {
    padding: 75px 0;
  }

  .category-grid,
  .property-grid,
  .steps-grid {
    grid-template-columns: 1fr;
  }

  .section {
    padding-top: 65px;
    padding-bottom: 65px;
  }

  .section-header {
    align-items: start;
    flex-direction: column;
  }

}

</style>
