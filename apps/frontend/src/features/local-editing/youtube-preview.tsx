import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Film, LoaderCircle } from "lucide-react";
import type { OwnerSourceDestination } from "../../../../../packages/contracts/local/acquisition-flow.ts";

type PreviewSource =
  | { kind: "youtube"; sourceId: string }
  | { kind: "saved"; destination: OwnerSourceDestination; variantId: string };

function SavedVideoFrame({
  url,
  onError,
}: {
  url: string;
  onError: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const media = video.current;
    if (!media) return;
    const timeout = setTimeout(onError, 15_000);
    const decoded = () => {
      if (media.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      clearTimeout(timeout);
      setLoaded(true);
    };
    media.addEventListener("loadeddata", decoded);
    media.addEventListener("canplay", decoded);
    media.addEventListener("seeked", decoded);
    media.src = url;
    media.load();
    return () => {
      clearTimeout(timeout);
      media.removeEventListener("loadeddata", decoded);
      media.removeEventListener("canplay", decoded);
      media.removeEventListener("seeked", decoded);
      media.pause();
      media.removeAttribute("src");
      media.load();
    };
  }, [url, onError]);
  return (
    <>
      <video
        ref={video}
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        data-loaded={loaded}
        onLoadedMetadata={(event) => {
          const media = event.currentTarget;
          if (!Number.isFinite(media.duration) || media.duration <= 0)
            onError();
          // Avoid opening logos/blank intro frames without fetching a poster.
          else media.currentTime = Math.min(10, media.duration / 4);
        }}
        onError={onError}
      />
      {!loaded && (
        <LoaderCircle
          size={20}
          className="acquisition-spinner"
          aria-hidden="true"
        />
      )}
    </>
  );
}

export function YoutubePreview({
  source,
  title,
  resolution,
}: {
  source: PreviewSource;
  title: string;
  resolution?: number | undefined;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);
  const [failed, setFailed] = useState(false);
  const fail = useCallback(() => setFailed(true), []);
  useLayoutEffect(() => {
    const measure = () =>
      setOverflow(
        Math.max(
          0,
          (text.current?.scrollWidth ?? 0) -
            (viewport.current?.clientWidth ?? 0),
        ),
      );
    measure();
    const observer = new ResizeObserver(measure);
    if (viewport.current) observer.observe(viewport.current);
    if (text.current) observer.observe(text.current);
    return () => observer.disconnect();
  }, [title]);
  const motion: CSSProperties & {
    "--youtube-title-shift": string;
    "--youtube-title-duration": string;
  } = {
    "--youtube-title-shift": `${-overflow}px`,
    "--youtube-title-duration": `${Math.max(6, overflow / 30 + 2)}s`,
  };
  return (
    <aside className="youtube-preview" aria-label="Selected video">
      <div className="youtube-thumbnail">
        {failed ? (
          <Film size={24} aria-hidden="true" />
        ) : source.kind === "saved" ? (
          <SavedVideoFrame
            url={`/api/local/sources/${source.destination}/${source.variantId}/preview`}
            onError={fail}
          />
        ) : (
          // The protected same-origin endpoint returns bounded JPEG bytes, never a remote URL.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/local/sources/thumbnail/${source.sourceId}`}
            alt=""
            referrerPolicy="no-referrer"
            onError={fail}
          />
        )}
      </div>
      <div className="youtube-video-details">
        <div
          ref={viewport}
          className={`youtube-video-title ${overflow > 0 ? "is-overflowing" : ""}`}
          title={title}
          style={motion}
        >
          <span ref={text} dir="auto">
            {title}
          </span>
        </div>
        <span className="source-hint">
          {resolution
            ? `${resolution}p · ${source.kind === "saved" ? "Saved" : "English"}`
            : "YouTube video"}
        </span>
      </div>
    </aside>
  );
}
