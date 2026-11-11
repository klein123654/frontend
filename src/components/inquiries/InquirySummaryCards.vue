<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, Clock3, Mail, MessageSquare } from '@lucide/vue'
import { countInquiriesByStatus, type OwnerInquiry } from '@/data/owner/ownerInquiries'

const props = defineProps<{
  inquiries: Pick<OwnerInquiry, 'status'>[]
}>()

const counts = computed(() => countInquiriesByStatus(props.inquiries))
</script>

<template>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-icon">
        <MessageSquare :size="21" />
      </div>
      <div class="summary-content">
        <span>Total Inquiries</span>
        <strong>{{ inquiries.length }}</strong>
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-icon new-icon">
        <Mail :size="21" />
      </div>
      <div class="summary-content">
        <span>New</span>
        <strong>{{ counts.New }}</strong>
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-icon progress-icon">
        <Clock3 :size="21" />
      </div>
      <div class="summary-content">
        <span>In Progress</span>
        <strong>{{ counts['In Progress'] }}</strong>
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-icon closed-icon">
        <CheckCircle2 :size="21" />
      </div>
      <div class="summary-content">
        <span>Resolved</span>
        <strong>{{ counts.Resolved }}</strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
