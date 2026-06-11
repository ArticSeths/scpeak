import {
  Room,
  RoomEvent,
  Track,
  createAudioAnalyser,
  LocalAudioTrack,
  type RemoteParticipant,
  type LocalParticipant,
  type TrackProcessor,
  type AudioProcessorOptions,
} from "livekit-client";

interface Participant {
  identity: string;
  name: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isLocal: boolean;
}

export function useLiveKit() {
  const room = shallowRef<Room | null>(null);
  const participants = ref<Participant[]>([]);
  const isConnected = ref(false);
  const isMuted = ref(true);
  const isMonitoring = ref(false);
  const isEffectActive = ref(false);
  const error = ref("");

  // Monitor: segunda conexión Room que recibe tu audio desde el servidor
  let monitorRoom: Room | null = null;

  // Procesador de efectos (walkie-talkie) conectado al track nativo
  let effectProcessor: TrackProcessor<Track.Kind.Audio, AudioProcessorOptions> | null = null;

  // Detección local de voz (sin latencia de red)
  const localSpeaking = ref(false);
  let analyserCleanup: (() => Promise<void>) | null = null;
  let speakingRafId = 0;

  /** Reanuda todos los AudioContext suspendidos (necesario en WebView2/Tauri) */
  function resumeAudioContexts() {
    // @ts-expect-error: AudioContext might not be in TS lib
    const ctxs = (window as any).__livekit_audio_contexts || [];
    for (const ctx of ctxs) {
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
    }
  }

  function startLocalSpeakingDetection() {
    if (!room.value) return;

    const pub = room.value.localParticipant.getTrackPublication(Track.Source.Microphone);
    const track = pub?.track;
    if (!track) return;

    const { calculateVolume, cleanup } = createAudioAnalyser(track as LocalAudioTrack, {
      cloneTrack: true,
      smoothingTimeConstant: 0.2,
      fftSize: 256,
    });
    analyserCleanup = cleanup;

    const threshold = -30; // dB — solo voz, ignora ruido de fondo
    let quietFrames = 0;
    const releaseFrames = 15; // ~250 ms a 60 fps

    function loop() {
      const volume = calculateVolume();
      const aboveThreshold = volume > threshold;

      if (aboveThreshold) {
        quietFrames = 0;
        if (!localSpeaking.value) {
          localSpeaking.value = true;
          updateParticipants();
        }
      } else {
        quietFrames++;
        if (localSpeaking.value && quietFrames >= releaseFrames) {
          localSpeaking.value = false;
          updateParticipants();
        }
      }

      speakingRafId = requestAnimationFrame(loop);
    }
    speakingRafId = requestAnimationFrame(loop);
  }

  function stopLocalSpeakingDetection() {
    if (speakingRafId) {
      cancelAnimationFrame(speakingRafId);
      speakingRafId = 0;
    }
    if (analyserCleanup) {
      analyserCleanup();
      analyserCleanup = null;
    }
    localSpeaking.value = false;
  }

  function mapParticipant(
    p: RemoteParticipant | LocalParticipant,
    isLocal: boolean
  ): Participant {
    const audioTrack = p.audioTrackPublications.values().next().value;
    const isMuted = audioTrack ? audioTrack.isMuted : true;
    return {
      identity: p.identity,
      name: p.name || p.identity,
      // Detección local instantánea (sin latencia), pero no mostrar si está muteado
      isSpeaking: isLocal ? (localSpeaking.value && !isMuted) : p.isSpeaking,
      isMuted,
      isLocal,
    };
  }

  function updateParticipants() {
    if (!room.value) return;
    const r = room.value;
    const list: Participant[] = [];

    // Local
    list.push(mapParticipant(r.localParticipant, true));

    // Remotos
    for (const p of r.remoteParticipants.values()) {
      list.push(mapParticipant(p, false));
    }

    participants.value = list;
  }

  async function connect(url: string, token: string, inputDeviceId?: string) {
    // Si el dispositivo guardado ya no existe, ignorarlo y usar el default
    let deviceId = inputDeviceId;
    if (deviceId) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const exists = devices.some(
          (d) => d.kind === "audioinput" && d.deviceId === deviceId,
        );
        if (!exists) {
          console.warn("useLiveKit: dispositivo de entrada no encontrado, usando default");
          deviceId = undefined;
        }
      } catch {
        // Si no podemos enumerar, usar default
        deviceId = undefined;
      }
    }

    try {
      const r = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          ...(deviceId ? { deviceId } : {}),
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
        webAudioMix: true,
      });

      r.on(RoomEvent.ParticipantConnected, updateParticipants);
      r.on(RoomEvent.ParticipantDisconnected, updateParticipants);
      r.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          const el = track.attach();
          el.id = `remote-audio-${track.sid}`;
          // Forzar reproducción en WebView2 (Tauri) que bloquea autoplay
          el.muted = false;
          el.autoplay = true;
          el.play().catch(() => {});
          document.body.appendChild(el);
        }
        updateParticipants();
      });
      r.on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach().forEach((el) => el.remove());
        updateParticipants();
      });
      r.on(RoomEvent.TrackMuted, updateParticipants);
      r.on(RoomEvent.TrackUnmuted, updateParticipants);
      r.on(RoomEvent.ActiveSpeakersChanged, updateParticipants);
      r.on(RoomEvent.LocalTrackPublished, updateParticipants);
      r.on(RoomEvent.LocalTrackUnpublished, updateParticipants);
      r.on(RoomEvent.Disconnected, () => {
        isConnected.value = false;
        participants.value = [];
      });

      await r.connect(url, token);

      room.value = r;
      isConnected.value = true;
      isMuted.value = true;
      error.value = "";

      updateParticipants();
    } catch (err: any) {
      error.value = err?.message || "Error al conectar con LiveKit";
      console.error("LiveKit connect error:", err);
    }
  }

  async function toggleMute() {
    if (!room.value) return;
    const newMuted = !isMuted.value;
    try {
      await room.value.localParticipant.setMicrophoneEnabled(!newMuted);
      isMuted.value = newMuted;
      if (!newMuted) {
        startLocalSpeakingDetection();
      } else {
        stopLocalSpeakingDetection();
      }
      updateParticipants();
    } catch (err: any) {
      error.value = err?.message || "Error al activar el micrófono";
      console.error("toggleMute error:", err);
    }
  }

  async function switchInput(deviceId: string) {
    if (!room.value) return;
    await room.value.switchActiveDevice("audioinput", deviceId);
  }

  async function switchOutput(deviceId: string) {
    if (!room.value) return;
    await room.value.switchActiveDevice("audiooutput", deviceId);
  }

  async function stopMonitor() {
    if (monitorRoom) {
      // Limpiar elementos de audio adjuntados
      for (const p of monitorRoom.remoteParticipants.values()) {
        for (const pub of p.audioTrackPublications.values()) {
          pub.track?.detach().forEach((el) => el.remove());
        }
      }
      await monitorRoom.disconnect();
      monitorRoom = null;
    }
    isMonitoring.value = false;
  }

  async function startMonitor(livekitUrl: string, monitorToken: string) {
    if (!room.value) return;

    if (isMonitoring.value) {
      await stopMonitor();
      return;
    }

    try {
      monitorRoom = new Room({ adaptiveStream: true, dynacast: true, webAudioMix: true });

      // Adjuntar audio de tracks remotos para que suene
      monitorRoom.on(
        RoomEvent.TrackSubscribed,
        (track) => {
          if (track.kind === Track.Kind.Audio) {
            const el = track.attach();
            el.id = `monitor-audio-${track.sid}`;
            el.muted = false;
            el.autoplay = true;
            el.play().catch(() => {});
            document.body.appendChild(el);
          }
        }
      );

      monitorRoom.on(
        RoomEvent.TrackUnsubscribed,
        (track) => {
          track.detach().forEach((el) => el.remove());
        }
      );

      await monitorRoom.connect(livekitUrl, monitorToken);
      isMonitoring.value = true;
    } catch (err: any) {
      console.error("Monitor connect error:", err);
      monitorRoom = null;
    }
  }

  async function setEffectProcessor(
    processor: TrackProcessor<Track.Kind.Audio, AudioProcessorOptions>
  ) {
    if (!room.value) return;

    // Guardar el procesador para aplicarlo cuando el track esté disponible
    effectProcessor = processor;

    // Si el usuario está muteado, activar el micrófono primero
    if (isMuted.value) {
      try {
        await room.value.localParticipant.setMicrophoneEnabled(true);
        isMuted.value = false;
        startLocalSpeakingDetection();
        updateParticipants();
      } catch (err: any) {
        error.value = err?.message || "Error al activar el micrófono para el efecto";
        console.error("setEffectProcessor: error al desmutear:", err);
        effectProcessor = null;
        return;
      }
    }

    // Obtener la publicación de audio del participante local
    const pub = room.value.localParticipant.getTrackPublication(Track.Source.Microphone);
    const track = pub?.track as LocalAudioTrack | undefined;
    if (!track) {
      console.error("No se encontró el track de micrófono nativo");
      error.value = "No se pudo acceder al micrófono. Revisa los permisos del navegador.";
      effectProcessor = null;
      return;
    }

    await (track as any).setProcessor?.(processor);
    isEffectActive.value = true;
  }

  async function removeEffectProcessor() {
    if (!room.value || !effectProcessor) return;

    const pub = room.value.localParticipant.getTrackPublication(Track.Source.Microphone);
    const track = pub?.track as LocalAudioTrack | undefined;
    if (track) {
      await (track as any).stopProcessor?.();
    }

    effectProcessor = null;
    isEffectActive.value = false;
  }

  async function disconnect() {
    await stopMonitor();
    stopLocalSpeakingDetection();
    // Limpiar procesador de efectos si existe
    if (effectProcessor) {
      await removeEffectProcessor();
    }
    if (room.value) {
      await room.value.disconnect();
      room.value = null;
    }
    isConnected.value = false;
    participants.value = [];
  }

  return {
    room,
    participants,
    isConnected,
    isMuted,
    isMonitoring,
    isEffectActive,
    error,
    connect,
    disconnect,
    toggleMute,
    switchInput,
    switchOutput,
    setEffectProcessor,
    removeEffectProcessor,
    startMonitor,
    stopMonitor,
  };
}
