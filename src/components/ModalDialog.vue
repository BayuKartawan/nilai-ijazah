<script setup lang="ts">
import { ref } from 'vue'
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-vue-next'

export interface ModalProps {
  show: boolean
  title?: string
  message?: string
  type?: 'confirm' | 'alert' | 'danger'
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<ModalProps>(), {
  title: '',
  message: '',
  type: 'confirm',
  confirmText: 'OK',
  cancelText: 'Batal'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:show': [value: boolean]
}>()

function close() {
  emit('update:show', false)
  emit('cancel')
}

function confirm() {
  emit('update:show', false)
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="dialog-overlay" @click.self="close">
        <div class="dialog" role="dialog" aria-modal="true">
          <div class="dialog-icon" :class="`dialog-icon--${type}`">
            <AlertTriangle v-if="type === 'danger'" :size="24" />
            <Info v-else-if="type === 'alert'" :size="24" />
            <AlertCircle v-else :size="24" />
          </div>
          <div class="dialog-content">
            <h3 v-if="title" class="dialog-title">{{ title }}</h3>
            <p v-if="message" class="dialog-message">{{ message }}</p>
            <slot />
          </div>
          <div class="dialog-actions">
            <button v-if="type !== 'alert'" class="dialog-btn dialog-btn--cancel" @click="close">
              {{ cancelText }}
            </button>
            <button
              class="dialog-btn"
              :class="type === 'danger' ? 'dialog-btn--danger' : 'dialog-btn--primary'"
              @click="confirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.dialog {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 0.875rem;
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.dialog-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-icon--confirm {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}

.dialog-icon--alert {
  background: var(--color-amber-50);
  color: var(--color-amber-600);
}

.dialog-icon--danger {
  background: var(--color-rose-50);
  color: var(--color-rose-500);
}

[data-theme="dark"] .dialog-icon--confirm {
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
}

[data-theme="dark"] .dialog-icon--alert {
  background: rgba(245, 158, 11, 0.15);
  color: #fcd34d;
}

[data-theme="dark"] .dialog-icon--danger {
  background: rgba(244, 63, 94, 0.15);
  color: #fda4af;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.dialog-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.dialog-message {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.25rem;
}

.dialog-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.dialog-btn--cancel {
  background: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--border-default);
}

.dialog-btn--cancel:hover {
  background: var(--bg-surface-hover);
}

.dialog-btn--primary {
  background: var(--color-primary-600);
  color: white;
}

.dialog-btn--primary:hover {
  background: var(--color-primary-700);
}

.dialog-btn--danger {
  background: var(--color-rose-500);
  color: white;
}

.dialog-btn--danger:hover {
  background: var(--color-rose-600);
}

/* Transitions */
.modal-enter-active {
  transition: opacity 0.15s ease;
}
.modal-enter-active .dialog {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.modal-leave-active {
  transition: opacity 0.1s ease;
}
.modal-leave-active .dialog {
  transition: transform 0.1s ease, opacity 0.1s ease;
}

.modal-enter-from {
  opacity: 0;
}
.modal-enter-from .dialog {
  transform: scale(0.95);
  opacity: 0;
}
.modal-leave-to {
  opacity: 0;
}
.modal-leave-to .dialog {
  transform: scale(0.95);
  opacity: 0;
}
</style>
