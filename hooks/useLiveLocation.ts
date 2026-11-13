import { useEffect, useEffectEvent, useState } from "react";
import * as Location from "expo-location";
import { angleDelta, smoothHeading } from "@/lib/geo/geo";

export type LivePosition = {
  lat: number;
  lon: number;
  /** Horizontal accuracy radius in metres (null when the device gives none). */
  accuracy: number | null;
};

/**
 * - `idle`: not enabled
 * - `starting`: waiting for permission / the first subscription
 * - `active`: position watch running (heading may still be null)
 * - `denied`: location permission refused
 * - `error`: location could not be started (e.g. GPS switched off / declined)
 */
export type LiveLocationStatus =
  "idle" | "starting" | "active" | "denied" | "error";

export type LiveLocation = {
  pos: LivePosition | null;
  /** Smoothed compass heading in degrees (0–360), null without compass. */
  heading: number | null;
  /** German, user-facing message for `denied` / `error`, otherwise null. */
  error: string | null;
  status: LiveLocationStatus;
};

type Options = {
  /** Exponential smoothing factor for the heading, (0, 1]. Default 0.15. */
  headingSmoothing?: number;
  /**
   * Only publish a new heading once it moved at least this many degrees
   * (keeps large lists calm). Default 0 = every reading.
   */
  headingThresholdDeg?: number;
  /** Called once when starting fails (`denied` / `error`). */
  onError?: (status: "denied" | "error", message: string) => void;
};

const IDLE: LiveLocation = {
  pos: null,
  heading: null,
  error: null,
  status: "idle",
};
const STARTING: LiveLocation = { ...IDLE, status: "starting" };

export const LOCATION_DENIED_MESSAGE =
  "Standortzugriff wurde verweigert. Bitte erlaube den Zugriff in den Einstellungen.";
export const LOCATION_ERROR_MESSAGE =
  "Standort nicht verfügbar. Bitte GPS bzw. Ortungsdienste einschalten und erneut versuchen.";

/**
 * Live device position and compass heading while `enabled` is true.
 *
 * Handles the permission request, the position and heading watches (true
 * heading with magnetic fallback), heading smoothing and teardown when
 * disabled or unmounted. Every async start is guarded: a failure ends in
 * `status: "error"` instead of an unhandled rejection, and a disable/enable
 * while a start is still pending never leaks a subscription (each start owns
 * its subscriptions and removes them if it was cancelled meanwhile).
 * A missing compass only leaves `heading` null; the position keeps working.
 */
export function useLiveLocation(
  enabled: boolean,
  { headingSmoothing = 0.15, headingThresholdDeg = 0, onError }: Options = {},
): LiveLocation {
  const [state, setState] = useState<LiveLocation>(STARTING);
  const reportError = useEffectEvent(
    (status: "denied" | "error", message: string) => onError?.(status, message),
  );

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let posSub: Location.LocationSubscription | null = null;
    let headingSub: Location.LocationSubscription | null = null;
    // Smoothed heading accumulator, independent of the (thresholded) state.
    let smoothed: number | null = null;

    const fail = (status: "denied" | "error", message: string) => {
      if (cancelled) return;
      setState({ ...IDLE, status, error: message });
      reportError(status, message);
    };

    const start = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== "granted") {
          fail("denied", LOCATION_DENIED_MESSAGE);
          return;
        }
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 1 },
          (loc) => {
            if (cancelled) return;
            setState((s) => ({
              ...s,
              status: "active",
              error: null,
              pos: {
                lat: loc.coords.latitude,
                lon: loc.coords.longitude,
                accuracy: loc.coords.accuracy ?? null,
              },
            }));
          },
          () => fail("error", LOCATION_ERROR_MESSAGE),
        );
        if (cancelled) {
          sub.remove();
          return;
        }
        posSub = sub;
        setState((s) =>
          s.status === "starting" ? { ...s, status: "active" } : s,
        );
      } catch {
        // e.g. LocationSettingsUnsatisfiedException when GPS is declined.
        fail("error", LOCATION_ERROR_MESSAGE);
        return;
      }

      try {
        const sub = await Location.watchHeadingAsync((h) => {
          if (cancelled) return;
          // trueHeading is -1 when unavailable; fall back to magnetic heading.
          const raw = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
          const next = smoothHeading(smoothed, raw, headingSmoothing);
          smoothed = next;
          setState((s) =>
            s.heading == null ||
            Math.abs(angleDelta(s.heading, next)) >= headingThresholdDeg
              ? { ...s, heading: next }
              : s,
          );
        });
        if (cancelled) {
          sub.remove();
          return;
        }
        headingSub = sub;
      } catch {
        // No compass: position stays usable, heading remains null.
      }
    };

    start();

    return () => {
      cancelled = true;
      posSub?.remove();
      headingSub?.remove();
      setState(STARTING);
    };
  }, [enabled, headingSmoothing, headingThresholdDeg]);

  return enabled ? state : IDLE;
}
