<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import type { AuthUser } from '@/types/user'

/** Shown only when a Google OAuth web client ID is configured at build time. */
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const SCRIPT_URL = 'https://accounts.google.com/gsi/client'

const props = withDefaults(defineProps<{ text?: 'signin_with' | 'signup_with' | 'continue_with' }>(), { text: 'continue_with' })
const emit = defineEmits<{ signedIn: [user: AuthUser] }>()

const { loginWithGoogle } = useAuth()
const container = ref<HTMLDivElement | null>(null)
const error = ref('')
const busy = ref(false)

interface GoogleIdentity {
  accounts: {
    id: {
      initialize(options: { client_id: string; callback: (response: { credential: string }) => void; ux_mode?: string }): void
      renderButton(element: HTMLElement, options: Record<string, unknown>): void
    }
  }
}

let scriptPromise: Promise<void> | null = null
function loadScript(): Promise<void> {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Google sign-in could not load.'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

async function handleCredential(response: { credential: string }) {
  busy.value = true
  error.value = ''
  try {
    emit('signedIn', await loginWithGoogle(response.credential))
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Google sign-in failed. Please try again.'
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  if (!clientId || !container.value) return
  try {
    await loadScript()
    const google = (window as Window & { google?: GoogleIdentity }).google
    if (!google) throw new Error('Google sign-in could not load.')
    google.accounts.id.initialize({ client_id: clientId, callback: handleCredential })
    google.accounts.id.renderButton(container.value, {
      theme: 'outline',
      size: 'large',
      text: props.text,
      shape: 'rectangular',
      width: Math.min(container.value.clientWidth || 360, 400),
    })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Google sign-in could not load.'
  }
})
</script>

<template>
  <div v-if="clientId" class="google-signin">
    <div class="divider" aria-hidden="true"><span>or</span></div>
    <div ref="container" class="button-slot" :aria-busy="busy" />
    <p v-if="busy" class="status" role="status">Signing you in…</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.google-signin {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.divider {
  display: flex;
  gap: 12px;
  align-items: center;
  color: #94a3b8;
  font-size: 12px;
  text-transform: uppercase;
}

.divider::before,
.divider::after {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
  content: '';
}

.button-slot {
  display: flex;
  justify-content: center;
  min-height: 44px;
}

.status,
.error {
  margin: 0;
  font-size: 13px;
  text-align: center;
}

.status {
  color: #475569;
}

.error {
  color: #b91c1c;
}
</style>
