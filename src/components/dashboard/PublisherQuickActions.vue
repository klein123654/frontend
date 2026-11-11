<script setup lang="ts">
defineProps<{
  newInquiryCount: number
}>()

const emit = defineEmits<{ navigate: [path: string] }>()
</script>

<template>
  <div class="quick-actions">
    <button type="button" class="quick-action" @click="emit('navigate', '/properties/create')">
      <span class="quick-icon" aria-hidden="true">+</span>
      <span>
        <strong>Add New Property</strong>
        <small>Create a property listing</small>
      </span>
      <span class="action-arrow" aria-hidden="true">→</span>
    </button>

    <button type="button" class="quick-action" @click="emit('navigate', '/properties')">
      <span class="quick-icon" aria-hidden="true">▤</span>
      <span>
        <strong>Manage Properties</strong>
        <small>View your listing statuses</small>
      </span>
      <span class="action-arrow" aria-hidden="true">→</span>
    </button>

    <button type="button" class="quick-action" @click="emit('navigate', '/inquiries')">
      <span class="quick-icon" aria-hidden="true">✉</span>
      <span>
        <strong>View Inquiries</strong>
        <small>{{ newInquiryCount }} new inquiries awaiting attention</small>
      </span>
      <span class="action-arrow" aria-hidden="true">→</span>
    </button>
  </div>

  <div class="approval-info">
    <strong>How listing approval works</strong>
    <p>
      Listings you submit for review are checked by an administrator before they appear publicly.
      You’ll get an email when a listing is approved or needs changes.
    </p>
  </div>
</template>

<style scoped>
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 13px;
  width: 100%;
  padding: 14px;
  text-align: left;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.quick-action:hover {
  border-color: #93c5fd;
  background: #f1f7ff;
}

.quick-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 9px;
  background: #eaf1fc;
  color: #2563eb;
  font-size: 20px;
}

.quick-action > span:nth-child(2) {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
}

.quick-action strong {
  color: #142d4e;
  font-size: 12px;
}

.quick-action small {
  color: #5e6d82;
  font-size: 11px;
}

.action-arrow {
  color: #5e6d82;
  font-size: 17px;
}

.approval-info {
  margin-top: 26px;
  padding: 18px;
  border-radius: 10px;
  background: #eaf1fc;
}

.approval-info strong {
  color: #142d4e;
  font-size: 13px;
}

.approval-info p {
  color: #5e6d82;
  font-size: 12px;
  line-height: 1.8;
  margin-bottom: 0;
}
</style>
