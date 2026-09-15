// Write-side types for the device endpoints (source of truth:
// /c/Code/development/PharmaLINK-backend, internal/device/dto). These are camelCase
// like the auth endpoints, unlike the snake_case read-side search and pharmacy types.

/** Platforms the backend accepts. Anything else is rejected with INVALID_PLATFORM. */
export type DevicePlatform = "android" | "ios" | "web";

/**
 * Body for POST /devices/register. The backend takes the user from the access token,
 * so no user is sent. Which credential is required depends on the platform - a
 * pushToken for android/ios, a webPushSubscription for web - and the browser's own
 * subscription object is forwarded as it produced it rather than reshaped here.
 */
export type RegisterDeviceRequest = {
  platform: DevicePlatform;
  deviceId: string;
  pushToken?: string;
  webPushSubscription?: PushSubscriptionJSON;
};

/** Data from POST /devices/register. The backend currently always answers
 * "registered", but the value is its to decide, so it stays a plain string. */
export type DeviceRegistration = {
  deviceId: string;
  platform: DevicePlatform;
  status: string;
};
