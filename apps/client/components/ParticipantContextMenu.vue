<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed z-[100] min-w-[200px] rounded-lg border border-surface-600 bg-surface-800 shadow-2xl py-1.5 text-sm"
      :style="{ left: x + 'px', top: y + 'px' }"
      @click.stop
    >
      <!-- Cabecera -->
      <div class="px-3 py-2 border-b border-surface-700 flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          :class="participant.isSpeaking ? 'bg-green-500 text-white' : 'bg-surface-600 text-surface-300'"
        >
          {{ participant.name.charAt(0).toUpperCase() }}
        </div>
        <div>
          <p class="text-surface-100 font-medium truncate max-w-[140px]">{{ participant.name }}</p>
          <p class="text-xs text-surface-500">
            {{ participant.isSpeaking ? '🔊 Hablando' : participant.isMuted ? '🔇 Muteado' : '👂 Escuchando' }}
          </p>
        </div>
      </div>

      <!-- Volumen -->
      <div class="px-3 py-2">
        <p class="text-xs text-surface-400 mb-1.5">Volumen</p>
        <input
          type="range"
          min="0"
          max="200"
          :value="Math.round(participant.volume * 100)"
          class="w-full h-1.5 rounded-full appearance-none bg-surface-600 cursor-pointer slider"
          @input="onVolume($event)"
        />
        <div class="flex justify-between text-xs text-surface-500 mt-0.5">
          <span>0%</span>
          <span>{{ Math.round(participant.volume * 100) }}%</span>
          <span>200%</span>
        </div>
      </div>

      <!-- Acciones -->
      <div class="border-t border-surface-700 pt-1">
        <button
          class="w-full text-left px-3 py-1.5 hover:bg-surface-700 text-surface-200 transition-colors flex items-center gap-2"
          @click="$emit('muteParticipant')"
        >
          <span>{{ participant.isLocallyMuted ? '🔊' : '🔇' }}</span>
          {{ participant.isLocallyMuted ? 'Activar audio' : 'Silenciar participante' }}
        </button>
      </div>
    </div>

    <!-- Overlay para cerrar -->
    <div
      v-if="visible"
      class="fixed inset-0 z-[99]"
      @click="$emit('close')"
      @contextmenu.prevent="$emit('close')"
    />
  </Teleport>
</template>

<script setup lang="ts">
import type { Participant } from "~/composables/useLiveKit";

const props = defineProps<{
  visible: boolean;
  x: number;
  y: number;
  participant: Participant;
}>();

const emit = defineEmits<{
  close: [];
  volumeChange: [identity: string, volume: number];
  muteParticipant: [];
}>();

function onVolume(event: Event) {
  const value = Number((event.target as HTMLInputElement).value) / 100;
  emit("volumeChange", props.participant.identity, value);
}
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: none;
}
</style>
