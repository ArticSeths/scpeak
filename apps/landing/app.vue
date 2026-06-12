<template>
  <div class="min-h-screen bg-bg text-text">
    <!-- Header flotante -->
    <header class="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <nav class="flex items-center gap-1 px-3 py-2 rounded-full bg-bg-elevated/90 backdrop-blur-xl border border-border shadow-lg shadow-black/50">
        <a href="#" class="flex items-center gap-1.5 font-semibold text-sm text-text px-2">
          🎙️ SCPeak
        </a>
        <div class="hidden sm:flex items-center">
          <a href="#features" class="px-3 py-1.5 rounded-full text-xs text-text-muted hover:text-text hover:bg-bg-card transition-colors">Features</a>
          <a href="#architecture" class="px-3 py-1.5 rounded-full text-xs text-text-muted hover:text-text hover:bg-bg-card transition-colors">Stack</a>
          <a href="#download" class="px-3 py-1.5 rounded-full text-xs text-text-muted hover:text-text hover:bg-bg-card transition-colors">Descargas</a>
          <a href="#deploy" class="px-3 py-1.5 rounded-full text-xs text-text-muted hover:text-text hover:bg-bg-card transition-colors">Deploy</a>
        </div>
        <a
          href="https://github.com/ArticSeths/scpeak"
          target="_blank"
          class="px-3 py-1.5 rounded-full text-xs font-medium bg-text text-black hover:bg-text-secondary transition-colors ml-1"
        >
          GitHub
        </a>
      </nav>
    </header>

    <!-- Contenido -->
    <main class="pt-14">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <FooterSection />
  </div>
</template>

<script setup lang="ts">
import FooterSection from "~/components/FooterSection.vue";
</script>
