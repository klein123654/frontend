<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { AlertTriangle, CheckCircle2 } from '@lucide/vue'

/**
 * Modal shown after saving a listing: a success message with what happens
 * next, or a save failure that reassures the publisher nothing was lost.
 * It cannot be dismissed by clicking outside, so a form is never cleared by accident.
 */
const props = withDefaults(defineProps<{
  open: boolean
  variant: 'success' | 'error'
  title: string
  message: string
  /** Extra line under the message, e.g. "Nothing you typed was lost." */
  note?: string
  primaryLabel: string
  linkLabel?: string
  linkTo?: string
  busy?: boolean
}>(), { note: '', linkLabel: '', linkTo: '', busy: false })

const emit = defineEmits<{ primary: []; close: [] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const primaryButton = ref<HTMLButtonElement | null>(null)

async function sync(open: boolean) {
  const element = dialog.value
  if (!element) return
  if (open && !element.open) {
    if (typeof element.showModal === 'function') element.showModal()
    else element.setAttribute('open', '')
    await nextTick()
    primaryButton.value?.focus()
  } else if (!open && element.open) {
    if (typeof element.close === 'function') element.close()
    else element.removeAttribute('open')
  }
}

watch(() => props.open, sync)
onMounted(() => sync(props.open))

/** Esc acts like the main button after a success, and like Close after an error. */
function onCancel(event: Event) {
  event.preventDefault()
  if (props.busy) return
  if (props.variant === 'success') emit('primary')
  else emit('close')
}
</script>

<template>
  <dialog
    ref="dialog"
    class="save-dialog"
    :class="`save-dialog--${variant}`"
    :role="variant === 'error' ? 'alertdialog' : 'dialog'"
    aria-modal="true"
    aria-labelledby="save-dialog-title"
    aria-describedby="save-dialog-message"
    data-testid="save-result-dialog"
    @cancel="onCancel"
  >
    <div class="save-dialog__icon" aria-hidden="true">
      <CheckCircle2 v-if="variant === 'success'" :size="30" />
      <AlertTriangle v-else :size="30" />
    </div>
    <h2 id="save-dialog-title">{{ title }}</h2>
    <p id="save-dialog-message">{{ message }}</p>
    <p v-if="note" class="save-dialog__note">{{ note }}</p>
    <div class="save-dialog__actions">
      <button ref="primaryButton" type="button" class="save-dialog__primary" :disabled="busy" @click="emit('primary')">
        {{ busy ? 'Saving…' : primaryLabel }}
      </button>
      <RouterLink v-if="linkTo" :to="linkTo" class="save-dialog__link">{{ linkLabel }}</RouterLink>
      <button v-if="variant === 'error'" type="button" class="save-dialog__secondary" :disabled="busy" @click="emit('close')">Close</button>
    </div>
  </dialog>
</template>

<style scoped>
.save-dialog {
  width: min(460px, calc(100vw - 32px));
  padding: 28px 26px 24px;
  border: 0;
  border-radius: 16px;
  box-shadow: 0 24px 60px #0f172a40;
  color: #142d4e;
  text-align: center;
}

.save-dialog::backdrop {
  background: #0f172a8c;
}

.save-dialog__icon {
  display: inline-grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 10px;
  border-radius: 50%;
}

.save-dialog--success .save-dialog__icon {
  background: #dcfce7;
  color: #15803d;
}

.save-dialog--error .save-dialog__icon {
  background: #fef3c7;
  color: #b45309;
}

h2 {
  margin: 0 0 8px;
  font-size: 21px;
}

p {
  margin: 0 0 8px;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}

.save-dialog__note {
  padding: 9px 12px;
  border-radius: 9px;
  background: #f8fafc;
  color: #334155;
  font-size: 13px;
}

.save-dialog__actions {
  display: grid;
  gap: 10px;
  justify-items: center;
  margin-top: 16px;
}

.save-dialog__primary {
  width: 100%;
  min-height: 46px;
  border: 0;
  border-radius: 10px;
  background: #142d4e;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.save-dialog--success .save-dialog__primary {
  background: #15803d;
}

.save-dialog__primary:disabled,
.save-dialog__secondary:disabled {
  opacity: 0.6;
  cursor: wait;
}

.save-dialog__link,
.save-dialog__secondary {
  border: 0;
  background: none;
  color: #1d4ed8;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.save-dialog__secondary {
  color: #5e6d82;
}
</style>
