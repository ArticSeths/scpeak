<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">Salas</h2>
      <div class="flex gap-2">
        <input
          v-model="newRoomName"
          type="text"
          placeholder="Nombre de sala"
          class="px-3 py-1.5 bg-surface-900 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 transition-colors"
          @keyup.enter="joinRoom(newRoomName)"
        />
        <button
          :disabled="!newRoomName.trim()"
          class="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          @click="joinRoom(newRoomName)"
        >
          Unirse / Crear
        </button>
      </div>
    </div>

    <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

    <div v-if="loadingRooms" class="text-surface-400 text-sm">Cargando salas...</div>

    <div v-else-if="roomList.length === 0" class="text-surface-500 text-sm">
      No hay salas todavía. Crea una nueva para comenzar.
    </div>

    <div v-else class="grid gap-3">
      <button
        v-for="room in roomList"
        :key="room.id"
        class="flex items-center justify-between p-4 bg-surface-900 border border-surface-800 rounded-lg hover:border-primary-600 transition-colors text-left"
        @click="joinRoom(room.name)"
      >
        <div>
          <p class="font-medium text-surface-100">{{ room.name }}</p>
          <p class="text-xs text-surface-500">
            Creada {{ new Date(room.createdAt).toLocaleDateString() }}
          </p>
        </div>
        <span class="text-primary-400 text-sm">Unirse →</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Room, TokenResponse } from "@scpeak/shared";

definePageMeta({
  middleware: "auth",
});

const { serverUrl } = useServer();
const { token, isAuthenticated } = useAuth();
const router = useRouter();

const roomList = ref<Room[]>([]);
const newRoomName = ref("");
const loadingRooms = ref(true);
const error = ref("");

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push("/");
    return;
  }
  await fetchRooms();
});

async function fetchRooms() {
  loadingRooms.value = true;
  try {
    roomList.value = await $fetch<Room[]>(`${serverUrl.value}/rooms`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
  } catch (err: any) {
    error.value = err?.data?.error || "Error al cargar salas";
  } finally {
    loadingRooms.value = false;
  }
}

async function joinRoom(roomName: string) {
  if (!roomName.trim()) return;
  error.value = "";
  try {
    const res = await $fetch<TokenResponse>(
      `${serverUrl.value}/rooms/join`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token.value}` },
        body: { roomName: roomName.trim() },
      }
    );
    // Navegar a la sala
    await router.push({ path: "/room", query: { name: res.roomName } });
  } catch (err: any) {
    error.value = err?.data?.error || "Error al unirse a la sala";
  }
}
</script>
