<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import AdminDeleteUserDialog from '@/components/admin/AdminDeleteUserDialog.vue'
import { adminUsers, setAdminUserStatus, loadAdminWorkspace, adminError } from '@/stores/adminWorkspace'
import type { ManagedUser, UserState } from '@/data/admin/adminTypes'
const query = ref('')
const role = ref('All')
const feedback = ref('')
onMounted(() => loadAdminWorkspace())
const rows = computed(() => adminUsers.value.filter((item) =>
  (role.value === 'All' || role.value === item.role) &&
  (!query.value.trim() || [item.name, item.email].some((x) => x.toLowerCase().includes(query.value.trim().toLowerCase())))
))
const deleting = ref<ManagedUser | null>(null)
function onDeleted(message: string) {
  deleting.value = null
  feedback.value = message
}
async function change(id: number, status: UserState) {
  feedback.value = await setAdminUserStatus(id, status) ? 'User status saved.' : (adminError.value || 'User status could not be changed.')
}
</script>
<template><AdminShell>
  <header class="admin-heading"><div><span class="admin-eyebrow">ADMIN WORKSPACE</span><h1>User Management</h1><p>View accounts, suspend them, or delete test and spam accounts.</p></div></header>
  <div v-if="adminError" class="admin-notice" role="alert">{{ adminError }}</div>
  <section class="admin-panel"><div class="admin-panel-head"><h2>User Directory</h2><span class="admin-count">{{ rows.length }} accounts</span></div><div class="admin-filters"><input v-model="query" aria-label="Search users" placeholder="Search users..."/><select v-model="role" aria-label="Filter users by role"><option>All</option><option>Client</option><option>Owner</option><option>Broker</option><option>Developer</option><option>Admin</option></select></div><p v-if="feedback" role="status" class="admin-feedback">{{ feedback }}</p>
    <div class="admin-table-wrap"><table><thead><tr><th>Account</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead><tbody><tr v-for="user in rows" :key="user.id"><td><strong>{{ user.name }}</strong><small>{{ user.email }}</small></td><td>{{ user.role }}</td><td>{{ user.joinedAt }}</td><td><span class="admin-status" :class="user.status.toLowerCase()">{{ user.status }}</span></td><td><button v-if="user.role!=='Admin'" type="button" :class="user.status==='Active' ? 'admin-button-danger' : 'admin-button-success'" :aria-label="`${user.status==='Active'?'Suspend':'Activate'} ${user.name}`" @click="change(user.id, user.status==='Active'?'Suspended':'Active')">{{ user.status==='Active'?'Suspend':'Activate' }}</button><button v-if="user.role!=='Admin'" type="button" class="admin-button-outline-danger" :aria-label="`Delete ${user.name}`" @click="deleting = user">Delete</button><span v-else>Protected</span></td></tr></tbody></table></div>
    <div v-if="!rows.length" class="admin-empty">No accounts match your filters.</div></section>
  <AdminDeleteUserDialog :user="deleting" @close="deleting = null" @deleted="onDeleted" />
</AdminShell></template>
<style scoped>
td button + button { margin-left: 8px; }
.admin-button-outline-danger { padding: 8px 12px; border: 1px solid #b91c1c; border-radius: 8px; background: #fff; color: #b91c1c; font-weight: 700; cursor: pointer; }
.admin-button-outline-danger:hover { background: #fef2f2; }
</style>
