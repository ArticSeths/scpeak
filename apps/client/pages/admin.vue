<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold">Panel de Administración</h1>
        <UButton to="/rooms" variant="ghost">← Volver a salas</UButton>
      </div>

      <!-- Usuarios -->
      <div class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div class="p-4 border-b border-gray-800">
          <h2 class="font-semibold text-lg">Usuarios</h2>
        </div>
        <div v-if="loading" class="p-6 text-center text-gray-500">Cargando...</div>
        <div v-else-if="error" class="p-6 text-center text-red-400">{{ error }}</div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-800 text-gray-400 text-left">
              <th class="p-3 pl-4">Usuario</th>
              <th class="p-3">Rol</th>
              <th class="p-3">Creado</th>
              <th class="p-3 pr-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              class="border-b border-gray-800/50 hover:bg-gray-800/50"
            >
              <td class="p-3 pl-4">{{ user.username }}</td>
              <td class="p-3">
                <UBadge :color="roleColor(user.role)" variant="soft">{{ user.role }}</UBadge>
              </td>
              <td class="p-3 text-gray-500">
                {{ new Date(user.createdAt).toLocaleDateString() }}
              </td>
              <td class="p-3 pr-4 text-right">
                <USelectMenu
                  v-if="user.id !== authUser?.userId"
                  :items="roles"
                  :model-value="user.role"
                  @update:model-value="(r: string) => changeRole(user.id, r)"
                >
                  <UButton variant="ghost" size="xs" trailing-icon="i-lucide-chevron-down">
                    {{ user.role }}
                  </UButton>
                </USelectMenu>
                <UButton
                  v-if="user.id !== authUser?.userId"
                  variant="ghost"
                  size="xs"
                  color="red"
                  icon="i-lucide-trash-2"
                  class="ml-2"
                  @click="deleteUser(user.id, user.username)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuthPayload } from "@scpeak/shared";

definePageMeta({ middleware: ["auth", "admin"] });

interface AdminUser {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

const { serverUrl, token } = useServer();
const { user: authUser } = useAuth();

const users = ref<AdminUser[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const roles = ["admin", "moderator", "user"];

function roleColor(role: string) {
  return role === "admin" ? "red" : role === "moderator" ? "amber" : "gray";
}

async function fetchUsers() {
  try {
    const data = await $fetch<AdminUser[]>(`${serverUrl.value}/admin/users`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    users.value = data;
  } catch (e: any) {
    error.value = e?.data?.error || "Error al cargar usuarios";
  } finally {
    loading.value = false;
  }
}

async function changeRole(userId: string, role: string) {
  try {
    await $fetch(`${serverUrl.value}/admin/users/${userId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token.value}` },
      body: { role },
    });
    const u = users.value.find((u) => u.id === userId);
    if (u) u.role = role;
  } catch (e: any) {
    alert(e?.data?.error || "Error al cambiar rol");
  }
}

async function deleteUser(userId: string, username: string) {
  if (!confirm(`¿Eliminar a "${username}" permanentemente?`)) return;
  try {
    await $fetch(`${serverUrl.value}/admin/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token.value}` },
    });
    users.value = users.value.filter((u) => u.id !== userId);
  } catch (e: any) {
    alert(e?.data?.error || "Error al eliminar usuario");
  }
}

onMounted(fetchUsers);
</script>
