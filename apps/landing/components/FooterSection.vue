<template>
  <footer class="border-t border-surface-800 py-10 px-4 bg-surface-950">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-surface-500">
      <div class="flex items-center gap-2">
        <span class="text-primary-500">🎙️</span>
        <span>SCPeak — Comunicación por voz estilo Walkie-Talkie</span>
      </div>

      <div class="flex items-center gap-6">
        <a href="https://github.com/ArticSeths/scpeak" target="_blank" class="hover:text-surface-300 transition-colors">
          GitHub
        </a>
        <a href="https://github.com/ArticSeths/scpeak/releases" target="_blank" class="hover:text-surface-300 transition-colors">
          Releases
        </a>
        <a href="https://github.com/ArticSeths/scpeak/issues" target="_blank" class="hover:text-surface-300 transition-colors">
          Issues
        </a>
      </div>

      <span class="text-surface-600">MIT © {{ year }} ArticSeths</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
</script>
