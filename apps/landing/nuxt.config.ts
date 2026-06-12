export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss"],

  app: {
    head: {
      title: "SCPeak — Comunicación por voz estilo Walkie-Talkie",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "App de escritorio nativa y ultraligera para comunicación por voz en Star Citizen. Walkie-Talkie FX, cancelación de ruido IA, self-hosted.",
        },
        { property: "og:title", content: "SCPeak — Comunicación por voz Walkie-Talkie" },
        {
          property: "og:description",
          content: "App nativa ultraligera para voz en Star Citizen. Walkie-Talkie FX, IA, self-hosted.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    },
  },

  devServer: {
    port: 3002,
  },

  compatibilityDate: "2026-06-12",
});
