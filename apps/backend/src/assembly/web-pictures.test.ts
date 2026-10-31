import { expect, it, vi } from "vitest";
import sharp from "sharp";
import {
  WebPictureSource,
  type PictureSearchFacts,
  type PictureDiscovery,
} from "./web-pictures.js";
import {
  publicPictureAddress,
  readPublicPicture,
  PictureHttpFailure,
} from "./public-picture-request.js";
import { geminiImageDiscovery } from "./gemini-image-search.js";
import { ExecutionError } from "../diagnostics/execution-failure.js";
import type { ExecutionTrace } from "../../../../packages/contracts/local/execution-diagnostics.ts";
import type { ContextualPictureRequest } from "@clipbuilder/contracts";

const request: ContextualPictureRequest = {
  kind: "object",
  brief: {
    scene: "A butterfly resting on a flower",
    searchQuery: "butterfly flower",
    requiredTerms: ["butterfly"],
    avoidTerms: [],
  },
  alternateBriefs: [
    {
      scene: "A butterfly on a flower",
      searchQuery: "butterfly garden",
      requiredTerms: ["butterfly"],
      avoidTerms: [],
    },
  ],
};
const raster = () =>
  sharp({
    create: { width: 24, height: 12, channels: 3, background: "#128fea" },
  })
    .png()
    .toBuffer();
it.each([false, true])(
  "preserves Gemini HTTP status even if its error body cannot be read (%s)",
  async (broken) => {
    const secret = "synthetic-secret-provider-body";
    const body = broken
      ? new ReadableStream({
          start(controller) {
            controller.error(Error(secret));
          },
        })
      : JSON.stringify({
          error: {
            message: "API_KEY_INVALID " + secret,
            status: "INVALID_ARGUMENT",
          },
        });
    const read = vi.fn<typeof fetch>(
      async () => new Response(body, { status: 403 }),
    );
    const operation = geminiImageDiscovery(
      "synthetic-key",
      "synthetic-model",
      read,
    )(request, AbortSignal.timeout(1000));
    try {
      await operation;
      throw Error("expected_failure");
    } catch (error) {
      expect(error).toBeInstanceOf(ExecutionError);
      if (!(error instanceof ExecutionError)) throw error;
      expect(error.diagnostic.httpStatus).toBe(403);
      if (!broken)
        expect(error.diagnostic).toMatchObject({
          category: "authentication",
          providerCode: "API_KEY_INVALID",
        });
      expect(JSON.stringify(error.diagnostic)).not.toContain(secret);
    }
    expect(read).toHaveBeenCalledTimes(1);
  },
);
it("retains the original discovery error rather than returning a false no-match", async () => {
  const trace: ExecutionTrace[] = [],
    read = vi.fn();
  const source = new WebPictureSource(
    async () => {
      throw new ExecutionError("codex_process_failed", {
        category: "schema_rejected",
        providerCode: "invalid_json_schema",
        schemaKeyword: "pattern",
      });
    },
    undefined,
    read,
    undefined,
    (entry) => trace.push(entry),
  );
  await expect(
    source.find(request, AbortSignal.timeout(1000)),
  ).rejects.toMatchObject({
    diagnostic: {
      category: "schema_rejected",
      providerCode: "invalid_json_schema",
    },
  });
  expect(read).not.toHaveBeenCalled();
  expect(trace).toContainEqual(
    expect.objectContaining({
      phase: "discovery",
      outcome: "failed",
      error: expect.objectContaining({ category: "schema_rejected" }),
    }),
  );
  expect(trace.at(-1)).toMatchObject({
    phase: "complete",
    outcome: "failed",
    retained: 0,
    downloads: 0,
  });
});
it("logs each HTTP/decode candidate and successful dimensions without URLs or brief text", async () => {
  const trace: ExecutionTrace[] = [],
    read = vi
      .fn()
      .mockRejectedValueOnce(new PictureHttpFailure(403))
      .mockResolvedValueOnce({
        bytes: await raster(),
        contentType: "image/png",
        url: new URL("https://private.invalid/image"),
      });
  const source = new WebPictureSource(
    async () => ({
      candidates: [
        { url: "https://private.invalid/first", kind: "image" },
        { url: "https://private.invalid/second", kind: "image" },
      ],
    }),
    undefined,
    read,
    undefined,
    (entry) => trace.push(entry),
  );
  expect(await source.find(request, AbortSignal.timeout(1000))).toMatchObject({
    width: 24,
    height: 12,
  });
  expect(trace).toContainEqual(
    expect.objectContaining({
      candidate: 1,
      outcome: "failed",
      error: expect.objectContaining({ category: "http", httpStatus: 403 }),
    }),
  );
  expect(trace).toContainEqual(
    expect.objectContaining({
      candidate: 2,
      phase: "decode",
      outcome: "succeeded",
      width: 24,
      height: 12,
    }),
  );
  expect(JSON.stringify(trace)).not.toMatch(
    /private\.invalid|butterfly|flower/u,
  );
});
it("accepts a small real raster from broad discovery without keyword/license/dimension gates", async () => {
  const discover = vi.fn<PictureDiscovery>(async () => ({
    candidates: [
      {
        url: "https://images.example.test/tiny",
        kind: "image",
        title: "Extra provider metadata",
      },
    ],
    providerMetadata: "Ignored without dropping usable images",
  }));
  const read = vi.fn(async (url: URL) => ({
    bytes: await raster(),
    contentType: "application/octet-stream",
    url,
  }));
  const facts: PictureSearchFacts[] = [];
  const source = new WebPictureSource(
    discover,
    (value) => facts.push(value),
    read,
  );
  expect(await source.find(request, AbortSignal.timeout(1000))).toMatchObject({
    repository: "web",
    width: 24,
    height: 12,
  });
  expect(discover).toHaveBeenCalledTimes(1);
  expect(discover.mock.calls[0]![0]).toEqual(request);
  expect(read).toHaveBeenCalledTimes(1);
  expect(facts).toEqual([{ outcome: "found", candidates: 1, downloads: 1 }]);
});
it("extracts page images, follows the resolved page base, and advances after corrupt bytes", async () => {
  const discover = vi.fn(async () => ({
    candidates: [{ url: "https://example.test/article", kind: "page" }],
  }));
  const read = vi.fn(async (url: URL) => {
    if (url.pathname === "/article")
      return {
        bytes: Buffer.from(
          '<meta content="/bad.jpg" property="og:image"><img src="/good.png?size=1&amp;other=2">',
        ),
        contentType: "text/html",
        url: new URL("https://example.test/final"),
      };
    return {
      bytes:
        url.pathname === "/bad.jpg"
          ? Buffer.from("not an image")
          : await raster(),
      contentType: "image/png",
      url,
    };
  });
  const facts: PictureSearchFacts[] = [];
  const source = new WebPictureSource(
    discover,
    (value) => facts.push(value),
    read,
  );
  expect(await source.find(request, AbortSignal.timeout(1000))).toMatchObject({
    repository: "web",
  });
  expect(read.mock.calls.map((call) => call[0].href)).toEqual([
    "https://example.test/article",
    "https://example.test/bad.jpg",
    "https://example.test/good.png?size=1&other=2",
  ]);
  expect(facts).toContainEqual({
    outcome: "miss",
    reason: "decode_failed",
    candidates: 1,
    downloads: 2,
  });
  expect(facts.at(-1)).toEqual({
    outcome: "found",
    candidates: 1,
    downloads: 3,
  });
  expect(JSON.stringify(facts)).not.toMatch(/example|butterfly|jpg|png/u);
});
it.each([{}, { candidates: [] }])(
  "reports zero candidates on every empty or malformed search exit: %j",
  async (raw) => {
    const observe = vi.fn(),
      read = vi.fn();
    expect(
      await new WebPictureSource(async () => raw, observe, read).find(
        request,
        AbortSignal.timeout(1000),
      ),
    ).toBeNull();
    expect(read).not.toHaveBeenCalled();
    expect(observe).toHaveBeenCalledWith({
      outcome: "miss",
      reason: Object.keys(raw).length ? "no_candidates" : "candidate_shape",
      candidates: 0,
      downloads: 0,
    });
  },
);
it("bounds attempted downloads and keeps lookup failures nonfatal with fixed reasons", async () => {
  const observe = vi.fn(),
    read = vi.fn(async () => {
      throw Error("image_address_blocked");
    });
  expect(
    await new WebPictureSource(
      async () => ({
        candidates: Array.from({ length: 12 }, (_, i) => ({
          url: `https://example.test/${i}`,
          kind: "image",
        })),
      }),
      observe,
      read,
    ).find(request, AbortSignal.timeout(1000)),
  ).toBeNull();
  expect(read).toHaveBeenCalledTimes(12);
  expect(observe).toHaveBeenCalledWith(
    expect.objectContaining({ reason: "address_blocked" }),
  );
  expect(observe).toHaveBeenLastCalledWith({
    outcome: "miss",
    candidates: 12,
    downloads: 12,
  });
});
it("propagates caller cancellation without disguising it as a search miss", async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(
    new WebPictureSource(async () => {
      throw Error("cancelled");
    }).find(request, controller.signal),
  ).rejects.toThrow();
});
it("records HTTP status and unsupported formats without exposing URLs or stopping lookup", async () => {
  const observe = vi.fn();
  const read = vi.fn(async (url: URL) => {
    if (url.pathname === "/blocked") throw new PictureHttpFailure(403);
    return {
      bytes: Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20"/></svg>',
      ),
      contentType: "image/svg+xml",
      url,
    };
  });
  const source = new WebPictureSource(
    async () => ({
      candidates: [
        { url: "https://example.test/blocked", kind: "image" },
        { url: "https://example.test/vector", kind: "image" },
      ],
    }),
    observe,
    read,
  );
  expect(await source.find(request, AbortSignal.timeout(1000))).toBeNull();
  expect(observe).toHaveBeenCalledWith({
    outcome: "miss",
    reason: "download_failed",
    httpStatus: 403,
    candidates: 2,
    downloads: 1,
  });
  expect(observe).toHaveBeenCalledWith({
    outcome: "miss",
    reason: "unsupported_format",
    candidates: 2,
    downloads: 2,
  });
  expect(JSON.stringify(observe.mock.calls)).not.toContain("example.test");
});
it.each([
  "127.0.0.1",
  "10.1.2.3",
  "169.254.169.254",
  "192.168.2.1",
  "100.64.0.1",
  "::1",
  "fc00::1",
  "::ffff:127.0.0.1",
  "2001:db8::1",
])("refuses local/special image address %s", (address) =>
  expect(publicPictureAddress(address)).toBe(false),
);
it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])(
  "admits public address %s",
  (address) => expect(publicPictureAddress(address)).toBe(true),
);
it("rejects private literal targets before opening a socket", async () => {
  await expect(
    readPublicPicture(
      new URL("http://127.0.0.1/private"),
      1024,
      AbortSignal.timeout(1000),
    ),
  ).rejects.toThrow("image_address_blocked");
});
