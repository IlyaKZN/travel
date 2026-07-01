/** Домены почты российских сервисов (whitelist). */
export const RUSSIAN_EMAIL_DOMAINS = new Set([
  "mail.ru",
  "inbox.ru",
  "bk.ru",
  "list.ru",
  "internet.ru",
  "yandex.ru",
  "ya.ru",
  "narod.ru",
  "rambler.ru",
  "lenta.ru",
  "autorambler.ru",
  "myrambler.ru",
  "ro.ru",
  "vk.com",
  "vk.ru",
  "pochta.ru",
  "ngs.ru",
  "e1.ru",
]);

export const AUTH_CONTACT_ERROR =
  "Используйте почту российского сервиса (Mail.ru, Яндекс, Rambler и т.п.) или номер телефона РФ (+7)";

function extractEmailDomain(email: string): string | null {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return parts[1];
}

export function isRussianEmail(email: string): boolean {
  const domain = extractEmailDomain(email);
  return domain !== null && RUSSIAN_EMAIL_DOMAINS.has(domain);
}

export function isRussianPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) return true;
  return digits.length === 10;
}

export function isEmailContact(value: string): boolean {
  return value.includes("@");
}

export function isTelegramContact(value: string): boolean {
  return value.toLowerCase().endsWith("@telegram.local");
}

export function validateAuthContact(value: string): { ok: true } | { ok: false; error: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, error: "Укажите email или телефон" };
  }

  if (isTelegramContact(trimmed)) {
    return { ok: true };
  }

  if (isEmailContact(trimmed)) {
    if (!isRussianEmail(trimmed)) {
      return { ok: false, error: AUTH_CONTACT_ERROR };
    }
    return { ok: true };
  }

  if (isRussianPhone(trimmed)) {
    return { ok: true };
  }

  return { ok: false, error: AUTH_CONTACT_ERROR };
}

export function isAllowedAuthContact(value: string): boolean {
  return validateAuthContact(value).ok;
}
