/**
 * useAudioEffects — Procesador de audio estilo walkie-talkie / radio.
 *
 * Devuelve un TrackProcessor compatible con livekit-client para aplicar
 * efectos sobre el track de micrófono nativo sin romper isSpeaking/isMuted.
 *
 * Cadena: Micrófono → Band-Pass (300-3400 Hz) → Waveshaper → Compressor → LiveKit
 */
import { Track, type TrackProcessor, type AudioProcessorOptions } from "livekit-client";

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
  let lowCut: BiquadFilterNode | null = null;
  let highCut: BiquadFilterNode | null = null;
  let waveshaper: WaveShaperNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;

  return {
    name: "walkie-talkie",

    processedTrack: undefined,

    async init(opts: AudioProcessorOptions) {
      const { track, audioContext } = opts;

      // El track ya viene capturado por LiveKit con el dispositivo correcto
      const sourceStream = new MediaStream([track]);
      sourceNode = audioContext.createMediaStreamSource(sourceStream);

      // 1. Band-pass 300 Hz – 3400 Hz
      lowCut = audioContext.createBiquadFilter();
      lowCut.type = "highpass";
      lowCut.frequency.value = 300;
      lowCut.Q.value = 0.7;

      highCut = audioContext.createBiquadFilter();
      highCut.type = "lowpass";
      highCut.frequency.value = 3400;
      highCut.Q.value = 0.7;

      // 2. Waveshaper (saturación / overdrive suave)
      waveshaper = audioContext.createWaveShaper();
      (waveshaper as any).curve = new Float32Array(makeDistortionCurve(50));
      waveshaper.oversample = "2x";

      // 3. Compressor (nivel constante)
      compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -30;
      compressor.knee.value = 20;
      compressor.ratio.value = 8;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.1;

      // 4. Salida
      destNode = audioContext.createMediaStreamDestination();

      // Encadenar
      sourceNode
        .connect(lowCut)
        .connect(highCut)
        .connect(waveshaper)
        .connect(compressor)
        .connect(destNode);

      this.processedTrack = destNode.stream.getAudioTracks()[0];
    },

    async restart(opts: AudioProcessorOptions) {
      await this.destroy();
      await this.init(opts);
    },

    async destroy() {
      sourceNode?.disconnect();
      lowCut?.disconnect();
      highCut?.disconnect();
      waveshaper?.disconnect();
      compressor?.disconnect();
      destNode?.disconnect();

      this.processedTrack?.stop();
      this.processedTrack = undefined;

      sourceNode = null;
      lowCut = null;
      highCut = null;
      waveshaper = null;
      compressor = null;
      destNode = null;
    },
  };
}

