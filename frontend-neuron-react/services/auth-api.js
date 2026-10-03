import { API_BASE_URL, apiRequest } from "@/lib/api-client";

export function getCurrentUser({ signal } = {}) {
  return apiRequest("/api/v1/auth/me", { signal });
}

export function logoutFromBackend() {
  return apiRequest("/api/v1/auth/logout");
}

export function startGoogleLogin() {
  window.location.assign(`${API_BASE_URL}/api/v1/auth/google/login`);
}
