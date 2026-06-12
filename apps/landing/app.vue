<template>
  <div class="min-h-screen bg-surface-950 text-surface-100">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 border-b border-surface-800 bg-surface-950/80 backdrop-blur-md">
      <nav class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="#" class="flex items-center gap-2 font-bold text-lg">
          <span class="text-primary-500">🎙️</span> SCPeak
        </a>
        <div class="hidden sm:flex items-center gap-6 text-sm text-surface-400">
          <a href="#features" class="hover:text-white transition-colors">Features</a>
          <a href="#architecture" class="hover:text-white transition-colors">Arquitectura</a>
          <a href="#download" class="hover:text-white transition-colors">Descargas</a>
          <a href="#deploy" class="hover:text-white transition-colors">Deploy</a>
          <a
            href="https://github.com/ArticSeths/scpeak"
            target="_blank"
            class="text-surface-300 hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
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
