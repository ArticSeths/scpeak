<template>
  <section id="deploy" class="py-20 px-4 bg-bg-secondary">
    <div class="max-w-3xl mx-auto">
      <p class="text-xs tracking-[0.2em] text-accent/70 uppercase mb-4">Self-Hosted</p>
      <h2 class="text-3xl sm:text-4xl font-bold mb-4">Tu propio servidor en 1 minuto</h2>
      <p class="text-text-secondary mb-12">Sin configuraciones complejas. Solo Docker y 4 puertos.</p>

      <div class="space-y-8">
        <div v-for="(step, i) in steps" :key="i" class="flex gap-5">
          <div class="w-8 h-8 rounded-lg bg-accent/5 border border-border flex items-center justify-center text-sm font-bold text-accent shrink-0 mt-0.5">
            {{ i + 1 }}
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-sm mb-2">{{ step.title }}</h3>
            <pre class="p-4 rounded-lg bg-bg-card border border-border text-sm overflow-x-auto font-mono text-text-secondary"><code>{{ step.code }}</code></pre>
            <p v-if="step.note" class="text-xs text-text-dim mt-2">{{ step.note }}</p>
          </div>
        </div>
      </div>

      <div class="mt-10 pt-8 border-t border-border">
        <p class="text-xs text-text-muted">
          Puertos necesarios: <span class="text-text-secondary font-mono">3001/tcp</span> (API) ·
          <span class="text-text-secondary font-mono">7880/tcp</span> (señal) ·
          <span class="text-text-secondary font-mono">7881/tcp</span> (fallback) ·
          <span class="text-text-secondary font-mono">7882/udp</span> (voz)
        </p>
        <a
          href="https://github.com/ArticSeths/scpeak/blob/master/DEPLOY.md"
          target="_blank"
          class="inline-block mt-4 text-sm text-accent/70 hover:underline"
        >
          Guía completa de despliegue →
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const steps = [
  {
    title: "Clona el repositorio",
    code: "git clone https://github.com/ArticSeths/scpeak.git\ncd scpeak",
  },
  {
    title: "Configura las variables de entorno",
    code: "cp .env.prod.example .env\n# edita el archivo con los secretos de tu servidor",
    note: "Usa openssl rand -hex 32 para generar secretos seguros.",
  },
  {
    title: "Levanta los servicios con Docker Compose",
    code: "docker compose -f docker-compose.prod.yml up -d",
    note: "La imagen se descarga automáticamente de GitHub Container Registry.",
  },
];
</script>
