import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import {
  canonicalOwnerYoutubeSource,
  ownerYoutubeSourceId,
} from "./youtube-url.ts";

const videoId = "SYNTHETIC01";
describe("owner YouTube identity admission", () => {
  it.each([
    `https://www.youtube.com/watch?v=${videoId}`,
    `https://youtube.com/watch?v=${videoId}&list=synthetic&index=2&t=20s`,
    `https://m.youtube.com/watch?v=${videoId}&si=synthetic#t=30`,
    `https://youtube.com/shorts/${videoId}?feature=share`,
    `https://www.youtube.com/shorts/${videoId}/?t=4`,
    `https://youtu.be/${videoId}?si=synthetic&t=10`,
    `https://youtu.be/${videoId}/`,
  ])("reconstructs one full source from the admitted alias %s", (input) => {
    const identity = canonicalOwnerYoutubeSource(input);
    expect(identity).toEqual({
      videoId,
      sourceId: createHash("sha256").update(`youtube:${videoId}`).digest("hex"),
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    });
    expect(identity.sourceId).toBe(ownerYoutubeSourceId(videoId));
    expect(identity.canonicalUrl).not.toMatch(/list=|t=|si=|feature=|#/u);
  });

  it.each([
    videoId,
    `http://youtube.com/watch?v=${videoId}`,
    `https://user:secret@youtube.com/watch?v=${videoId}`,
    `https://youtube.com:443/watch?v=${videoId}`,
    `https://youtube.com:80/watch?v=${videoId}`,
    `https://127.0.0.1/watch?v=${videoId}`,
    `https://[::1]/watch?v=${videoId}`,
    `https://youtube.com.evil.example/watch?v=${videoId}`,
    `https://youtube.com./watch?v=${videoId}`,
    `https://www.youtu.be/${videoId}`,
    `https://youtube-nocookie.com/embed/${videoId}`,
    `https://youtube.com/embed/${videoId}`,
    `https://youtube.com/live/${videoId}`,
    `https://youtube.com/playlist?list=synthetic`,
    `https://youtube.com/@synthetic`,
    `https://youtube.com/results?search_query=synthetic`,
    `https://youtube.com/watch?v=${videoId}&v=${videoId}`,
    `https://youtube.com/watch?v=${videoId}&v=DIFFERENT01`,
    `https://youtube.com/shorts/${videoId}?v=${videoId}`,
    `https://youtu.be/${videoId}?v=${videoId}`,
    `https://youtu.be/${videoId}/extra`,
    `https://youtube.com/watch?v=short`,
    `https://youtube.com/watch?v=${videoId}x`,
    `https://youtube.com/watch?v=${videoId}&url=https://127.0.0.1`,
    `https://youtube.com/watch?v=${videoId}&--exec=calc`,
    `https://youtube.com/watch?v=${videoId}\n--exec calc`,
    `https://youtube.com\\@127.0.0.1/watch?v=${videoId}`,
    ` https://youtu.be/${videoId}`,
    `https://youtu.be/${videoId}\u0000`,
    `https://youtu.be/${videoId}?si=${"x".repeat(2048)}`,
  ])("rejects other input without an arbitrary-fetch identity", (input) => {
    expect(() => canonicalOwnerYoutubeSource(input)).toThrow(
      "owner_youtube_url_invalid",
    );
  });

  it("binds distinct platform identities and refuses invalid IDs before hashing", () => {
    expect(ownerYoutubeSourceId(videoId)).not.toBe(
      ownerYoutubeSourceId("DIFFERENT01"),
    );
    expect(() => ownerYoutubeSourceId("../source")).toThrow();
  });
});
