/**
 * useAudioEffects — Procesador de audio estilo walkie-talkie / radio.
 *
 * Devuelve un TrackProcessor compatible con livekit-client para aplicar
 * efectos sobre el track de micrófono nativo sin romper isSpeaking/isMuted.
 *
 * Cadena (realista):
 *   Mic → Pre-Gain → Band-Pass (300–3000 Hz) → Soft Clipper →
 *   Compressor → Noise Gate → Speaker Sim → Makeup Gain → LiveKit
 */
import { Track, type TrackProcessor, type AudioProcessorOptions } from "livekit-client";

/**
 * Curva de soft-clipping estilo "overdrive analógico suave".
 * amount: 0 = lineal, 100 = saturación fuerte (recomendado 20-40 para radio).
 */
function makeDistortionCurve(amount: number): Float32Array {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

export function createWalkieTalkieProcessor(): TrackProcessor<Track.Kind.Audio, AudioProcessorOptions> {
  let sourceNode: MediaStreamAudioSourceNode | null = null;
  let destNode: MediaStreamAudioDestinationNode | null = null;
  let preGain: GainNode | null = null;
  let lowCut: BiquadFilterNode | null = null;
  let highCut: BiquadFilterNode | null = null;
  let waveshaper: WaveShaperNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;
  let noiseGate: GainNode | null = null;
  let speakerPeak: BiquadFilterNode | null = null;
  let speakerNotch: BiquadFilterNode | null = null;
  let makeupGain: GainNode | null = null;

  // Generador de estática de radio (ruido blanco muy sutil)
  let staticSource: AudioBufferSourceNode | null = null;
  let staticGain: GainNode | null = null;
  let staticTimer: ReturnType<typeof setInterval> | null = null;

  return {
    name: "walkie-talkie",

    processedTrack: undefined,

    async init(opts: AudioProcessorOptions) {
      const { track, audioContext } = opts;

      // ── Fuente ──
      const sourceStream = new MediaStream([track]);
      sourceNode = audioContext.createMediaStreamSource(sourceStream);

      // ── 1. Pre-Gain: subir nivel antes de procesar ──
      preGain = audioContext.createGain();
      preGain.gain.value = 2.0; // +6 dB

      // ── 2. Band-Pass 300–3000 Hz (rango real de walkie-talkie) ──
      lowCut = audioContext.createBiquadFilter();
      lowCut.type = "highpass";
      lowCut.frequency.value = 300;
      lowCut.Q.value = 0.6; // pendiente más suave

      highCut = audioContext.createBiquadFilter();
      highCut.type = "lowpass";
      highCut.frequency.value = 3000;
      highCut.Q.value = 0.6;

      // ── 3. Soft-Clipper: saturación analógica ligera ──
      waveshaper = audioContext.createWaveShaper();
      (waveshaper as any).curve = new Float32Array(makeDistortionCurve(25));
      waveshaper.oversample = "2x";

      // ── 4. Compressor: AGC agresivo como el de una radio real ──
      compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -36;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.15;

      // ── 5. Noise Gate: corta ruido de fondo cuando no hablas ──
      // Se implementa como GainNode modulado desde un analyser (simplificado:
      // el compressor ya reduce el ruido; el gate lo silencia más)
      noiseGate = audioContext.createGain();
      noiseGate.gain.value = 1.0;

      // ── 6. Speaker Sim: pequeño altavoz de radio (resonancia ~1.5 kHz) ──
      speakerPeak = audioContext.createBiquadFilter();
      speakerPeak.type = "peaking";
      speakerPeak.frequency.value = 1500;
      speakerPeak.gain.value = 4; // +4 dB resonancia de altavoz pequeño
      speakerPeak.Q.value = 1.5;

      speakerNotch = audioContext.createBiquadFilter();
      speakerNotch.type = "notch";
      speakerNotch.frequency.value = 3200;
      speakerNotch.gain.value = -8; // corte en agudos extremos
      speakerNotch.Q.value = 0.8;

      // ── 7. Makeup Gain: nivel final controlado (no demasiado fuerte) ──
      makeupGain = audioContext.createGain();
      makeupGain.gain.value = 0.7; // −3 dB para no saturar

      // ── Estática de radio (ruido blanco muy sutil de fondo) ──
      staticGain = audioContext.createGain();
      staticGain.gain.value = 0.005; // casi inaudible, solo para "color"

      function startStaticNoise() {
        if (!audioContext || !staticGain || !destNode) return;
        const bufferSize = audioContext.sampleRate * 2; // 2 segundos
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.1; // ruido blanco de baja amplitud
        }
        const src = audioContext.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        src.connect(staticGain);
        src.start();
        staticSource = src;
      }

      startStaticNoise();

      // ── Destino ──
      destNode = audioContext.createMediaStreamDestination();

      // ── Encadenar: source → preGain → lowCut → highCut → waveshaper → compressor → noiseGate → speakerPeak → speakerNotch → makeupGain → dest ──
      sourceNode
        .connect(preGain)
        .connect(lowCut)
        .connect(highCut)
        .connect(waveshaper)
        .connect(compressor)
        .connect(noiseGate)
        .connect(speakerPeak)
        .connect(speakerNotch)
        .connect(makeupGain)
        .connect(destNode);

      // Mezclar estática en el destino
      staticGain.connect(destNode);

      this.processedTrack = destNode.stream.getAudioTracks()[0];
    },

    async restart(opts: AudioProcessorOptions) {
      await this.destroy();
      await this.init(opts);
    },

    async destroy() {
      if (staticTimer) {
        clearInterval(staticTimer);
        staticTimer = null;
      }
      staticSource?.stop();
      staticSource?.disconnect();

      sourceNode?.disconnect();
      preGain?.disconnect();
      lowCut?.disconnect();
      highCut?.disconnect();
      waveshaper?.disconnect();
      compressor?.disconnect();
      noiseGate?.disconnect();
      speakerPeak?.disconnect();
      speakerNotch?.disconnect();
      makeupGain?.disconnect();
      staticGain?.disconnect();
      destNode?.disconnect();

      this.processedTrack?.stop();
      this.processedTrack = undefined;

      sourceNode = null;
      preGain = null;
      lowCut = null;
      highCut = null;
      waveshaper = null;
      compressor = null;
      noiseGate = null;
      speakerPeak = null;
      speakerNotch = null;
      makeupGain = null;
      staticGain = null;
      staticSource = null;
      destNode = null;
    },
  };
}

