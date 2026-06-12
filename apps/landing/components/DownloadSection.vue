<template>
  <section id="download" class="py-20 px-4 bg-surface-900/50">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-3xl sm:text-4xl font-bold mb-4">Descargas</h2>
      <p class="text-surface-400 mb-10">
        Última versión:
        <span class="text-white font-mono">{{ release?.tag_name || "..." }}</span>
        <span class="text-surface-600 ml-2">{{ releaseDate }}</span>
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          v-for="d in downloads"
          :key="d.os"
          :href="d.url"
          class="p-6 rounded-xl border border-surface-800 bg-surface-900 hover:border-primary-500/30 transition-colors group text-left"
        >
          <span class="text-3xl">{{ d.icon }}</span>
          <h3 class="font-semibold mt-2">{{ d.os }}</h3>
          <p class="text-xs text-surface-500 mt-1">{{ d.label }}</p>
          <p class="text-xs text-primary-400 mt-2 group-hover:underline">
            Descargar ↓
          </p>
        </a>
      </div>

      <p class="text-xs text-surface-600 mt-6">
        También disponible en
        <a
          href="https://github.com/ArticSeths/scpeak/releases"
          target="_blank"
          class="text-primary-400 hover:underline"
        >
          GitHub Releases
        </a>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Release {
  tag_name: string;
  published_at: string;
  assets: { name: string; browser_download_url: string }[];
}

const release = ref<Release | null>(null);

const releaseDate = computed(() => {
  if (!release.value) return "";
  return new Date(release.value.published_at).toLocaleDateString("es-ES");
});

const downloads = computed(() => {
  const assets = release.value?.assets || [];
  return [
    {
      os: "Windows",
      icon: "🪟",
      label: "Instalador .msi / .exe",
      url:
        assets.find((a) => a.name.endsWith(".msi") || a.name.endsWith(".exe"))
          ?.browser_download_url || "#download",
    },
    {
      os: "macOS",
      icon: "🍎",
      label: "Imagen .dmg",
      url:
        assets.find((a) => a.name.endsWith(".dmg"))?.browser_download_url || "#download",
    },
    {
      os: "Linux",
      icon: "🐧",
      label: "AppImage / .deb",
      url:
        assets.find((a) => a.name.endsWith(".AppImage") || a.name.endsWith(".deb"))
          ?.browser_download_url || "#download",
    },
  ];
});

onMounted(async () => {
  try {
    release.value = await $fetch<Release>(
      "https://api.github.com/repos/ArticSeths/scpeak/releases/latest",
    );
  } catch { /* mantiene default */ }
});
</script>
