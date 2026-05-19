<script setup lang="ts">
import { provide, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import ToastNotification from '@/components/ToastNotification.vue'

const toastRef = ref<InstanceType<typeof ToastNotification> | null>(null)

function toast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) {
  toastRef.value?.addToast(message, type, duration)
}

provide('toast', toast)
</script>

<template>
  <MainLayout />
  <ToastNotification ref="toastRef" />
</template>
