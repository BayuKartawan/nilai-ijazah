import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'system' | 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('system')

  // Load theme from localStorage
  const saved = localStorage.getItem('theme-mode') as ThemeMode | null
  if (saved && ['system', 'light', 'dark'].includes(saved)) {
    mode.value = saved
  }

  // Resolve actual theme
  function getResolvedTheme(): 'light' | 'dark' {
    if (mode.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return mode.value
  }

  const isDark = ref(getResolvedTheme() === 'dark')

  // Apply theme
  function applyTheme() {
    const resolved = getResolvedTheme()
    isDark.value = resolved === 'dark'
    document.documentElement.setAttribute('data-theme', resolved)
    localStorage.setItem('theme-mode', mode.value)
  }

  function setMode(newMode: ThemeMode) {
    mode.value = newMode
    applyTheme()
  }

  function cycleTheme() {
    const order: ThemeMode[] = ['system', 'light', 'dark']
    const idx = order.indexOf(mode.value)
    setMode(order[(idx + 1) % order.length]!)
  }

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    if (mode.value === 'system') {
      applyTheme()
    }
  })

  // Apply on init
  applyTheme()

  watch(mode, () => applyTheme())

  return { mode, isDark, setMode, cycleTheme }
})
