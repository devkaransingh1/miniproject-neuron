import { API_BASE_URL, apiRequest } from "@/lib/api-client";

/**
 * @typedef {{
 *   gmail: { connected: boolean },
 *   calendar: { connected: boolean },
 *   github: { connected: boolean }
 * }} IntegrationStatus
 */

/** @param {AbortSignal} [signal] */
export function getIntegrationStatus(signal) {
  return apiRequest("/api/v1/integrations/status", {
    signal,
    cache: "no-store",
  });
}

/**
 * @typedef {{
 *   connected: boolean,
 *   sync_status: "not_started" | "syncing" | "completed" | "failed",
 *   sync_completed: boolean
 * }} GmailSyncStatus
 */

/** @param {AbortSignal} [signal] */
export function getGmailSyncStatus(signal) {
  return apiRequest("/api/v1/gmail/sync-status", { signal });
}

export function startGmailConnect() {
  window.location.assign(`${API_BASE_URL}/api/v1/connect/gmail`);
}

export function startCalendarConnect() {
  window.location.assign(`${API_BASE_URL}/api/v1/connect/calendar`);
}
