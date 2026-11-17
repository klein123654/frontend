<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Sparkles } from '@lucide/vue'
import MessageSafetyWarning from '@/components/inquiries/MessageSafetyWarning.vue'
import { useAuth } from '@/composables/useAuth'
import { fetchInquiryMessages, sendInquiryMessage, suggestInquiryReply, type InquiryThreadMessage } from '@/services/inquiryService'

const props = defineProps<{ visible: boolean; inquiryId: number | null }>()
const emit = defineEmits<{ 'update:visible': [visible: boolean] }>()

const loading = ref(false)
const sending = ref(false)
const error = ref('')
const replyBody = ref('')
const messages = ref<InquiryThreadMessage[]>([])
const messageList = ref<HTMLElement | null>(null)
const { user } = useAuth()
const drafting = ref(false)
const draftNote = ref('')

async function draftReply() {
  if (props.inquiryId === null || drafting.value) return
  if (replyBody.value.trim() && !window.confirm('Replace what you have written with an AI draft?')) return
  drafting.value = true
  error.value = ''
  draftNote.value = ''
  try {
    const { reply } = await suggestInquiryReply(props.inquiryId)
    replyBody.value = reply
    draftNote.value = reply.includes('[')
      ? 'AI draft added. Replace the parts in [brackets] with the correct details, then review before sending.'
      : 'AI draft added. Review and edit it before sending.'
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'The AI could not draft a reply.'
  } finally {
    drafting.value = false
  }
}

async function scrollToLatestMessage() {
  await nextTick()
  messageList.value?.scrollTo({ top: messageList.value.scrollHeight, behavior: 'smooth' })
}

async function loadMessages(inquiryId: number) {
  loading.value = true
  error.value = ''
  messages.value = []
  try {
    const response = await fetchInquiryMessages(inquiryId)
    messages.value = response.data
    await scrollToLatestMessage()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to load this conversation.'
  } finally {
    loading.value = false
  }
}

watch(() => [props.visible, props.inquiryId] as const, ([visible, inquiryId]) => {
  if (visible && inquiryId !== null) void loadMessages(inquiryId)
})

async function sendReply() {
  if (props.inquiryId === null || !replyBody.value.trim() || sending.value) return
  sending.value = true
  error.value = ''
  try {
    const response = await sendInquiryMessage(props.inquiryId, replyBody.value.trim())
    messages.value.push(response.data)
    replyBody.value = ''
    draftNote.value = ''
    await scrollToLatestMessage()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to send your reply.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div v-if="visible" class="conversation-overlay" role="presentation" @click.self="emit('update:visible', false)">
    <section class="conversation-panel" role="dialog" aria-modal="true" aria-labelledby="publisher-conversation-title">
      <header class="conversation-header">
        <div><span class="eyebrow">INQUIRY THREAD</span><h2 id="publisher-conversation-title">Conversation</h2></div>
        <button type="button" aria-label="Close conversation" @click="emit('update:visible', false)">×</button>
      </header>
      <p v-if="loading" role="status">Loading conversation…</p>
      <div v-else ref="messageList" class="conversation-messages" aria-live="polite">
        <article v-for="message in messages" :key="message.id" class="conversation-message">
          <header><strong>{{ message.sender?.name || 'Former account' }}</strong><time :datetime="message.created_at">{{ new Date(message.created_at).toLocaleString() }}</time></header>
          <p>{{ message.body }}</p>
          <MessageSafetyWarning v-if="message.safety_warning && message.sender_id !== user?.id" :reason="message.safety_warning" />
        </article>
        <p v-if="!messages.length && !error" class="conversation-empty">No messages in this conversation yet.</p>
      </div>
      <p v-if="error" class="conversation-error" role="alert">{{ error }}</p>
      <form class="conversation-reply" @submit.prevent="sendReply">
        <div class="reply-label-row">
          <label for="publisher-conversation-reply">Reply</label>
          <button type="button" class="draft-button" :disabled="drafting || loading" @click="draftReply">
            <Sparkles :size="14" aria-hidden="true" /> {{ drafting ? 'Drafting…' : 'Suggest a reply' }}
          </button>
        </div>
        <textarea id="publisher-conversation-reply" v-model="replyBody" maxlength="2000" rows="5" required placeholder="Write a reply…"></textarea>
        <p v-if="draftNote" class="draft-note" role="status">{{ draftNote }}</p>
        <button type="submit" :disabled="sending || !replyBody.trim()">{{ sending ? 'Sending…' : 'Send' }}</button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.conversation-overlay{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;padding:20px;background:#10223499}.conversation-panel{display:flex;flex-direction:column;width:min(620px,100%);max-height:min(760px,90vh);padding:22px;border-radius:12px;background:white;box-shadow:0 24px 70px #10223440}.conversation-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:1px solid #e2e8f0;padding-bottom:15px}.eyebrow{color:#2563eb;font-size:11px;font-weight:800}.conversation-header h2{margin:6px 0 0;font-size:19px;color:#142d4e}.conversation-header button{border:0;background:none;font-size:26px;cursor:pointer;color:#475569}.conversation-messages{display:grid;align-content:start;gap:12px;min-height:120px;overflow:auto;padding:16px 2px}.conversation-message{padding:13px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc}.conversation-message header{display:flex;justify-content:space-between;gap:12px;color:#334155;font-size:12px}.conversation-message time{color:#5e6d82;font-weight:400}.conversation-message p{margin:9px 0 0;color:#1e293b;white-space:pre-wrap;overflow-wrap:anywhere}.conversation-empty{color:#5e6d82;text-align:center;padding:28px}.conversation-error{padding:10px;background:#fef2f2;color:#991b1b;border-radius:7px}.conversation-reply{display:grid;gap:9px;border-top:1px solid #e2e8f0;padding-top:16px}.conversation-reply label{font-size:13px;font-weight:700}.conversation-reply textarea{resize:vertical;min-height:84px;padding:10px;border:1px solid #cbd5e1;border-radius:7px;font:inherit}.conversation-reply button{justify-self:end;padding:10px 18px;border:0;border-radius:7px;background:#142d4e;color:white;font-weight:700;cursor:pointer}.conversation-reply button:disabled{opacity:.5;cursor:not-allowed}

.reply-label-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.draft-button { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px !important; border: 1px solid #c7d2fe !important; border-radius: 8px; background: #eef2ff !important; color: #3730a3 !important; font-size: 12px; font-weight: 700; cursor: pointer; }
.draft-button:disabled { opacity: 0.6; cursor: wait; }
.draft-note { margin: 0; color: #475569; font-size: 12px; }
</style>
