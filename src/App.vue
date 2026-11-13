
<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ServerWakeNotice from '@/components/common/ServerWakeNotice.vue'
import AccountNotices from '@/components/common/AccountNotices.vue'

const route = useRoute()
const { user } = useAuth()

// Publisher and admin workspaces use their own sidebar navigation.
// Buyers keep the storefront navigation while using their account pages.
const isDashboardRoute = computed(() =>
  ['/owner', '/broker', '/developer', '/admin'].some(
    (prefix) =>
      route.path === prefix ||
      route.path.startsWith(`${prefix}/`)
  ) ||
  // Account settings sit inside the workspace sidebar for publishers and admins.
  (route.path === '/account' && Boolean(user.value) && user.value?.role !== 'buyer')
)
</script>

<template>
  <AccountNotices />
  <AppNavbar v-if="!isDashboardRoute" />

  <RouterView />

  <AppFooter v-if="!isDashboardRoute" />

  <ServerWakeNotice />
</template>

<style>
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: Inter, Arial, sans-serif;
  color: #142d4e;
  background: white;
}

button,
input,
select {
  font-family: inherit;
}
</style>
