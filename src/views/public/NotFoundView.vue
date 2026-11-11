<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="not-found">
    <p class="not-found__code" aria-hidden="true">404</p>
    <h1>Page not found</h1>
    <p>The page you’re looking for doesn’t exist or may have been moved.</p>
    <div class="not-found__actions">
      <RouterLink to="/" class="not-found__primary">Go to homepage</RouterLink>
      <RouterLink to="/properties" class="not-found__secondary">Browse properties</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.not-found {
  display: grid;
  justify-items: center;
  gap: 12px;
  min-height: 60vh;
  align-content: center;
  padding: 48px 16px;
  text-align: center;
}

.not-found__code {
  margin: 0;
  font-size: 4rem;
  font-weight: 800;
  color: #1d4ed8;
}

h1 {
  margin: 0;
  font-size: 1.75rem;
}

p {
  margin: 0;
  color: #475569;
}

.not-found__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}

.not-found__actions a {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
}

.not-found__primary {
  background: #1d4ed8;
  color: #ffffff;
}

.not-found__secondary {
  border: 1px solid #cbd5e1;
  color: #142d4e;
}
</style>
