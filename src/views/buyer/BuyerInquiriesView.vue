<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import {
  fetchInquiryMessages,
  fetchMySentInquiries,
  sendInquiryMessage,
  type BackendInquiry,
  type InquiryThreadMessage,
} from '@/services/inquiryService'

const inquiries = ref<BackendInquiry[]>([])
const loading = ref(true)
const error = ref('')
const conversationOpen = ref(false)
const conversationLoading = ref(false)
const conversationSending = ref(false)
const conversationError = ref('')
const replyBody = ref('')
const conversationMessages = ref<InquiryThreadMessage[]>([])
const selectedInquiry = ref<BackendInquiry | null>(null)
const messageList = ref<HTMLElement | null>(null)

async function scrollToLatestMessage() {
  await nextTick()
  messageList.value?.scrollTo({ top: messageList.value.scrollHeight, behavior: 'smooth' })
}

async function openConversation(inquiry: BackendInquiry) {
  selectedInquiry.value = inquiry
  conversationOpen.value = true
  conversationLoading.value = true
  conversationError.value = ''
  conversationMessages.value = []
  try {
    const response = await fetchInquiryMessages(inquiry.id)
    conversationMessages.value = response.data
    await scrollToLatestMessage()
  } catch (cause) {
    conversationError.value = cause instanceof Error ? cause.message : 'Unable to load this conversation.'
  } finally {
    conversationLoading.value = false
  }
}

async function sendReply() {
  if (!selectedInquiry.value || !replyBody.value.trim() || conversationSending.value) return
  conversationSending.value = true
  conversationError.value = ''
  try {
    const response = await sendInquiryMessage(selectedInquiry.value.id, replyBody.value.trim())
    conversationMessages.value.push(response.data)
    replyBody.value = ''
    await scrollToLatestMessage()
  } catch (cause) {
    conversationError.value = cause instanceof Error ? cause.message : 'Unable to send your reply.'
  } finally {
    conversationSending.value = false
  }
}

onMounted(async () => {
  try {
    const response = await fetchMySentInquiries()
    inquiries.value = response.data
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to load your inquiries.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="account-page">
    <header class="page-heading"><div><span class="eyebrow">YOUR ACCOUNT</span><h1>My Inquiries</h1><p>Review the messages you sent to property contacts.</p></div><RouterLink to="/properties" class="primary-button">Explore Properties</RouterLink></header>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="loading" role="status" class="empty">Loading your inquiries…</p>
    <section v-else-if="inquiries.length" class="inquiry-list" aria-label="Sent inquiries">
      <article v-for="inquiry in inquiries" :key="inquiry.id" class="inquiry-row">
        <div><h2>{{ inquiry.property?.title || 'Property inquiry' }}</h2><p>{{ inquiry.message }}</p><small>Sent {{ inquiry.created_at.slice(0, 10) }}</small></div>
        <div class="status-block"><span class="status" :class="inquiry.status">{{ inquiry.status.replace('_', ' ') }}</span><button type="button" class="conversation-button" @click="openConversation(inquiry)">View Conversation</button><RouterLink v-if="inquiry.property_id" :to="`/properties/${inquiry.property_id}`">View property</RouterLink></div>
      </article>
    </section>
    <section v-else class="empty"><h2>No inquiries yet</h2><p>When you contact a listing owner or broker, your message will be kept here.</p><RouterLink to="/properties">Browse properties</RouterLink></section>

    <div v-if="conversationOpen" class="conversation-overlay" role="presentation" @click.self="conversationOpen = false">
      <section class="conversation-panel" role="dialog" aria-modal="true" aria-labelledby="conversation-title">
        <header class="conversation-header"><div><span class="eyebrow">INQUIRY THREAD</span><h2 id="conversation-title">{{ selectedInquiry?.property?.title || 'Property conversation' }}</h2></div><button type="button" aria-label="Close conversation" @click="conversationOpen = false">×</button></header>
        <p v-if="conversationLoading" role="status">Loading conversation…</p>
        <div v-else ref="messageList" class="conversation-messages" aria-live="polite">
          <article v-for="message in conversationMessages" :key="message.id" class="conversation-message">
            <header><strong>{{ message.sender?.name || 'Former account' }}</strong><time :datetime="message.created_at">{{ new Date(message.created_at).toLocaleString() }}</time></header>
            <p>{{ message.body }}</p>
          </article>
          <p v-if="!conversationMessages.length && !conversationError" class="conversation-empty">No messages in this conversation yet.</p>
        </div>
        <p v-if="conversationError" class="error" role="alert">{{ conversationError }}</p>
        <form class="conversation-reply" @submit.prevent="sendReply">
          <label for="buyer-conversation-reply">Reply</label>
          <textarea id="buyer-conversation-reply" v-model="replyBody" maxlength="2000" rows="3" required placeholder="Write a reply…"></textarea>
          <button type="submit" :disabled="conversationSending || !replyBody.trim()">{{ conversationSending ? 'Sending…' : 'Send' }}</button>
        </form>
      </section>
    </div>
  </main>
</template>

<style scoped>
.account-page{max-width:1120px;margin:0 auto;padding:46px 24px 80px;color:#142d4e}.page-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:28px}.eyebrow{color:#2563eb;font-size:11px;font-weight:800;letter-spacing:1.2px}.page-heading h1{font-size:32px;margin:8px 0}.page-heading p,.inquiry-row p,.empty p{color:#5e6d82;font-size:14px;line-height:1.7;margin:0}.primary-button{background:#142d4e;color:#fff;padding:13px 17px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700}.inquiry-list{display:grid;gap:14px}.inquiry-row{display:flex;justify-content:space-between;gap:24px;padding:21px;border:1px solid #e2e8f0;border-radius:12px;background:#fff}.inquiry-row h2{font-size:17px;margin:0 0 8px}.inquiry-row small{display:block;margin-top:10px;color:#5e6d82;font-size:12px}.status-block{display:flex;flex-direction:column;align-items:flex-end;gap:14px;white-space:nowrap}.status{padding:7px 10px;border-radius:20px;background:#eff6ff;color:#1d4ed8;text-transform:capitalize;font-size:12px;font-weight:700}.status.in_progress{background:#fef9c3;color:#a16207}.status.resolved{background:#dcfce7;color:#15803d}.status-block a,.empty a{color:#2563eb;font-size:13px;font-weight:700;text-decoration:none}.empty{text-align:center;padding:55px 20px;border:1px dashed #cbd5e1;border-radius:12px;background:#fff}.empty h2{margin:0 0 10px}.empty p{margin-bottom:15px}.error{padding:12px;background:#fef2f2;color:#991b1b;border-radius:8px}@media(max-width:650px){.page-heading,.inquiry-row{align-items:flex-start;flex-direction:column}.primary-button{width:100%;text-align:center}.status-block{align-items:flex-start}}
.conversation-button{border:0;background:transparent;color:#2563eb;font:inherit;font-size:13px;font-weight:700;cursor:pointer}.conversation-overlay{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:20px;background:#10223499}.conversation-panel{display:flex;flex-direction:column;width:min(620px,100%);max-height:min(760px,90vh);padding:22px;border-radius:12px;background:white;box-shadow:0 24px 70px #10223440}.conversation-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:1px solid #e2e8f0;padding-bottom:15px}.conversation-header h2{margin:6px 0 0;font-size:19px}.conversation-header button{border:0;background:none;font-size:26px;cursor:pointer;color:#475569}.conversation-messages{display:grid;align-content:start;gap:12px;min-height:120px;overflow:auto;padding:16px 2px}.conversation-message{padding:13px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc}.conversation-message header{display:flex;justify-content:space-between;gap:12px;color:#334155;font-size:12px}.conversation-message time{color:#5e6d82;font-weight:400}.conversation-message p{margin:9px 0 0;color:#1e293b;white-space:pre-wrap;overflow-wrap:anywhere}.conversation-empty{color:#5e6d82;text-align:center;padding:28px}.conversation-reply{display:grid;gap:9px;border-top:1px solid #e2e8f0;padding-top:16px}.conversation-reply label{font-size:13px;font-weight:700}.conversation-reply textarea{resize:vertical;min-height:84px;padding:10px;border:1px solid #cbd5e1;border-radius:7px;font:inherit}.conversation-reply button{justify-self:end;padding:10px 18px;border:0;border-radius:7px;background:#142d4e;color:white;font-weight:700;cursor:pointer}.conversation-reply button:disabled{opacity:.5;cursor:not-allowed}
</style>
