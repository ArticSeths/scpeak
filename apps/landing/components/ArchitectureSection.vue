<template>
  <section id="architecture" class="py-20 px-4">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl sm:text-4xl font-bold text-center mb-12">
        Cómo funciona
      </h2>

      <!-- Diagrama -->
      <div class="flex flex-col lg:flex-row items-center justify-center gap-8 mb-16">
        <div class="p-6 rounded-xl border border-surface-800 bg-surface-900 text-center w-56">
          <span class="text-4xl">🖥️</span>
          <h3 class="font-semibold mt-2">Cliente</h3>
          <p class="text-xs text-surface-500 mt-1">Tauri + Nuxt 3 + Vue 3</p>
          <p class="text-xs text-surface-500">TailwindCSS + LiveKit SDK</p>
        </div>

        <span class="text-2xl text-primary-500 hidden lg:block">→</span>
        <span class="text-2xl text-primary-500 lg:hidden">↓</span>

        <div class="p-6 rounded-xl border border-primary-500/30 bg-primary-500/5 text-center w-56">
          <span class="text-4xl">☁️</span>
          <h3 class="font-semibold mt-2">LiveKit SFU</h3>
          <p class="text-xs text-surface-500 mt-1">WebSocket :7880</p>
          <p class="text-xs text-surface-500">UDP :7882 (voz)</p>
        </div>

        <span class="text-2xl text-primary-500 hidden lg:block">→</span>
        <span class="text-2xl text-primary-500 lg:hidden">↓</span>

        <div class="p-6 rounded-xl border border-surface-800 bg-surface-900 text-center w-56">
          <span class="text-4xl">🗄️</span>
          <h3 class="font-semibold mt-2">Backend</h3>
          <p class="text-xs text-surface-500 mt-1">Express + Drizzle ORM</p>
          <p class="text-xs text-surface-500">PostgreSQL + Redis</p>
        </div>
      </div>

      <!-- Stack -->
      <div class="max-w-3xl mx-auto">
        <h3 class="text-lg font-semibold text-center mb-4">Stack tecnológico</h3>
        <div class="flex flex-wrap justify-center gap-2">
          <span
            v-for="tech in stack"
            :key="tech"
            class="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-800 text-surface-300 border border-surface-700"
          >
            {{ tech }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const stack = [
  "Tauri 2",
  "Rust",
  "Nuxt 3",
  "Vue 3",
  "TailwindCSS",
  "TypeScript",
  "LiveKit",
  "Express 5",
  "Drizzle ORM",
  "PostgreSQL 15",
  "Redis 7",
  "Docker",
  "pnpm",
  "GitHub Actions",
  "Web Audio API",
  "WebRTC",
];
</script>
