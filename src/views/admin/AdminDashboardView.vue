<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AdminShell from '@/components/admin/AdminShell.vue'
import {
  adminListings, pendingAdminListings, adminVerifications, adminUsers,
  adminInquiries, adminReports, loadAdminWorkspace, adminError
} from '@/stores/adminWorkspace'
onMounted(() => loadAdminWorkspace())
const stats = computed(() => [
  { label: 'Total Property Listings', value: adminListings.value.length, path: '/admin/properties' },
  { label: 'Pending Property Reviews', value: pendingAdminListings.value.length, path: '/admin/properties' },
  { label: 'Pending Broker Requests', value: adminVerifications.value.filter((x) => x.status === 'Pending').length, path: '/admin/verifications' },
  { label: 'Open Issue Reports', value: adminReports.value.filter((x) => x.status !== 'Resolved').length, path: '/admin/reports' }
])
const links = [
  { label: 'Property Approvals', path: '/admin/properties', detail: 'Review owner and broker listing submissions' },
  { label: 'Broker Verification', path: '/admin/verifications', detail: 'Inspect pending broker verification requests' },
  { label: 'Manage Users', path: '/admin/users', detail: 'Review connected user account records' },
  { label: 'Inquiries', path: '/admin/inquiries', detail: 'Track incoming administrative messages' },
  { label: 'Issue Reports', path: '/admin/reports', detail: 'Review reports submitted by users' }
]
</script>
<template><AdminShell>
  <header class="admin-heading"><div><span class="admin-eyebrow">ADMIN WORKSPACE</span><h1>Dashboard Overview</h1><p>Monitor listing submissions, broker verification requests, and support activity.</p></div></header>
  <div v-if="adminError" class="admin-notice" role="alert">{{ adminError }}</div>
  <section class="admin-stats" aria-label="Admin overview statistics">
    <RouterLink v-for="stat in stats" :key="stat.label" :to="stat.path" class="admin-stat" style="text-decoration:none"><span>{{ stat.label }}</span><strong>{{ stat.value }}</strong></RouterLink>
  </section>
  <div class="admin-grid"><section class="admin-panel"><h2>Quick Actions</h2><div v-for="link in links" :key="link.path" style="padding:15px 0;border-bottom:1px solid #e2e8f0"><RouterLink class="admin-link" :to="link.path">{{ link.label }} →</RouterLink><p>{{ link.detail }}</p></div></section>
    <section class="admin-panel"><h2>Application Records</h2><p>Counts reflect records currently stored in the application database.</p><div style="display:grid;gap:15px;margin-top:22px"><p><strong>Users:</strong> {{ adminUsers.length }}</p><p><strong>Property inquiries:</strong> {{ adminInquiries.length }}</p><p><strong>Issue reports:</strong> {{ adminReports.length }}</p><p><strong>Broker verification requests:</strong> {{ adminVerifications.length }}</p></div></section></div>
</AdminShell></template>
