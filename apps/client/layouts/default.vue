<template>
  <div class="min-h-screen bg-surface-950 text-surface-100">
    <header class="border-b border-surface-800 px-6 py-4">
      <div class="flex items-center justify-between max-w-5xl mx-auto">
        <h1 class="text-xl font-bold tracking-wider text-primary-400">SCPeak</h1>
        <button
          v-if="isAuthenticated"
          class="text-sm text-surface-400 hover:text-surface-200 transition-colors"
          @click="logout"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
    <main class="max-w-5xl mx-auto px-6 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated, logout } = useAuth();
</script>
