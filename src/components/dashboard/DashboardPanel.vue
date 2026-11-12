<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description: string
  actionLabel?: string
  tag?: 'section' | 'aside'
}>(), {
  actionLabel: '',
  tag: 'section',
})

const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <component :is="tag" class="content-panel">
    <div class="panel-header">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>

      <button v-if="actionLabel" type="button" class="text-button" @click="emit('action')">
        {{ actionLabel }}
      </button>
    </div>

    <slot />
  </component>
</template>

<style scoped>
.content-panel {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  padding: 25px;
  min-width: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 24px;
}

.panel-header h2 {
  color: #142d4e;
  font-size: 18px;
  margin: 0 0 8px;
}

.panel-header p {
  color: #5e6d82;
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}

.text-button {
  border: none;
  background: transparent;
  color: #2563eb;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.text-button:hover {
  color: #1d4ed8;
}

@media (max-width: 600px) {
  .content-panel {
    padding: 18px;
  }
}
</style>
