import {
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
  type RemoteTrackPublication,
  type LocalParticipant,
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
  const error = ref("");

  // Monitor: segunda conexión Room que recibe tu audio desde el servidor
  let monitorRoom: Room | null = null;

  function mapParticipant(
    p: RemoteParticipant | LocalParticipant,
    isLocal: boolean
  ): Participant {
    const audioTrack = p.audioTrackPublications.values().next().value;
    return {
      identity: p.identity,
      name: p.name || p.identity,
      isSpeaking: p.isSpeaking,
      isMuted: audioTrack ? audioTrack.isMuted : true,
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
    try {
      const r = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: inputDeviceId ? { deviceId: inputDeviceId } : undefined,
      });

      r.on(RoomEvent.ParticipantConnected, updateParticipants);
      r.on(RoomEvent.ParticipantDisconnected, updateParticipants);
      r.on(RoomEvent.TrackSubscribed, updateParticipants);
      r.on(RoomEvent.TrackUnsubscribed, updateParticipants);
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

      // Publicar micrófono muteado por defecto
      await r.localParticipant.setMicrophoneEnabled(true);
      await r.localParticipant.setMicrophoneEnabled(false);
      isMuted.value = true;

      updateParticipants();
    } catch (err: any) {
      error.value = err?.message || "Error al conectar con LiveKit";
      console.error("LiveKit connect error:", err);
    }
  }

  async function toggleMute() {
    if (!room.value) return;
    const newMuted = !isMuted.value;
    await room.value.localParticipant.setMicrophoneEnabled(!newMuted);
    isMuted.value = newMuted;
    updateParticipants();
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
      monitorRoom = new Room({ adaptiveStream: true, dynacast: true });

      // Adjuntar audio de tracks remotos para que suene
      monitorRoom.on(
        RoomEvent.TrackSubscribed,
        (track) => {
          if (track.kind === Track.Kind.Audio) {
            const el = track.attach();
            el.id = `monitor-audio-${track.sid}`;
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

  async function disconnect() {
    await stopMonitor();
    if (room.value) {
      await room.value.disconnect();
      room.value = null;
    }
    isConnected.value = false;
    participants.value = [];
  }

  return {
    room: readonly(room),
    participants: readonly(participants),
    isConnected: readonly(isConnected),
    isMuted: readonly(isMuted),
    isMonitoring: readonly(isMonitoring),
    error: readonly(error),
    connect,
    disconnect,
    toggleMute,
    switchInput,
    switchOutput,
    startMonitor,
    stopMonitor,
  };
}
