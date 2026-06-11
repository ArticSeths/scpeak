<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
        @click.self="close"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <!-- Panel -->
        <div
          class="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl border border-surface-700 bg-surface-900 shadow-2xl mx-4"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-surface-800 sticky top-0 bg-surface-900 z-10">
            <h3 class="text-lg font-bold text-white">⚙️ Configuración de Voz</h3>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-700 text-surface-400 hover:text-white transition-colors text-lg"
              @click="close"
            >
              ✕
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-surface-800 px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px]"
              :class="activeTab === tab.id
                ? 'border-primary-500 text-white'
                : 'border-transparent text-surface-400 hover:text-surface-200'"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Contenido por tab -->
          <div class="px-6 py-4 space-y-5">
            <!-- ── Voz ── -->
            <template v-if="activeTab === 'voice'">
              <ToggleSetting
                icon="🤖"
                label="Supresión de ruido"
                description="Elimina ruido de fondo con IA del navegador"
                :model-value="settings.noiseSuppression"
                @update:model-value="$emit('update:noiseSuppression', $event)"
              />
              <ToggleSetting
                icon="🔇"
                label="Cancelación de eco"
                description="Evita que el altavoz se acople al micrófono"
                :model-value="settings.echoCancellation"
                @update:model-value="$emit('update:echoCancellation', $event)"
              />
              <ToggleSetting
                icon="📢"
                label="Control automático de ganancia"
                description="Mantiene tu volumen de voz constante"
                :model-value="settings.autoGainControl"
                @update:model-value="$emit('update:autoGainControl', $event)"
              />

              <div class="pt-2 border-t border-surface-800">
                <p class="text-xs text-surface-500 mb-2">
                  💡 Los cambios en esta sección requieren reconectar el micrófono.
                </p>
              </div>
            </template>

            <!-- ── Radio ── -->
            <template v-if="activeTab === 'radio'">
              <SliderSetting
                icon="🎚️"
                label="Filtro pasa-bajos"
                description="Frecuencia de corte inferior (Hz)"
                :min="100" :max="500" :step="10"
                :model-value="settings.radio.bandLow"
                unit="Hz"
                @update:model-value="v => updateRadio({ bandLow: v })"
              />
              <SliderSetting
                icon="🎚️"
                label="Filtro pasa-altos"
                description="Frecuencia de corte superior (Hz)"
                :min="2000" :max="4000" :step="50"
                :model-value="settings.radio.bandHigh"
                unit="Hz"
                @update:model-value="v => updateRadio({ bandHigh: v })"
              />
              <SliderSetting
                icon="🔩"
                label="Distorsión"
                description="Saturación analógica del walkie-talkie"
                :min="0" :max="100" :step="1"
                :model-value="settings.radio.distortion"
                unit="%"
                @update:model-value="v => updateRadio({ distortion: v })"
              />
              <SliderSetting
                icon="📐"
                label="Compresor — Umbral"
                description="Nivel a partir del cual comprime (dB)"
                :min="-60" :max="0" :step="1"
                :model-value="settings.radio.threshold"
                unit="dB"
                @update:model-value="v => updateRadio({ threshold: v })"
              />
              <SliderSetting
                icon="📐"
                label="Compresor — Ratio"
                description="Intensidad de la compresión"
                :min="1" :max="20" :step="1"
                :model-value="settings.radio.ratio"
                unit=":1"
                @update:model-value="v => updateRadio({ ratio: v })"
              />
              <SliderSetting
                icon="🚪"
                label="Puerta de ruido"
                description="Umbral de silencio (dB)"
                :min="-80" :max="-20" :step="1"
                :model-value="settings.radio.gateThreshold"
                unit="dB"
                @update:model-value="v => updateRadio({ gateThreshold: v })"
              />
              <SliderSetting
                icon="📢"
                label="Resonancia de altavoz"
                description="Simula el altavoz pequeño de una radio"
                :min="0" :max="8" :step="0.5"
                :model-value="settings.radio.speakerResonance"
                unit="dB"
                @update:model-value="v => updateRadio({ speakerResonance: v })"
              />
              <SliderSetting
                icon="🔉"
                label="Ganancia de salida"
                description="Volumen final del efecto radio"
                :min="0.1" :max="2.0" :step="0.1"
                :model-value="settings.radio.outputGain"
                unit="x"
                @update:model-value="v => updateRadio({ outputGain: v })"
              />

              <button
                class="w-full mt-3 px-4 py-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-surface-200 text-sm transition-colors"
                @click="$emit('resetRadio')"
              >
                ↺ Restaurar valores por defecto
              </button>
            </template>

            <!-- ── Monitor ── -->
            <template v-if="activeTab === 'monitor'">
              <SliderSetting
                icon="🔊"
                label="Volumen del monitor"
                description="Volumen de la escucha de retorno"
                :min="0.1" :max="2.0" :step="0.1"
                :model-value="settings.monitorVolume"
                unit="x"
                @update:model-value="$emit('update:monitorVolume', $event)"
              />
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import ToggleSetting from "./settings/ToggleSetting.vue";
import SliderSetting from "./settings/SliderSetting.vue";
import type { AudioSettings, RadioSettings } from "~/composables/useAudioSettings";

defineProps<{
  open: boolean;
  settings: AudioSettings;
}>();

const emit = defineEmits<{
  close: [];
  "update:noiseSuppression": [value: boolean];
  "update:echoCancellation": [value: boolean];
  "update:autoGainControl": [value: boolean];
  "update:monitorVolume": [value: number];
  updateRadio: [patch: Partial<RadioSettings>];
  resetRadio: [];
}>();

const tabs = [
  { id: "voice", label: "🎙️ Voz" },
  { id: "radio", label: "📻 Radio" },
  { id: "monitor", label: "🎧 Monitor" },
] as const;
const activeTab = ref<"voice" | "radio" | "monitor">("voice");

function close() {
  emit("close");
}

function updateRadio(patch: Partial<RadioSettings>) {
  emit("updateRadio", patch);
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
