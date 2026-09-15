// This browser's own device id, which is what identifies it to the push backend.
// It sits apart from the auth tokens because it outlives a session: the backend keys
// devices on this id, so keeping the same one across sign-ins refreshes a single row
// instead of piling up new ones. There is no "list my devices" endpoint, so the
// stored id is also the only handle the client has for deleting its row later.

const DEVICE_ID_KEY = "pharmalink.device_id";

const hasWindow = () => typeof window !== "undefined";

/** The stored device id, or null when this browser never registered one. */
export function getDeviceId(): string | null {
  return hasWindow() ? window.localStorage.getItem(DEVICE_ID_KEY) : null;
}

/** The stored device id, creating and persisting one on first use. */
export function getOrCreateDeviceId(): string {
  if (!hasWindow()) return "";
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = newDeviceId();
  window.localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

/** randomUUID needs a secure context, so plain-http origins get a fallback. */
function newDeviceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "dev-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}
