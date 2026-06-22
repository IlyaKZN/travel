import { ref } from 'vue'

export type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

function getPreferredTheme(): Theme {
  const stored = localStorage.getItem('travels-theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(value: Theme) {
  theme.value = value
  document.documentElement.classList.toggle('dark', value === 'dark')
  localStorage.setItem('travels-theme', value)
}

export function initTheme() {
  applyTheme(getPreferredTheme())
}

export function useTheme() {
  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggleTheme }
}
