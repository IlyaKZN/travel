import { ref, onMounted, onUnmounted } from 'vue'
import { DESKTOP_BREAKPOINT } from '@/types'

export function useIsDesktop() {
  const isDesktop = ref(
    typeof window !== 'undefined' ? window.innerWidth >= DESKTOP_BREAKPOINT : true,
  )

  let mql: MediaQueryList | null = null
  const onChange = () => {
    if (mql) isDesktop.value = mql.matches
  }

  onMounted(() => {
    mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)
    mql.addEventListener('change', onChange)
    isDesktop.value = mql.matches
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', onChange)
  })

  return isDesktop
}
