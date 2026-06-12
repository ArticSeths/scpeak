<template>
  <section id="deploy" class="py-20 px-4">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl sm:text-4xl font-bold text-center mb-4">
        Despliega tu propio servidor
      </h2>
      <p class="text-surface-400 text-center mb-10">
        3 pasos. 1 minuto. Sin configuración compleja.
      </p>

      <div class="space-y-6">
        <!-- Paso 1 -->
        <div class="flex gap-4">
          <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold shrink-0 mt-1">
            1
          </div>
          <div>
            <h3 class="font-semibold mb-2">Clona el repositorio</h3>
            <pre class="p-3 rounded-lg bg-surface-800 text-sm overflow-x-auto"><code>git clone https://github.com/ArticSeths/scpeak.git
cd scpeak</code></pre>
          </div>
        </div>

        <!-- Paso 2 -->
        <div class="flex gap-4">
          <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold shrink-0 mt-1">
            2
          </div>
          <div>
            <h3 class="font-semibold mb-2">Configura tu servidor</h3>
            <pre class="p-3 rounded-lg bg-surface-800 text-sm overflow-x-auto"><code>cp .env.prod.example .env
nano .env  # edita nombre, contraseña y secretos</code></pre>
            <p class="text-xs text-surface-500 mt-1">
              Usa <code class="text-surface-400">openssl rand -hex 32</code> para generar secretos seguros.
            </p>
          </div>
        </div>

        <!-- Paso 3 -->
        <div class="flex gap-4">
          <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold shrink-0 mt-1">
            3
          </div>
          <div>
            <h3 class="font-semibold mb-2">Levanta los servicios</h3>
            <pre class="p-3 rounded-lg bg-surface-800 text-sm overflow-x-auto"><code>docker compose -f docker-compose.prod.yml up -d</code></pre>
            <p class="text-xs text-surface-500 mt-1">
              La imagen se descarga automáticamente de GHCR. Puertos necesarios: 3001/tcp, 7880/tcp, 7881/tcp, 7882/udp.
            </p>
          </div>
        </div>
      </div>

      <div class="text-center mt-8">
        <a
          href="https://github.com/ArticSeths/scpeak/blob/master/DEPLOY.md"
          target="_blank"
          class="text-primary-400 hover:underline text-sm"
        >
          📖 Guía completa de despliegue →
        </a>
      </div>
    </div>
  </section>
</template>
