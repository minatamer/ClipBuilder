import { createHash } from "node:crypto";
import { ownerYoutubeVideoIdSchema } from "../../../packages/contracts/local/acquisition.ts";

export function ownerYoutubeSourceId(videoId: string): string {
  return createHash("sha256")
    .update(`youtube:${ownerYoutubeVideoIdSchema.parse(videoId)}`)
    .digest("hex");
}

/** Admit only one HTTPS video, then reconstruct the input supplied to the tool. */
export function canonicalOwnerYoutubeSource(input: string): {
  videoId: string;
  sourceId: string;
  canonicalUrl: string;
} {
  try {
    if (
      input.length > 2048 ||
      input !== input.trim() ||
      Array.from(input).some(
        (char) =>
          char.charCodeAt(0) <= 32 ||
          char.charCodeAt(0) === 127 ||
          char === "\\",
      ) ||
      !input.startsWith("https://")
    )
      throw new Error();
    const url = new URL(input);
    const authority = input.slice(8).split(/[/?#]/u, 1)[0];
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      authority?.includes(":") ||
      !["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(
        url.hostname,
      ) ||
      authority !== url.hostname
    )
      throw new Error();
    let videoId: string;
    if (url.hostname === "youtu.be") {
      if (!/^\/[A-Za-z0-9_-]{11}\/?$/u.test(url.pathname)) throw new Error();
      videoId = url.pathname.slice(1).replace(/\/$/u, "");
      if (url.searchParams.has("v")) throw new Error();
    } else if (url.pathname === "/watch") {
      const ids = url.searchParams.getAll("v");
      if (ids.length !== 1 || !ids[0]) throw new Error();
      videoId = ids[0];
    } else {
      const match = /^\/shorts\/([A-Za-z0-9_-]{11})\/?$/u.exec(url.pathname);
      if (!match?.[1] || url.searchParams.has("v")) throw new Error();
      videoId = match[1];
    }
    ownerYoutubeVideoIdSchema.parse(videoId);
    // Reject unknown fields instead of admitting a future extractor control.
    const ignored = new Set([
      "v",
      "t",
      "start",
      "end",
      "time_continue",
      "si",
      "feature",
      "list",
      "index",
      "pp",
      "ab_channel",
      "utm_source",
      "utm_medium",
      "utm_campaign",
    ]);
    for (const key of url.searchParams.keys())
      if (!ignored.has(key)) throw new Error();
    return {
      videoId,
      sourceId: ownerYoutubeSourceId(videoId),
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch {
    throw new Error("owner_youtube_url_invalid");
  }
}
