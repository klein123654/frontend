
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

type DashboardRole = 'owner' | 'broker' | 'admin'

type NavigationIcon =
  | 'dashboard'
  | 'properties'
  | 'add'
  | 'inquiries'
  | 'users'
  | 'verify'
  | 'reports'

interface NavigationItem {
  label: string
  path: string
  icon: NavigationIcon
}

const props = withDefaults(
  defineProps<{
    role?: DashboardRole
  }>(),
  {
    role: 'owner'
  }
)

const route = useRoute()
const mobileOpen = ref(false)

const roleTitle = computed(() => {
  switch (props.role) {
    case 'broker':
      return 'Broker Workspace'
    case 'admin':
      return 'Admin Workspace'
    default:
      return 'Owner Workspace'
  }
})

const navigation = computed<NavigationItem[]>(() => {
  if (props.role === 'owner') {
    return [
      {
        label: 'Dashboard',
        path: '/owner/dashboard',
        icon: 'dashboard'
      },
      {
        label: 'My Properties',
        path: '/owner/properties',
        icon: 'properties'
      },
      {
        label: 'Add Property',
        path: '/owner/properties/create',
        icon: 'add'
      },
      {
        label: 'Inquiries',
        path: '/owner/inquiries',
        icon: 'inquiries'
      }
    ]
  }

  if (props.role === 'broker') {
    return [
      { label: 'Dashboard', path: '/broker/dashboard', icon: 'dashboard' },
      { label: 'My Listings', path: '/broker/listings', icon: 'properties' },
      { label: 'Add Listing', path: '/broker/listings/create', icon: 'add' },
      { label: 'Inquiries', path: '/broker/inquiries', icon: 'inquiries' },
      { label: 'Broker Profile', path: '/broker/profile', icon: 'users' }
    ]
  }

  return [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: 'dashboard'
    },
    {
      label: 'Manage Properties',
      path: '/admin/properties',
      icon: 'properties'
    },
    {
      label: 'Manage Users',
      path: '/admin/users',
      icon: 'users'
    },
    {
      label: 'Verifications',
      path: '/admin/verifications',
      icon: 'verify'
    },
    {
      label: 'Reports',
      path: '/admin/reports',
      icon: 'reports'
    }
  ]
})

function isActive(path: string) {
  return route.path === path
}

function closeMobile() {
  mobileOpen.value = false
}
</script>

<template>
  <div class="sidebar-layout">
    <!-- MOBILE MENU BUTTON -->
    <button
      class="mobile-sidebar-toggle"
      type="button"
      :aria-expanded="mobileOpen"
      aria-controls="dashboard-sidebar"
      @click="mobileOpen = !mobileOpen"
    >
      <span aria-hidden="true">
        {{ mobileOpen ? '✕' : '☰' }}
      </span>
      Dashboard Menu
    </button>

    <!-- MOBILE OVERLAY -->
    <div
      v-if="mobileOpen"
      class="sidebar-overlay"
      @click="closeMobile"
    ></div>

    <!-- SIDEBAR -->
    <aside
      id="dashboard-sidebar"
      class="sidebar"
      :class="{ open: mobileOpen }"
    >
      <!-- WORKSPACE HEADING -->
      <div class="sidebar-heading">
        <span class="workspace-label">
          BUTUANSPACES
        </span>

        <h2>{{ roleTitle }}</h2>
        <p>Manage your workspace</p>
      </div>

      <div class="navigation-title">
        MAIN MENU
      </div>

      <!-- NAVIGATION -->
      <nav
        class="sidebar-navigation"
        aria-label="Dashboard navigation"
      >
        <RouterLink
          v-for="item in navigation"
          :key="item.path"
          :to="item.path"
          class="sidebar-link"
          :class="{ active: isActive(item.path) }"
          @click="closeMobile"
        >
          <span class="nav-icon" aria-hidden="true">
            <!-- DASHBOARD -->
            <svg
              v-if="item.icon === 'dashboard'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>

            <!-- PROPERTIES -->
            <svg
              v-else-if="item.icon === 'properties'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path
                d="M3 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16"
              />
              <path d="M16 9h3a2 2 0 0 1 2 2v10" />
              <path d="M2 21h20" />
              <path d="M7 7h2M7 11h2M7 15h2M12 7h1M12 11h1" />
            </svg>

            <!-- ADD PROPERTY -->
            <svg
              v-else-if="item.icon === 'add'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 7v10M7 12h10" />
            </svg>

            <!-- INQUIRIES -->
            <svg
              v-else-if="item.icon === 'inquiries'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path
                d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z"
              />
            </svg>

            <!-- USERS -->
            <svg
              v-else-if="item.icon === 'users'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <circle cx="9" cy="8" r="4" />
              <path d="M2 21v-2a7 7 0 0 1 14 0v2" />
              <path d="M16 4a4 4 0 0 1 0 8" />
              <path d="M19 15a6 6 0 0 1 3 5" />
            </svg>

            <!-- VERIFICATIONS -->
            <svg
              v-else-if="item.icon === 'verify'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
              />
              <path d="m9 12 2 2 4-4" />
            </svg>

            <!-- REPORTS -->
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
            </svg>
          </span>

          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- BOTTOM ACCOUNT SECTION -->
      <div class="sidebar-bottom">
        <div class="demo-profile">
          <div class="profile-avatar">
            D
          </div>

          <div class="profile-info">
            <strong>Demo Account</strong>
            <span>{{ roleTitle }}</span>
          </div>
        </div>

        <RouterLink
          to="/"
          class="back-home"
          @click="closeMobile"
        >
          ← Back to Website
        </RouterLink>
      </div>
    </aside>

    <!-- MAIN PAGE CONTENT -->
    <div class="sidebar-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* ============================= */
/* MAIN DASHBOARD LAYOUT         */
/* ============================= */

.sidebar-layout {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  min-height: 100vh;
  background: #f5f7fb;
}

/* ============================= */
/* FIXED DESKTOP SIDEBAR         */
/* ============================= */

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;

  width: 250px;
  height: 100vh;
  height: 100dvh;

  z-index: 100;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding: 30px 16px 24px;

  overflow-y: auto;
  overscroll-behavior: contain;
}

/* ============================= */
/* SIDEBAR HEADING               */
/* ============================= */

.sidebar-heading {
  padding: 0 14px 30px;
  border-bottom: 1px solid #e2e8f0;
}

.workspace-label {
  color: #2563eb;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.sidebar-heading h2 {
  color: #142d4e;
  font-size: 19px;
  letter-spacing: -0.4px;
  margin: 10px 0 6px;
}

.sidebar-heading p {
  color: #94a3b8;
  font-size: 12px;
  margin: 0;
}

/* ============================= */
/* NAVIGATION                    */
/* ============================= */

.navigation-title {
  padding: 28px 14px 12px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.sidebar-navigation {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 13px 14px;

  color: #64748b;
  border-radius: 9px;
  text-decoration: none;

  font-size: 13px;
  font-weight: 600;

  transition:
    background 0.2s,
    color 0.2s;
}

.sidebar-link:hover {
  background: #f1f5f9;
  color: #142d4e;
}

.sidebar-link.active {
  background: #eaf1fc;
  color: #2563eb;
}

/* ============================= */
/* NAVIGATION ICONS              */
/* ============================= */

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-icon svg {
  width: 19px;
  height: 19px;

  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ============================= */
/* DEMO ACCOUNT                  */
/* ============================= */

.sidebar-bottom {
  margin-top: auto;
  padding: 28px 12px 0;
}

.demo-profile {
  display: flex;
  align-items: center;
  gap: 11px;

  padding: 15px 0;
  border-top: 1px solid #e2e8f0;
}

.profile-avatar {
  display: grid;
  place-items: center;

  width: 39px;
  height: 39px;
  flex-shrink: 0;

  border-radius: 50%;
  color: #142d4e;
  background: #eaf1fc;

  font-size: 14px;
  font-weight: 800;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.profile-info strong {
  color: #142d4e;
  font-size: 12px;
}

.profile-info span {
  color: #94a3b8;
  font-size: 11px;
}

.back-home {
  display: block;
  padding: 14px 0;

  color: #64748b;
  text-decoration: none;

  font-size: 12px;
  font-weight: 600;
}

.back-home:hover {
  color: #2563eb;
}

/* ============================= */
/* MAIN CONTENT                  */
/* ============================= */

.sidebar-content {
  grid-column: 2;
  min-width: 0;
  padding: 36px;
}

/* ============================= */
/* HIDDEN MOBILE ELEMENTS        */
/* ============================= */

.mobile-sidebar-toggle,
.sidebar-overlay {
  display: none;
}

/* ============================= */
/* SMALL DESKTOP                 */
/* ============================= */

@media (max-width: 1000px) {
  .sidebar-layout {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .sidebar {
    width: 220px;
  }

  .sidebar-content {
    padding: 26px;
  }
}

/* ============================= */
/* MOBILE LAYOUT                 */
/* ============================= */

@media (max-width: 760px) {
  .sidebar-layout {
    display: block;
    position: relative;
  }

  /* MOBILE MENU BUTTON */

  .mobile-sidebar-toggle {
    display: flex;
    align-items: center;
    gap: 10px;

    width: 100%;
    padding: 16px 20px;

    background: #ffffff;
    color: #142d4e;

    border: none;
    border-bottom: 1px solid #e2e8f0;

    text-align: left;
    font-size: 14px;
    font-weight: 700;

    cursor: pointer;
  }

  /* MOBILE SLIDE-OUT SIDEBAR */

  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;

    width: min(280px, 85vw);

    height: 100vh;
    height: 100dvh;

    z-index: 202;

    transform: translateX(-105%);
    transition: transform 0.25s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  /* MOBILE OVERLAY */

  .sidebar-overlay {
    display: block;
    position: fixed;

    inset: 0;
    z-index: 201;

    background: rgba(15, 23, 42, 0.45);
  }

  /* MOBILE MAIN CONTENT */

  .sidebar-content {
    padding: 22px 16px 50px;
  }
}
</style>
