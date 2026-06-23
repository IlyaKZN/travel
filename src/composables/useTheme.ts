import { ref } from 'vue'
import { telegramColorScheme, isTelegram } from './useTelegram'

export type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

function getPreferredTheme(): Theme {
  const fromTelegram = telegramColorScheme()
  if (fromTelegram) return fromTelegram

  const stored = localStorage.getItem('travels-theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(value: Theme) {
  theme.value = value
  document.documentElement.classList.toggle('dark', value === 'dark')
  if (!isTelegram.value) {
    localStorage.setItem('travels-theme', value)
  }
}

export function initTheme() {
  applyTheme(getPreferredTheme())

  const webApp = window.Telegram?.WebApp
  if (webApp?.initData) {
    webApp.onEvent('themeChanged', () => {
      applyTheme(telegramColorScheme() ?? theme.value)
    })
  }
}

export function useTheme() {
  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggleTheme }
}
