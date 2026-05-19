<script setup lang="ts">
import { ref, inject } from 'vue'
import { useDataStore } from '@/stores/data'
import { Plus, Pencil, Trash2, X } from 'lucide-vue-next'
import ModalDialog from '@/components/ModalDialog.vue'
import type { Mapel } from '@/types'

const store = useDataStore()
const toast = inject<(msg: string, type?: string) => void>('toast')!

const showForm = ref(false)
const editingId = ref<string | null>(null)
const deleteTarget = ref<Mapel | null>(null)
const showDeleteConfirm = ref(false)

const form = ref<Omit<Mapel, 'id'>>({
  kode: '', nama: '', kelompok: 'A', kkm: 75, isPAI: false
})

function openAdd() {
  editingId.value = null
  form.value = { kode: '', nama: '', kelompok: 'A', kkm: 75, isPAI: false }
  showForm.value = true
}

function openEdit(mapel: Mapel) {
  editingId.value = mapel.id
  form.value = { kode: mapel.kode, nama: mapel.nama, kelompok: mapel.kelompok, kkm: mapel.kkm, isPAI: mapel.isPAI }
  showForm.value = true
}

function save() {
  if (!form.value.nama.trim() || !form.value.kode.trim()) return
  if (editingId.value) {
    store.updateMapel(editingId.value, form.value)
    toast('Mapel berhasil diperbarui.', 'success')
  } else {
    store.addMapel(form.value)
    toast('Mapel berhasil ditambahkan.', 'success')
  }
  showForm.value = false
}

function askDelete(mapel: Mapel) {
  deleteTarget.value = mapel
  showDeleteConfirm.value = true
}

function doDelete() {
  if (deleteTarget.value) {
    store.deleteMapel(deleteTarget.value.id)
    toast(`Mapel "${deleteTarget.value.nama}" berhasil dihapus.`, 'success')
    deleteTarget.value = null
  }
}

function getKelompokLabel(k: string) {
  switch (k) {
    case 'A': return 'Kelompok A'
    case 'B': return 'Kelompok B'
    case 'C': return 'Muatan Lokal'
    default: return k
  }
}
</script>

<template>
  <div class="fade-in">
    <div class="toolbar">
      <div></div>
      <button class="btn btn-primary btn-sm" @click="openAdd">
        <Plus :size="16" /> <span>Tambah Mapel</span>
      </button>
    </div>

    <!-- Form Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
          <div class="modal">
            <div class="modal-header">
              <h3>{{ editingId ? 'Edit Mapel' : 'Tambah Mapel' }}</h3>
              <button class="modal-close" @click="showForm = false"><X :size="18" /></button>
            </div>
            <div class="modal-body">
              <div class="form-stack">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Kode Mapel</label>
                    <input v-model="form.kode" type="text" class="form-input" placeholder="Contoh: MTK" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">SKL (Standar Kelulusan)</label>
                    <input v-model.number="form.kkm" type="number" class="form-input" min="0" max="100" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Nama Mata Pelajaran</label>
                  <input v-model="form.nama" type="text" class="form-input" placeholder="Nama lengkap mapel" />
                </div>
                <div class="form-group">
                  <label class="form-label">Kelompok</label>
                  <select v-model="form.kelompok" class="form-input">
                    <option value="A">Kelompok A (Wajib)</option>
                    <option value="B">Kelompok B (Pilihan)</option>
                    <option value="C">Muatan Lokal</option>
                  </select>
                </div>
                <label class="check-label">
                  <input type="checkbox" v-model="form.isPAI" />
                  <span>Mata Pelajaran PAI</span>
                </label>
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

    <ModalDialog
      v-model:show="showDeleteConfirm"
      type="danger"
      title="Hapus Mata Pelajaran?"
      :message="`Semua nilai terkait &quot;${deleteTarget?.nama}&quot; akan dihapus permanen.`"
      confirm-text="Hapus"
      @confirm="doDelete"
    />

    <div class="card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:44px">No</th>
              <th>Kode</th>
              <th>Nama Mata Pelajaran</th>
              <th class="hide-mobile">Kelompok</th>
              <th>SKL</th>
              <th class="hide-mobile">Ket</th>
              <th style="width:80px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(mapel, idx) in store.mapelList" :key="mapel.id">
              <td>{{ idx + 1 }}</td>
              <td><code class="code-text">{{ mapel.kode }}</code></td>
              <td style="font-weight:500">{{ mapel.nama }}</td>
              <td class="hide-mobile">
                <span class="badge" :class="{ 'badge-success': mapel.kelompok === 'A', 'badge-warning': mapel.kelompok === 'B', 'badge-info': mapel.kelompok === 'C' }">
                  {{ getKelompokLabel(mapel.kelompok) }}
                </span>
              </td>
              <td>{{ mapel.kkm }}</td>
              <td class="hide-mobile">
                <span v-if="mapel.isPAI" class="tag">PAI</span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" @click="openEdit(mapel)" title="Edit"><Pencil :size="15" /></button>
                  <button class="icon-btn danger" @click="askDelete(mapel)" title="Hapus"><Trash2 :size="15" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.table-wrapper { overflow-x: auto; }

.code-text {
  font-size: 0.8125rem; padding: 0.125rem 0.375rem; background: var(--bg-muted);
  border-radius: 0.25rem; color: var(--text-secondary);
}

.tag {
  font-size: 0.6875rem; padding: 0.125rem 0.5rem; background: var(--bg-muted);
  color: var(--text-secondary); border-radius: 9999px; font-weight: 500;
}

.badge-info { background: var(--color-primary-50); color: var(--color-primary-700); }
[data-theme="dark"] .badge-info { background: rgba(99,102,241,0.15); color: #a5b4fc; }

.action-btns { display: flex; gap: 0.25rem; }
.icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: none; background: none;
  color: var(--text-secondary); cursor: pointer; border-radius: 0.375rem; transition: all 0.15s ease;
}
.icon-btn:hover { background: var(--bg-muted); color: var(--color-primary-600); }
.icon-btn.danger:hover { color: var(--color-rose-500); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
.modal { background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: 0.875rem; width: 100%; max-width: 480px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-default); }
.modal-header h3 { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
.modal-close { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: none; background: none; color: var(--text-secondary); cursor: pointer; border-radius: 0.375rem; }
.modal-close:hover { background: var(--bg-muted); }
.modal-body { padding: 1.25rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1rem 1.25rem; border-top: 1px solid var(--border-default); }

.form-stack { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-label { font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary); }

.check-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-primary); cursor: pointer; }
.check-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--color-primary-600); }

.modal-enter-active { transition: opacity 0.15s ease; }
.modal-leave-active { transition: opacity 0.1s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
  .hide-mobile { display: none; }
}
</style>
