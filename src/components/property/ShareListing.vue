<script setup lang="ts">
import { computed, ref } from 'vue'
import { Link2, Share2 } from '@lucide/vue'

const props = defineProps<{
  title: string
  /** Absolute URL of the listing page. */
  url: string
}>()

const copied = ref(false)
const canUseNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

const facebookUrl = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`)
const messengerUrl = computed(() => `fb-messenger://share/?link=${encodeURIComponent(props.url)}`)

async function shareNatively() {
  try {
    await navigator.share({ title: props.title, url: props.url })
  } catch {
    // The user closed the share sheet.
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch {
    window.prompt('Copy this link:', props.url)
  }
}
</script>

<template>
  <div class="share" role="group" aria-label="Share this listing">
    <span class="share__label">Share:</span>
    <button v-if="canUseNativeShare" type="button" class="share__button" @click="shareNatively">
      <Share2 :size="15" aria-hidden="true" /> Share
    </button>
    <a :href="facebookUrl" target="_blank" rel="noopener noreferrer" class="share__button">Facebook</a>
    <a :href="messengerUrl" class="share__button share__button--mobile">Send via Messenger</a>
    <button type="button" class="share__button" @click="copyLink">
      <Link2 :size="15" aria-hidden="true" /> {{ copied ? 'Link copied' : 'Copy link' }}
    </button>
    <span class="sr-only" aria-live="polite">{{ copied ? 'Link copied to clipboard' : '' }}</span>
  </div>
</template>

<style scoped>
.share {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.share__label {
  color: #475569;
  font-size: 13px;
  font-weight: 600;
}

.share__button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 34px;
  padding: 6px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  background: #ffffff;
  color: #142d4e;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.share__button:hover {
  border-color: #1d4ed8;
  color: #1d4ed8;
}

/* The Messenger app link only works where the app is installed (phones). */
.share__button--mobile {
  display: none;
}

@media (hover: none) and (pointer: coarse) {
  .share__button--mobile {
    display: inline-flex;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
