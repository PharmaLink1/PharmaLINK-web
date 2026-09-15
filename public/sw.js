// PharmaLink service worker. Its only job is to show the pushes the backend sends and
// to open the app when one is tapped. Next does not compile or bundle anything under
// public/, so this file stays dependency-free plain JavaScript.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Payload sent by the backend (internal/infrastructure/push_webpush.go):
// { title, body, data }. `data` names the subject of the push - a medicineId for a
// back-in-stock alert, a reminderId for a refill reminder.
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    // A push we cannot parse still has to produce a notification: a silent one is
    // counted as a protocol violation and can cost us the subscription.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "PharmaLink", {
      body: payload.body || "",
      icon: "/favicon.ico",
      data: payload.data || {},
    }),
  );
});

// Tapping a notification focuses a tab that is already open rather than stacking up
// duplicates. The payload's ids have no deep-link route yet, so every push lands on
// the dashboard for now.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = "/dashboard";

  event.waitUntil(
    (async () => {
      const tabs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const tab of tabs) {
        if (new URL(tab.url).pathname === url) return tab.focus();
      }
      return self.clients.openWindow(url);
    })(),
  );
});
