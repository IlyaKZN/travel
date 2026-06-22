const TOKEN_KEY = 'travels_token'
const PENDING_CONTACT_KEY = 'travels_pending_contact'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getPendingContact(): string | null {
  return sessionStorage.getItem(PENDING_CONTACT_KEY)
}

export function setPendingContact(contact: string | null) {
  if (contact) sessionStorage.setItem(PENDING_CONTACT_KEY, contact)
  else sessionStorage.removeItem(PENDING_CONTACT_KEY)
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`/api${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(body.error || 'Ошибка запроса', res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
