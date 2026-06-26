import type { ChatThread, Message } from "@/lib/api";

export type ChatWsEvent =
  | { type: "connected"; userId: string }
  | { type: "joined"; conversation: ChatThread; messages: Message[] }
  | { type: "message"; message: Message }
  | { type: "conversation_updated"; conversation: ChatThread }
  | { type: "error"; message: string };

type QueryClientLike = {
  setQueryData: <T>(key: unknown[], updater: T | ((old: T | undefined) => T | undefined)) => void;
};

function wsUrl(token: string) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;
}

class ChatWebSocketClient {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private listeners = new Set<(event: ChatWsEvent) => void>();
  private joinedConversationId: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private intentionalClose = false;

  subscribe(listener: (event: ChatWsEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: ChatWsEvent) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  connect(token: string) {
    if (this.token === token && this.ws?.readyState === WebSocket.OPEN) return;
    if (this.token === token && this.ws?.readyState === WebSocket.CONNECTING) return;

    this.intentionalClose = false;
    this.token = token;
    this.open();
  }

  disconnect() {
    this.intentionalClose = true;
    this.token = null;
    this.joinedConversationId = null;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  private open() {
    if (!this.token) return;

    this.ws?.close();
    const ws = new WebSocket(wsUrl(this.token));
    this.ws = ws;

    ws.onopen = () => {
      this.reconnectAttempt = 0;
      if (this.joinedConversationId) {
        this.sendRaw({ type: "join", conversationId: this.joinedConversationId });
      }
    };

    ws.onmessage = (event) => {
      try {
        this.emit(JSON.parse(event.data as string) as ChatWsEvent);
      } catch {
        /* ignore malformed payloads */
      }
    };

    ws.onclose = () => {
      this.ws = null;
      if (!this.intentionalClose && this.token) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 30_000);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, delay);
  }

  private sendRaw(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  join(conversationId: string) {
    this.joinedConversationId = conversationId;
    this.sendRaw({ type: "join", conversationId });
  }

  leave() {
    this.joinedConversationId = null;
    this.sendRaw({ type: "leave" });
  }

  send(text: string) {
    this.sendRaw({ type: "send", text });
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const chatWs = new ChatWebSocketClient();

export function appendChatMessage(queryClient: QueryClientLike, chatId: string, message: Message) {
  queryClient.setQueryData<Message[]>(["messages", chatId], (old) => {
    const list = old ?? [];
    if (list.some((m) => m.id === message.id)) return list;
    return [...list, message];
  });
}

export function syncJoinedChat(
  queryClient: QueryClientLike,
  conversation: ChatThread,
  messages: Message[],
) {
  queryClient.setQueryData(["chat", conversation.id], conversation);
  queryClient.setQueryData(["messages", conversation.id], messages);
}

export function updateChatConversation(queryClient: QueryClientLike, conversation: ChatThread) {
  queryClient.setQueryData(["chat", conversation.id], conversation);
  queryClient.setQueryData<ChatThread[]>(["chats"], (old) => {
    if (!old) return old;
    const idx = old.findIndex((c) => c.id === conversation.id);
    const next = idx === -1 ? [conversation, ...old] : old.map((c, i) => (i === idx ? conversation : c));
    return [...next].sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  });
}

export function ensureChatSocket(token: string | null) {
  if (token) {
    chatWs.connect(token);
  } else {
    chatWs.disconnect();
  }
}
