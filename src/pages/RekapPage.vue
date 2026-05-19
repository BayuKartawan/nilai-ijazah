<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useDataStore } from '@/stores/data'
import { Download, Search, TrendingUp } from 'lucide-vue-next'
import { exportRekapNilai } from '@/utils/excel'

const store = useDataStore()
const toast = inject<(msg: string, type?: string) => void>('toast')!

const searchQuery = ref('')
const activeTab = ref<'raport' | 'ujian' | 'ijazah'>('raport')

const filteredSiswa = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return store.sortedSiswa
  return store.sortedSiswa.filter(s => s.nama.toLowerCase().includes(q) || s.nisn.includes(q))
})

function runKatrol() {
  store.katrolNilaiIjazah()
  toast('Nilai ujian berhasil dikatrol untuk menaikkan nilai ijazah!', 'success')
}

function doExport() {
  exportRekapNilai(
    store.siswaList,
    store.mapelList,
    store.getNilaiRaport,
    store.getNilaiUjian,
    store.hitungNilaiIjazah
  )
}
</script>

<template>
  <div class="fade-in">
    <div class="toolbar">
      <div class="tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'raport' }" @click="activeTab = 'raport'">Raport</button>
        <button class="tab-btn" :class="{ active: activeTab === 'ujian' }" @click="activeTab = 'ujian'">Ujian</button>
        <button class="tab-btn" :class="{ active: activeTab === 'ijazah' }" @click="activeTab = 'ijazah'">Ijazah</button>
      </div>
      <div class="toolbar-actions">
        <div class="search-box">
          <Search :size="16" class="search-icon" />
          <input v-model="searchQuery" type="text" placeholder="Cari..." class="form-input search-input" />
        </div>
        <button class="btn btn-secondary btn-sm" @click="doExport">
          <Download :size="16" /> <span class="btn-text">Export</span>
        </button>
      </div>
    </div>

    <!-- Raport -->
    <div v-if="activeTab === 'raport'" class="card">
      <div class="card-header"><h3 class="card-title">Rekap Rata-rata Nilai Raport</h3></div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:44px">No</th>
              <th>Nama</th>
              <th v-for="m in store.mapelList" :key="m.id" style="min-width:72px; text-align:center">{{ m.kode }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(siswa, idx) in filteredSiswa" :key="siswa.id">
              <td>{{ idx + 1 }}</td>
              <td style="font-weight:500; white-space:nowrap">{{ siswa.nama }}</td>
              <td v-for="m in store.mapelList" :key="m.id" style="text-align:center">
                {{ store.getNilaiRaport(siswa.id, m.id)?.rataRata?.toFixed(2) ?? '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Ujian -->
    <div v-if="activeTab === 'ujian'" class="card">
      <div class="card-header"><h3 class="card-title">Rekap Nilai Ujian Madrasah</h3></div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:44px">No</th>
              <th>Nama</th>
              <th v-for="m in store.mapelList" :key="m.id" style="min-width:72px; text-align:center">{{ m.kode }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(siswa, idx) in filteredSiswa" :key="siswa.id">
              <td>{{ idx + 1 }}</td>
              <td style="font-weight:500; white-space:nowrap">{{ siswa.nama }}</td>
              <td v-for="m in store.mapelList" :key="m.id" style="text-align:center">
                {{ store.getNilaiUjian(siswa.id, m.id)?.nilai?.toFixed(2) ?? '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Ijazah -->
    <div v-if="activeTab === 'ijazah'" class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">Rekap Nilai Ijazah</h3>
          <p class="card-subtitle">Bobot: Raport {{ store.settingKatrol.bobotRaport }}% + Ujian {{ store.settingKatrol.bobotUjian }}%</p>
        </div>
        <button class="btn btn-primary btn-sm" @click="runKatrol">
          <TrendingUp :size="16" /> <span class="btn-text">Katrol Ijazah</span>
        </button>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th rowspan="2" style="width:44px">No</th>
              <th rowspan="2">Nama</th>
              <th v-for="m in store.mapelList" :key="m.id" colspan="2" style="text-align:center; border-bottom:none">{{ m.kode }}</th>
            </tr>
            <tr>
              <template v-for="m in store.mapelList" :key="m.id + '-sub'">
                <th style="text-align:center; font-size:0.6875rem">Asli</th>
                <th style="text-align:center; font-size:0.6875rem">Katrol</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(siswa, idx) in filteredSiswa" :key="siswa.id">
              <td>{{ idx + 1 }}</td>
              <td style="font-weight:500; white-space:nowrap">{{ siswa.nama }}</td>
              <template v-for="m in store.mapelList" :key="m.id">
                <td style="text-align:center">
                  <span :class="{ 'text-warn': (store.hitungNilaiIjazah(siswa.id, m.id, false) ?? 100) < m.kkm }">
                    {{ store.hitungNilaiIjazah(siswa.id, m.id, false)?.toFixed(2) ?? '-' }}
                  </span>
                </td>
                <td style="text-align:center">
                  <span :class="{ 'text-katrol': store.getNilaiUjian(siswa.id, m.id)?.isKatrol }">
                    {{ store.hitungNilaiIjazah(siswa.id, m.id, true)?.toFixed(2) ?? '-' }}
                  </span>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
.tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border-default); }
.toolbar-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
.search-input { padding-left: 2.25rem; width: 180px; }
.card-title { font-size: 0.9375rem; font-weight: 600; color: var(--text-primary); }
.card-subtitle { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.125rem; }
.table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.text-warn { color: var(--color-rose-500); font-weight: 600; }
.text-katrol { color: var(--color-emerald-600); font-weight: 600; }

@media (max-width: 640px) {
  .toolbar { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
  .btn-text { display: none; }
  .tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; }
}
</style>
