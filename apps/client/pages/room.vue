<template>
  <div class="space-y-6">
    <!-- Header de la sala -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">{{ roomName }}</h2>
        <p class="text-sm text-surface-400">
          {{ participants.length }} participante{{ participants.length !== 1 ? "s" : "" }}
        </p>
      </div>
      <button
        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        @click="leaveRoom"
      >
        Salir
      </button>
    </div>

    <!-- Error -->
    <p v-if="lkError" class="text-red-400 text-sm">{{ lkError }}</p>

    <!-- Conectando -->
    <div v-if="!isLkConnected && !lkError" class="text-surface-400 text-sm">
      Conectando a la sala...
    </div>

    <!-- Participantes -->
    <div v-if="isLkConnected" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <div
        v-for="p in participants"
        :key="p.identity"
        class="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all"
        :class="[
          p.isSpeaking
            ? 'border-green-500 bg-green-500/10'
            : 'border-surface-800 bg-surface-900',
        ]"
      >
        <!-- Avatar -->
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
          :class="[
            p.isMuted ? 'bg-surface-700 text-surface-400' : 'bg-primary-600 text-white',
          ]"
        >
          {{ p.name.charAt(0).toUpperCase() }}
        </div>

        <!-- Nombre -->
        <span class="text-sm text-surface-200 truncate max-w-full">
          {{ p.name }}
          <span v-if="p.isLocal" class="text-surface-500">(tú)</span>
        </span>

        <!-- Estado -->
        <span class="text-xs" :class="p.isMuted ? 'text-red-400' : 'text-green-400'">
          {{ p.isMuted ? "🔇 Mute" : "🎙️ Hablando" }}
        </span>
      </div>
    </div>

    <!-- Controles -->
    <div v-if="isLkConnected" class="fixed bottom-0 left-0 right-0 p-4 bg-surface-950 border-t border-surface-800">
      <div class="max-w-5xl mx-auto space-y-3">
        <!-- Selectores de dispositivo -->
        <div class="flex flex-wrap gap-3 justify-center">
          <label class="flex items-center gap-2 text-sm text-surface-300">
            🎙️ Entrada:
            <select
              class="bg-surface-800 border border-surface-700 rounded px-2 py-1 text-sm text-surface-200 max-w-[200px]"
              :value="selectedInputId"
              @change="onInputChange(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="d in audioInputs" :key="d.deviceId" :value="d.deviceId">
                {{ d.label || 'Micrófono ' + d.deviceId.slice(0, 5) }}
              </option>
            </select>
          </label>
          <label class="flex items-center gap-2 text-sm text-surface-300">
            🔊 Salida:
            <select
              class="bg-surface-800 border border-surface-700 rounded px-2 py-1 text-sm text-surface-200 max-w-[200px]"
              :value="selectedOutputId"
              @change="onOutputChange(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="d in audioOutputs" :key="d.deviceId" :value="d.deviceId">
                {{ d.label || 'Altavoz ' + d.deviceId.slice(0, 5) }}
              </option>
            </select>
          </label>
        </div>

        <!-- Botones -->
        <div class="flex justify-center gap-3">
        <button
          class="px-6 py-3 rounded-full font-medium text-white transition-colors"
          :class="isMuted ? 'bg-surface-700 hover:bg-surface-600' : 'bg-green-600 hover:bg-green-700'"
          @click="toggleMute"
        >
          {{ isMuted ? "🔇 Activar micrófono" : "🎙️ Silenciar" }}
        </button>
        <button
          class="px-6 py-3 rounded-full font-medium text-white transition-colors"
          :class="isMonitoring ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-surface-700 hover:bg-surface-600'"
          @click="toggleMonitor"
          title="Escuchar tu propio micrófono (loopback)"
        >
          {{ isMonitoring ? "🔊 Monitor ON" : "🎧 Monitor" }}
        </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TokenResponse } from "@scpeak/shared";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const { serverUrl } = useServer();
const { token: authToken } = useAuth();
const {
  connect,
  disconnect,
  toggleMute,
  switchInput,
  switchOutput,
  startMonitor,
  stopMonitor,
  participants,
  isConnected: isLkConnected,
  isMuted,
  isMonitoring,
  error: lkError,
} = useLiveKit();

const {
  audioInputs,
  audioOutputs,
  selectedInputId,
  selectedOutputId,
  enumerate,
  setInput,
  setOutput,
} = useAudioDevices();

const roomName = computed(() => (route.query.name as string) || "");

// URL de LiveKit derivada del servidor API
const livekitUrl = computed(() => {
  if (!serverUrl.value) return "";
  const apiUrl = new URL(serverUrl.value);
  return `ws://${apiUrl.hostname}:7880`;
});

onMounted(async () => {
  if (!roomName.value) {
    router.push("/rooms");
    return;
  }

  await enumerate();

  try {
    const res = await $fetch<TokenResponse>(
      `${serverUrl.value}/rooms/join`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken.value}` },
        body: { roomName: roomName.value },
      }
    );

    await connect(livekitUrl.value, res.token, selectedInputId.value || undefined);

    // Aplicar dispositivo de salida si hay uno guardado
    if (selectedOutputId.value) {
      await switchOutput(selectedOutputId.value);
    }
  } catch (err: any) {
    console.error("Error al unirse a la sala:", err);
  }
});

onBeforeUnmount(() => {
  disconnect();
});

function leaveRoom() {
  disconnect();
  router.push("/rooms");
}

async function toggleMonitor() {
  if (isMonitoring.value) {
    await stopMonitor();
    return;
  }

  // Pedir token de monitor al servidor (identidad distinta, solo escucha)
  const res = await $fetch<TokenResponse>(
    `${serverUrl.value}/rooms/monitor`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken.value}` },
      body: { roomName: roomName.value },
    }
  );

  await startMonitor(livekitUrl.value, res.token);
}

async function onInputChange(deviceId: string) {
  setInput(deviceId);
  await switchInput(deviceId);
}

async function onOutputChange(deviceId: string) {
  setOutput(deviceId);
  await switchOutput(deviceId);
}
</script>
