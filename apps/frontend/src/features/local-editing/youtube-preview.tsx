import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { VideoThumbnail } from "../../shared/ui/video-thumbnail";
import type { OwnerSourceDestination } from "../../../../../packages/contracts/local/acquisition-flow.ts";

type PreviewSource =
  | { kind: "youtube"; sourceId: string }
  | { kind: "saved"; destination: OwnerSourceDestination; variantId: string };

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
        <VideoThumbnail
          request={
            source.kind === "saved"
              ? {
                  source: `/api/local/sources/${source.destination}/${source.variantId}/preview`,
                }
              : {
                  kind: "image",
                  source: `/api/local/sources/thumbnail/${source.sourceId}`,
                }
          }
        />
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
