<template>
  <section class="pt-24 sm:pt-32 pb-16 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Label -->
      <p class="text-xs tracking-[0.2em] text-primary-400 uppercase mb-6 text-center">
        Voice Communication App
      </p>

      <!-- Título -->
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center leading-[1.1]">
        Comunícate con tu flota
        <span class="block text-surface-500">como si llevaras un Walkie-Talkie</span>
      </h1>

      <p class="text-base sm:text-lg text-surface-400 max-w-xl mx-auto mt-6 text-center leading-relaxed">
        App de escritorio nativa, ultraligera. Efectos de voz realistas,
        cancelación de ruido por IA, y despliegue self-hosted en un minuto.
        Diseñada para Star Citizen.
      </p>

      <!-- CTAs -->
      <div class="flex justify-center gap-3 mt-8">
        <a
          href="#download"
          class="px-6 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-surface-200 transition-colors"
        >
          Descargar app
        </a>
        <a
          href="#deploy"
          class="px-6 py-2.5 rounded-lg border border-surface-700 text-surface-300 font-medium text-sm hover:border-surface-500 hover:text-white transition-colors"
        >
          Deploy server
        </a>
      </div>

      <!-- Stats row -->
      <div class="flex justify-center gap-6 sm:gap-10 mt-14 pt-10 border-t border-surface-800">
        <div class="text-center">
          <p class="text-xl sm:text-2xl font-bold text-white font-mono">{{ releaseVersion }}</p>
          <p class="text-xs text-surface-500 mt-1">Última versión</p>
        </div>
        <div class="text-center">
          <p class="text-xl sm:text-2xl font-bold text-white font-mono">100+</p>
          <p class="text-xs text-surface-500 mt-1">Usuarios / sala</p>
        </div>
        <div class="text-center">
          <p class="text-xl sm:text-2xl font-bold text-white font-mono">~8 MB</p>
          <p class="text-xs text-surface-500 mt-1">Tamaño app</p>
        </div>
        <div class="text-center">
          <p class="text-xl sm:text-2xl font-bold text-white font-mono">1 min</p>
          <p class="text-xs text-surface-500 mt-1">Deploy</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const releaseVersion = ref("v0.0.1");

onMounted(async () => {
  try {
    const res = await $fetch<{ tag_name: string }>(
      "https://api.github.com/repos/ArticSeths/scpeak/releases/latest",
    );
    releaseVersion.value = res.tag_name;
  } catch { /* mantiene default */ }
});
</script>
