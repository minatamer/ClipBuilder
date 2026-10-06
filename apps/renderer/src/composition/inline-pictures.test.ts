import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  contextualPictureAssetSchema,
  type ContextualPicture,
} from "@clipbuilder/contracts";
import { verifyInlinePictures } from "./inline-pictures.js";
function fixture() {
  const bytes = Buffer.from([
    0xff, 0xd8, 0xff, 0xc0, 0, 17, 8, 0, 10, 0, 20, 3, 1, 17, 0, 2, 17, 0, 3,
    17, 0, 0xff, 0xda, 0, 2, 0xff, 0xd9,
  ]);
  const picture: ContextualPicture = {
    startMs: 2000,
    endMs: 4000,
    anchorWordId: "w_000001",
    subjectWordIds: ["w_000001"],
    asset: {
      repository: "wikimedia-commons",
      license: "CC0",
      pageId: 1,
      title: "Synthetic",
      width: 20,
      height: 10,
      dataUri: `data:image/jpeg;base64,${bytes.toString("base64")}`,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    },
  };
  return { pictures: [picture] };
}
describe("fixed renderer inline JPEG boundary", () => {
  it("verifies bounded dimensions and checksum without external asset access", () => {
    expect(() => verifyInlinePictures(fixture())).not.toThrow();
    expect(() => verifyInlinePictures({})).not.toThrow();
  });
  it("verifies generated JPEG bytes with distinct provenance and rejects forged licensing", () => {
    const manifest = fixture(),
      original = manifest.pictures[0]!.asset;
    const asset = contextualPictureAssetSchema.parse({
      repository: "google-gemini",
      model: "gemini-3.1-flash-image",
      policy: "contextual-generated-v1",
      width: original.width,
      height: original.height,
      sha256: original.sha256,
      dataUri: original.dataUri,
    });
    manifest.pictures[0]!.asset = asset;
    expect(() => verifyInlinePictures(manifest)).not.toThrow();
    expect(
      contextualPictureAssetSchema.safeParse({
        ...asset,
        license: "CC0",
        pageId: 1,
      }).success,
    ).toBe(false);
    asset.sha256 = "a".repeat(64);
    expect(() => verifyInlinePictures(manifest)).toThrow();
  });
  it.each([
    "checksum",
    "dimensions",
    "remote-url",
    "encoded-padding",
    "missing-frame",
  ])("rejects %s corruption before Chromium", (kind) => {
    const manifest = fixture(),
      asset = manifest.pictures[0]!.asset;
    if (kind === "checksum") asset.sha256 = "a".repeat(64);
    if (kind === "dimensions") asset.height = 4096;
    if (kind === "remote-url")
      asset.dataUri = "https://evil.test/synthetic.jpg";
    if (kind === "encoded-padding") asset.dataUri += "=";
    if (kind === "missing-frame") {
      const bytes = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
      asset.dataUri = `data:image/jpeg;base64,${bytes.toString("base64")}`;
      asset.sha256 = createHash("sha256").update(bytes).digest("hex");
    }
    expect(() => verifyInlinePictures(manifest)).toThrow("invalid");
  });
});
