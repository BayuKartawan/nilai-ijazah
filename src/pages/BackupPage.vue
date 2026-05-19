<script setup lang="ts">
import { ref, inject } from 'vue'
import { useDataStore } from '@/stores/data'
import { Download, Upload, Trash2 } from 'lucide-vue-next'
import ModalDialog from '@/components/ModalDialog.vue'

const store = useDataStore()
const toast = inject<(msg: string, type?: string) => void>('toast')!

const showResetConfirm = ref(false)

function downloadBackup() {
  const json = store.exportBackup()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `backup-nilai-ijazah-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  toast('Backup berhasil diunduh!', 'success')
}

async function handleRestore(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const json = e.target?.result as string
    const result = store.importBackup(json)
    if (result.success) {
      toast('Data berhasil dipulihkan dari backup!', 'success')
    } else {
      toast(result.error || 'Gagal memulihkan data.', 'error')
    }
  }
  reader.readAsText(file)
  target.value = ''
}

function doReset() {
  store.resetAllData()
  toast('Semua data berhasil direset.', 'success')
}
</script>

<template>
  <div class="fade-in">
    <div class="page-header">
      <h2 class="page-heading">Backup & Restore Data</h2>
      <p class="page-desc">Semua data disimpan di browser (localStorage). Gunakan backup untuk menyimpan data ke file.</p>
    </div>

    <div class="cards-grid">
      <div class="feature-card">
        <div class="feature-icon" style="color: var(--color-primary-500)">
          <Download :size="28" />
        </div>
        <h3>Backup Data</h3>
        <p>Unduh seluruh data ke file JSON sebagai cadangan. File ini dapat digunakan untuk memulihkan data di kemudian hari.</p>
        <button class="btn btn-primary" @click="downloadBackup">
          <Download :size="16" /> Unduh Backup
        </button>
      </div>

      <div class="feature-card">
        <div class="feature-icon" style="color: var(--color-emerald-500)">
          <Upload :size="28" />
        </div>
        <h3>Restore Data</h3>
        <p>Pulihkan data dari file backup JSON. Data yang ada saat ini akan digantikan dengan data dari file backup.</p>
        <label class="btn btn-success" style="cursor:pointer">
          <Upload :size="16" /> Pilih File Backup
          <input type="file" accept=".json" @change="handleRestore" hidden />
        </label>
      </div>

      <div class="feature-card feature-card--danger">
        <div class="feature-icon" style="color: var(--color-rose-500)">
          <Trash2 :size="28" />
        </div>
        <h3>Reset Semua Data</h3>
        <p>Hapus semua data siswa, nilai, dan pengaturan. Mata pelajaran akan dikembalikan ke default. Pastikan sudah membuat backup terlebih dahulu.</p>
        <button class="btn btn-danger" @click="showResetConfirm = true">
          <Trash2 :size="16" /> Reset Data
        </button>
      </div>
    </div>

    <ModalDialog
      v-model:show="showResetConfirm"
      type="danger"
      title="Reset Semua Data?"
      message="Tindakan ini tidak dapat dibatalkan. Semua data siswa, nilai, dan pengaturan akan dihapus."
      confirm-text="Ya, Reset"
      @confirm="doReset"
    />
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 1.5rem; }
.page-heading { font-size: 1.125rem; font-weight: 600; color: var(--text-primary); }
.page-desc { font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.feature-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-card--danger {
  border-color: var(--color-rose-100);
}

[data-theme="dark"] .feature-card--danger {
  border-color: rgba(244, 63, 94, 0.2);
}

.feature-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-muted);
  border-radius: 0.75rem;
}

.feature-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.feature-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  flex: 1;
}

.feature-card .btn {
  align-self: flex-start;
  margin-top: 0.25rem;
}
</style>
