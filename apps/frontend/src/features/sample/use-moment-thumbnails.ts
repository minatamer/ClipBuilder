"use client";

import { useEffect, useState } from "react";
import type { AnalysisBundleV1 } from "@clipbuilder/contracts";
import { candidateRange } from "./candidate.evidence";
import { decodeMomentFrames } from "./moment-thumbnail";
import { useSessionEffects } from "../session/session.provider";

export type MomentFrame = HTMLCanvasElement | "unavailable";

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
    const controller = new AbortController();
    const video = document.createElement("video");
    video.playsInline = true;
    const frames: Record<string, MomentFrame> = {};
    void decodeMomentFrames(
      video,
      sourceUrl,
      analysis.candidates.map((candidate) => ({
        id: candidate.id,
        startMs: candidateRange(analysis, candidate).startMs,
      })),
      controller.signal,
      (id, frame) => {
        frames[id] = frame;
        setCache({
          sourceUrl,
          revision: analysis.revision,
          frames: { ...frames },
        });
      },
    );
    const stop = () => {
      controller.abort();
      for (const frame of Object.values(frames)) {
        if (frame !== "unavailable") {
          frame.width = 0;
          frame.height = 0;
        }
      }
    };
    return effects ? effects.registerStopper(stop) : stop;
  }, [analysis, sourceUrl, effects]);
  return cache?.sourceUrl === sourceUrl && cache?.revision === analysis.revision
    ? cache.frames
    : {};
}
