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
import { decodedThumbnailZoom } from "./thumbnail-framing";

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
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const media = video.current;
    if (!media) return;
    let settled = false;
    let sampleTime: number | null = null;
    const timeout = setTimeout(onError, 15_000);
    const metadata = () => {
      if (!Number.isFinite(media.duration) || media.duration <= 0) {
        onError();
        return;
      }
      // Set the sample before any decoded frame can be accepted.
      sampleTime = Math.min(10, media.duration / 4);
      media.currentTime = sampleTime;
    };
    const decoded = () => {
      if (
        settled ||
        sampleTime === null ||
        Math.abs(media.currentTime - sampleTime) > 0.1 ||
        media.seeking ||
        media.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
      )
        return;
      settled = true;
      clearTimeout(timeout);
      setZoom(decodedThumbnailZoom(media));
      setLoaded(true);
    };
    media.addEventListener("loadedmetadata", metadata);
    media.addEventListener("loadeddata", decoded);
    media.addEventListener("canplay", decoded);
    media.addEventListener("seeked", decoded);
    media.src = url;
    media.load();
    return () => {
      clearTimeout(timeout);
      media.removeEventListener("loadedmetadata", metadata);
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
        style={{ transform: `scale(${zoom})` }}
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

type PreviewProps = {
  source: PreviewSource;
  title: string;
  resolution?: number | undefined;
};

export function YoutubePreview(props: PreviewProps) {
  const { source } = props;
  const identity =
    source.kind === "saved"
      ? `saved:${source.destination}:${source.variantId}`
      : `youtube:${source.sourceId}`;
  return <SourcePreview key={identity} {...props} />;
}

function SourcePreview({ source, title, resolution }: PreviewProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
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
            onLoad={(event) =>
              setZoom(decodedThumbnailZoom(event.currentTarget))
            }
            style={{ transform: `scale(${zoom})` }}
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
