import type { ServerInfo } from "@scpeak/shared";

interface ConnectionState {
  serverUrl: string | null;
  serverInfo: ServerInfo | null;
}

export function useServer() {
  const state = useState<ConnectionState>("server", () => ({
    serverUrl: null,
    serverInfo: null,
  }));

  const isConnected = computed(() => !!state.value.serverUrl && !!state.value.serverInfo);
  const serverUrl = computed(() => state.value.serverUrl);
  const serverInfo = computed(() => state.value.serverInfo);

  function loadFromStorage() {
    if (!import.meta.client) return;
    const url = localStorage.getItem("scpeak_server_url");
    const infoStr = localStorage.getItem("scpeak_server_info");
    if (url && infoStr) {
      state.value = { serverUrl: url, serverInfo: JSON.parse(infoStr) };
    }
  }

  async function connect(url: string): Promise<ServerInfo> {
    // Normalizar: quitar trailing slash, asegurar protocolo
    let normalized = url.trim().replace(/\/+$/, "");
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `http://${normalized}`;
    }

    const info = await $fetch<ServerInfo>(`${normalized}/info`);

    state.value = { serverUrl: normalized, serverInfo: info };
    if (import.meta.client) {
      localStorage.setItem("scpeak_server_url", normalized);
      localStorage.setItem("scpeak_server_info", JSON.stringify(info));
    }

    return info;
  }

  function disconnect() {
    state.value = { serverUrl: null, serverInfo: null };
    if (import.meta.client) {
      localStorage.removeItem("scpeak_server_url");
      localStorage.removeItem("scpeak_server_info");
    }
  }

  return {
    state: readonly(state),
    isConnected,
    serverUrl,
    serverInfo,
    connect,
    disconnect,
    loadFromStorage,
  };
}
