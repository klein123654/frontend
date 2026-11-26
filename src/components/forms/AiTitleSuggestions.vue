<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles } from '@lucide/vue'
import { suggestListingTitles, type DescriptionRequest } from '@/services/propertyService'

/** "Suggest titles" button: the AI proposes up to three titles; clicking one uses it. */
const props = defineProps<{
  facts: Omit<DescriptionRequest, 'currentDescription' | 'style' | 'language'>
}>()
const emit = defineEmits<{ pick: [title: string] }>()

const busy = ref(false)
const titles = ref<string[]>([])
const message = ref('')

async function suggest() {
  busy.value = true
  message.value = ''
  try {
    titles.value = await suggestListingTitles(props.facts)
  } catch (cause) {
    titles.value = []
    message.value = cause instanceof Error ? cause.message : 'AI title suggestions are unavailable.'
  } finally {
    busy.value = false
  }
}

function pick(title: string) {
  emit('pick', title)
  titles.value = []
}
</script>

<template>
  <div class="ai-titles" data-testid="ai-title-suggestions">
    <button type="button" class="ai-titles__button" :disabled="busy" @click="suggest">
      <Sparkles v-if="!busy" :size="14" aria-hidden="true" />
      {{ busy ? 'Suggesting…' : 'Suggest titles' }}
    </button>
    <ul v-if="titles.length" class="ai-titles__list" aria-label="Suggested titles">
      <li v-for="title in titles" :key="title">
        <button type="button" @click="pick(title)">{{ title }}</button>
      </li>
    </ul>
    <small v-if="message" class="ai-titles__error" role="status">{{ message }}</small>
  </div>
</template>

<style scoped>
.ai-titles {
  display: grid;
  gap: 6px;
  justify-items: start;
}

button {
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid #93c5fd;
  border-radius: 6px;
  background: #eff6ff;
  color: #1d4ed8;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.ai-titles__button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.ai-titles__list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ai-titles__list button {
  background: #fff;
  font-weight: 600;
  text-align: left;
}

.ai-titles__error {
  color: #a33b2b;
  font-size: 12px;
}
</style>
