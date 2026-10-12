
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useFormDraft } from '@/composables/useFormDraft'

type AccountType = 'customer'

const accountTypes: {
  value: AccountType
  title: string
  description: string
  icon: string
}[] = [
  {
    value: 'customer',
    title: 'Buyer Account',
    description: 'Browse, save, and inquire about commercial properties.',
    icon: '01'
  }
]

const form = reactive({
  accountType: 'customer' as AccountType,
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  ownerType: '',
  brokerageName: '',
  licenseNumber: '',
  acceptTerms: false
})
const formDraft = useFormDraft('register', form)

const errors = reactive<Record<string, string>>({})
const route = useRoute()
const router = useRouter()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const { register, loading } = useAuth()

function selectAccountType(type: AccountType) {
  form.accountType = type
  form.ownerType = ''
  form.brokerageName = ''
  form.licenseNumber = ''
  submitted.value = false

  for (const key of Object.keys(errors)) {
    delete errors[key]
  }
}

function validateForm() {
  for (const key of Object.keys(errors)) {
    delete errors[key]
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phonePattern = /^(?:\+63|0)9\d{9}$/

  if (form.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.'
  }

  if (!emailPattern.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!phonePattern.test(form.phone.trim())) {
    errors.phone = 'Enter a valid Philippine mobile number.'
  }

  if (form.password.length < 8) {
    errors.password = 'Password must contain at least 8 characters.'
  }

  if (
    form.password &&
    !/[A-Za-z]/.test(form.password)
  ) {
    errors.password = 'Password must include a letter.'
  }

  if (
    form.password &&
    !/[0-9]/.test(form.password)
  ) {
    errors.password = 'Password must include a number.'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (!form.acceptTerms) {
    errors.acceptTerms = 'Please accept the account terms.'
  }

  return Object.keys(errors).length === 0
}

async function handleRegister() {
  submitted.value = false
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateForm()) return

  try {
    await register({
      name: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      password_confirmation: form.confirmPassword,
      role: 'buyer',
    })
    formDraft.clear()

    submitted.value = true

    successMessage.value = 'Your buyer account is ready. You can now save properties and contact listing owners or brokers.'
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    await router.push(redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/')
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Registration failed. Please try again.'
  }
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-container">

      <!-- PAGE INTRODUCTION -->
      <div class="page-heading">
        <span class="eyebrow">JOIN BUTUANSPACES</span>

        <h1>Create your account</h1>

        <p>
          Join a platform designed to connect people with
          commercial real estate opportunities in Butuan City.
        </p>
      </div>

      <!-- ACCOUNT TYPE SELECTION -->
      <section class="account-section">
        <div class="section-heading">
          <span class="step-label">STEP 01</span>
          <h2>Choose your account type</h2>
          <p>Select the role that best describes you.</p>
        </div>

        <div class="account-grid">
          <button
            v-for="account in accountTypes"
            :key="account.value"
            type="button"
            class="account-card"
            :class="{
              selected: form.accountType === account.value
            }"
            :aria-pressed="form.accountType === account.value"
            @click="selectAccountType(account.value)"
          >
            <span class="account-icon">
              {{ account.icon }}
            </span>

            <strong>{{ account.title }}</strong>

            <span class="account-description">
              {{ account.description }}
            </span>

            <span
              v-if="form.accountType === account.value"
              class="selected-indicator"
            >
              Selected
            </span>
          </button>
        </div>
      </section>

      <!-- REGISTRATION FORM -->
      <section class="form-section">
        <div class="section-heading">
          <span class="step-label">STEP 02</span>
          <h2>Account information</h2>
          <p>Complete the information below to create your account.</p>
        </div>

        <div v-if="errorMessage" class="error-message" role="alert">
          {{ errorMessage }}
        </div>

        <div v-if="submitted" class="success-message" role="status">
          <span class="success-icon">✓</span>
          <div>
            <h3>Account created successfully</h3>
            <p>{{ successMessage }}</p>
          </div>
        </div>

        <form
          class="register-form"
          novalidate
          @submit.prevent="handleRegister"
        >

          <!-- BASIC INFORMATION -->
          <div class="form-grid">

            <div class="form-group full-width">
              <label for="register-name">
                Full Name <span>*</span>
              </label>

              <input
                id="register-name"
                v-model="form.fullName"
                type="text"
                placeholder="Enter your full name"
                autocomplete="name"
                :aria-invalid="!!errors.fullName"
              />

              <small v-if="errors.fullName" class="error">
                {{ errors.fullName }}
              </small>
            </div>

            <div class="form-group">
              <label for="register-email">
                Email Address <span>*</span>
              </label>

              <input
                id="register-email"
                v-model="form.email"
                type="email"
                placeholder="example@email.com"
                autocomplete="email"
                :aria-invalid="!!errors.email"
              />

              <small v-if="errors.email" class="error">
                {{ errors.email }}
              </small>
            </div>

            <div class="form-group">
              <label for="register-phone">
                Mobile Number <span>*</span>
              </label>

              <input
                id="register-phone"
                v-model="form.phone"
                type="tel"
                placeholder="09XXXXXXXXX"
                autocomplete="tel"
                :aria-invalid="!!errors.phone"
              />

              <small v-if="errors.phone" class="error">
                {{ errors.phone }}
              </small>
            </div>

            <!-- PASSWORD -->
            <div class="form-group">
              <label for="register-password">
                Password <span>*</span>
              </label>

              <div class="password-field">
                <input
                  id="register-password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Create a password"
                  autocomplete="new-password"
                  :aria-invalid="!!errors.password"
                />

                <button
                  type="button"
                  class="password-toggle"
                  :aria-label="
                    showPassword ? 'Hide password' : 'Show password'
                  "
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>

              <small v-if="errors.password" class="error">
                {{ errors.password }}
              </small>
            </div>

            <div class="form-group">
              <label for="register-confirm">
                Confirm Password <span>*</span>
              </label>

              <div class="password-field">
                <input
                  id="register-confirm"
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                  :aria-invalid="!!errors.confirmPassword"
                />

                <button
                  type="button"
                  class="password-toggle"
                  :aria-label="
                    showConfirmPassword
                      ? 'Hide confirmation password'
                      : 'Show confirmation password'
                  "
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  {{ showConfirmPassword ? 'Hide' : 'Show' }}
                </button>
              </div>

              <small v-if="errors.confirmPassword" class="error">
                {{ errors.confirmPassword }}
              </small>
            </div>
          </div>

          <!-- ACKNOWLEDGEMENT -->
          <div class="terms-section">
            <label class="checkbox-label">
              <input
                v-model="form.acceptTerms"
                type="checkbox"
              />

              <span>
                I agree to the account terms and confirm that the information provided is accurate.
              </span>
            </label>

            <small v-if="errors.acceptTerms" class="error">
              {{ errors.acceptTerms }}
            </small>
          </div>

          <!-- BUTTON -->
          <button class="submit-button" type="submit">
            Create Account
          </button>

          <p class="demo-notice">
            Your account information will be stored securely in the application database.
          </p>
        </form>

        <div class="login-link">
          Already have an account?

          <RouterLink :to="{ name: 'login', query: route.query.redirect ? { redirect: route.query.redirect } : undefined }">
            Sign In
          </RouterLink>
        </div>
      </section>

    </div>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #f5f7fb;
  padding: 65px 24px 90px;
}

.auth-container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-heading {
  text-align: center;
  max-width: 580px;
  margin: 0 auto 42px;
}

.eyebrow,
.step-label {
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.page-heading h1 {
  color: #142d4e;
  font-size: clamp(30px, 4vw, 40px);
  letter-spacing: -1px;
  margin: 12px 0;
}

.page-heading p,
.section-heading p {
  color: #64748b;
  font-size: 14px;
  line-height: 1.8;
}

.account-section {
  margin-bottom: 35px;
}

.section-heading {
  margin-bottom: 22px;
}

.section-heading h2 {
  color: #142d4e;
  font-size: 23px;
  margin: 10px 0 6px;
}

.section-heading p {
  margin: 0;
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.account-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 12px;
  min-height: 195px;
  padding: 24px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s;
}

.account-card:hover {
  border-color: #93c5fd;
}

.account-card.selected {
  background: #f8fbff;
  border: 2px solid #2563eb;
  padding: 23px;
  box-shadow: 0 5px 20px rgba(37, 99, 235, 0.08);
}

.account-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #eaf1fc;
  color: #2563eb;
  font-size: 14px;
  font-weight: 800;
}

.account-card strong {
  color: #142d4e;
  font-size: 16px;
}

.account-description {
  color: #64748b;
  font-size: 12px;
  line-height: 1.7;
}

.selected-indicator {
  position: absolute;
  top: 18px;
  right: 18px;
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
}

/* FORM PANEL */

.form-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 38px 42px;
  box-shadow: 0 8px 30px rgba(20, 45, 78, 0.035);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
}

.form-group label {
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.form-group label > span:not(.optional) {
  color: #dc2626;
}

.optional {
  color: #94a3b8;
  font-weight: 400;
}

.form-group input,
.form-group select {
  width: 100%;
  height: 46px;
  border: 1px solid #dbe2ea;
  border-radius: 9px;
  background: white;
  padding: 0 14px;
  outline: none;
  color: #142d4e;
  font-size: 13px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #2563eb;
}

.form-group input[aria-invalid="true"],
.form-group select[aria-invalid="true"] {
  border-color: #dc2626;
}

.form-group input::placeholder {
  color: #94a3b8;
}

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
  border: none;
  background: transparent;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.error {
  color: #dc2626;
  font-size: 12px;
}

/* ROLE SPECIFIC SECTION */

.role-section {
  padding: 25px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.role-heading {
  margin-bottom: 22px;
}

.role-heading h3 {
  color: #142d4e;
  font-size: 18px;
  margin: 0 0 8px;
}

.role-heading p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
  margin: 0;
}

.info-note {
  margin-top: 20px;
  padding: 14px;
  background: #eaf1fc;
  color: #47617f;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.7;
}

/* TERMS */

.terms-section {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  margin-top: 3px;
  flex-shrink: 0;
  accent-color: #2563eb;
}

.checkbox-label span {
  color: #64748b;
  font-size: 12px;
  line-height: 1.8;
}

/* SUBMIT */

.submit-button {
  width: 100%;
  padding: 16px;
  color: white;
  background: #142d4e;
  border: 1px solid #142d4e;
  border-radius: 9px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.demo-notice {
  margin: -8px 0 0;
  color: #94a3b8;
  font-size: 11px;
  text-align: center;
}

.login-link {
  text-align: center;
  color: #64748b;
  font-size: 13px;
  margin-top: 25px;
}

.login-link a {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
}

/* SUCCESS */

.success-message {
  display: flex;
  gap: 15px;
  padding: 20px;
  margin-bottom: 25px;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  background: #f0fdf4;
}

.success-icon {
  color: #15803d;
  font-size: 24px;
  font-weight: 700;
}

.success-message h3 {
  color: #166534;
  font-size: 15px;
  margin: 0 0 8px;
}

.success-message p {
  color: #166534;
  font-size: 12px;
  line-height: 1.7;
  margin: 0;
}

/* RESPONSIVE */

@media (max-width: 760px) {
  .account-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .account-card {
    min-height: 130px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .form-section {
    padding: 28px 22px;
  }

  .auth-page {
    padding: 40px 16px 70px;
  }
}

@media (max-width: 480px) {
  .page-heading h1 {
    font-size: 28px;
  }

  .role-section {
    padding: 20px 16px;
  }

  .section-heading h2 {
    font-size: 20px;
  }
}
</style>
