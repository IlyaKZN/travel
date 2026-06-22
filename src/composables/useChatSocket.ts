import { ref, onUnmounted, type Ref } from 'vue'
import { getToken } from '@/api/client'
import type { ChatMessage, Conversation } from '@/types'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export function useChatSocket(conversationId: Ref<string>) {
  const status = ref<ConnectionStatus>('disconnected')
  const error = ref('')

  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let intentionalClose = false

  function getWsUrl() {
    const token = getToken()
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token ?? '')}`
  }

  function connect(
    onJoined: (data: { conversation: Conversation; messages: ChatMessage[] }) => void,
    onMessage: (message: ChatMessage) => void,
  ) {
    disconnect(false)
    intentionalClose = false
    status.value = 'connecting'
    error.value = ''

    const token = getToken()
    if (!token) {
      status.value = 'error'
      error.value = 'Требуется авторизация'
      return
    }

    ws = new WebSocket(getWsUrl())

    ws.onopen = () => {
      status.value = 'connected'
      ws?.send(JSON.stringify({ type: 'join', conversationId: conversationId.value }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string)
        if (data.type === 'joined') {
          onJoined({ conversation: data.conversation, messages: data.messages })
        } else if (data.type === 'message') {
          onMessage(data.message as ChatMessage)
        } else if (data.type === 'error') {
          error.value = data.message ?? 'Ошибка WebSocket'
        }
      } catch {
        error.value = 'Ошибка обработки сообщения'
      }
    }

    ws.onclose = () => {
      status.value = 'disconnected'
      ws = null
      if (!intentionalClose) {
        reconnectTimer = setTimeout(() => connect(onJoined, onMessage), 3000)
      }
    }

    ws.onerror = () => {
      status.value = 'error'
      error.value = 'Ошибка соединения'
    }
  }

  function send(text: string) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      error.value = 'Нет соединения с сервером'
      return false
    }
    ws.send(JSON.stringify({ type: 'send', text }))
    return true
  }

  function rejoin() {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'leave' }))
      ws.send(JSON.stringify({ type: 'join', conversationId: conversationId.value }))
    }
  }

  function disconnect(userInitiated = true) {
    intentionalClose = userInitiated
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'leave' }))
      }
      ws.close()
      ws = null
    }
    status.value = 'disconnected'
  }

  onUnmounted(() => disconnect())

  return { status, error, connect, send, rejoin, disconnect }
}
