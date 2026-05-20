<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import type { ThemeMode } from '@/stores/theme'
import {
  LayoutDashboard, Users, BookOpen, FileText, ClipboardCheck,
  TrendingUp, Sun, Moon, Monitor,
  Menu, X, GraduationCap, HardDrive, Printer
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const theme = useThemeStore()

const sidebarOpen = ref(false)

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/siswa', label: 'Data Siswa', icon: Users },
  { path: '/mapel', label: 'Data Mapel', icon: BookOpen },
  { path: '/nilai-raport', label: 'Nilai Raport', icon: FileText },
  { path: '/ujian-madrasah', label: 'Ujian Madrasah', icon: ClipboardCheck },
  { path: '/rekap', label: 'Rekap Nilai', icon: TrendingUp },
  { path: '/cetak-rekap', label: 'Cetak Rekap', icon: Printer },
  { path: '/backup', label: 'Backup & Restore', icon: HardDrive },
]

const isActive = (path: string) => route.path === path

function navigate(path: string) {
  router.push(path)
  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
}

const currentPageTitle = computed(() => {
  const item = menuItems.find(i => i.path === route.path)
  return item?.label || 'Dashboard'
})

const themeIcon = computed(() => {
  switch (theme.mode) {
    case 'dark': return Moon
    case 'light': return Sun
    default: return Monitor
  }
})

const themeLabel = computed(() => {
  switch (theme.mode) {
    case 'dark': return 'Gelap'
    case 'light': return 'Terang'
    default: return 'Sistem'
  }
})
</script>

<template>
  <div class="app-layout">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <div class="logo">
          <GraduationCap :size="22" style="color: var(--color-primary-500)" />
          <span class="logo-text">Nilai Ijazah</span>
        </div>
        <button class="sidebar-close" @click="sidebarOpen = false">
          <X :size="18" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in menuItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click="navigate(item.path)"
        >
          <component :is="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main-wrapper">
      <header class="topbar">
        <div class="topbar-left">
          <button class="topbar-menu" @click="sidebarOpen = !sidebarOpen">
            <Menu :size="20" />
          </button>
          <h1 class="page-title">{{ currentPageTitle }}</h1>
        </div>
        <div class="topbar-right">
          <button class="theme-toggle" @click="theme.cycleTheme()" :title="`Tema: ${themeLabel}`">
            <component :is="themeIcon" :size="16" />
            <span class="theme-label">{{ themeLabel }}</span>
          </button>
        </div>
      </header>

      <main class="content">
        <div class="content-inner" :class="{ 'is-wide': route.path === '/rekap' }">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar overlay (mobile) */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 39;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 40;
  transition: transform 0.2s ease;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--sidebar-border);
  min-height: 57px;
}

.sidebar-close {
  display: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 0.375rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-text {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: none;
  color: var(--sidebar-text);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
  font-family: var(--font-sans);
  text-align: left;
}

.nav-item:hover {
  background: var(--sidebar-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--sidebar-active);
  color: var(--sidebar-active-text);
}

/* Main wrapper */
.main-wrapper {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0;
  overflow: hidden;
  transition: margin-left 0.2s ease;
}

/* Topbar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  height: 57px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-default);
  position: sticky;
  top: 0;
  z-index: 30;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.topbar-menu {
  display: none;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 0.375rem;
}

.topbar-menu:hover {
  background: var(--bg-surface-hover);
}

.page-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
}

.theme-toggle:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

/* Content — centered on wide screens */
.content {
  flex: 1;
  padding: 1.25rem;
  display: flex;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
}

.content-inner {
  width: 100%;
  max-width: 1200px;
  min-width: 0;
}

.content-inner.is-wide {
  max-width: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }

  .sidebar-close {
    display: flex;
  }

  .main-wrapper {
    margin-left: 0;
  }

  .topbar-menu {
    display: flex;
  }

  .theme-label {
    display: none;
  }

  .content {
    padding: 1rem 0.75rem;
  }
}
</style>
