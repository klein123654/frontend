import { computed, ref } from 'vue'
import type { BrokerListing } from '@/data/broker/brokerListings'

const listings = ref<BrokerListing[]>([])

export const allBrokerListings = computed(() => listings.value)
