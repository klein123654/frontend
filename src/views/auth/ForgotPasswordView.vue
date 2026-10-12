
<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { requestPasswordReset } from '@/services/authService'
import { useFormDraft } from '@/composables/useFormDraft'

const email = ref('')
const formDraft = useFormDraft('forgot-password', { email })
const emailError = ref('')
const submitted = ref(false)
const feedback = ref('')
const loading = ref(false)

async function handleSubmit() {
  emailError.value = ''
  submitted.value = false

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(email.value.trim())) {
    emailError.value = 'Please enter a valid email address.'
    return
  }

  feedback.value = ''
  loading.value = true
  try {
    await requestPasswordReset(email.value.trim())
    formDraft.clear()
    submitted.value = true
  } catch (error) {
    feedback.value = error instanceof Error ? error.message : 'Unable to request a password reset.'
  } finally { loading.value = false }
}

function tryAgain() {
  email.value = ''
  emailError.value = ''
  submitted.value = false
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-container">

      <!-- LEFT INFORMATION PANEL -->
      <section class="welcome-panel">
        <div class="welcome-content">
          <span class="welcome-label">ACCOUNT RECOVERY</span>

          <h1>
            Let's get you<br />
            back on track.
          </h1>

          <p>
            Your commercial property opportunities are
            waiting. Return to your ButuanSpaces account
            when you're ready.
          </p>

          <div class="welcome-footer">
            <span class="brand-mark">B</span>
            <strong>ButuanSpaces</strong>
          </div>
        </div>
      </section>

      <!-- RIGHT FORM PANEL -->
      <section class="form-panel">
        <div class="form-content">

          <!-- BACK LINK -->
          <RouterLink to="/login" class="back-link">
            ← Back to Login
          </RouterLink>

          <!-- SUCCESS STATE -->
          <div v-if="submitted" class="success-content">

            <div class="success-icon">
              ✓
            </div>

            <span class="eyebrow">PASSWORD ASSISTANCE</span>

            <h2>Check your email</h2>

            <p>
              The email address
              <strong>{{ email }}</strong>
              If an account exists for this address, a password-reset link has been sent.
            </p>


            <button
              type="button"
              class="primary-button"
              @click="tryAgain"
            >
              Try Another Email
            </button>

            <RouterLink to="/login" class="secondary-link">
              Return to Login
            </RouterLink>

          </div>

          <!-- RECOVERY FORM -->
          <template v-else>

            <div class="form-heading">
              <div class="mail-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="26"
                  height="26"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>

              <span class="eyebrow">PASSWORD ASSISTANCE</span>

              <h2>Forgot your password?</h2>

              <p>
                Enter the email address associated with
                your account to receive a password recovery link.
              </p>
            </div>

            <form
              class="recovery-form"
              novalidate
              @submit.prevent="handleSubmit"
            >
              <div class="form-group">
                <label for="recovery-email">
                  Email Address
                </label>

                <input
                  id="recovery-email"
                  v-model="email"
                  type="email"
                  placeholder="Enter your email address"
                  autocomplete="email"
                  :aria-invalid="!!emailError"
                  :aria-describedby="
                    emailError ? 'recovery-email-error' : undefined
                  "
                />

                <small
                  v-if="emailError"
                  id="recovery-email-error"
                  class="error"
                  role="alert"
                >
                  {{ emailError }}
                </small>
              </div>

              <p v-if="feedback" class="error" role="alert">{{ feedback }}</p>
              <button type="submit" class="primary-button" :disabled="loading">
                {{ loading ? 'Sending…' : 'Send Reset Link' }}
              </button>
            </form>

            <div class="help-section">
              <p>
                Remembered your password?
                <RouterLink to="/login">Sign In</RouterLink>
              </p>
            </div>

          </template>
        </div>
      </section>

    </div>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 100px);
  background: #f5f7fb;
  padding: 60px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-container {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  width: 100%;
  max-width: 1080px;
  min-height: 540px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(20, 45, 78, 0.06);
}

/* WELCOME PANEL */

.welcome-panel {
  display: flex;
  align-items: center;
  padding: 65px 48px;
  background: #142d4e;
  color: white;
}

.welcome-content {
  width: 100%;
}

.welcome-label {
  color: #93c5fd;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

.welcome-content h1 {
  margin: 22px 0;
  font-size: clamp(32px, 4vw, 46px);
  line-height: 1.15;
  letter-spacing: -1.5px;
}

.welcome-content p {
  max-width: 340px;
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.9;
}

.welcome-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 90px;
  font-size: 18px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  font-weight: 800;
}

/* FORM PANEL */

.form-panel {
  display: flex;
  align-items: center;
  padding: 55px;
}

.form-content {
  width: 100%;
  max-width: 390px;
  margin: auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 34px;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover {
  color: #2563eb;
}

.mail-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 25px;
  border-radius: 14px;
  background: #eaf1fc;
  color: #2563eb;
}

.eyebrow {
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.form-heading h2,
.success-content h2 {
  margin: 13px 0;
  color: #142d4e;
  font-size: 28px;
  letter-spacing: -0.5px;
}

.form-heading p,
.success-content p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.8;
}

/* FORM */

.recovery-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.form-group label {
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #dbe2ea;
  border-radius: 9px;
  outline: none;
  color: #142d4e;
  background: white;
  font-size: 13px;
  font-family: inherit;
}

.form-group input:focus {
  border-color: #2563eb;
}

.form-group input[aria-invalid="true"] {
  border-color: #dc2626;
}

.form-group input::placeholder {
  color: #94a3b8;
}

.error {
  color: #dc2626;
  font-size: 12px;
}

/* BUTTON */

.primary-button {
  width: 100%;
  padding: 15px;
  border: 1px solid #142d4e;
  border-radius: 9px;
  background: #142d4e;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.primary-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.primary-button:focus-visible,
.back-link:focus-visible,
.secondary-link:focus-visible,
.help-section a:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 3px;
}

/* HELP LINKS */

.help-section {
  margin-top: 28px;
  text-align: center;
}

.help-section p {
  color: #64748b;
  font-size: 13px;
}

.help-section a,
.secondary-link {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}

.help-section a:hover,
.secondary-link:hover {
  text-decoration: underline;
}

.demo-note {
  margin-top: 30px;
  padding-top: 22px;
  border-top: 1px solid #e2e8f0;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.8;
  text-align: center;
}

/* SUCCESS */

.success-content {
  text-align: center;
}

.success-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 25px;
  background: #e8f5ec;
  color: #15803d;
  border-radius: 50%;
  font-size: 28px;
  font-weight: 700;
}

.success-content strong {
  color: #142d4e;
  overflow-wrap: anywhere;
}

.demo-alert {
  margin: 25px 0;
  padding: 15px;
  border: 1px solid #bfdbfe;
  border-radius: 9px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  line-height: 1.8;
}

.secondary-link {
  display: inline-block;
  margin-top: 22px;
  font-size: 13px;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .welcome-panel {
    padding: 45px 30px;
  }

  .form-panel {
    padding: 45px 30px;
  }

  .welcome-footer {
    margin-top: 50px;
  }
}

@media (max-width: 700px) {
  .auth-page {
    padding: 25px 16px;
  }

  .auth-container {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .welcome-panel {
    padding: 30px 25px;
  }

  .welcome-content h1 {
    font-size: 28px;
  }

  .welcome-content p,
  .welcome-footer {
    display: none;
  }

  .form-panel {
    padding: 35px 25px;
  }

  .form-heading h2,
  .success-content h2 {
    font-size: 24px;
  }

  .back-link {
    margin-bottom: 28px;
  }
}
</style>
