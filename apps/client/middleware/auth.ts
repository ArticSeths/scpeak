export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return;
  const token = localStorage.getItem("scpeak_token");
  if (!token && to.path !== "/") {
    return navigateTo("/");
  }
});
