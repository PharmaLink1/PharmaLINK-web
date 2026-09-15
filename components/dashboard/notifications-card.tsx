"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { deviceApi } from "@/lib/api-client";
import { ApiError } from "@/lib/auth-types";
import { getDeviceId, getOrCreateDeviceId } from "@/lib/device-storage";
import {
  PushPermissionDenied,
  getExistingSubscription,
  getPermission,
  getPushSupport,
  isIosSafari,
  isStandalone,
  subscribeToPush,
  unsubscribeFromPush,
  type PushPermission,
  type PushSupport,
} from "@/lib/push-client";
import { getErrorMessage } from "@/lib/i18n/errors";
import { useLanguage } from "@/lib/i18n";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

/**
 * Makes this browser a push destination for the signed-in patient. The browser
 * subscription is the credential, so it is created here and handed to
 * POST /devices/register; turning notifications off reverses both.
 *
 * Every input to the decision is browser state - support, permission, an existing
 * subscription - so nothing is rendered until the effect has read it. The server
 * cannot know any of it.
 */
export function NotificationsCard() {
  const { t } = useLanguage();
  const copy = t.dashboard.notifications;

  const [support, setSupport] = React.useState<PushSupport | null>(null);
  const [permission, setPermission] = React.useState<PushPermission>("default");
  const [subscribed, setSubscribed] = React.useState(false);
  const [busy, setBusy] = React.useState<"on" | "off" | null>(null);
  const [error, setError] = React.useState("");
  const resyncedRef = React.useRef(false);

  React.useEffect(() => {
    let active = true;
    void (async () => {
      const currentSupport = getPushSupport();
      const currentPermission = getPermission();
      const existing = currentSupport === "ready" ? await getExistingSubscription() : null;
      if (!active) return;

      setSupport(currentSupport);
      setPermission(currentPermission);
      setSubscribed(existing !== null);

      // A subscription lives in the browser and survives signing out, but its row no
      // longer exists. So a signed-in patient can hold a subscription the backend has
      // forgotten; hand it over once, quietly.
      const deviceId = getDeviceId();
      if (!existing || currentPermission !== "granted" || !deviceId || resyncedRef.current) return;
      resyncedRef.current = true;
      try {
        await deviceApi.register({ platform: "web", deviceId, webPushSubscription: existing });
      } catch {
        // Fall back to the toggle below, which reports failures properly.
        if (active) setSubscribed(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleEnable() {
    if (busy) return;
    setBusy("on");
    setError("");
    try {
      const subscription = await subscribeToPush();
      await deviceApi.register({
        platform: "web",
        deviceId: getOrCreateDeviceId(),
        webPushSubscription: subscription,
      });
      resyncedRef.current = true;
      setPermission("granted");
      setSubscribed(true);
    } catch (err) {
      if (err instanceof PushPermissionDenied) {
        setPermission("denied");
      } else {
        setError(err instanceof ApiError ? getErrorMessage(err, t) : copy.enableFailed);
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleDisable() {
    if (busy) return;
    setBusy("off");
    setError("");
    try {
      // Drop the browser subscription first. If that fails, the stored device is
      // still accurate and the patient can retry.
      await unsubscribeFromPush();
      const deviceId = getDeviceId();
      if (deviceId) await deviceApi.unregister(deviceId);
      setSubscribed(false);
    } catch (err) {
      setError(err instanceof ApiError ? getErrorMessage(err, t) : copy.disableFailed);
    } finally {
      setBusy(null);
    }
  }

  function renderState() {
    if (support === null) {
      return (
        <p className={"flex items-center gap-2 text-sm text-muted-foreground"} aria-busy={"true"}>
          <Spinner className={"size-4"} label={copy.checking} />
          {copy.checking}
        </p>
      );
    }

    if (support === "insecure") {
      return <Alert variant={"warning"}>{copy.insecureBody}</Alert>;
    }

    if (support === "unsupported") {
      // iOS Safari only exposes push to a site launched from the Home Screen, so
      // "add to Home Screen" is the fix rather than a dead end.
      if (isIosSafari() && !isStandalone()) {
        return (
          <Alert variant={"warning"}>
            <AlertCopy title={copy.installTitle} body={copy.installBody} />
          </Alert>
        );
      }
      return (
        <Alert variant={"info"}>
          <AlertCopy title={copy.unsupportedTitle} body={copy.unsupportedBody} />
        </Alert>
      );
    }

    if (subscribed) {
      return (
        <>
          <Alert variant={"success"}>
            <AlertCopy title={copy.onTitle} body={copy.onBody} />
          </Alert>
          <Button
            type={"button"}
            variant={"outline"}
            size={"sm"}
            block
            className={"sm:w-auto"}
            loading={busy === "off"}
            onClick={() => void handleDisable()}
          >
            {busy === "off" ? copy.disabling : copy.disable}
          </Button>
        </>
      );
    }

    return (
      <>
        {permission === "denied" && (
          <Alert variant={"warning"}>
            <AlertCopy title={copy.deniedTitle} body={copy.deniedBody} />
          </Alert>
        )}
        <Button
          type={"button"}
          size={"sm"}
          block
          className={"sm:w-auto"}
          loading={busy === "on"}
          onClick={() => void handleEnable()}
        >
          {busy !== "on" && <Bell className={"size-4"} aria-hidden />}
          {busy === "on" ? copy.enabling : copy.enable}
        </Button>
      </>
    );
  }

  return (
    <Card variant={"elevated"} className={"mt-6"}>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className={"space-y-4"}>
        {error && <Alert variant={"danger"}>{error}</Alert>}
        {renderState()}
      </CardContent>
    </Card>
  );
}

/** Two-line alert copy: a short heading with the explanation under it. */
function AlertCopy({ title, body }: { title: string; body: string }) {
  return (
    <>
      <span className={"block font-medium"}>{title}</span>
      <span className={"mt-1 block"}>{body}</span>
    </>
  );
}
