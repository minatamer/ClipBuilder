import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { Img, useBufferState } from "remotion";
import type { OwnerOverlay } from "../../../../../packages/contracts/local/clips.ts";
import type { OwnerOverlayImageProps } from "../../../../../packages/composition/local/automatic-overlay.tsx";

function prepareImage(src: string) {
  const controller = new AbortController();
  let url: string | undefined;
  let image: HTMLImageElement | undefined;
  const promise = fetch(src, { signal: controller.signal }).then(
    async (response) => {
      if (!response.ok) throw new Error("preview_image_unavailable");
      const bytes = await response.blob();
      controller.signal.throwIfAborted();
      url = URL.createObjectURL(bytes);
      image = new Image();
      image.decoding = "async";
      image.src = url;
      await image.decode();
      controller.signal.throwIfAborted();
      return url;
    },
  );
  return {
    promise,
    release() {
      controller.abort();
      image?.removeAttribute("src");
      if (url) URL.revokeObjectURL(url);
    },
  };
}

/** Retain decoded admitted bytes, including protected/no-store responses. */
export function usePreviewImages(
  overlay: OwnerOverlay,
  assets: Record<string, string>,
  onError: () => void,
) {
  const sources = useMemo(
    () =>
      JSON.stringify(
        [
          ...new Set(
            [...overlay.visuals, ...(overlay.hookContent?.visuals ?? [])]
              .filter((cue) => !cue.video)
              .map((cue) => assets[cue.assetId])
              .filter((url): url is string => Boolean(url)),
          ),
        ].sort(),
      ),
    [overlay.visuals, overlay.hookContent?.visuals, assets],
  );
  const cache = useRef(new Map<string, ReturnType<typeof prepareImage>>());
  const [ready, setReady] = useState<Record<string, string>>({});
  const prepared = useRef(false);
  const { delayPlayback } = useBufferState();
  const reportError = useEffectEvent(onError);
  useEffect(() => {
    let disposed = false;
    // Initial preparation gates Play. Later additions load without suspending it.
    const gate = prepared.current ? null : delayPlayback();
    const urls: string[] = JSON.parse(sources);
    for (const [src, entry] of cache.current)
      if (!urls.includes(src)) {
        entry.release();
        cache.current.delete(src);
      }
    const entries = urls.map((src) => {
      let entry = cache.current.get(src);
      if (!entry) {
        entry = prepareImage(src);
        cache.current.set(src, entry);
      }
      return entry.promise.then((url) => [src, url] as const);
    });
    void Promise.all(entries)
      .then((values) => {
        if (disposed) return;
        setReady(Object.fromEntries(values));
        prepared.current = true;
      })
      .catch(() => {
        if (!disposed) reportError();
      })
      .finally(() => gate?.unblock());
    return () => {
      disposed = true;
      gate?.unblock();
    };
  }, [sources, delayPlayback]);
  useEffect(() => {
    const owned = cache.current;
    return () => {
      for (const entry of owned.values()) entry.release();
      owned.clear();
    };
  }, []);
  return Object.fromEntries(
    Object.entries(assets).flatMap(([id, src]) =>
      ready[src] ? [[id, ready[src]!]] : [],
    ),
  );
}

export const previewOverlayImage = (props: OwnerOverlayImageProps) =>
  props.src ? (
    <Img {...props} decoding="async" pauseWhenLoading={false} maxRetries={0} />
  ) : null;
