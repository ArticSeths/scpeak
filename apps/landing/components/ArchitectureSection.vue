<template>
  <section id="architecture" class="py-20 px-4 bg-bg-secondary">
    <div class="max-w-6xl mx-auto">
      <p class="text-xs tracking-[0.2em] text-accent/70 uppercase mb-4">Under the hood</p>
      <h2 class="text-3xl sm:text-4xl font-bold mb-4">
        Construido con tecnologías modernas
      </h2>
      <p class="text-text-secondary mb-12 max-w-xl">
        Un stack pensado para rendimiento, seguridad y facilidad de despliegue.
        Sin dependencias pesadas, sin configuraciones innecesarias.
      </p>

      <!-- Tech cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        <div class="p-6 rounded-xl border border-border bg-bg-elevated">
          <p class="text-xs text-text-muted uppercase tracking-wider mb-3">Rust</p>
          <p class="text-sm text-text-secondary leading-relaxed">
            App nativa con seguridad de memoria y cero-cost abstractions.
            Máxima fiabilidad con mínimo consumo.
          </p>
        </div>
        <div class="p-6 rounded-xl border border-border bg-bg-elevated">
          <p class="text-xs text-text-muted uppercase tracking-wider mb-3">Tauri</p>
          <p class="text-sm text-text-secondary leading-relaxed">
            Framework nativo de escritorio. Binarios de ~8 MB, auto-actualizaciones,
            y APIs de sistema sin depender de Electron.
          </p>
        </div>
        <div class="p-6 rounded-xl border border-border bg-bg-elevated">
          <p class="text-xs text-text-muted uppercase tracking-wider mb-3">LiveKit</p>
          <p class="text-sm text-text-secondary leading-relaxed">
            SFU open-source para WebRTC. NAT traversal automático,
            adaptación de bitrate, y codec Opus con DTX.
          </p>
        </div>
      </div>

      <!-- Stack completo -->
      <div>
        <p class="text-xs tracking-[0.2em] text-text-muted uppercase mb-4">Stack completo</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tech in stack"
            :key="tech"
            class="px-3 py-1.5 rounded-md text-xs font-medium bg-bg-card text-text-muted border border-border-subtle"
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
  "Tauri 2", "Rust", "Nuxt 3", "Vue 3", "TailwindCSS", "TypeScript",
  "LiveKit", "Express 5", "Drizzle ORM", "PostgreSQL 15", "Redis 7",
  "Docker", "pnpm", "GitHub Actions", "Web Audio API", "WebRTC",
];
</script>
