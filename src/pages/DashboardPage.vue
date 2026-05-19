<script setup lang="ts">
import { computed } from 'vue'
import { useDataStore } from '@/stores/data'
import { Users, BookOpen, FileText, ClipboardCheck, TrendingUp, Printer } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const store = useDataStore()
const router = useRouter()

const stats = computed(() => {
  const siswaCount = store.totalSiswa
  const mapelCount = store.totalMapel
  const totalRaport = siswaCount * mapelCount
  const filledRaport = store.nilaiRaport.filter(n => n.rataRata !== null).length
  const filledUjian = store.nilaiUjian.filter(n => n.nilai !== null).length

  return {
    siswa: siswaCount,
    mapel: mapelCount,
    raportProgress: totalRaport > 0 ? Math.round((filledRaport / totalRaport) * 100) : 0,
    ujianProgress: totalRaport > 0 ? Math.round((filledUjian / totalRaport) * 100) : 0,
  }
})

const quickActions = [
  { label: 'Data Siswa', icon: Users, path: '/siswa', color: '#6366f1' },
  { label: 'Data Mapel', icon: BookOpen, path: '/mapel', color: '#10b981' },
  { label: 'Nilai Raport', icon: FileText, path: '/nilai-raport', color: '#f59e0b' },
  { label: 'Ujian Madrasah', icon: ClipboardCheck, path: '/ujian-madrasah', color: '#f43f5e' },
  { label: 'Rekap Nilai', icon: TrendingUp, path: '/rekap', color: '#8b5cf6' },
  { label: 'Cetak Rekap', icon: Printer, path: '/cetak-rekap', color: '#0ea5e9' },
]
</script>

<template>
  <div class="fade-in">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="color:#6366f1"><Users :size="20" /></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.siswa }}</span>
          <span class="stat-label">Total Siswa</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color:#10b981"><BookOpen :size="20" /></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.mapel }}</span>
          <span class="stat-label">Mata Pelajaran</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color:#f59e0b"><FileText :size="20" /></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.raportProgress }}%</span>
          <span class="stat-label">Raport Terisi</span>
        </div>
        <div class="stat-bar"><div class="stat-bar-fill" :style="{ width: stats.raportProgress + '%', backgroundColor: '#f59e0b' }"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color:#f43f5e"><ClipboardCheck :size="20" /></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.ujianProgress }}%</span>
          <span class="stat-label">Ujian Terisi</span>
        </div>
        <div class="stat-bar"><div class="stat-bar-fill" :style="{ width: stats.ujianProgress + '%', backgroundColor: '#f43f5e' }"></div></div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Menu Cepat</h2>
      <div class="actions-grid">
        <button v-for="a in quickActions" :key="a.path" class="action-card" @click="router.push(a.path)">
          <div class="action-icon" :style="{ color: a.color }"><component :is="a.icon" :size="22" /></div>
          <span class="action-label">{{ a.label }}</span>
        </button>
      </div>
    </div>

    <div class="section">
      <div class="info-card">
        <h3>Petunjuk Penggunaan</h3>
        <ol>
          <li>Input <strong>Data Siswa</strong> (NISN & Nama) dan atur <strong>Mata Pelajaran</strong></li>
          <li>Masukkan <strong>Nilai Raport</strong> untuk 5 semester (Semester 7–11)</li>
          <li>Input <strong>Nilai Ujian Madrasah</strong> untuk setiap mapel</li>
          <li>Cek <strong>Rekap Nilai</strong> dan lakukan <strong>Katrol Ijazah</strong> jika diperlukan</li>
          <li><strong>Cetak Rekap</strong> untuk mencetak dokumen resmi rekap nilai ijazah</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.stat-card { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 0.75rem; padding: 1.25rem; background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: 0.75rem; transition: border-color 0.15s ease; }
.stat-card:hover { border-color: var(--color-primary-300); }
.stat-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--bg-muted); border-radius: 0.5rem; }
.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 1.375rem; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
.stat-label { font-size: 0.8125rem; color: var(--text-secondary); }
.stat-bar { width: 100%; height: 4px; background: var(--bg-muted); border-radius: 2px; margin-top: 0.25rem; }
.stat-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }

.section { margin-bottom: 2rem; }
.section-title { font-size: 0.9375rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem; }
.actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; }
.action-card { display: flex; flex-direction: column; align-items: center; gap: 0.625rem; padding: 1.25rem 1rem; background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: 0.75rem; cursor: pointer; font-family: var(--font-sans); transition: all 0.15s ease; }
.action-card:hover { border-color: var(--color-primary-300); transform: translateY(-1px); }
.action-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: var(--bg-muted); border-radius: 0.625rem; }
.action-label { font-size: 0.8125rem; font-weight: 500; color: var(--text-primary); }

.info-card { background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: 0.75rem; padding: 1.25rem; }
.info-card h3 { font-size: 0.9375rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.75rem; }
.info-card ol { padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
.info-card li { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; }
</style>
