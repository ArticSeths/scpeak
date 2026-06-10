export default defineNuxtConfig({
  ssr: false,

  modules: ["@nuxtjs/tailwindcss"],

  // Workaround para Nuxt 3.21.8 + ssr:false (nuxt/nuxt#35033)
  // Remover cuando se actualice a Nuxt >= 3.21.9
  experimental: {
    viteEnvironmentApi: true,
  },

  devServer: {
    port: 3000,
  },

  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3001",
      livekitUrl: "ws://localhost:7880",
    },
  },

  compatibilityDate: "2026-06-10",
});
