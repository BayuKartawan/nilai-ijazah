<script setup lang="ts">
import { ref, watch } from 'vue'
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-vue-next'

export interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<ToastItem[]>([])
let counter = 0

function addToast(message: string, type: ToastItem['type'] = 'info', duration = 3000) {
  const id = ++counter
  toasts.value.push({ id, message, type, duration })
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
}

function removeToast(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

// Expose globally
defineExpose({ addToast, removeToast })
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <div class="toast-icon">
            <CheckCircle v-if="toast.type === 'success'" :size="18" />
            <AlertCircle v-else-if="toast.type === 'error'" :size="18" />
            <AlertTriangle v-else-if="toast.type === 'warning'" :size="18" />
            <Info v-else :size="18" />
          </div>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" @click="removeToast(toast.id)">
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 380px;
  width: 100%;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-radius: 0.625rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  pointer-events: auto;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.toast--success .toast-icon { color: var(--color-emerald-500); }
.toast--error .toast-icon { color: var(--color-rose-500); }
.toast--warning .toast-icon { color: var(--color-amber-500); }
.toast--info .toast-icon { color: var(--color-primary-500); }

.toast-icon {
  flex-shrink: 0;
  display: flex;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 0.25rem;
  transition: color 0.15s ease;
}

.toast-close:hover {
  color: var(--text-primary);
}

/* Transitions */
.toast-enter-active {
  transition: all 0.2s ease;
}
.toast-leave-active {
  transition: all 0.15s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.toast-move {
  transition: transform 0.2s ease;
}

@media (max-width: 480px) {
  .toast-container {
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
  }
}
</style>
