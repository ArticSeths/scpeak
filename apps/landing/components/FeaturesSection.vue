<template>
  <section id="features" class="py-20 px-4">
    <div class="max-w-6xl mx-auto">
      <p class="text-xs tracking-[0.2em] text-primary-400 uppercase mb-4">Platform</p>
      <h2 class="text-3xl sm:text-4xl font-bold mb-12">Todo lo que necesitas</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-surface-800 rounded-xl overflow-hidden">
        <div
          v-for="f in features"
          :key="f.title"
          class="p-6 bg-surface-900 hover:bg-surface-800/80 transition-colors group"
        >
          <div class="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-xl mb-4">
            {{ f.icon }}
          </div>
          <h3 class="font-semibold mb-2">{{ f.title }}</h3>
          <p class="text-sm text-surface-400 leading-relaxed">{{ f.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  {
    icon: "📻",
    title: "Efecto Walkie-Talkie",
    description:
      "Filtro pasa-banda, distorsión analógica y compresor que simulan una radio real. Parámetros configurables al detalle desde la UI.",
  },
  {
    icon: "🤖",
    title: "Cancelación de ruido IA",
    description:
      "Supresión de ruido nativa del navegador (WebRTC AudioProcessing). Elimina ventiladores, teclados y ruido de calle en tiempo real.",
  },
  {
    icon: "🔊",
    title: "Puerto único UDP",
    description:
      "Toda la voz por un solo puerto (7882/udp). Sin NAT traversal complejo, sin configurar firewalls. Como TeamSpeak.",
  },
  {
    icon: "🪶",
    title: "Ultraligera",
    description:
      "App nativa con Tauri 2. Binario de ~8 MB y ~30 MB de RAM. Usa el WebView del sistema, sin Electron, sin Chromium.",
  },
  {
    icon: "🔐",
    title: "Segura por diseño",
    description:
      "JWT + tokens LiveKit de corta duración. API keys nunca expuestas al cliente. bcrypt + PostgreSQL. Cifrado E2E en la voz.",
  },
  {
    icon: "👥",
    title: "Multi-sala y roles",
    description:
      "Crea salas públicas o privadas. Control de acceso por contraseña de servidor. Hasta 100+ usuarios simultáneos por sala.",
  },
];
</script>
