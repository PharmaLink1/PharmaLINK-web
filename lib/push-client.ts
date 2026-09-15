// Browser-side Web Push plumbing. Nothing here talks to the PharmaLink API: it only
// obtains the subscription the backend needs, which lib/api-client's deviceApi then
// registers. Kept separate from the endpoint wrappers so everything that can only
// run in a live browser sits in one place.

/** "ready" when this browser can subscribe at all; otherwise why it cannot. */
export type PushSupport = "ready" | "unsupported" | "insecure";

/** Mirrors the browser's Notification.permission. */
export type PushPermission = "default" | "granted" | "denied";

/** Thrown when the patient dismisses or blocks the permission prompt, so the UI can
 * show a blocked state instead of a generic failure. */
export class PushPermissionDenied extends Error {
  constructor() {
    super("notification permission was not granted");
    this.name = "PushPermissionDenied";
  }
}

// The backend signs its pushes with this key (VAPID_PUBLIC_KEY in its env); the
// browser needs the public half to build a subscription the push service accepts.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export function getPushSupport(): PushSupport {
  if (typeof window === "undefined") return "unsupported";
  // Service workers and PushManager are both gated on a secure context, and
  // localhost counts as one while a plain-http LAN origin does not.
  if (!window.isSecureContext) return "insecure";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "unsupported";
  }
  return "ready";
}

export function getPermission(): PushPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "default";
  return Notification.permission;
}

/** True on iOS/iPadOS Safari. iPadOS claims to be a Mac, so the touch test is what
 * catches it. Chrome and Firefox on iOS report themselves separately and cannot
 * install web apps, so they are left out. */
export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  return isIos && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

/** iOS delivers Web Push only to a site opened from the Home Screen. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}

/**
 * Asks for permission and creates (or reuses) this browser's push subscription,
 * registering the service worker that receives the pushes. Permission is asked for
 * first, while the click that called this still counts as a user gesture - browsers
 * ignore the prompt once an await has consumed the gesture.
 */
export async function subscribeToPush(): Promise<PushSubscriptionJSON> {
  if (!VAPID_PUBLIC_KEY) throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set");
  if (getPushSupport() !== "ready") throw new Error("push is not supported here");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new PushPermissionDenied();

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    // The backend always shows a notification, and Chrome rejects a subscription
    // that does not promise one.
    userVisibleOnly: true,
    applicationServerKey: decodeVapidKey(VAPID_PUBLIC_KEY),
  });
  return subscription.toJSON();
}

/** The subscription this browser already holds, if any. */
export async function getExistingSubscription(): Promise<PushSubscriptionJSON | null> {
  const registration = await currentRegistration();
  if (!registration) return null;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? subscription.toJSON() : null;
}

/** Drops this browser's push subscription. False when there was none to drop. */
export async function unsubscribeFromPush(): Promise<boolean> {
  const registration = await currentRegistration();
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? subscription.unsubscribe() : false;
}

async function currentRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (getPushSupport() !== "ready" || !VAPID_PUBLIC_KEY) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  return registration ?? null;
}

/** VAPID keys travel as base64url; the browser wants the raw bytes. */
function decodeVapidKey(base64: string): Uint8Array<ArrayBuffer> {
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = window.atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}
