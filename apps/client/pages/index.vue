<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh]">
    <div class="w-full max-w-sm space-y-6">
      <div class="text-center space-y-2">
        <h2 class="text-3xl font-bold text-primary-400">SCPeak</h2>
        <p class="text-surface-400 text-sm">Comunicaciones de voz en tiempo real</p>
      </div>

      <!-- Paso 1: Conectar al servidor -->
      <form v-if="!isConnected" class="space-y-4" @submit.prevent="handleConnect">
        <div>
          <label for="serverAddr" class="block text-sm text-surface-300 mb-1">Servidor</label>
          <input
            id="serverAddr"
            v-model="serverAddr"
            type="text"
            required
            class="w-full px-3 py-2 bg-surface-900 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 transition-colors"
            placeholder="192.168.1.100:3001"
          />
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          Conectar
        </button>
      </form>

      <!-- Paso 2: Login / Registro -->
      <template v-else>
        <div class="text-center">
          <p class="text-sm text-surface-400">
            Conectado a
            <span class="text-primary-400 font-medium">{{ serverInfo?.name }}</span>
          </p>
          <button class="text-xs text-surface-500 hover:text-surface-300 mt-1" @click="changeServer">
            Cambiar servidor
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label for="username" class="block text-sm text-surface-300 mb-1">Usuario</label>
            <input
              id="username"
              v-model="username"
              type="text"
              autocomplete="username"
              required
              class="w-full px-3 py-2 bg-surface-900 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="tu_usuario"
            />
          </div>

          <div>
            <label for="password" class="block text-sm text-surface-300 mb-1">Contraseña</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              minlength="6"
              class="w-full px-3 py-2 bg-surface-900 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div v-if="!isLogin && serverInfo?.requiresPassword">
            <label for="serverPassword" class="block text-sm text-surface-300 mb-1">Contraseña del servidor</label>
            <input
              id="serverPassword"
              v-model="serverPassword"
              type="password"
              required
              class="w-full px-3 py-2 bg-surface-900 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="Proporcionada por el admin"
            />
          </div>

          <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {{ isLogin ? "Iniciar sesión" : "Registrarse" }}
          </button>
        </form>

        <p class="text-center text-sm text-surface-400">
          <button class="text-primary-400 hover:underline" @click="isLogin = !isLogin">
            {{ isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión" }}
          </button>
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { login, register, loadFromStorage, isAuthenticated } = useAuth();
const { connect, disconnect, isConnected, serverInfo, loadFromStorage: loadServer } = useServer();
const router = useRouter();

const serverAddr = ref("localhost:3001");
const username = ref("");
const password = ref("");
const serverPassword = ref("");
const isLogin = ref(true);
const loading = ref(false);
const error = ref("");

onMounted(() => {
  loadServer();
  loadFromStorage();
  if (isAuthenticated.value && isConnected.value) {
    router.push("/rooms");
  }
});

async function handleConnect() {
  error.value = "";
  loading.value = true;
  try {
    await connect(serverAddr.value);
  } catch (err: any) {
    error.value = err?.message || "No se pudo conectar al servidor";
  } finally {
    loading.value = false;
  }
}

function changeServer() {
  disconnect();
  error.value = "";
}

async function handleSubmit() {
  error.value = "";
  loading.value = true;
  try {
    if (isLogin.value) {
      await login(username.value, password.value);
    } else {
      await register(username.value, password.value, serverPassword.value || undefined);
    }
  } catch (err: any) {
    error.value = err?.data?.error || err?.message || "Error de conexión";
  } finally {
    loading.value = false;
  }
}
</script>
