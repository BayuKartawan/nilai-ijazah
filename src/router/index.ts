import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/pages/DashboardPage.vue') },
    { path: '/siswa', component: () => import('@/pages/SiswaPage.vue') },
    { path: '/mapel', component: () => import('@/pages/MapelPage.vue') },
    { path: '/nilai-raport', component: () => import('@/pages/NilaiRaportPage.vue') },
    { path: '/ujian-madrasah', component: () => import('@/pages/UjianMadrasahPage.vue') },
    { path: '/rekap', component: () => import('@/pages/RekapPage.vue') },
    { path: '/cetak-rekap', component: () => import('@/pages/CetakRekapPage.vue') },
    { path: '/backup', component: () => import('@/pages/BackupPage.vue') },
  ],
})

export default router
