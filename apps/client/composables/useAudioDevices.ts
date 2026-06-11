export function useAudioDevices() {
  const audioInputs = ref<MediaDeviceInfo[]>([]);
  const audioOutputs = ref<MediaDeviceInfo[]>([]);
  const selectedInputId = ref<string>("");
  const selectedOutputId = ref<string>("");

  async function enumerate() {
    // Enumerar sin pedir permiso aún — LiveKit lo hará al conectar.
    // Si no hay labels es porque el usuario aún no dio permiso de micrófono.
    const devices = await navigator.mediaDevices.enumerateDevices();
    audioInputs.value = devices.filter((d) => d.kind === "audioinput");
    audioOutputs.value = devices.filter((d) => d.kind === "audiooutput");

    // Restaurar selección de localStorage o usar default
    const savedInput = localStorage.getItem("scpeak:audioInput");
    const savedOutput = localStorage.getItem("scpeak:audioOutput");

    if (savedInput && audioInputs.value.some((d) => d.deviceId === savedInput)) {
      selectedInputId.value = savedInput;
    } else if (audioInputs.value.length > 0) {
      selectedInputId.value = audioInputs.value[0].deviceId;
    }

    if (savedOutput && audioOutputs.value.some((d) => d.deviceId === savedOutput)) {
      selectedOutputId.value = savedOutput;
    } else if (audioOutputs.value.length > 0) {
      selectedOutputId.value = audioOutputs.value[0].deviceId;
    }
  }

  function setInput(deviceId: string) {
    selectedInputId.value = deviceId;
    localStorage.setItem("scpeak:audioInput", deviceId);
  }

  function setOutput(deviceId: string) {
    selectedOutputId.value = deviceId;
    localStorage.setItem("scpeak:audioOutput", deviceId);
  }

  return {
    audioInputs: readonly(audioInputs),
    audioOutputs: readonly(audioOutputs),
    selectedInputId: readonly(selectedInputId),
    selectedOutputId: readonly(selectedOutputId),
    enumerate,
    setInput,
    setOutput,
  };
}
