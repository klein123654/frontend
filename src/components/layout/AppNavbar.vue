
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)
const { user, logout } = useAuth()

const activeNav = computed(() => {
  if (route.path.startsWith('/properties')) {
    return 'properties'
  }

  if (route.hash === '#categories') {
    return 'categories'
  }

  return route.path === '/' ? 'home' : ''
})

function closeMenu() {
  menuOpen.value = false
}

function goToLogin() {
  closeMenu()
  void router.push('/login')
}

function goToRegistration() {
  closeMenu()
  void router.push('/register')
}

function dashboardPath() {
  const paths = {
    buyer: '/buyer/dashboard',
    owner: '/owner/dashboard',
    broker: '/broker/dashboard',
    developer: '/developer/dashboard',
    admin: '/admin/dashboard',
  }

  return user.value ? paths[user.value.role] : '/login'
}

async function signOut() {
  closeMenu()
  await logout()
  await router.push('/login')
}

function becomePublisher() {
  closeMenu()
  void router.push('/publisher/apply')
}
</script>

<template>
  <header class="navbar">
    <div class="nav-container">

      <!-- LOGO -->
      <RouterLink to="/" class="brand" @click="closeMenu">
        <span class="brand-icon">B</span>
        <span>
          Butuan<span class="brand-accent">Spaces</span>
        </span>
      </RouterLink>

      <!-- MOBILE MENU -->
      <button
        class="mobile-toggle"
        type="button"
        aria-label="Toggle navigation"
        :aria-expanded="menuOpen"
        aria-controls="main-navigation"
        @click="menuOpen = !menuOpen"
      >
        {{ menuOpen ? '✕' : '☰' }}
      </button>

      <!-- NAVIGATION LINKS -->
      <nav
        id="main-navigation"
        :class="['nav-links', { open: menuOpen }]"
        aria-label="Main navigation"
      >
        <RouterLink
          to="/"
          :class="{ active: activeNav === 'home' }"
          @click="closeMenu"
        >
          Home
        </RouterLink>

        <RouterLink
          to="/#categories"
          :class="{ active: activeNav === 'categories' }"
          @click="closeMenu"
        >
          Categories
        </RouterLink>

        <RouterLink
          to="/properties"
          :class="{ active: activeNav === 'properties' }"
          @click="closeMenu"
        >
          Properties
        </RouterLink>

        <template v-if="user && user.role !== 'admin'">
          <RouterLink to="/buyer/saved-properties" @click="closeMenu">Saved Properties</RouterLink>
          <RouterLink to="/buyer/inquiries" @click="closeMenu">My Inquiries</RouterLink>
        </template>

        <!-- ACCOUNT ACTIONS -->
        <div class="nav-actions">
          <template v-if="user">
            <template v-if="user.role === 'buyer'">
              <Button label="Become a Publisher" severity="secondary" text @click="becomePublisher" />
              <Button label="Sign Out" severity="secondary" text @click="signOut" />
            </template>
            <template v-else>
              <Button label="Dashboard" severity="secondary" text @click="router.push(dashboardPath())" />
              <Button label="Sign Out" class="list-property-btn" @click="signOut" />
            </template>
          </template>
          <template v-else>
            <Button
              label="Log In"
              severity="secondary"
              text
              @click="goToLogin"
            />
            <Button
              label="Sign Up"
              class="list-property-btn"
              @click="goToRegistration"
            />
          </template>
        </div>
      </nav>

    </div>
  </header>
</template>

<style scoped>
/* HEADER */

.navbar {
  background: #ffffff;
  border-bottom: 1px solid #e9edf3;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  min-height: 76px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

/* BRAND */

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 21px;
  font-weight: 800;
  color: #142d4e;
  text-decoration: none;
  white-space: nowrap;
}

.brand-icon {
  background: #142d4e;
  color: white;
  padding: 9px 14px;
  border-radius: 10px;
}

.brand-accent {
  color: #2563eb;
}

/* DESKTOP NAVIGATION */

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-links a {
  color: #475569;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #2563eb;
}

.nav-links a.active {
  color: #2563eb;
  font-weight: 700;
}

/* ACCOUNT BUTTONS */

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 40px;
  padding-left: 24px;
  border-left: 1px solid #e2e8f0;
}

.nav-actions :deep(.p-button) {
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
}

.nav-actions :deep(.list-property-btn) {
  background: #142d4e;
  border: 1px solid #142d4e;
  color: #ffffff;
  border-radius: 8px;
  padding: 11px 18px;
  font-weight: 600;
  transition: background 0.2s, border-color 0.2s;
}

.nav-actions :deep(.list-property-btn:hover) {
  background: #2563eb;
  border-color: #2563eb;
}

/* MOBILE MENU BUTTON */

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  color: #142d4e;
  font-size: 25px;
  cursor: pointer;
}

/* TABLET AND MOBILE */

@media (max-width: 1050px) {
  .mobile-toggle {
    display: block;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #ffffff;
    padding: 24px;
    flex-direction: column;
    align-items: stretch;
    gap: 22px;
    border-top: 1px solid #e9edf3;
    box-shadow: 0 12px 25px #142d4e12;
  }

  .nav-links.open {
    display: flex;
  }

  .nav-links a {
    font-size: 15px;
  }

  .nav-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-left: 0;
    margin-top: 8px;
    padding-left: 0;
    padding-top: 20px;
    border-left: none;
    border-top: 1px solid #e2e8f0;
  }

  .nav-actions :deep(.p-button) {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 16px;
  }

  .brand {
    font-size: 19px;
  }

  .brand-icon {
    padding: 8px 12px;
  }
}
</style>
