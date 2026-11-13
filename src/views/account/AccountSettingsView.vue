<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KeyRound, Mail, Trash2, UserRound } from '@lucide/vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useAuth } from '@/composables/useAuth'
import {
  changePassword,
  deleteAccount,
  requestEmailChange,
  resendVerificationEmail,
  updateProfile,
} from '@/services/accountService'

type Feedback = { text: string; error: boolean } | null

const route = useRoute()
const router = useRouter()
const { user, refreshUser } = useAuth()

/** Publishers and admins see this page inside their workspace sidebar. */
const sidebarRole = computed(() => {
  switch (user.value?.role) {
    case 'owner':
    case 'developer':
      return 'owner'
    case 'broker':
      return 'broker'
    case 'admin':
      return 'admin'
    default:
      return null
  }
})

const profile = reactive({ name: '', phone: '' })
const email = reactive({ email: '', password: '' })
const password = reactive({ current: '', next: '', confirm: '' })
const removal = reactive({ password: '', confirmText: '' })

const busy = reactive({ profile: false, email: false, verify: false, password: false, remove: false })
const feedback = reactive<Record<'profile' | 'email' | 'verify' | 'password' | 'remove', Feedback>>({
  profile: null, email: null, verify: null, password: null, remove: null,
})

watch(user, (current) => {
  profile.name = current?.name ?? ''
  profile.phone = current?.phone ?? ''
}, { immediate: true })

onMounted(async () => {
  const status = route.query.email
  if (status === 'changed') {
    feedback.email = { text: 'Your email address has been changed.', error: false }
    await refreshUser().catch(() => undefined)
  } else if (status === 'taken') {
    feedback.email = { text: 'That email address is already used by another account, so it was not changed.', error: true }
  }
  if (status) void router.replace({ query: {} })
})

function errorText(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback
}

async function run(key: keyof typeof busy, task: () => Promise<string>, fallback: string) {
  busy[key] = true
  feedback[key] = null
  try {
    feedback[key] = { text: await task(), error: false }
  } catch (cause) {
    feedback[key] = { text: errorText(cause, fallback), error: true }
  } finally {
    busy[key] = false
  }
}

function saveProfile() {
  return run('profile', async () => {
    user.value = await updateProfile({ name: profile.name.trim(), phone: profile.phone.trim() || null })
    return 'Your details have been saved.'
  }, 'Unable to save your details.')
}

function changeEmail() {
  return run('email', async () => {
    const message = await requestEmailChange({ email: email.email.trim(), password: email.password })
    email.email = ''
    email.password = ''
    return message
  }, 'Unable to start the email change.')
}

function resendVerification() {
  return run('verify', resendVerificationEmail, 'Unable to send a new confirmation email.')
}

const passwordMismatch = computed(() => password.confirm !== '' && password.next !== password.confirm)

function savePassword() {
  if (passwordMismatch.value) return
  return run('password', async () => {
    const message = await changePassword({
      current_password: password.current,
      password: password.next,
      password_confirmation: password.confirm,
    })
    password.current = ''
    password.next = ''
    password.confirm = ''
    return message
  }, 'Unable to change your password.')
}

const canDelete = computed(() => user.value?.role !== 'admin')
const deleteConfirmed = computed(() => removal.confirmText.trim().toUpperCase() === 'DELETE' && removal.password !== '')

async function removeAccount() {
  if (!deleteConfirmed.value) return
  busy.remove = true
  feedback.remove = null
  try {
    await deleteAccount(removal.password)
    user.value = null
    await router.push({ path: '/', query: { account: 'deleted' } })
  } catch (cause) {
    feedback.remove = { text: errorText(cause, 'Unable to delete your account.'), error: true }
  } finally {
    busy.remove = false
  }
}
</script>

<template>
  <component :is="sidebarRole ? AppSidebar : 'div'" v-bind="sidebarRole ? { role: sidebarRole } : {}">
    <main class="account-page" :class="{ 'account-page--storefront': !sidebarRole }">
      <span class="eyebrow">YOUR ACCOUNT</span>
      <h1>Account settings</h1>
      <p class="intro">Update your details, sign-in email and password.</p>

      <div class="grid">
        <section class="panel" aria-labelledby="profile-heading">
          <UserRound :size="24" aria-hidden="true" />
          <h2 id="profile-heading">Personal details</h2>
          <form @submit.prevent="saveProfile">
            <label for="account-name">Full name</label>
            <input id="account-name" v-model="profile.name" required maxlength="255" autocomplete="name" />
            <label for="account-phone">Mobile number <span class="optional">(optional, not shown publicly)</span></label>
            <input id="account-phone" v-model="profile.phone" type="tel" inputmode="tel" maxlength="30" placeholder="09171234567" autocomplete="tel" />
            <button type="submit" :disabled="busy.profile">{{ busy.profile ? 'Saving…' : 'Save details' }}</button>
          </form>
          <p v-if="feedback.profile" :class="{ error: feedback.profile.error }" role="status">{{ feedback.profile.text }}</p>
        </section>

        <section class="panel" aria-labelledby="email-heading">
          <Mail :size="24" aria-hidden="true" />
          <h2 id="email-heading">Sign-in email</h2>
          <p class="current-email">
            <strong>{{ user?.email }}</strong>
            <span v-if="user?.email_verified" class="badge badge--ok">Confirmed</span>
            <span v-else class="badge badge--warn">Not confirmed</span>
          </p>
          <div v-if="user && !user.email_verified" class="verify-row">
            <span>Confirm your email to receive inquiry replies and password resets.</span>
            <button type="button" class="link-button" :disabled="busy.verify" @click="resendVerification">
              {{ busy.verify ? 'Sending…' : 'Resend confirmation email' }}
            </button>
          </div>
          <p v-if="feedback.verify" :class="{ error: feedback.verify.error }" role="status">{{ feedback.verify.text }}</p>

          <form @submit.prevent="changeEmail">
            <label for="new-email">New email address</label>
            <input id="new-email" v-model="email.email" type="email" required maxlength="255" autocomplete="email" />
            <label for="email-password">Current password</label>
            <input id="email-password" v-model="email.password" type="password" required autocomplete="current-password" />
            <button type="submit" :disabled="busy.email">{{ busy.email ? 'Sending link…' : 'Change email' }}</button>
          </form>
          <p class="hint">We'll email a confirmation link to the new address. Nothing changes until you open it.</p>
          <p v-if="feedback.email" :class="{ error: feedback.email.error }" role="status">{{ feedback.email.text }}</p>
        </section>

        <section class="panel" aria-labelledby="password-heading">
          <KeyRound :size="24" aria-hidden="true" />
          <h2 id="password-heading">Password</h2>
          <form @submit.prevent="savePassword">
            <label for="current-password">Current password</label>
            <input id="current-password" v-model="password.current" type="password" required autocomplete="current-password" />
            <label for="new-password">New password</label>
            <input id="new-password" v-model="password.next" type="password" required minlength="8" autocomplete="new-password" />
            <label for="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              v-model="password.confirm"
              type="password"
              required
              autocomplete="new-password"
              :aria-invalid="passwordMismatch"
              aria-describedby="password-match"
            />
            <span v-if="passwordMismatch" id="password-match" class="field-error">The passwords don't match.</span>
            <button type="submit" :disabled="busy.password || passwordMismatch">{{ busy.password ? 'Updating…' : 'Change password' }}</button>
          </form>
          <p class="hint">
            Signed up with Google, or forgot your password?
            <RouterLink to="/forgot-password">Set a new one by email</RouterLink>.
          </p>
          <p v-if="feedback.password" :class="{ error: feedback.password.error }" role="status">{{ feedback.password.text }}</p>
        </section>

        <section v-if="canDelete" class="panel panel--danger" aria-labelledby="delete-heading">
          <Trash2 :size="24" aria-hidden="true" />
          <h2 id="delete-heading">Delete account</h2>
          <p>
            This permanently deletes your account, your saved properties and searches<template v-if="user?.role !== 'buyer'">, and <strong>all of your listings and their photos</strong></template>.
            Messages you already sent stay with the people you contacted, but your name and contact details are removed from them.
          </p>
          <form @submit.prevent="removeAccount">
            <label for="delete-password">Current password</label>
            <input id="delete-password" v-model="removal.password" type="password" autocomplete="current-password" />
            <label for="delete-confirm">Type <strong>DELETE</strong> to confirm</label>
            <input id="delete-confirm" v-model="removal.confirmText" autocomplete="off" />
            <button type="submit" class="danger" :disabled="busy.remove || !deleteConfirmed">
              {{ busy.remove ? 'Deleting…' : 'Delete my account' }}
            </button>
          </form>
          <p v-if="feedback.remove" class="error" role="alert">{{ feedback.remove.text }}</p>
        </section>
      </div>
    </main>
  </component>
</template>

<style scoped>
.account-page {
  max-width: 1100px;
  margin: auto;
}

.account-page--storefront {
  padding: 40px 24px 64px;
}

.eyebrow {
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

h1 {
  margin: 10px 0 6px;
  color: #142d4e;
  font-size: 32px;
}

.intro {
  margin: 0 0 24px;
  color: #475569;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  align-items: start;
}

.panel {
  padding: 26px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #ffffff;
}

.panel > svg {
  color: #2563eb;
}

.panel--danger {
  border-color: #fecaca;
}

.panel--danger > svg {
  color: #dc2626;
}

h2 {
  margin: 10px 0;
  color: #142d4e;
  font-size: 18px;
}

p,
.verify-row {
  color: #475569;
  font-size: 13px;
  line-height: 1.7;
}

p.error,
.field-error {
  color: #b91c1c;
}

.field-error {
  font-size: 12px;
}

.hint {
  margin: 10px 0 0;
  font-size: 12px;
}

.hint a {
  color: #1d4ed8;
}

form {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

label {
  color: #142d4e;
  font-size: 12px;
  font-weight: 700;
}

.optional {
  color: #64748b;
  font-weight: 500;
}

input {
  min-height: 42px;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

input:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 1px;
}

button[type='submit'] {
  margin-top: 8px;
  padding: 12px;
  border: 0;
  border-radius: 8px;
  background: #142d4e;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

button.danger {
  background: #dc2626;
}

button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.current-email {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 0;
  color: #142d4e;
  word-break: break-all;
}

.badge {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.badge--ok {
  background: #dcfce7;
  color: #166534;
}

.badge--warn {
  background: #fef3c7;
  color: #92400e;
}

.verify-row {
  display: grid;
  gap: 4px;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fffbeb;
}

.link-button {
  justify-self: start;
  padding: 0;
  border: 0;
  background: none;
  color: #1d4ed8;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}
</style>
