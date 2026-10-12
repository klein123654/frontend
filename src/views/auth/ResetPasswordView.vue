<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { resetPassword } from '@/services/authService'

const route = useRoute()
const router = useRouter()
const token = computed(() => String(route.query.token ?? ''))
const email = computed(() => String(route.query.email ?? ''))
const password = ref('')
const confirmation = ref('')
const error = ref('')
const loading = ref(false)
async function submit() {
  error.value = ''
  if (!token.value || !email.value) { error.value = 'This reset link is incomplete. Request a new one.'; return }
  loading.value = true
  try {
    await resetPassword({ token: token.value, email: email.value, password: password.value, password_confirmation: confirmation.value })
    await router.replace({ name: 'login', query: { reset: 'success' } })
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Unable to reset your password.' }
  finally { loading.value = false }
}
</script>
<template><main class="reset-page"><section class="card"><span class="eyebrow">ACCOUNT RECOVERY</span><h1>Set a new password</h1><p>Choose a new password for {{ email || 'your account' }}.</p><form @submit.prevent="submit"><label for="new-password">New password</label><input id="new-password" v-model="password" type="password" minlength="8" required autocomplete="new-password"/><label for="confirm-password">Confirm new password</label><input id="confirm-password" v-model="confirmation" type="password" minlength="8" required autocomplete="new-password"/><p v-if="error" class="error" role="alert">{{ error }}</p><button :disabled="loading">{{ loading ? 'Saving…' : 'Reset Password' }}</button></form><RouterLink to="/login">Back to sign in</RouterLink></section></main></template>
<style scoped>.reset-page{min-height:70vh;display:grid;place-items:center;padding:32px 20px;background:#f8fafc}.card{width:min(100%,480px);padding:36px;background:white;border:1px solid #e2e8f0;border-radius:16px}.eyebrow{color:#2563eb;font-size:11px;font-weight:800;letter-spacing:1.4px}h1{color:#142d4e;margin:12px 0}p{color:#64748b;font-size:13px;line-height:1.7}form{display:grid;gap:10px;margin:24px 0}label{font-size:12px;font-weight:700;color:#334155}input{height:44px;border:1px solid #cbd5e1;border-radius:8px;padding:10px;font:inherit}button{margin-top:8px;border:0;border-radius:8px;padding:13px;color:white;background:#142d4e;font-weight:700;cursor:pointer}button:disabled{opacity:.6}.error{color:#b91c1c}.card>a{color:#2563eb;text-decoration:none;font-size:13px}</style>
