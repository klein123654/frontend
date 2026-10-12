
<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const route = useRoute()

// Publisher and admin workspaces use their own sidebar navigation.
// Buyers keep the storefront navigation while using their account pages.
const isDashboardRoute = computed(() =>
  ['/owner', '/broker', '/developer', '/admin'].some(
    (prefix) =>
      route.path === prefix ||
      route.path.startsWith(`${prefix}/`)
  )
)
</script>

<template>
  <AppNavbar v-if="!isDashboardRoute" />

  <RouterView />

  <AppFooter v-if="!isDashboardRoute" />
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
