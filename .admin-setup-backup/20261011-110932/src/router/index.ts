
import { createRouter, createWebHistory } from 'vue-router'

// PUBLIC PAGES
import HomeView from '@/views/public/HomeView.vue'
import PropertiesView from '@/views/public/PropertiesView.vue'
import PropertyDetailsView from '@/views/public/PropertyDetailsView.vue'

// AUTHENTICATION PAGES
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'

// PROPERTY OWNER PAGES
import OwnerDashboardView from '@/views/owner/OwnerDashboardView.vue'
import MyPropertiesView from '@/views/owner/MyPropertiesView.vue'
import CreatePropertyView from '@/views/owner/CreatePropertyView.vue'
import EditPropertyView from '@/views/owner/EditPropertyView.vue'
import OwnerPropertyDetailsView from '@/views/owner/OwnerPropertyDetailsView.vue'
import OwnerInquiriesView from '@/views/owner/OwnerInquiriesView.vue'

// BROKER WORKSPACE
import BrokerDashboardView from '@/views/broker/BrokerDashboardView.vue'
import BrokerListingsView from '@/views/broker/BrokerListingsView.vue'
import CreateBrokerListingView from '@/views/broker/CreateBrokerListingView.vue'
import EditBrokerListingView from '@/views/broker/EditBrokerListingView.vue'
import BrokerListingDetailsView from '@/views/broker/BrokerListingDetailsView.vue'
import BrokerInquiriesView from '@/views/broker/BrokerInquiriesView.vue'
import BrokerProfileView from '@/views/broker/BrokerProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // PUBLIC ROUTES
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/properties',
      name: 'properties',
      component: PropertiesView
    },
    {
      path: '/properties/:id',
      name: 'property-details',
      component: PropertyDetailsView
    },

    // AUTHENTICATION ROUTES
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView
    },

    // PROPERTY OWNER ROUTES
    {
      path: '/owner/dashboard',
      name: 'owner-dashboard',
      component: OwnerDashboardView
    },
    {
      path: '/owner/properties',
      name: 'owner-properties',
      component: MyPropertiesView
    },
    {
      path: '/owner/properties/create',
      name: 'owner-create-property',
      component: CreatePropertyView
    },
    {
      path: '/owner/properties/:id/edit',
      name: 'owner-edit-property',
      component: EditPropertyView,
      props: true
    },
    {
      path: '/owner/properties/:id',
      name: 'owner-property-details',
      component: OwnerPropertyDetailsView,
      props: true
    },
    {
      path: '/owner/inquiries',
      name: 'owner-inquiries',
      component: OwnerInquiriesView
    },
    // BROKER WORKSPACE ROUTES
    { path: '/broker/dashboard', name: 'broker-dashboard', component: BrokerDashboardView },
    { path: '/broker/listings', name: 'broker-listings', component: BrokerListingsView },
    { path: '/broker/listings/create', name: 'broker-create-listing', component: CreateBrokerListingView },
    { path: '/broker/listings/:id/edit', name: 'broker-edit-listing', component: EditBrokerListingView },
    { path: '/broker/listings/:id', name: 'broker-listing-details', component: BrokerListingDetailsView },
    { path: '/broker/inquiries', name: 'broker-inquiries', component: BrokerInquiriesView },
    { path: '/broker/profile', name: 'broker-profile', component: BrokerProfileView }
  ],

  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth' as const
      }
    }

    return { top: 0 }
  }
})

export default router
