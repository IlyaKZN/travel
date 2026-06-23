import { ref, readonly } from 'vue'

type Theme = 'light' | 'dark'

export const isTelegram = ref(false)

export function getTelegramWebApp() {
  return window.Telegram?.WebApp
}

export function getInitData(): string {
  return getTelegramWebApp()?.initData ?? ''
}

export function initTelegram(): boolean {
  const webApp = getTelegramWebApp()
  if (!webApp?.initData) return false

  isTelegram.value = true
  document.body.classList.add('telegram-mini-app')

  webApp.ready()
  webApp.expand()
  webApp.enableClosingConfirmation()

  applyTelegramTheme(webApp)
  webApp.onEvent('themeChanged', () => applyTelegramTheme(webApp))

  return true
}

function applyTelegramTheme(webApp: NonNullable<typeof window.Telegram>['WebApp']) {
  const params = webApp.themeParams
  if (params.bg_color) {
    webApp.setBackgroundColor(params.bg_color)
    document.documentElement.style.setProperty('--tg-bg', params.bg_color)
  }
  if (params.header_bg_color ?? params.bg_color) {
    webApp.setHeaderColor(params.header_bg_color ?? params.bg_color ?? '#ffffff')
  }
}

export function telegramColorScheme(): Theme | null {
  const scheme = getTelegramWebApp()?.colorScheme
  if (scheme === 'dark' || scheme === 'light') return scheme
  return null
}

export function setupBackButton(onBack: () => void): () => void {
  const webApp = getTelegramWebApp()
  if (!webApp || !isTelegram.value) return () => {}

  webApp.BackButton.show()
  webApp.BackButton.onClick(onBack)

  return () => {
    webApp.BackButton.offClick(onBack)
    webApp.BackButton.hide()
  }
}

export function useTelegram() {
  return {
    isTelegram: readonly(isTelegram),
    getInitData,
    setupBackButton,
  }
}
