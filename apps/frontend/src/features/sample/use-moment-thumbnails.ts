"use client";

import { useEffect, useState } from "react";
import type { AnalysisBundleV1 } from "@clipbuilder/contracts";
import { candidateRange } from "./candidate.evidence";
import {
  subscribeVideoThumbnail,
  videoThumbnailSnapshot,
  type VideoThumbnailSnapshot,
} from "../media/video-thumbnail";
import { useSessionEffects } from "../session/session.provider";
import { thumbnailSize } from "../media/thumbnail-framing";

export type MomentFrame = VideoThumbnailSnapshot;

export function useMomentThumbnails(
  analysis: AnalysisBundleV1,
  sourceUrl?: string,
) {
  const effects = useSessionEffects();
  const [cache, setCache] = useState<{
    sourceUrl: string;
    revision: string;
    frames: Record<string, MomentFrame>;
  }>();
  useEffect(() => {
    if (!sourceUrl) return;
    let active = true;
    const swap =
      analysis.media.rotationDegrees === 90 ||
      analysis.media.rotationDegrees === 270;
    const size = thumbnailSize(
      swap
        ? analysis.media.height / analysis.media.width
        : analysis.media.width / analysis.media.height,
    );
    const requests = analysis.candidates.map((candidate) => ({
      id: candidate.id,
      request: {
        source: sourceUrl,
        timeMs: candidateRange(analysis, candidate).startMs,
        ...size,
      },
    }));
    const publish = () => {
      if (!active) return;
      const frames: Record<string, MomentFrame> = {};
      for (const { id, request } of requests) {
        const snapshot = videoThumbnailSnapshot(request);
        if (snapshot.state !== "loading") frames[id] = snapshot;
      }
      setCache({
        sourceUrl,
        revision: analysis.revision,
        frames,
      });
    };
    const releases = requests.map(({ request }) =>
      subscribeVideoThumbnail(request, publish),
    );
    void Promise.resolve().then(publish);
    const stop = () => {
      active = false;
      for (const release of releases) release();
    };
    return effects ? effects.registerStopper(stop) : stop;
  }, [analysis, sourceUrl, effects]);
  return cache?.sourceUrl === sourceUrl && cache?.revision === analysis.revision
    ? cache.frames
    : {};
}
