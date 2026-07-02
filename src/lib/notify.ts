import { reactive, readonly } from "vue";

export type ToastVariant = "success" | "info" | "error";

export interface ToastItem {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
}

export interface NotifyOptions {
  description?: string;
  duration?: number;
}

const DEFAULT_DURATION = 3800;
const MAX_VISIBLE = 4;

const state = reactive({
  items: [] as ToastItem[],
});

const timers = new Map<number, ReturnType<typeof setTimeout>>();
let nextId = 1;

function scheduleDismiss(id: number, duration: number) {
  if (duration <= 0) return;
  const timer = setTimeout(() => dismiss(id), duration);
  timers.set(id, timer);
}

function push(variant: ToastVariant, title: string, opts?: NotifyOptions) {
  const id = nextId++;
  const item: ToastItem = {
    id,
    variant,
    title,
    description: opts?.description,
  };

  state.items.unshift(item);
  if (state.items.length > MAX_VISIBLE) {
    const removed = state.items.splice(MAX_VISIBLE);
    for (const toast of removed) {
      const timer = timers.get(toast.id);
      if (timer) {
        clearTimeout(timer);
        timers.delete(toast.id);
      }
    }
  }

  scheduleDismiss(id, opts?.duration ?? DEFAULT_DURATION);
  return id;
}

export function dismiss(id: number) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  const index = state.items.findIndex((item) => item.id === id);
  if (index !== -1) state.items.splice(index, 1);
}

export const notify = {
  success: (title: string, opts?: NotifyOptions) => push("success", title, opts),
  info: (title: string, opts?: NotifyOptions) => push("info", title, opts),
  error: (title: string, opts?: NotifyOptions) => push("error", title, opts),
  dismiss,
};

export const toastState = readonly(state);
