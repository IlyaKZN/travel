import type { TransportType } from "./api";

export function formatDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(d);
}
export function formatTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(d);
}
export function formatDateTime(iso: string) {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}
export function formatDay(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(d);
}

export function formatBudget(rub: number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(rub);
}

export function formatBudgetShort(rub: number) {
  const amount = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(rub);
  return `~ ${amount} ₽`;
}

export function formatOrganizerShortName(firstName: string, lastName?: string) {
  const initial = lastName?.[0] ? ` ${lastName[0]}.` : "";
  return `${firstName}${initial}`;
}

export function formatSeatsLeft(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  let word = "МЕСТ";
  if (mod10 === 1 && mod100 !== 11) word = "МЕСТО";
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) word = "МЕСТА";
  return `${count} ${word}`;
}

export function tripAvatarColors(from: string, to: string) {
  // Cheerful, vibrant gradient pairs — warm & friendly
  const pairs: Array<{ bg: string; fg: string }> = [
    { bg: "#FF8A65", fg: "#FFB74D" }, // coral → amber
    { bg: "#FF6B9D", fg: "#FFC371" }, // pink → peach
    { bg: "#7B61FF", fg: "#FF8AC5" }, // violet → pink
    { bg: "#4FC3F7", fg: "#81E6A8" }, // sky → mint
    { bg: "#FFB347", fg: "#FF6B6B" }, // mango → coral
    { bg: "#5B8DEF", fg: "#A78BFA" }, // blue → lilac
    { bg: "#34D399", fg: "#FBBF24" }, // emerald → gold
    { bg: "#F472B6", fg: "#A78BFA" }, // rose → violet
    { bg: "#FF7E5F", fg: "#FEB47B" }, // sunset
  ];
  const h = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);
  return pairs[(h(from) + h(to)) % pairs.length];
}

export function tripInitials(from: string, to: string) {
  return `${from[0] ?? ""}${to[0] ?? ""}`.toUpperCase();
}

export const transportIcon: Record<TransportType, string> = {
  car: "🚗", train: "🚆", bus: "🚌", plane: "✈️",
};
