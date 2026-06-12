<template>
  <section class="pt-32 pb-20 px-4 text-center">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Badges -->
      <div class="flex justify-center gap-3 flex-wrap">
        <a href="https://github.com/ArticSeths/scpeak/actions" target="_blank">
          <img src="https://img.shields.io/github/actions/workflow/status/ArticSeths/scpeak/ci.yml?branch=master&label=CI&style=flat-square" alt="CI" />
        </a>
        <a href="https://github.com/ArticSeths/scpeak/releases" target="_blank">
          <img src="https://img.shields.io/github/v/release/ArticSeths/scpeak?color=blue&style=flat-square" alt="Release" />
        </a>
        <a href="https://github.com/ArticSeths/scpeak/pkgs/container/scpeak-server" target="_blank">
          <img src="https://img.shields.io/badge/docker-ghcr.io%2Fscpeak--server-2496ED?logo=docker&style=flat-square" alt="Docker" />
        </a>
        <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
      </div>

      <!-- Título -->
      <h1 class="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
        Comunicación por voz
        <span class="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
          estilo Walkie-Talkie
        </span>
      </h1>

      <p class="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto">
        App de escritorio nativa y ultraligera para Star Citizen. Efectos de voz realistas,
        cancelación de ruido por IA, y despliegue self-hosted en 1 minuto.
      </p>

      <!-- CTAs -->
      <div class="flex justify-center gap-3 pt-4">
        <a
          href="#download"
          class="px-8 py-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors shadow-lg shadow-primary-600/25"
        >
          📥 Descargar
        </a>
        <a
          href="https://github.com/ArticSeths/scpeak"
          target="_blank"
          class="px-8 py-3 rounded-full border border-surface-600 hover:border-surface-400 text-surface-200 font-semibold transition-colors"
        >
          ⭐ GitHub
        </a>
      </div>

      <!-- Stats -->
      <div class="flex justify-center gap-8 pt-8 text-sm text-surface-500">
        <div class="text-center">
          <p class="text-2xl font-bold text-white">{{ releaseVersion }}</p>
          <p>Última versión</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-white">100+</p>
          <p>Usuarios por sala</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-white">5-10 MB</p>
          <p>Tamaño app</p>
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
