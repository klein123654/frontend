
import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/services/authService'
import { useAuth } from '@/composables/useAuth'

const HomeView = () => import('@/views/public/HomeView.vue')
const PropertiesView = () => import('@/views/public/PropertiesView.vue')
const PropertyDetailsView = () => import('@/views/public/PropertyDetailsView.vue')
const ReportIssueView = () => import('@/views/public/ReportIssueView.vue')
const LoginView = () => import('@/views/auth/LoginView.vue')
const RegisterView = () => import('@/views/auth/RegisterView.vue')
const ForgotPasswordView = () => import('@/views/auth/ForgotPasswordView.vue')
const ResetPasswordView = () => import('@/views/auth/ResetPasswordView.vue')
const BuyerSavedPropertiesView = () => import('@/views/buyer/BuyerSavedPropertiesView.vue')
const BuyerInquiriesView = () => import('@/views/buyer/BuyerInquiriesView.vue')
const PublisherApplicationView = () => import('@/views/buyer/PublisherApplicationView.vue')
const OwnerDashboardView = () => import('@/views/owner/OwnerDashboardView.vue')
const MyPropertiesView = () => import('@/views/owner/MyPropertiesView.vue')
const CreatePropertyView = () => import('@/views/owner/CreatePropertyView.vue')
const EditPropertyView = () => import('@/views/owner/EditPropertyView.vue')
const OwnerPropertyDetailsView = () => import('@/views/owner/OwnerPropertyDetailsView.vue')
const OwnerInquiriesView = () => import('@/views/owner/OwnerInquiriesView.vue')
const BrokerDashboardView = () => import('@/views/broker/BrokerDashboardView.vue')
const BrokerListingsView = () => import('@/views/broker/BrokerListingsView.vue')
const CreateBrokerListingView = () => import('@/views/broker/CreateBrokerListingView.vue')
const EditBrokerListingView = () => import('@/views/broker/EditBrokerListingView.vue')
const BrokerListingDetailsView = () => import('@/views/broker/BrokerListingDetailsView.vue')
const BrokerInquiriesView = () => import('@/views/broker/BrokerInquiriesView.vue')
const BrokerProfileView = () => import('@/views/broker/BrokerProfileView.vue')
const AdminDashboardView = () => import('@/views/admin/AdminDashboardView.vue')
const AdminPropertiesView = () => import('@/views/admin/AdminPropertiesView.vue')
const AdminUsersView = () => import('@/views/admin/AdminUsersView.vue')
const AdminVerificationsView = () => import('@/views/admin/AdminVerificationsView.vue')
const AdminInquiriesView = () => import('@/views/admin/AdminInquiriesView.vue')
const AdminReportsView = () => import('@/views/admin/AdminReportsView.vue')
const AdminPublisherApplicationsView = () => import('@/views/admin/AdminPublisherApplicationsView.vue')

let hasCompletedInitialNavigation = false
const scrollStoragePrefix = 'butuanspaces_scroll:'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // PUBLIC ROUTES
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/properties',
      name: 'properties',
      component: PropertiesView,
    },
    {
      path: '/properties/:id',
      name: 'property-details',
      component: PropertyDetailsView,
      props: true,
    },
    {
      path: '/report-issue',
      name: 'report-issue',
      component: ReportIssueView,
    },

    // AUTHENTICATION ROUTES
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
    },

    // Buyer accounts keep the public storefront navigation.
    {
      path: '/buyer/dashboard',
      name: 'buyer-dashboard',
      redirect: '/',
    },
    // Preserve links from older buyer sessions while keeping browsing public.
    { path: '/buyer/properties', redirect: '/properties' },
    { path: '/buyer/properties/:id', redirect: (to) => `/properties/${to.params.id}` },
    {
      path: '/buyer/saved-properties',
      name: 'buyer-saved-properties',
      component: BuyerSavedPropertiesView,
    },
    {
      path: '/buyer/inquiries',
      name: 'buyer-inquiries',
      component: BuyerInquiriesView,
    },
    {
      path: '/publisher/apply',
      name: 'publisher-application',
      component: PublisherApplicationView,
    },

    // PROPERTY OWNER ROUTES
    {
      path: '/owner/dashboard',
      name: 'owner-dashboard',
      component: OwnerDashboardView,
    },
    {
      path: '/owner/properties',
      name: 'owner-properties',
      component: MyPropertiesView,
    },
    {
      path: '/owner/properties/create',
      name: 'owner-create-property',
      component: CreatePropertyView,
    },
    {
      path: '/owner/properties/:id/edit',
      name: 'owner-edit-property',
      component: EditPropertyView,
      props: true,
    },
    {
      path: '/owner/properties/:id',
      name: 'owner-property-details',
      component: OwnerPropertyDetailsView,
      props: true,
    },
    {
      path: '/owner/inquiries',
      name: 'owner-inquiries',
      component: OwnerInquiriesView,
    },

    // Developers share the publisher tools and dashboard layout.
    { path: '/developer/dashboard', name: 'developer-dashboard', component: OwnerDashboardView },
    { path: '/developer/properties', name: 'developer-properties', component: MyPropertiesView },
    { path: '/developer/properties/create', name: 'developer-create-property', component: CreatePropertyView },
    { path: '/developer/properties/:id/edit', name: 'developer-edit-property', component: EditPropertyView, props: true },
    { path: '/developer/properties/:id', name: 'developer-property-details', component: OwnerPropertyDetailsView, props: true },
    { path: '/developer/inquiries', name: 'developer-inquiries', component: OwnerInquiriesView },

    // BROKER WORKSPACE ROUTES
    {
      path: '/broker/dashboard',
      name: 'broker-dashboard',
      component: BrokerDashboardView,
    },
    {
      path: '/broker/listings',
      name: 'broker-listings',
      component: BrokerListingsView,
    },
    {
      path: '/broker/listings/create',
      name: 'broker-create-listing',
      component: CreateBrokerListingView,
    },
    {
      path: '/broker/listings/:id/edit',
      name: 'broker-edit-listing',
      component: EditBrokerListingView,
      props: true,
    },
    {
      path: '/broker/listings/:id',
      name: 'broker-listing-details',
      component: BrokerListingDetailsView,
      props: true,
    },
    {
      path: '/broker/inquiries',
      name: 'broker-inquiries',
      component: BrokerInquiriesView,
    },
    {
      path: '/broker/profile',
      name: 'broker-profile',
      component: BrokerProfileView,
    },

    // ADMIN WORKSPACE ROUTES
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: AdminDashboardView,
    },
    {
      path: '/admin/properties',
      name: 'admin-properties',
      component: AdminPropertiesView,
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUsersView,
    },
    {
      path: '/admin/verifications',
      name: 'admin-verifications',
      component: AdminVerificationsView,
    },
    {
      path: '/admin/publisher-applications',
      name: 'admin-publisher-applications',
      component: AdminPublisherApplicationsView,
    },
    {
      path: '/admin/inquiries',
      name: 'admin-inquiries',
      component: AdminInquiriesView,
    },
    {
      path: '/admin/reports',
      name: 'admin-reports',
      component: AdminReportsView,
    },
  ],

  scrollBehavior(to, _from, savedPosition) {
    // Browser back/forward restores its exact history-entry position.
    if (savedPosition) return savedPosition

    // On refresh, restore the last position saved for this URL.
    if (!hasCompletedInitialNavigation) {
      hasCompletedInitialNavigation = true
      try {
        const saved = sessionStorage.getItem(`${scrollStoragePrefix}${to.fullPath}`)
        if (saved) return JSON.parse(saved) as { left: number; top: number }
      } catch {
        sessionStorage.removeItem(`${scrollStoragePrefix}${to.fullPath}`)
      }
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth' as const,
      }
    }

    return { top: 0 }
  },
})

if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual'
  let scrollSaveFrame = 0
  const persistScrollPosition = () => {
    const key = `${scrollStoragePrefix}${router.currentRoute.value.fullPath}`
    sessionStorage.setItem(key, JSON.stringify({ left: window.scrollX, top: window.scrollY }))
  }
  const saveScrollPosition = () => {
    if (scrollSaveFrame) window.cancelAnimationFrame(scrollSaveFrame)
    scrollSaveFrame = window.requestAnimationFrame(() => {
      persistScrollPosition()
      scrollSaveFrame = 0
    })
  }
  const saveBeforePageHide = () => {
    if (scrollSaveFrame) window.cancelAnimationFrame(scrollSaveFrame)
    persistScrollPosition()
    scrollSaveFrame = 0
  }
  window.addEventListener('scroll', saveScrollPosition, { passive: true })
  window.addEventListener('pagehide', saveBeforePageHide)
}

// ROLE-BASED ROUTE GUARDS

function homeForRole(role: string): string {
  switch (role) {
    case 'buyer':
      return '/'
    case 'owner':
      return '/owner/dashboard'
    case 'broker':
      return '/broker/dashboard'
    case 'developer':
      return '/developer/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/properties'
  }
}

router.beforeEach(async (to) => {
  const auth = useAuth()
  const token = getToken()

  // Determine which role is allowed to access each workspace.
  const requiredRole = to.path.startsWith('/buyer/') || to.path.startsWith('/publisher/')
    ? 'member'
    : to.path.startsWith('/owner/')
      ? 'owner'
      : to.path.startsWith('/broker/')
        ? 'broker'
        : to.path.startsWith('/developer/')
          ? 'developer'
        : to.path.startsWith('/admin/')
          ? 'admin'
          : null

  // Validate an existing session with the Laravel API.
  if (token) {
    try {
      await auth.refreshUser()
    } catch {
      // refreshUser handles clearing invalid sessions.
      if (requiredRole) {
        return {
          name: 'login',
          query: { redirect: to.fullPath },
        }
      }
    }
  } else {
    auth.user.value = null
  }

  const user = auth.user.value

  // Issue reporting is for visitors and members; administrators review reports.
  if (to.path === '/report-issue' && user?.role === 'admin') {
    return '/admin/reports'
  }

  if (requiredRole && user && user.account_status !== 'active') {
    await auth.logout()
    return { name: 'login', query: { suspended: '1' } }
  }

  // All workspaces require authentication.
  if (requiredRole && !user) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  // Users may only access their own role's workspace.
  if (user && (to.path === '/login' || to.path === '/register')) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : ''
    if (redirect.startsWith('/') && !redirect.startsWith('//')) return redirect
    return homeForRole(user.role)
  }

  if (requiredRole === 'member' && user?.role === 'admin') {
    return homeForRole(user.role)
  }

  if (to.path.startsWith('/publisher/') && user && user.role !== 'buyer') {
    return homeForRole(user.role)
  }

  if (requiredRole && requiredRole !== 'member' && user && user.role !== requiredRole) {
    return homeForRole(user.role)
  }

  return true
})

export default router
