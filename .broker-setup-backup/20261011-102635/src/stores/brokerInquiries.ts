import { computed, ref } from 'vue'
import type { BrokerInquiry } from '@/data/broker/brokerInquiries'

const inquiries = ref<BrokerInquiry[]>([])

export const allBrokerInquiries = computed(() => inquiries.value)
