<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useDataStore } from '@/stores/data'
import { Download, Search, TrendingUp, TrendingDown, Info, X } from 'lucide-vue-next'
import { exportRekapNilai } from '@/utils/excel'
import ModalDialog from '@/components/ModalDialog.vue'

const store = useDataStore()
const toast = inject<(msg: string, type?: string) => void>('toast')!

const searchQuery = ref('')
const activeTab = ref<'raport' | 'ujian' | 'ijazah'>('raport')
const showKatrolInfo = ref(false)
const showBatalConfirm = ref(false)

const filteredSiswa = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return store.sortedSiswa
  return store.sortedSiswa.filter(s => s.nama.toLowerCase().includes(q) || s.nisn.includes(q))
})

// === Per-siswa averages ===
function avgRaportSiswa(siswaId: string): number | null {
  const vals: number[] = []
  store.mapelList.forEach(m => {
    const nr = store.getNilaiRaport(siswaId, m.id)
    if (nr?.rataRata != null) vals.push(nr.rataRata)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function avgUjianSiswa(siswaId: string): number | null {
  const vals: number[] = []
  store.mapelList.forEach(m => {
    const nu = store.getNilaiUjian(siswaId, m.id)
    if (nu?.nilai != null) vals.push(nu.nilai)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function avgIjazahAsliSiswa(siswaId: string): number | null {
  const vals: number[] = []
  store.mapelList.forEach(m => {
    const v = store.hitungNilaiIjazah(siswaId, m.id, false)
    if (v != null) vals.push(v)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function avgIjazahKatrolSiswa(siswaId: string): number | null {
  const vals: number[] = []
  store.mapelList.forEach(m => {
    const v = store.hitungNilaiIjazah(siswaId, m.id, true)
    if (v != null) vals.push(v)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

// === Per-mapel averages (footer) ===
function avgRaportMapel(mapelId: string): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const nr = store.getNilaiRaport(s.id, mapelId)
    if (nr?.rataRata != null) vals.push(nr.rataRata)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function avgUjianMapel(mapelId: string): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const nu = store.getNilaiUjian(s.id, mapelId)
    if (nu?.nilai != null) vals.push(nu.nilai)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function avgIjazahAsliMapel(mapelId: string): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const v = store.hitungNilaiIjazah(s.id, mapelId, false)
    if (v != null) vals.push(v)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

function avgIjazahKatrolMapel(mapelId: string): number | null {
  const vals: number[] = []
  store.siswaList.forEach(s => {
    const v = store.hitungNilaiIjazah(s.id, mapelId, true)
    if (v != null) vals.push(v)
  })
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

// Check if any katrol is active
const hasKatrol = computed(() => store.nilaiUjian.some(nu => nu.isKatrol))

function runKatrol() {
  store.katrolNilaiIjazah()
  toast('Nilai ujian berhasil dikatrol untuk menaikkan nilai ijazah!', 'success')
}

function doBatalKatrol() {
  store.batalKatrol()
  toast('Semua nilai katrol berhasil dibatalkan.', 'success')
}

function doExport() {
  exportRekapNilai(store.siswaList, store.mapelList, store.getNilaiRaport, store.getNilaiUjian, store.hitungNilaiIjazah)
}

function fmt(v: number | null): string {
  return v != null ? v.toFixed(2) : '-'
}
</script>

<template>
  <div class="fade-in rekap-page">
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
              <th class="col-avg">Rata²</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(siswa, idx) in filteredSiswa" :key="siswa.id">
              <td>{{ idx + 1 }}</td>
              <td style="font-weight:500; white-space:nowrap">{{ siswa.nama }}</td>
              <td v-for="m in store.mapelList" :key="m.id" style="text-align:center">
                {{ store.getNilaiRaport(siswa.id, m.id)?.rataRata?.toFixed(2) ?? '-' }}
              </td>
              <td class="col-avg-val">{{ fmt(avgRaportSiswa(siswa.id)) }}</td>
            </tr>
          </tbody>
          <tfoot v-if="store.siswaList.length > 0">
            <tr class="footer-row">
              <td colspan="2" style="font-weight:600; text-align:right">Rata² Mapel</td>
              <td v-for="m in store.mapelList" :key="m.id" style="text-align:center">{{ fmt(avgRaportMapel(m.id)) }}</td>
              <td></td>
            </tr>
          </tfoot>
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
              <th class="col-avg">Rata²</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(siswa, idx) in filteredSiswa" :key="siswa.id">
              <td>{{ idx + 1 }}</td>
              <td style="font-weight:500; white-space:nowrap">{{ siswa.nama }}</td>
              <td v-for="m in store.mapelList" :key="m.id" style="text-align:center">
                {{ store.getNilaiUjian(siswa.id, m.id)?.nilai?.toFixed(2) ?? '-' }}
              </td>
              <td class="col-avg-val">{{ fmt(avgUjianSiswa(siswa.id)) }}</td>
            </tr>
          </tbody>
          <tfoot v-if="store.siswaList.length > 0">
            <tr class="footer-row">
              <td colspan="2" style="font-weight:600; text-align:right">Rata² Mapel</td>
              <td v-for="m in store.mapelList" :key="m.id" style="text-align:center">{{ fmt(avgUjianMapel(m.id)) }}</td>
              <td></td>
            </tr>
          </tfoot>
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
        <div class="header-actions">
          <button class="btn btn-ghost btn-sm" @click="showKatrolInfo = true" title="Info Perhitungan">
            <Info :size="16" /> <span class="btn-text">Info</span>
          </button>
          <button v-if="hasKatrol" class="btn btn-warning btn-sm" @click="showBatalConfirm = true">
            <TrendingDown :size="16" /> <span class="btn-text">Batal Katrol</span>
          </button>
          <button class="btn btn-primary btn-sm" @click="runKatrol">
            <TrendingUp :size="16" /> <span class="btn-text">Katrol Ijazah</span>
          </button>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th rowspan="2" style="width:44px">No</th>
              <th rowspan="2">Nama</th>
              <th v-for="m in store.mapelList" :key="m.id" colspan="2" style="text-align:center; border-bottom:none">{{ m.kode }}</th>
              <th colspan="2" style="text-align:center; border-bottom:none" class="col-avg-header">Rata²</th>
            </tr>
            <tr>
              <template v-for="m in store.mapelList" :key="m.id + '-sub'">
                <th style="text-align:center; font-size:0.6875rem">Asli</th>
                <th style="text-align:center; font-size:0.6875rem">Katrol</th>
              </template>
              <th style="text-align:center; font-size:0.6875rem" class="col-avg-header">Asli</th>
              <th style="text-align:center; font-size:0.6875rem" class="col-avg-header">Katrol</th>
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
              <td class="col-avg-val">{{ fmt(avgIjazahAsliSiswa(siswa.id)) }}</td>
              <td class="col-avg-val text-katrol-avg">{{ fmt(avgIjazahKatrolSiswa(siswa.id)) }}</td>
            </tr>
          </tbody>
          <tfoot v-if="store.siswaList.length > 0">
            <tr class="footer-row">
              <td colspan="2" style="font-weight:600; text-align:right">Rata² Mapel</td>
              <template v-for="m in store.mapelList" :key="m.id">
                <td style="text-align:center">{{ fmt(avgIjazahAsliMapel(m.id)) }}</td>
                <td style="text-align:center">{{ fmt(avgIjazahKatrolMapel(m.id)) }}</td>
              </template>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Batal Katrol Confirmation -->
    <ModalDialog
      v-model:show="showBatalConfirm"
      type="danger"
      title="Batalkan Semua Katrol?"
      message="Semua nilai katrol ujian akan direset ke nilai asli. Proses ini tidak dapat dibatalkan."
      confirm-text="Ya, Batalkan"
      @confirm="doBatalKatrol"
    />

    <!-- Info Katrol Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showKatrolInfo" class="modal-overlay" @click.self="showKatrolInfo = false">
          <div class="modal info-modal">
            <div class="modal-header">
              <h3>Perhitungan Nilai Katrol</h3>
              <button class="modal-close" @click="showKatrolInfo = false"><X :size="18" /></button>
            </div>
            <div class="modal-body">
              <div class="info-section">
                <h4>Rumus Nilai Ijazah</h4>
                <div class="formula-box">
                  Nilai Ijazah = (Rata² Raport × <strong>{{ store.settingKatrol.bobotRaport }}%</strong>) + (Nilai Ujian × <strong>{{ store.settingKatrol.bobotUjian }}%</strong>)
                </div>
              </div>
              <div class="info-section">
                <h4>Mekanisme Katrol</h4>
                <ol class="info-steps">
                  <li>Sistem mencari <strong>nilai ijazah terendah</strong> per mata pelajaran dari seluruh siswa</li>
                  <li>Jika nilai terendah <strong>di bawah SKL</strong> (Standar Kelulusan), maka katrol diaktifkan</li>
                  <li>Sistem menghitung <strong>selisih (gap)</strong> antara SKL dan nilai terendah</li>
                  <li>
                    Boost ujian dihitung:<br>
                    <div class="formula-box formula-sm">
                      Boost = Gap ÷ (Bobot Ujian / 100)<br>
                      Boost = Gap ÷ {{ store.settingKatrol.bobotUjian / 100 }}
                    </div>
                  </li>
                  <li>Nilai ujian <strong>semua siswa</strong> pada mapel tersebut dinaikkan sebesar boost (maksimal 100)</li>
                  <li>Nilai ijazah dihitung ulang dengan nilai ujian yang sudah dikatrol</li>
                </ol>
              </div>
              <div class="info-section">
                <h4>Keterangan Warna</h4>
                <div class="legend">
                  <div class="legend-item"><span class="dot dot-warn"></span> Nilai asli di bawah SKL</div>
                  <div class="legend-item"><span class="dot dot-katrol"></span> Nilai sudah dikatrol</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Root container: must allow shrinking within flex parent */
.rekap-page {
  min-width: 0;
  overflow: hidden;
}

.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
.tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border-default); }
.toolbar-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
.search-input { padding-left: 2.25rem; width: 180px; }
.card-title { font-size: 0.9375rem; font-weight: 600; color: var(--text-primary); }
.card-subtitle { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.125rem; }
.header-actions { display: flex; gap: 0.375rem; align-items: center; }

/* Table scroll container */
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
}
.text-warn { color: var(--color-rose-500); font-weight: 600; }
.text-katrol { color: var(--color-emerald-600); font-weight: 600; }

/* Average columns */
.col-avg, .col-avg-header { min-width: 72px; text-align: center; background: var(--bg-muted); }
.col-avg-val { text-align: center; font-weight: 600; color: var(--color-primary-600); background: var(--bg-muted); }
.text-katrol-avg { color: var(--color-emerald-600) !important; }

/* Footer row */
.footer-row { background: var(--bg-muted); }
.footer-row td { font-weight: 600; font-size: 0.8125rem; color: var(--color-primary-600); }

/* Btn ghost/warning */
.btn-ghost {
  background: transparent; color: var(--text-secondary); border: 1px solid var(--border-default);
}
.btn-ghost:hover { background: var(--bg-muted); color: var(--text-primary); }
.btn-warning {
  background: var(--color-amber-500); color: #fff; border: none;
}
.btn-warning:hover { background: var(--color-amber-600); }

/* Info Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
.modal { background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: 0.875rem; width: 100%; max-height: 90vh; overflow-y: auto; }
.info-modal { max-width: 560px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-default); }
.modal-header h3 { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
.modal-close { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: none; background: none; color: var(--text-secondary); cursor: pointer; border-radius: 0.375rem; }
.modal-close:hover { background: var(--bg-muted); }
.modal-body { padding: 1.25rem; }

.info-section { margin-bottom: 1.25rem; }
.info-section:last-child { margin-bottom: 0; }
.info-section h4 { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
.formula-box {
  background: var(--bg-muted); border: 1px solid var(--border-default);
  padding: 0.75rem 1rem; border-radius: 0.5rem;
  font-size: 0.8125rem; color: var(--text-primary); line-height: 1.6;
}
.formula-sm { margin-top: 0.375rem; font-size: 0.75rem; }
.info-steps { padding-left: 1.25rem; font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.7; }
.info-steps li { margin-bottom: 0.375rem; }
.info-steps strong { color: var(--text-primary); }
.legend { display: flex; flex-direction: column; gap: 0.375rem; }
.legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-secondary); }
.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dot-warn { background: var(--color-rose-500); }
.dot-katrol { background: var(--color-emerald-600); }

/* Modal transition */
.modal-enter-active { transition: opacity 0.15s ease; }
.modal-enter-active .modal { transition: transform 0.15s ease, opacity 0.15s ease; }
.modal-leave-active { transition: opacity 0.1s ease; }
.modal-leave-active .modal { transition: transform 0.1s ease; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .modal { transform: scale(0.95); opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-leave-to .modal { transform: scale(0.95); opacity: 0; }

/* Sticky columns — only on wide screens */
@media (min-width: 769px) {
  .data-table thead tr:first-child th:first-child {
    position: sticky;
    left: 0;
    z-index: 12;
    background: var(--bg-muted);
  }

  .data-table thead tr:first-child th:nth-child(2) {
    position: sticky;
    left: 44px;
    z-index: 12;
    background: var(--bg-muted);
  }

  /* For ijazah tab: second header row sticky */
  .data-table thead tr:nth-child(2) th {
    z-index: 11;
  }

  .data-table tbody td:first-child {
    position: sticky;
    left: 0;
    z-index: 5;
    background: var(--bg-surface);
  }

  .data-table tbody td:nth-child(2) {
    position: sticky;
    left: 44px;
    z-index: 5;
    background: var(--bg-surface);
  }

  .data-table tfoot tr td:first-child {
    position: sticky;
    left: 0;
    z-index: 5;
    background: var(--bg-muted);
  }

  /* Shadow indicator on sticky Nama column */
  .data-table thead tr:first-child th:nth-child(2)::after,
  .data-table tbody td:nth-child(2)::after {
    content: '';
    position: absolute;
    top: 0;
    right: -6px;
    bottom: 0;
    width: 6px;
    pointer-events: none;
    background: linear-gradient(to right, rgba(0,0,0,0.08), transparent);
  }

  /* Hover keeps correct bg on sticky cells */
  .data-table tbody tr:hover td:first-child,
  .data-table tbody tr:hover td:nth-child(2) {
    background-color: var(--bg-surface-hover);
  }
}

@media (max-width: 640px) {
  .toolbar { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
  .btn-text { display: none; }
  .tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .header-actions { flex-wrap: wrap; }
}
</style>
