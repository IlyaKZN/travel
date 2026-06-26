import { onMounted, onUnmounted } from "vue";
import { getToken } from "@/lib/api";
import {
  chatWs,
  ensureChatSocket,
  updateChatConversation,
  type ChatWsEvent,
} from "@/lib/chat-ws";

export function useChatSocket(onEvent: (event: ChatWsEvent) => void) {
  let unsubscribe: (() => void) | undefined;

  onMounted(() => {
    ensureChatSocket(getToken());
    unsubscribe = chatWs.subscribe(onEvent);
  });

  onUnmounted(() => {
    unsubscribe?.();
  });
}

export function useChatsListSocket(
  queryClient: Parameters<typeof updateChatConversation>[0],
) {
  useChatSocket((event) => {
    if (event.type === "conversation_updated") {
      updateChatConversation(queryClient, event.conversation);
    }
  });
}
