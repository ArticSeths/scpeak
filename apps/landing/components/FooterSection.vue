<template>
  <footer class="border-t border-border py-8 px-4">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-dim">
      <span>SCPeak © {{ year }}</span>
      <div class="flex items-center gap-4">
        <a href="https://github.com/ArticSeths/scpeak" target="_blank" class="hover:text-text-secondary transition-colors">GitHub</a>
        <a href="https://github.com/ArticSeths/scpeak/releases" target="_blank" class="hover:text-text-secondary transition-colors">Releases</a>
        <a href="https://github.com/ArticSeths/scpeak/issues" target="_blank" class="hover:text-text-secondary transition-colors">Issues</a>
      </div>
      <span>MIT License</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
</script>
