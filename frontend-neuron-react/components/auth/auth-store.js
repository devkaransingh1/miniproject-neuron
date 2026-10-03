import { ApiError } from "@/lib/api-client";
import { getCurrentUser, logoutFromBackend } from "@/services/auth-api";

let snapshot = {
  status: "checking",
  user: null,
  error: null,
  path: null,
};
let requestVersion = 0;
const listeners = new Set();

export function subscribeToAuth(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAuthSnapshot() {
  return snapshot;
}

function updateAuth(nextSnapshot) {
  snapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}

export async function refreshAuth(signal, path) {
  const version = ++requestVersion;
  updateAuth({ status: "checking", user: null, error: null, path });

  try {
    const user = await getCurrentUser({ signal });
    if (signal?.aborted || version !== requestVersion) return;
    updateAuth({ status: "authenticated", user, error: null, path });
  } catch (error) {
    if (signal?.aborted || version !== requestVersion) return;

    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      updateAuth({ status: "unauthenticated", user: null, error: null, path });
      return;
    }

    updateAuth({ status: "error", user: null, error, path });
  }
}

export async function logout() {
  ++requestVersion;
  await logoutFromBackend();
  updateAuth({
    status: "unauthenticated",
    user: null,
    error: null,
    path: snapshot.path,
  });
}
