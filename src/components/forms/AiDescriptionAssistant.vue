<script setup lang="ts">
import { computed, ref } from 'vue'
import { Sparkles } from '@lucide/vue'
import {
  generateListingDescription,
  type DescriptionLanguage,
  type DescriptionRequest,
  type DescriptionStyle,
} from '@/services/propertyService'

/**
 * AI help for a listing description: the publisher's key features, a language,
 * and draft / polish / restyle actions. The publisher always reviews the text.
 */
const props = withDefaults(defineProps<{
  facts: Omit<DescriptionRequest, 'features' | 'currentDescription' | 'style' | 'language'>
  idPrefix?: string
}>(), { idPrefix: 'listing' })

const description = defineModel<string>({ required: true })
const features = defineModel<string>('features', { default: '' })

const language = ref<DescriptionLanguage>('en')
const busy = ref(false)
const message = ref('')
const unsupported = ref<string[]>([])
const askReplace = ref(false)
const hasDraft = ref(false)
const id = (name: string) => `${props.idPrefix}-${name}`

const LANGUAGES: { value: DescriptionLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fil', label: 'Filipino' },
  { value: 'ceb', label: 'Cebuano' },
]

const missingFacts = computed(() => !props.facts.title.trim() && !props.facts.area && !props.facts.price)

async function run(style: DescriptionStyle, polish: boolean) {
  askReplace.value = false
  busy.value = true
  message.value = ''
  unsupported.value = []
  try {
    const draft = await generateListingDescription({
      ...props.facts,
      features: features.value,
      currentDescription: polish ? description.value : undefined,
      style,
      language: language.value,
    })
    description.value = draft.description
    unsupported.value = draft.unsupportedNumbers
    hasDraft.value = true
  } catch (cause) {
    message.value = cause instanceof Error ? cause.message : 'AI description generation is temporarily unavailable. Please try again.'
  } finally {
    busy.value = false
  }
}

/** Ask first when the box already has text, so nothing is overwritten by surprise. */
function generate() {
  if (description.value.trim() && !hasDraft.value) {
    askReplace.value = true
    return
  }
  void run('standard', false)
}

/** Restyle the current draft, keeping what the publisher may have edited in it. */
function restyle(style: DescriptionStyle) {
  void run(style, true)
}
</script>

<template>
  <div class="ai-assist" data-testid="ai-description-assistant">
    <label :for="id('features')" class="ai-assist__label">
      Key features for the AI <span>(optional, not shown publicly)</span>
    </label>
    <textarea
      :id="id('features')"
      v-model="features"
      rows="2"
      maxlength="1000"
      placeholder="e.g. corner unit, 2 parking slots, fiber internet ready, 3-phase power"
    />
    <small class="ai-assist__hint">The AI uses these with the title, size, address, price and types, and never adds features you did not give.</small>

    <div class="ai-assist__row">
      <label :for="id('language')" class="sr-only">Language</label>
      <select :id="id('language')" v-model="language" :disabled="busy">
        <option v-for="option in LANGUAGES" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
      <button type="button" class="ai-assist__primary" :disabled="busy" @click="generate">
        <Sparkles v-if="!busy" :size="15" aria-hidden="true" />
        <span>{{ busy ? 'Generating…' : 'Generate Description' }}</span>
      </button>
    </div>

    <div v-if="askReplace" class="ai-assist__ask" role="group" aria-label="The description already has text">
      <span>The description already has text. What should the AI do?</span>
      <button type="button" @click="run('standard', true)">Improve my text</button>
      <button type="button" @click="run('standard', false)">Write a new one</button>
      <button type="button" class="ai-assist__link" @click="askReplace = false">Cancel</button>
    </div>

    <div v-if="hasDraft && !busy" class="ai-assist__styles" role="group" aria-label="Adjust the draft">
      <button type="button" @click="run('standard', false)">Try again</button>
      <button type="button" @click="restyle('shorter')">Shorter</button>
      <button type="button" @click="restyle('longer')">Longer</button>
      <button type="button" @click="restyle('formal')">More formal</button>
    </div>

    <p v-if="unsupported.length" class="ai-assist__warn" role="alert" data-testid="ai-unsupported-numbers">
      Please check: the draft mentions {{ unsupported.join(', ') }}, which you didn't enter. Edit or remove anything that isn't true.
    </p>
    <p v-else-if="hasDraft && !message" class="ai-assist__note" role="status">Review the draft before saving. You can edit it freely.</p>
    <p v-if="missingFacts && !hasDraft && !message" class="ai-assist__note">Tip: fill in the title, price and area first for a better draft.</p>
    <p v-if="message" class="ai-assist__error" role="status">{{ message }}</p>
  </div>
</template>

<style scoped>
.ai-assist {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  background: #f8fbff;
}

.ai-assist__label {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.ai-assist__label span {
  font-weight: 400;
  color: #5e6d82;
}

textarea,
select {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 11px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  color: #142d4e;
  font: inherit;
  font-size: 13px;
}

select {
  width: auto;
  min-height: 36px;
}

.ai-assist__hint,
.ai-assist__note {
  margin: 0;
  color: #5e6d82;
  font-size: 12px;
}

.ai-assist__row,
.ai-assist__styles,
.ai-assist__ask {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.ai-assist__ask {
  padding: 9px 10px;
  border-radius: 8px;
  background: #fef3c7;
  color: #92400e;
  font-size: 12px;
}

button {
  min-height: 34px;
  padding: 0 11px;
  border: 1px solid #93c5fd;
  border-radius: 6px;
  background: #fff;
  color: #1d4ed8;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.ai-assist__primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #eff6ff;
}

.ai-assist__link {
  border-color: transparent;
  background: transparent;
  color: #5e6d82;
}

button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.ai-assist__warn {
  margin: 0;
  padding: 9px 10px;
  border-radius: 8px;
  background: #fef3c7;
  color: #92400e;
  font-size: 12px;
}

.ai-assist__error {
  margin: 0;
  color: #a33b2b;
  font-size: 12px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
