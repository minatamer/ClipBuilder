import { useMemo, useSyncExternalStore, type RefObject } from "react";
import { BrandedSpinner } from "./branded-spinner";
import { CircleAlert } from "lucide-react";
import styles from "./media-loading-overlay.module.css";

type Media = HTMLVideoElement | HTMLImageElement;
const serverSnapshot = () => "loading";
const events = [
  "loadstart",
  "loadeddata",
  "canplay",
  "emptied",
  "load",
  "error",
];

function mediaReadiness(element: RefObject<Media | null>) {
  return {
    subscribe(notify: () => void) {
      const node = element.current;
      if (!node) return () => {};
      for (const event of events) node.addEventListener(event, notify);
      return () => {
        for (const event of events) node.removeEventListener(event, notify);
      };
    },
    snapshot() {
      const node = element.current;
      if (!node) return "loading";
      if (node instanceof HTMLVideoElement)
        return node.error
          ? "failed"
          : node.readyState >= 2
            ? "ready"
            : "loading";
      return !node.complete
        ? "loading"
        : node.naturalWidth > 0
          ? "ready"
          : "failed";
    },
  };
}

/** Observe existing media only; never fetch, seek, retry or change readiness gates. */
export function MediaLoadingOverlay({
  element,
  showFailure = true,
}: {
  element: RefObject<Media | null>;
  showFailure?: boolean;
}) {
  const readiness = useMemo(() => mediaReadiness(element), [element]);
  const state = useSyncExternalStore(
    readiness.subscribe,
    readiness.snapshot,
    serverSnapshot,
  );
  if (state === "ready" || (state === "failed" && !showFailure)) return null;
  return (
    <div
      className={styles.overlay}
      data-failed={state === "failed" || undefined}
    >
      <div className={styles.indicator}>
        {state === "loading" ? (
          <BrandedSpinner size="compact" />
        ) : (
          <CircleAlert size={24} aria-hidden="true" />
        )}
      </div>
      <span role={state === "failed" ? "alert" : "status"}>
        {state === "failed"
          ? "Source preview unavailable."
          : "Loading source frame…"}
      </span>
    </div>
  );
}
