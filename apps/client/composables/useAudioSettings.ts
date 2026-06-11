/**
 * useAudioSettings — Estado reactivo de configuración de audio.
 * Persiste en localStorage automáticamente.
 */
import type { AudioProcessorOptions } from "livekit-client";

export interface RadioSettings {
  bandLow: number; // Hz (100–500)
  bandHigh: number; // Hz (2000–4000)
  distortion: number; // 0–100
  threshold: number; // dB (−60 a 0)
  ratio: number; // 1–20
  gateThreshold: number; // dB (−80 a −20)
  speakerResonance: number; // dB (0–8)
  outputGain: number; // 0.1–2.0
}

export interface AudioSettings {
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  radio: RadioSettings;
  monitorVolume: number; // 0.1–2.0
}

const DEFAULT_RADIO: RadioSettings = {
  bandLow: 300,
  bandHigh: 3000,
  distortion: 25,
  threshold: -36,
  ratio: 12,
  gateThreshold: -55,
  speakerResonance: 2,
  outputGain: 0.7,
};

function defaults(): AudioSettings {
  return {
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true,
    radio: { ...DEFAULT_RADIO },
    monitorVolume: 1.0,
  };
}

function load(): AudioSettings {
  try {
    const raw = localStorage.getItem("scpeak:audioSettings");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        noiseSuppression: parsed.noiseSuppression ?? true,
        echoCancellation: parsed.echoCancellation ?? true,
        autoGainControl: parsed.autoGainControl ?? true,
        radio: { ...DEFAULT_RADIO, ...parsed.radio },
        monitorVolume: parsed.monitorVolume ?? 1.0,
      };
    }
  } catch { /* ignore */ }
  return defaults();
}

function save(s: AudioSettings) {
  try {
    localStorage.setItem("scpeak:audioSettings", JSON.stringify(s));
  } catch { /* ignore */ }
}

export function useAudioSettings() {
  const settings = useState<AudioSettings>("audio-settings", () => load());

  watch(settings, (s) => save(s), { deep: true });

  const requiresMicRestart = computed(() => {
    // Si el usuario cambió noiseSuppression, echoCancellation o autoGainControl,
    // debe reconectar el micrófono. Se indica con un flag.
    return true; // simplificado: siempre requiere reinicio
  });

  function resetRadio() {
    settings.value.radio = { ...DEFAULT_RADIO };
  }

  function updateRadio(patch: Partial<RadioSettings>) {
    Object.assign(settings.value.radio, patch);
  }

  return {
    settings: readonly(settings),
    resetRadio,
    updateRadio,
    requiresMicRestart,
  };
}
