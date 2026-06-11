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
        class="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all select-none"
        :class="[
          p.isSpeaking
            ? 'border-green-500 bg-green-500/10'
            : 'border-surface-800 bg-surface-900',
          isDeafened ? 'border-red-500/50 opacity-50' : '',
          p.isLocallyMuted && !isDeafened ? 'opacity-60' : '',
        ]"
        @contextmenu.prevent="openContextMenu($event, p)"
      >
        <!-- Avatar -->
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold relative"
          :class="[
            p.isMuted ? 'bg-surface-700 text-surface-400' : 'bg-primary-600 text-white',
          ]"
        >
          {{ p.name.charAt(0).toUpperCase() }}
          <span
            v-if="p.isLocallyMuted"
            class="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs"
          >🔇</span>
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
          :class="isDeafened ? 'bg-red-600 hover:bg-red-700' : 'bg-surface-700 hover:bg-surface-600'"
          @click="toggleDeafen"
          title="Silencia altavoces y micrófono a la vez"
        >
          {{ isDeafened ? "🔇 Ensordecido" : "🔊 Oír" }}
        </button>
        <button
          class="px-6 py-3 rounded-full font-medium text-white transition-colors"
          :class="isMonitoring ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-surface-700 hover:bg-surface-600'"
          @click="toggleMonitor"
          title="Escuchar tu propio micrófono (loopback)"
        >
          {{ isMonitoring ? "🔊 Monitor ON" : "🎧 Monitor" }}
        </button>
        <button
          class="px-6 py-3 rounded-full font-medium text-white transition-colors"
          :class="isEffectActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-surface-700 hover:bg-surface-600'"
          @click="toggleEffects"
          title="Filtro walkie-talkie / radio"
        >
          {{ isEffectActive ? "📻 Radio ON" : "📻 Radio" }}
        </button>
        <button
          class="px-6 py-3 rounded-full font-medium text-white transition-colors bg-surface-700 hover:bg-surface-600"
          @click="showSettings = true"
          title="Configuración de audio"
        >
          ⚙️
        </button>
        </div>
      </div>
    </div>

    <!-- Panel de configuración -->
    <AudioSettingsPanel
      :open="showSettings"
      :settings="audioSettings"
      @close="showSettings = false"
      @update:noise-suppression="onNoiseSuppressionChange"
      @update:echo-cancellation="onEchoCancellationChange"
      @update:auto-gain-control="onAutoGainChange"
      @update:monitor-volume="onMonitorVolumeChange"
      @update-radio="onRadioChange"
      @reset-radio="resetRadio"
    />

    <!-- Menú contextual de participante -->
    <ParticipantContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :participant="contextMenu.participant"
      @close="contextMenu.visible = false"
      @volume-change="onParticipantVolumeChange"
      @mute-participant="onParticipantMuteToggle"
    />
  </div>
</template>

<script setup lang="ts">
import type { TokenResponse } from "@scpeak/shared";
import type { Participant } from "~/composables/useLiveKit";
import { Track } from "livekit-client";
import { createWalkieTalkieProcessor } from "~/composables/useAudioEffects";
import { useAudioSettings } from "~/composables/useAudioSettings";
import AudioSettingsPanel from "~/components/AudioSettingsPanel.vue";
import ParticipantContextMenu from "~/components/ParticipantContextMenu.vue";

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
  setMonitorVolume,
  participants,
  room,
  isConnected: isLkConnected,
  isMuted,
  isMonitoring,
  isEffectActive,
  setEffectProcessor,
  removeEffectProcessor,
  toggleDeafen,
  setParticipantVolume,
  toggleParticipantMute,
  isDeafened,
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

const { settings: audioSettings, resetRadio, updateRadio } = useAudioSettings();

const roomName = computed(() => (route.query.name as string) || "");
const showSettings = ref(false);

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  participant: null as Participant | null,
});

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
  removeEffectProcessor();
  disconnect();
});

function leaveRoom() {
  removeEffectProcessor();
  disconnect();
  router.push("/rooms");
}

async function toggleEffects() {
  if (isEffectActive.value) {
    await removeEffectProcessor();
    return;
  }

  const processor = createWalkieTalkieProcessor(audioSettings.value.radio);
  await setEffectProcessor(processor);
}

async function toggleMonitor() {
  if (isMonitoring.value) {
    stopMonitor();
    return;
  }

  startMonitor();
}

async function onInputChange(deviceId: string) {
  setInput(deviceId);
  await switchInput(deviceId);
}

async function onOutputChange(deviceId: string) {
  setOutput(deviceId);
  await switchOutput(deviceId);
}

// ── Settings handlers ──

function onNoiseSuppressionChange(value: boolean) {
  audioSettings.value.noiseSuppression = value;
  // Requiere reconexión del micrófono — reiniciar track
  if (room.value) {
    room.value.localParticipant
      .getTrackPublication(Track.Source.Microphone)
      ?.track?.restartTrack({
        noiseSuppression: value,
        echoCancellation: audioSettings.value.echoCancellation,
        autoGainControl: audioSettings.value.autoGainControl,
      })
      .catch((err: any) => console.warn("Error al reiniciar track:", err));
  }
}

function onEchoCancellationChange(value: boolean) {
  audioSettings.value.echoCancellation = value;
  if (room.value) {
    room.value.localParticipant
      .getTrackPublication(Track.Source.Microphone)
      ?.track?.restartTrack({
        noiseSuppression: audioSettings.value.noiseSuppression,
        echoCancellation: value,
        autoGainControl: audioSettings.value.autoGainControl,
      })
      .catch((err: any) => console.warn("Error al reiniciar track:", err));
  }
}

function onAutoGainChange(value: boolean) {
  audioSettings.value.autoGainControl = value;
  if (room.value) {
    room.value.localParticipant
      .getTrackPublication(Track.Source.Microphone)
      ?.track?.restartTrack({
        noiseSuppression: audioSettings.value.noiseSuppression,
        echoCancellation: audioSettings.value.echoCancellation,
        autoGainControl: value,
      })
      .catch((err: any) => console.warn("Error al reiniciar track:", err));
  }
}

function onMonitorVolumeChange(value: number) {
  audioSettings.value.monitorVolume = value;
  setMonitorVolume(value);
}

function onRadioChange(patch: Partial<typeof audioSettings.value.radio>) {
  updateRadio(patch);
  if (isEffectActive.value) {
    removeEffectProcessor().then(() => {
      const processor = createWalkieTalkieProcessor(audioSettings.value.radio);
      setEffectProcessor(processor);
    });
  }
}

// ── Context menu handlers ──

function openContextMenu(e: MouseEvent, p: Participant) {
  if (p.isLocal) return; // no mostrar menú para uno mismo
  contextMenu.visible = true;
  contextMenu.x = e.clientX;
  contextMenu.y = e.clientY;
  contextMenu.participant = p;
}

function onParticipantVolumeChange(identity: string, volume: number) {
  setParticipantVolume(identity, volume);
}

function onParticipantMuteToggle() {
  if (!contextMenu.participant) return;
  toggleParticipantMute(contextMenu.participant.identity);
  contextMenu.visible = false;
}
</script>
