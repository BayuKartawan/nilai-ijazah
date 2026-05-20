<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useDataStore } from '@/stores/data'
import { Plus, Pencil, Trash2, Upload, Download, Search, X, Loader2 } from 'lucide-vue-next'
import { exportTemplateSiswa, parseSiswaFromExcel } from '@/utils/excel'
import ModalDialog from '@/components/ModalDialog.vue'
import type { Siswa } from '@/types'

const store = useDataStore()
const toast = inject<(msg: string, type?: string) => void>('toast')!

const searchQuery = ref('')
const showForm = ref(false)
const editingId = ref<string | null>(null)
const importLoading = ref(false)

// Delete confirmation
const deleteTarget = ref<Siswa | null>(null)
const showDeleteConfirm = ref(false)

const form = ref<Omit<Siswa, 'id'>>({
  nisn: '', nama: ''
})

const formError = ref('')

const filteredSiswa = computed(() => {
  const q = searchQuery.value.toLowerCase()
  const sorted = store.sortedSiswa
  if (!q) return sorted
  return sorted.filter(s =>
    s.nama.toLowerCase().includes(q) ||
    s.nisn.includes(q)
  )
})

function openAdd() {
  editingId.value = null
  formError.value = ''
  form.value = { nisn: '', nama: '' }
  showForm.value = true
}

function openEdit(siswa: Siswa) {
  editingId.value = siswa.id
  formError.value = ''
  form.value = { nisn: siswa.nisn, nama: siswa.nama }
  showForm.value = true
}

function save() {
  formError.value = ''
  if (!form.value.nama.trim()) {
    formError.value = 'Nama siswa wajib diisi.'
    return
  }
  if (!form.value.nisn.trim()) {
    formError.value = 'NISN wajib diisi.'
    return
  }

  if (editingId.value) {
    const result = store.updateSiswa(editingId.value, form.value)
    if (!result.success) {
      formError.value = result.error || 'Gagal menyimpan.'
      return
    }
    toast('Data siswa berhasil diperbarui.', 'success')
  } else {
    const result = store.addSiswa(form.value)
    if (!result.success) {
      formError.value = result.error || 'Gagal menambah siswa.'
      return
    }
    toast('Siswa berhasil ditambahkan.', 'success')
  }
  showForm.value = false
}

function askDelete(siswa: Siswa) {
  deleteTarget.value = siswa
  showDeleteConfirm.value = true
}

function doDelete() {
  if (deleteTarget.value) {
    store.deleteSiswa(deleteTarget.value.id)
    toast(`Data "${deleteTarget.value.nama}" berhasil dihapus.`, 'success')
    deleteTarget.value = null
  }
}

async function handleImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  importLoading.value = true
  try {
    const list = await parseSiswaFromExcel(file)
    const result = store.importSiswa(list)
    toast(`Berhasil: ${result.imported} data baru ditambahkan, ${result.updated} data diperbarui.`, result.updated > 0 ? 'warning' : 'success')
  } catch {
    toast('Gagal mengimpor. Pastikan format sesuai template.', 'error')
  } finally {
    importLoading.value = false
    target.value = ''
  }
}
</script>

<template>
  <div class="fade-in">
    <!-- Import Loader -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="importLoading" class="import-loader-overlay">
          <div class="import-loader-box">
            <Loader2 :size="28" class="spin-icon" />
            <span>Mengimpor data...</span>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div class="toolbar">
      <div class="search-box">
        <Search :size="16" class="search-icon" />
        <input v-model="searchQuery" type="text" placeholder="Cari nama atau NISN..." class="form-input search-input" />
      </div>
      <div class="toolbar-actions">
        <button class="btn btn-secondary btn-sm" @click="exportTemplateSiswa">
          <Download :size="16" />
          <span>Template</span>
        </button>
        <label class="btn btn-secondary btn-sm" style="cursor:pointer">
          <Upload :size="16" />
          <span>{{ importLoading ? 'Importing...' : 'Import' }}</span>
          <input type="file" accept=".xlsx,.xls" @change="handleImport" hidden />
        </label>
        <button class="btn btn-primary btn-sm" @click="openAdd">
          <Plus :size="16" />
          <span>Tambah</span>
        </button>
      </div>
    </div>

    <!-- Form Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
          <div class="modal">
            <div class="modal-header">
              <h3>{{ editingId ? 'Edit Siswa' : 'Tambah Siswa' }}</h3>
              <button class="modal-close" @click="showForm = false"><X :size="18" /></button>
            </div>
            <div class="modal-body">
              <p v-if="formError" class="form-error">{{ formError }}</p>
              <div class="form-stack">
                <div class="form-group">
                  <label class="form-label">NISN <span class="required">*</span></label>
                  <input v-model="form.nisn" type="text" class="form-input" placeholder="Nomor Induk Siswa Nasional" />
                </div>
                <div class="form-group">
                  <label class="form-label">Nama Lengkap <span class="required">*</span></label>
                  <input v-model="form.nama" type="text" class="form-input" placeholder="Nama lengkap siswa" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showForm = false">Batal</button>
              <button class="btn btn-primary" @click="save">Simpan</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete confirmation -->
    <ModalDialog
      v-model:show="showDeleteConfirm"
      type="danger"
      title="Hapus Data Siswa?"
      :message="`Semua data dan nilai milik &quot;${deleteTarget?.nama}&quot; akan dihapus permanen.`"
      confirm-text="Hapus"
      @confirm="doDelete"
    />

    <!-- Table -->
    <div class="card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:44px">No</th>
              <th>NISN</th>
              <th>Nama Siswa</th>
              <th style="width:80px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(siswa, idx) in filteredSiswa" :key="siswa.id">
              <td>{{ idx + 1 }}</td>
              <td style="font-family: monospace; font-size:0.8125rem">{{ siswa.nisn }}</td>
              <td style="font-weight:500">{{ siswa.nama }}</td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" @click="openEdit(siswa)" title="Edit"><Pencil :size="15" /></button>
                  <button class="icon-btn danger" @click="askDelete(siswa)" title="Hapus"><Trash2 :size="15" /></button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredSiswa.length === 0">
              <td colspan="4" class="empty-state">
                {{ searchQuery ? 'Tidak ada siswa ditemukan.' : 'Belum ada data siswa.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap;
}
.search-box { position: relative; flex: 1; max-width: 320px; min-width: 180px; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
.search-input { padding-left: 2.25rem; }
.toolbar-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.table-wrapper { overflow-x: auto; }
.empty-state { text-align: center; padding: 2.5rem 1rem !important; color: var(--text-muted); }

.action-btns { display: flex; gap: 0.25rem; }
.icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: none; background: none;
  color: var(--text-secondary); cursor: pointer; border-radius: 0.375rem;
  transition: all 0.15s ease;
}
.icon-btn:hover { background: var(--bg-muted); color: var(--color-primary-600); }
.icon-btn.danger:hover { color: var(--color-rose-500); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 1rem;
}
.modal {
  background: var(--bg-surface); border: 1px solid var(--border-default);
  border-radius: 0.875rem; width: 100%; max-width: 440px; max-height: 90vh; overflow-y: auto;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-default);
}
.modal-header h3 { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
.modal-close {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: none; background: none;
  color: var(--text-secondary); cursor: pointer; border-radius: 0.375rem;
}
.modal-close:hover { background: var(--bg-muted); }
.modal-body { padding: 1.25rem; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.5rem;
  padding: 1rem 1.25rem; border-top: 1px solid var(--border-default);
}
.form-stack { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-label { font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary); }
.required { color: var(--color-rose-500); }
.form-error {
  font-size: 0.8125rem; color: var(--color-rose-500); margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem; background: var(--color-rose-50); border-radius: 0.5rem;
}
[data-theme="dark"] .form-error { background: rgba(244,63,94,0.1); }

/* Modal transition */
.modal-enter-active { transition: opacity 0.15s ease; }
.modal-enter-active .modal { transition: transform 0.15s ease, opacity 0.15s ease; }
.modal-leave-active { transition: opacity 0.1s ease; }
.modal-leave-active .modal { transition: transform 0.1s ease; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .modal { transform: scale(0.95); opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-leave-to .modal { transform: scale(0.95); opacity: 0; }

@media (max-width: 640px) {
  .toolbar { flex-direction: column; align-items: stretch; }
  .search-box { max-width: none; }
}

/* Import loader */
.import-loader-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.import-loader-box {
  display: flex; align-items: center; gap: 0.625rem;
  background: var(--bg-surface); border: 1px solid var(--border-default);
  padding: 0.875rem 1.5rem; border-radius: 0.75rem;
  font-size: 0.875rem; font-weight: 500; color: var(--text-primary);
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
}
.spin-icon { animation: spin 0.8s linear infinite; color: var(--color-primary-600); }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active { transition: opacity 0.15s ease; }
.fade-leave-active { transition: opacity 0.1s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
