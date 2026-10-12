
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useFormDraft } from '@/composables/useFormDraft'

const router = useRouter()
const route = useRoute()
const { login, loading } = useAuth()

const form = reactive({
  email: '',
  password: ''
})
const formDraft = useFormDraft('login', form)

const errors = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)
const loginError = ref('')

async function handleLogin() {
  errors.email = ''
  errors.password = ''
  loginError.value = ''

  let valid = true
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Please enter your password.'
    valid = false
  }

  if (!valid) return

  try {
    const user = await login(form.email.trim(), form.password)
    formDraft.clear()

    const roleHome = {
      owner: '/owner/dashboard',
      broker: '/broker/dashboard',
      developer: '/developer/dashboard',
      admin: '/admin/dashboard',
      buyer: '/',
    }[user.role] || '/'
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const destination = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : roleHome

    await router.push(destination)
  } catch (error) {
    loginError.value = error instanceof Error
      ? error.message
      : 'Unable to sign in. Please try again.'
  }
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-container">

      <!-- LEFT INFORMATION PANEL -->
      <section class="welcome-panel">
        <div class="welcome-content">
          <span class="welcome-label">WELCOME BACK</span>

          <h1>
            Your space.<br />
            Your opportunity.
          </h1>

          <p>
            Discover commercial properties, connect with
            property owners and brokers, and explore
            opportunities in Butuan City.
          </p>

          <div class="welcome-footer">
            <span class="brand-mark">B</span>
            <strong>ButuanSpaces</strong>
          </div>
        </div>
      </section>

      <!-- RIGHT LOGIN PANEL -->
      <section class="form-panel">
        <div class="form-content">

          <div class="form-heading">
            <span class="eyebrow">ACCOUNT ACCESS</span>

            <h2>Sign in to your account</h2>

            <p>
              Welcome back! Enter your details to continue.
            </p>
          </div>

          <div
            v-if="loginError"
            class="error-message"
            role="alert"
          >
            {{ loginError }}
          </div>

          <form
            class="login-form"
            novalidate
            @submit.prevent="handleLogin"
          >

            <!-- EMAIL -->
            <div class="form-group">
              <label for="login-email">
                Email Address
              </label>

              <input
                id="login-email"
                v-model="form.email"
                type="email"
                placeholder="Enter your email address"
                autocomplete="email"
                :aria-invalid="!!errors.email"
                :aria-describedby="
                  errors.email ? 'login-email-error' : undefined
                "
              />

              <small
                v-if="errors.email"
                id="login-email-error"
                class="error"
              >
                {{ errors.email }}
              </small>
            </div>

            <!-- PASSWORD -->
            <div class="form-group">
              <div class="label-row">
                <label for="login-password">
                  Password
                </label>

                <RouterLink
                  to="/forgot-password"
                  class="forgot-link"
                >
                  Forgot password?
                </RouterLink>
              </div>

              <div class="password-field">
                <input
                  id="login-password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  :aria-invalid="!!errors.password"
                  :aria-describedby="
                    errors.password
                      ? 'login-password-error'
                      : undefined
                  "
                />

                <button
                  type="button"
                  class="password-toggle"
                  :aria-label="
                    showPassword ? 'Hide password' : 'Show password'
                  "
                  :aria-pressed="showPassword"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>

              <small
                v-if="errors.password"
                id="login-password-error"
                class="error"
              >
                {{ errors.password }}
              </small>
            </div>

            <!-- LOGIN BUTTON -->
            <button type="submit" class="login-button">
              Sign In
            </button>

          </form>

          <div class="register-section">
            Don't have an account?

            <RouterLink :to="{ name: 'register', query: route.query.redirect ? { redirect: route.query.redirect } : undefined }">
              Create an account
            </RouterLink>
          </div>

          

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
  align-items: center;
  justify-content: center;
}

.auth-container {
  width: 100%;
  max-width: 1080px;
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(20, 45, 78, 0.06);
}

/* WELCOME PANEL */

.welcome-panel {
  background: #142d4e;
  color: white;
  padding: 65px 48px;
  display: flex;
  align-items: center;
}

.welcome-content {
  width: 100%;
}

.welcome-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #93c5fd;
}

.welcome-content h1 {
  font-size: clamp(32px, 4vw, 46px);
  line-height: 1.15;
  letter-spacing: -1.5px;
  margin: 22px 0;
}

.welcome-content p {
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.9;
  max-width: 340px;
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
  padding: 65px 55px;
  display: flex;
  align-items: center;
}

.form-content {
  width: 100%;
  max-width: 390px;
  margin: auto;
}

.eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #2563eb;
}

.form-heading h2 {
  color: #142d4e;
  font-size: 28px;
  letter-spacing: -0.5px;
  margin: 13px 0;
}

.form-heading p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
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
  transition: border-color 0.2s;
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

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.forgot-link {
  color: #2563eb;
  font-size: 12px;
  text-decoration: none;
  font-weight: 600;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* PASSWORD */

.password-field {
  position: relative;
}

.password-field input {
  padding-right: 70px;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  background: transparent;
  border: 0;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* BUTTON */

.login-button {
  width: 100%;
  padding: 15px;
  background: #142d4e;
  border: 1px solid #142d4e;
  border-radius: 9px;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.login-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.login-button:focus-visible,
.password-toggle:focus-visible,
.forgot-link:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 3px;
}

/* OTHER INFORMATION */

.register-section {
  margin-top: 30px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
}

.register-section a {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
}

.register-section a:hover {
  text-decoration: underline;
}

.demo-note {
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.7;
  text-align: center;
  border-top: 1px solid #e2e8f0;
  padding-top: 22px;
  margin-top: 30px;
}

.demo-alert {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 9px;
  color: #1d4ed8;
  padding: 14px;
  margin-top: 22px;
  font-size: 12px;
  line-height: 1.7;
}

.error {
  color: #dc2626;
  font-size: 12px;
}

/* TABLET */

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

/* MOBILE */

@media (max-width: 700px) {
  .auth-page {
    padding: 25px 16px;
  }

  .auth-container {
    grid-template-columns: 1fr;
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

  .form-heading h2 {
    font-size: 24px;
  }
}
</style>
