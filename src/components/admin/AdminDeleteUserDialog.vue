<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import type { ManagedUser } from '@/data/admin/adminTypes'
import { deleteAdminUser } from '@/stores/adminWorkspace'

const props = defineProps<{ user: ManagedUser | null }>()
const emit = defineEmits<{ close: []; deleted: [message: string] }>()

const dialog = ref<HTMLDialogElement | null>(null)
const form = reactive({ password: '', reason: '', notify: false })
const busy = ref(false)
const error = ref('')
const isPublisher = computed(() => ['Owner', 'Broker'].includes(props.user?.role ?? ''))

watch(() => props.user, async (user) => {
  Object.assign(form, { password: '', reason: '', notify: false })
  error.value = ''
  await nextTick()
  if (user) dialog.value?.showModal?.()
  else dialog.value?.close?.()
})

async function confirmDelete() {
  if (!props.user || !form.password) return
  busy.value = true
  error.value = ''
  try {
    const message = await deleteAdminUser(props.user.id, {
      password: form.password,
      reason: form.reason.trim() || undefined,
      notify_user: form.notify,
    })
    emit('deleted', message)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'The account could not be deleted.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <dialog ref="dialog" class="delete-dialog" aria-labelledby="delete-user-title" @close="emit('close')">
    <form v-if="user" method="dialog" @submit.prevent="confirmDelete">
      <h2 id="delete-user-title">Delete {{ user.name }}?</h2>
      <p class="who">{{ user.email }} · {{ user.role }}</p>
      <ul>
        <li>The account and its saved properties and searches are permanently deleted.</li>
        <li v-if="isPublisher"><strong>All of this account's listings and photos are deleted too.</strong></li>
        <li>Messages this person sent stay with the recipients, but their name and contact details are removed.</li>
        <li>This cannot be undone. To block someone without deleting their data, suspend the account instead.</li>
      </ul>

      <label for="delete-reason">Reason <span>(optional)</span></label>
      <input id="delete-reason" v-model="form.reason" maxlength="1000" placeholder="e.g. Test account, spam, fake listings" />

      <label class="check">
        <input v-model="form.notify" type="checkbox" />
        Email this person that their account was deleted
      </label>

      <label for="delete-admin-password">Your password, to confirm</label>
      <input id="delete-admin-password" v-model="form.password" type="password" required autocomplete="current-password" />

      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <div class="actions">
        <button type="button" class="secondary" :disabled="busy" @click="emit('close')">Cancel</button>
        <button type="submit" class="danger" :disabled="busy || !form.password">
          {{ busy ? 'Deleting…' : 'Delete account' }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.delete-dialog {
  width: min(92vw, 480px);
  padding: 26px;
  border: 0;
  border-radius: 14px;
  box-shadow: 0 24px 60px rgb(15 23 42 / 25%);
}

.delete-dialog::backdrop {
  background: rgb(15 23 42 / 45%);
}

h2 {
  margin: 0 0 4px;
  color: #142d4e;
  font-size: 20px;
}

.who {
  margin: 0 0 12px;
  color: #475569;
  font-size: 13px;
  word-break: break-all;
}

ul {
  margin: 0 0 16px;
  padding-left: 18px;
  color: #475569;
  font-size: 13px;
  line-height: 1.6;
}

form {
  display: grid;
  gap: 8px;
}

label {
  color: #142d4e;
  font-size: 12px;
  font-weight: 700;
}

label span {
  color: #64748b;
  font-weight: 500;
}

input:not([type='checkbox']) {
  min-height: 42px;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

.check {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 4px 0;
  font-weight: 500;
}

.error {
  margin: 0;
  color: #b91c1c;
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}

.actions button {
  padding: 11px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.secondary {
  background: #ffffff;
  color: #142d4e;
}

.danger {
  border-color: #b91c1c !important;
  background: #b91c1c;
  color: #ffffff;
}

button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
