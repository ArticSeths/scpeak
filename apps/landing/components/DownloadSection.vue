<template>
  <section id="download" class="py-20 px-4">
    <div class="max-w-4xl mx-auto">
      <p class="text-xs tracking-[0.2em] text-accent/70 uppercase mb-4 text-center">Install</p>
      <h2 class="text-3xl sm:text-4xl font-bold text-center mb-4">Descarga la app</h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
        <a
          v-for="d in downloads"
          :key="d.os"
          :href="d.url"
          class="p-5 rounded-xl border border-border bg-bg-elevated hover:border-border-hover transition-colors group"
        >
          <p class="text-xs text-text-muted uppercase tracking-wider mb-3">{{ d.os }}</p>
          <span class="text-2xl">{{ d.icon }}</span>
          <p class="text-sm text-text-secondary mt-2">{{ d.label }}</p>
          <p class="text-xs text-accent/70 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            Descargar →
          </p>
        </a>
      </div>

      <p class="text-center mt-8 text-xs text-text-dim">
        Versión {{ release?.tag_name || "..." }} —
        <a href="https://github.com/ArticSeths/scpeak/releases" target="_blank" class="text-accent/70 hover:underline">
          Ver todas las versiones
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

const downloads = computed(() => {
  const assets = release.value?.assets || [];
  return [
    {
      os: "Windows",
      icon: "🪟",
      label: ".msi / .exe",
      url: assets.find((a) => a.name.endsWith(".msi") || a.name.endsWith(".exe"))?.browser_download_url || "#download",
    },
    {
      os: "macOS",
      icon: "🍎",
      label: ".dmg",
      url: assets.find((a) => a.name.endsWith(".dmg"))?.browser_download_url || "#download",
    },
    {
      os: "Linux",
      icon: "🐧",
      label: ".AppImage / .deb",
      url: assets.find((a) => a.name.endsWith(".AppImage") || a.name.endsWith(".deb"))?.browser_download_url || "#download",
    },
  ];
});

onMounted(async () => {
  try {
    release.value = await $fetch<Release>(
      "https://api.github.com/repos/ArticSeths/scpeak/releases/latest",
    );
  } catch { /* */ }
});
</script>
