import { chatWs, ensureChatSocket } from "./chat-ws";
import { syncPushSubscription } from "./push-notifications";

export type TransportType = "car" | "train" | "bus" | "plane";

export interface User {
  id: string;
  nickname: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  avatarColor: string;
  bio: string;
  location: string;
  joinedYear: number;
  email?: string;
}

export interface Trip {
  id: string;
  from: string;
  to: string;
  startAt: string;
  endAt: string;
  transport: TransportType;
  seats: number;
  taken: number;
  budget: number;
  organizerId: string;
  organizer?: User;
  participantIds: string[];
  participants?: User[];
  pendingRequestIds?: string[];
  pendingRequests?: Array<{ user: User; createdAt: string }>;
  description: string;
  info: string;
  tags?: string[];
}

export interface Message {
  id: string;
  authorId: string;
  text: string;
  at: string;
  image?: string;
}

export interface ChatThread {
  id: string;
  kind: "group" | "dm";
  tripId?: string;
  participantIds: string[];
  participants?: User[];
  title: string;
  preview: string;
  unread: number;
  lastAt: string;
  otherUser?: User;
}

export interface Review {
  id: string;
  authorId: string;
  text: string;
  at: string;
}

export type NotificationKind =
  | "request_incoming"
  | "request_accepted"
  | "request_declined"
  | "trip_updated";

export interface Notification {
  id: string;
  kind: NotificationKind;
  tripId: string;
  actorId?: string;
  at: string;
  read: boolean;
  changeSummary?: string;
}

interface AuthResult {
  token: string;
  user: User;
  needsProfile?: boolean;
}

export const transportLabel: Record<TransportType, string> = {
  car: "Авто",
  train: "Поезд",
  bus: "Автобус",
  plane: "Самолёт",
};

export const suggestedTripTags = [
  "Природа",
  "Городской уикенд",
  "Фестиваль",
  "Хайкинг",
  "Пляж",
  "Гастротур",
  "Фото",
  "Спорт",
  "Йога",
  "Работа/воркейшн",
  "С детьми",
  "С животными",
  "Бюджетно",
  "Комфорт",
  "Ночной выезд",
] as const;

const TOKEN_KEY = "waymate_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  ensureChatSocket(token);
  void syncPushSubscription();
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  chatWs.disconnect();
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    if (response.status === 401) {
      clearToken();
    }
    throw new Error(errorBody?.error ?? "Не удалось выполнить запрос");
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const api = {
  login: async (data: { email: string; password: string; remember?: boolean }) => {
    const result = await apiFetch<AuthResult>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setToken(result.token);
    return result;
  },

  register: async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    const result = await apiFetch<AuthResult>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setToken(result.token);
    return result;
  },

  telegramLogin: async (initData: string) => {
    const result = await apiFetch<AuthResult>("/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ initData }),
    });
    setToken(result.token);
    return result;
  },

  me: () => apiFetch<User>("/api/auth/me"),
  logout: async () => {
    try {
      await apiFetch<void>("/api/auth/logout", { method: "POST" });
    } finally {
      clearToken();
    }
  },
  users: () => apiFetch<User[]>("/api/users"),
  user: (id: string) => apiFetch<User>(`/api/users/${id}`),
  updateMe: (data: Partial<User> & { email?: string; phone?: string; age?: string; firstName?: string; lastName?: string }) =>
    apiFetch<User>("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch<{ message: string }>("/api/auth/password", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  trips: () => apiFetch<Trip[]>("/api/trips"),
  trip: (id: string) => apiFetch<Trip>(`/api/trips/${id}`),
  createTrip: (data: Omit<Trip, "id" | "taken" | "organizerId" | "participantIds" | "organizer" | "participants"> & { seats: number }) =>
    apiFetch<Trip>("/api/trips", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTrip: (
    id: string,
    data: Omit<Trip, "id" | "taken" | "organizerId" | "participantIds" | "organizer" | "participants" | "pendingRequestIds" | "pendingRequests"> & {
      seats: number;
    },
  ) =>
    apiFetch<Trip>(`/api/trips/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteTrip: (id: string) =>
    apiFetch<{ message: string }>(`/api/trips/${id}`, {
      method: "DELETE",
    }),
  joinTrip: (id: string) =>
    apiFetch<Trip>(`/api/trips/${id}/signup`, {
      method: "POST",
    }),
  cancelTripRequest: (id: string) =>
    apiFetch<Trip>(`/api/trips/${id}/signup`, {
      method: "DELETE",
    }),
  approveTripRequest: (tripId: string, userId: string) =>
    apiFetch<Trip>(`/api/trips/${tripId}/requests/${userId}/approve`, {
      method: "POST",
    }),
  declineTripRequest: (tripId: string, userId: string) =>
    apiFetch<Trip>(`/api/trips/${tripId}/requests/${userId}/decline`, {
      method: "POST",
    }),
  removeTripParticipant: (tripId: string, userId: string) =>
    apiFetch<Trip>(`/api/trips/${tripId}/participants/${userId}`, {
      method: "DELETE",
    }),

  chats: () => apiFetch<ChatThread[]>("/api/chats"),
  startDm: (userId: string) =>
    apiFetch<ChatThread>(`/api/chats/dm/${userId}`, {
      method: "POST",
    }),
  tripChat: (tripId: string) => apiFetch<ChatThread>(`/api/chats/trip/${tripId}`),
  chat: (id: string) => apiFetch<ChatThread>(`/api/chats/${id}`),
  markChatRead: (id: string) =>
    apiFetch<ChatThread>(`/api/chats/${id}/read`, {
      method: "POST",
    }),
  deleteChat: (id: string) =>
    apiFetch<{ message: string }>(`/api/chats/${id}`, {
      method: "DELETE",
    }),
  messages: (chatId: string) => apiFetch<Message[]>(`/api/chats/${chatId}/messages`),
  sendMessage: (chatId: string, payload: { text: string; image?: string }) =>
    apiFetch<Message>(`/api/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  reviews: (userId: string) => apiFetch<Review[]>(`/api/users/${userId}/reviews`),
  createReview: (userId: string, text: string) =>
    apiFetch<Review>(`/api/users/${userId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  pushVapidKey: () => apiFetch<{ publicKey: string | null }>("/api/push/vapid-key"),
  subscribePush: (subscription: PushSubscriptionJSON) =>
    apiFetch<{ message: string }>("/api/push/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
    }),
  unsubscribePush: (endpoint: string) =>
    apiFetch<void>("/api/push/subscribe", {
      method: "DELETE",
      body: JSON.stringify({ endpoint }),
    }),

  notifications: () => apiFetch<Notification[]>("/api/notifications"),
  markAllNotificationsRead: () =>
    apiFetch<{ message: string }>("/api/notifications/read-all", { method: "POST" }),
  markNotificationRead: (id: string) =>
    apiFetch<Notification>(`/api/notifications/${id}/read`, { method: "PATCH" }),
  dismissNotification: (id: string) =>
    apiFetch<void>(`/api/notifications/${id}`, { method: "DELETE" }),
  acceptNotificationRequest: (id: string) =>
    apiFetch<{ message: string }>(`/api/notifications/${id}/accept`, { method: "POST" }),
  declineNotificationRequest: (id: string) =>
    apiFetch<{ message: string }>(`/api/notifications/${id}/decline`, { method: "POST" }),
};
