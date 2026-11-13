<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { resendVerificationEmail } from '@/services/accountService'

const DISMISS_KEY = 'butuanspaces_verify_banner_dismissed'

const route = useRoute()
const router = useRouter()
const { user, refreshUser } = useAuth()

const flash = ref<{ text: string; error: boolean } | null>(null)
const sending = ref(false)
const resendMessage = ref('')
const dismissed = ref(readDismissed())

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

const FLASH_MESSAGES: Record<string, { text: string; error: boolean }> = {
  'email_verified:1': { text: 'Thanks! Your email address is confirmed.', error: false },
  'email_verified:invalid': { text: 'That confirmation link is no longer valid. Sign in and request a new one from Account settings.', error: true },
  'account:deleted': { text: 'Your account has been deleted. Thank you for using ButuanSpaces.', error: false },
}

// One-time messages arriving from email links or redirects.
watch(() => route.query, async (query) => {
  for (const key of ['email_verified', 'account'] as const) {
    const value = query[key]
    if (typeof value !== 'string') continue
    flash.value = FLASH_MESSAGES[`${key}:${value}`] ?? null
    const rest = { ...query }
    delete rest[key]
    void router.replace({ query: rest })
    if (key === 'email_verified' && value === '1' && user.value) await refreshUser().catch(() => undefined)
  }
}, { immediate: true })

const showVerifyBanner = computed(() =>
  Boolean(user.value) && user.value?.email_verified === false && !dismissed.value && route.path !== '/account',
)

async function resend() {
  sending.value = true
  try {
    resendMessage.value = await resendVerificationEmail()
  } catch (cause) {
    resendMessage.value = cause instanceof Error ? cause.message : 'Unable to send the email right now.'
  } finally {
    sending.value = false
  }
}

function dismiss() {
  dismissed.value = true
  try {
    sessionStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // Dismissal just won't persist across reloads.
  }
}
</script>

<template>
  <div v-if="flash" class="notice" :class="flash.error ? 'notice--error' : 'notice--ok'" role="status">
    <span>{{ flash.text }}</span>
    <button type="button" aria-label="Dismiss message" @click="flash = null">×</button>
  </div>

  <div v-if="showVerifyBanner" class="notice notice--warn" role="region" aria-label="Email confirmation">
    <span v-if="resendMessage">{{ resendMessage }}</span>
    <span v-else>
      Please confirm your email address (<strong>{{ user?.email }}</strong>) so you don't miss inquiry replies.
      <button type="button" class="inline" :disabled="sending" @click="resend">{{ sending ? 'Sending…' : 'Resend link' }}</button>
    </span>
    <button type="button" aria-label="Hide this reminder" @click="dismiss">×</button>
  </div>
</template>

<style scoped>
.notice {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
}

.notice > span {
  flex: 1;
  max-width: 1100px;
}

.notice--ok {
  background: #dcfce7;
  color: #14532d;
}

.notice--error {
  background: #fee2e2;
  color: #7f1d1d;
}

.notice--warn {
  background: #fef3c7;
  color: #78350f;
}

.notice button {
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.notice > button {
  font-size: 20px;
  line-height: 1;
}

.notice button.inline {
  padding: 0;
  font-weight: 700;
  text-decoration: underline;
}
</style>
