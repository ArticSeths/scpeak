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
  let speakerPeak: BiquadFilterNode | null = null;
  let speakerNotch: BiquadFilterNode | null = null;
  let makeupGain: GainNode | null = null;

  // ── Noise Gate real ──
  let analyser: AnalyserNode | null = null;
  let gateGain: GainNode | null = null;
  let gateTimer: ReturnType<typeof setInterval> | null = null;

  return {
    name: "walkie-talkie",

    processedTrack: undefined,

    async init(opts: AudioProcessorOptions) {
      const { track, audioContext } = opts;

      // ── Fuente ──
      const sourceStream = new MediaStream([track]);
      sourceNode = audioContext.createMediaStreamSource(sourceStream);

      // ── 1. Pre-Gain: ligero, sin amplificar el ruido de fondo ──
      preGain = audioContext.createGain();
      preGain.gain.value = 1.2; // +1.5 dB, suficiente para la cadena sin realzar ruido

      // ── 2. Band-Pass 300–3000 Hz (rango real de walkie-talkie) ──
      lowCut = audioContext.createBiquadFilter();
      lowCut.type = "highpass";
      lowCut.frequency.value = 300;
      lowCut.Q.value = 0.6;

      highCut = audioContext.createBiquadFilter();
      highCut.type = "lowpass";
      highCut.frequency.value = 3000;
      highCut.Q.value = 0.6;

      // ── 3. Soft-Clipper: saturación analógica ligera ──
      waveshaper = audioContext.createWaveShaper();
      (waveshaper as any).curve = new Float32Array(makeDistortionCurve(25));
      waveshaper.oversample = "2x";

      // ── 4. Compressor: AGC de radio ──
      compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -36;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.15;

      // ── 5. Noise Gate real ──
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;

      gateGain = audioContext.createGain();
      gateGain.gain.value = 0; // empieza cerrado, se abre al hablar

      const gateThreshold = -55; // dB — por debajo de esto se considera silencio
      const gateOpenTime = 0.02; // segundos para abrir (ataque rápido)
      const gateCloseTime = 0.3; // segundos para cerrar (release lento, evita cortes)
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      gateTimer = setInterval(() => {
        if (!analyser || !gateGain || !audioContext) return;
        analyser.getByteFrequencyData(dataArray);
        // Calcular volumen promedio en dB
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const db = 20 * Math.log10(Math.max(avg, 1) / 255);

        const targetGain = db > gateThreshold ? 1.0 : 0.0;
        const now = audioContext.currentTime;
        const rampTime = targetGain > 0.5 ? gateOpenTime : gateCloseTime;
        gateGain.gain.cancelScheduledValues(now);
        gateGain.gain.setTargetAtTime(targetGain, now, rampTime / 3);
      }, 30); // ~33 fps

      // ── 6. Speaker Sim: altavoz pequeño de radio ──
      speakerPeak = audioContext.createBiquadFilter();
      speakerPeak.type = "peaking";
      speakerPeak.frequency.value = 1500;
      speakerPeak.gain.value = 2; // +2 dB (reducido de +4)
      speakerPeak.Q.value = 1.5;

      speakerNotch = audioContext.createBiquadFilter();
      speakerNotch.type = "notch";
      speakerNotch.frequency.value = 3200;
      speakerNotch.gain.value = -8;
      speakerNotch.Q.value = 0.8;

      // ── 7. Makeup Gain: nivel final controlado ──
      makeupGain = audioContext.createGain();
      makeupGain.gain.value = 0.7; // −3 dB

      // ── Destino ──
      destNode = audioContext.createMediaStreamDestination();

      // ── Encadenar: source → preGain → lowCut → highCut → waveshaper → compressor → gateGain → speakerPeak → speakerNotch → makeupGain → dest ──
      sourceNode
        .connect(preGain)
        .connect(lowCut)
        .connect(highCut)
        .connect(waveshaper)
        .connect(compressor)
        .connect(gateGain)
        .connect(speakerPeak)
        .connect(speakerNotch)
        .connect(makeupGain)
        .connect(destNode);

      // Conectar el analyser ANTES del gate (después del compressor)
      compressor.connect(analyser);

      this.processedTrack = destNode.stream.getAudioTracks()[0];
    },

    async restart(opts: AudioProcessorOptions) {
      await this.destroy();
      await this.init(opts);
    },

    async destroy() {
      if (gateTimer) {
        clearInterval(gateTimer);
        gateTimer = null;
      }

      sourceNode?.disconnect();
      preGain?.disconnect();
      lowCut?.disconnect();
      highCut?.disconnect();
      waveshaper?.disconnect();
      compressor?.disconnect();
      analyser?.disconnect();
      gateGain?.disconnect();
      speakerPeak?.disconnect();
      speakerNotch?.disconnect();
      makeupGain?.disconnect();
      destNode?.disconnect();

      this.processedTrack?.stop();
      this.processedTrack = undefined;

      sourceNode = null;
      preGain = null;
      lowCut = null;
      highCut = null;
      waveshaper = null;
      compressor = null;
      analyser = null;
      gateGain = null;
      speakerPeak = null;
      speakerNotch = null;
      makeupGain = null;
      destNode = null;
    },
  };
}

