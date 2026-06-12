import type { AuthPayload } from "@scpeak/shared";

interface AuthState {
  token: string | null;
  user: AuthPayload | null;
}

export function useAuth() {
  const state = useState<AuthState>("auth", () => ({
    token: null,
    user: null,
  }));

  const { serverUrl } = useServer();
  const router = useRouter();

  const isAuthenticated = computed(() => !!state.value.token);
  const isAdmin = computed(() => state.value.user?.role === "admin");
  const isModerator = computed(() => isAdmin.value || state.value.user?.role === "moderator");

  function setAuth(token: string, user: AuthPayload) {
    state.value = { token, user };
    if (import.meta.client) {
      localStorage.setItem("scpeak_token", token);
      localStorage.setItem("scpeak_user", JSON.stringify(user));
    }
  }

  function loadFromStorage() {
    if (!import.meta.client) return;
    const token = localStorage.getItem("scpeak_token");
    const userStr = localStorage.getItem("scpeak_user");
    if (token && userStr) {
      state.value = { token, user: JSON.parse(userStr) };
    }
  }

  async function login(username: string, password: string) {
    const res = await $fetch<{ token: string; user: AuthPayload }>(
      `${serverUrl.value}/auth/login`,
      {
        method: "POST",
        body: { username, password },
      }
    );
    setAuth(res.token, res.user);
    await router.push("/rooms");
  }

  async function register(username: string, password: string, serverPassword?: string) {
    const res = await $fetch<{ token: string; user: AuthPayload }>(
      `${serverUrl.value}/auth/register`,
      {
        method: "POST",
        body: { username, password, serverPassword },
      }
    );
    setAuth(res.token, res.user);
    await router.push("/rooms");
  }

  function logout() {
    state.value = { token: null, user: null };
    if (import.meta.client) {
      localStorage.removeItem("scpeak_token");
      localStorage.removeItem("scpeak_user");
    }
    router.push("/");
  }

  return {
    state: readonly(state),
    isAuthenticated,
    isAdmin,
    isModerator,
    token: computed(() => state.value.token),
    user: computed(() => state.value.user),
    login,
    register,
    logout,
    loadFromStorage,
  };
}
