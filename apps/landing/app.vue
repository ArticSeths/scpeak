<template>
  <div class="min-h-screen bg-bg text-text">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 border-b border-border-subtle bg-black/80 backdrop-blur-md">
      <nav class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="#" class="flex items-center gap-2 font-bold text-lg text-text">
          🎙️ SCPeak
        </a>
        <div class="hidden sm:flex items-center gap-6 text-sm text-text-muted">
          <a href="#features" class="hover:text-text transition-colors">Features</a>
          <a href="#architecture" class="hover:text-text transition-colors">Stack</a>
          <a href="#download" class="hover:text-text transition-colors">Descargas</a>
          <a href="#deploy" class="hover:text-text transition-colors">Deploy</a>
          <a
            href="https://github.com/ArticSeths/scpeak"
            target="_blank"
            class="text-text-secondary hover:text-text transition-colors"
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
