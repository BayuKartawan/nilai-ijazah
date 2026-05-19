<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useDataStore } from '@/stores/data'
import { Upload, Download, Save } from 'lucide-vue-next'
import { exportTemplateNilaiRaport, parseNilaiRaportFromExcel } from '@/utils/excel'

const store = useDataStore()
const toast = inject<(msg: string, type?: string) => void>('toast')!

const selectedMapelId = ref(store.mapelList.length > 0 ? store.mapelList[0]?.id || '' : '')

const selectedMapel = computed(() => store.mapelList.find(m => m.id === selectedMapelId.value))

const nilaiGrid = computed(() => {
  return store.sortedSiswa.map(siswa => {
    const nr = store.getNilaiRaport(siswa.id, selectedMapelId.value)
    return {
      siswa,
      nilaiRaport: nr || {
        siswaId: siswa.id, mapelId: selectedMapelId.value,
        semester7: null, semester8: null, semester9: null, semester10: null, semester11: null, rataRata: null
      }
    }
  })
})

function updateValue(siswaId: string, field: string, value: string) {
  const numValue = value === '' ? null : Number(value)
  store.updateNilaiRaport(siswaId, selectedMapelId.value, { [field]: numValue })
}

function saveAll() {
  store.saveAll()
  toast('Data tersimpan!', 'success')
}

async function handleImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    const results = await parseNilaiRaportFromExcel(file, store.siswaList, store.mapelList)
    results.forEach(r => store.updateNilaiRaport(r.siswaId, r.mapelId, r.data))
    toast(`Berhasil mengimpor ${results.length} data nilai raport.`, 'success')
  } catch { toast('Gagal mengimpor.', 'error') }
  finally { target.value = '' }
}
</script>

<template>
  <div class="fade-in">
    <div class="toolbar">
      <div class="mapel-select">
        <label class="form-label">Mata Pelajaran:</label>
        <select v-model="selectedMapelId" class="form-input" style="max-width:300px">
          <option v-for="m in store.mapelList" :key="m.id" :value="m.id">{{ m.nama }}</option>
        </select>
      </div>
      <div class="toolbar-actions">
        <button class="btn btn-secondary btn-sm" @click="exportTemplateNilaiRaport(store.mapelList, store.sortedSiswa)">
          <Download :size="16" /> <span>Template</span>
        </button>
        <label class="btn btn-secondary btn-sm" style="cursor:pointer">
          <Upload :size="16" /> <span>Import</span>
          <input type="file" accept=".xlsx,.xls" @change="handleImport" hidden />
        </label>
        <button class="btn btn-success btn-sm" @click="saveAll">
          <Save :size="16" /> <span>Simpan</span>
        </button>
      </div>
    </div>

    <div v-if="selectedMapel" class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">{{ selectedMapel.nama }}</h3>
          <p class="card-subtitle">Semester 7 – 11 | KKM: {{ selectedMapel.kkm }}</p>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:44px">No</th>
              <th>Nama Siswa</th>
              <th style="width:80px">S7</th>
              <th style="width:80px">S8</th>
              <th style="width:80px">S9</th>
              <th style="width:80px">S10</th>
              <th style="width:80px">S11</th>
              <th style="width:90px">Rata²</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in nilaiGrid" :key="row.siswa.id">
              <td>{{ idx + 1 }}</td>
              <td style="font-weight:500">{{ row.siswa.nama }}</td>
              <td><input type="number" class="form-input cell-input" :value="row.nilaiRaport.semester7" @change="updateValue(row.siswa.id, 'semester7', ($event.target as HTMLInputElement).value)" min="0" max="100" /></td>
              <td><input type="number" class="form-input cell-input" :value="row.nilaiRaport.semester8" @change="updateValue(row.siswa.id, 'semester8', ($event.target as HTMLInputElement).value)" min="0" max="100" /></td>
              <td><input type="number" class="form-input cell-input" :value="row.nilaiRaport.semester9" @change="updateValue(row.siswa.id, 'semester9', ($event.target as HTMLInputElement).value)" min="0" max="100" /></td>
              <td><input type="number" class="form-input cell-input" :value="row.nilaiRaport.semester10" @change="updateValue(row.siswa.id, 'semester10', ($event.target as HTMLInputElement).value)" min="0" max="100" /></td>
              <td><input type="number" class="form-input cell-input" :value="row.nilaiRaport.semester11" @change="updateValue(row.siswa.id, 'semester11', ($event.target as HTMLInputElement).value)" min="0" max="100" /></td>
              <td>
                <span class="rata-rata" :class="{ warn: row.nilaiRaport.rataRata !== null && row.nilaiRaport.rataRata < (selectedMapel?.kkm || 75) }">
                  {{ row.nilaiRaport.rataRata !== null ? row.nilaiRaport.rataRata.toFixed(2) : '-' }}
                </span>
              </td>
            </tr>
            <tr v-if="store.sortedSiswa.length === 0">
              <td colspan="8" class="empty-state">Belum ada data siswa.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.mapel-select { display: flex; flex-direction: column; gap: 0.375rem; }
.toolbar-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.card-title { font-size: 0.9375rem; font-weight: 600; color: var(--text-primary); }
.card-subtitle { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.125rem; }
.table-wrapper { overflow-x: auto; }
.cell-input { width: 64px; padding: 0.375rem 0.375rem; text-align: center; font-size: 0.8125rem; }
.rata-rata { font-weight: 600; color: var(--color-emerald-600); font-size: 0.875rem; }
.rata-rata.warn { color: var(--color-rose-500); }
.empty-state { text-align: center; padding: 2.5rem 1rem !important; color: var(--text-muted); }
.form-label { font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary); }

@media (max-width: 640px) { .toolbar { flex-direction: column; align-items: stretch; } }
</style>
