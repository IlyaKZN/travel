import { onMounted, onUnmounted } from "vue";
import { getToken } from "@/lib/api";
import {
  applyRealtimeEvent,
  chatWs,
  ensureChatSocket,
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
  queryClient: Parameters<typeof applyRealtimeEvent>[0],
) {
  useChatSocket((event) => {
    applyRealtimeEvent(queryClient, event);
  });
}
