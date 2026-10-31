import { createHash } from "node:crypto";
import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import { CONTEXTUAL_PICTURE_POLICY as policy } from "@clipbuilder/contracts";
import { CommonsPictureSource } from "./commons-pictures.js";
import { normalizePicture } from "./picture-raster.js";

const planetRequest = {
  kind: "planet" as const,
  brief: {
    scene: "A planet photograph",
    searchQuery: "Mars planet photograph",
    requiredTerms: ["planet"],
    avoidTerms: ["logo"],
  },
};

function metadata(
  license = "CC0",
  url = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Synthetic.png/920px-Synthetic.png",
) {
  return {
    query: {
      pages: {
        "1": {
          pageid: 1,
          title: "File:Synthetic planet.png",
          imageinfo: [
            {
              mime: "image/png",
              width: 1200,
              height: 800,
              thumburl: url,
              extmetadata: {
                LicenseShortName: { value: license },
                Copyrighted: { value: "False" },
                AttributionRequired: { value: "False" },
              },
            },
          ],
        },
      },
    },
  };
}
describe("bounded rights-cleared Commons pictures", () => {
  it("local Codex can admit other source-reported licenses and try the next eligible raster", async () => {
    const base = metadata("CC BY-SA").query.pages["1"];
    const fixture = {
      query: {
        pages: {
          "1": base,
          "2": {
            ...base,
            pageid: 2,
            title: "File:Synthetic planet second.png",
            imageinfo: [
              {
                ...base.imageinfo[0]!,
                thumburl:
                  "https://upload.wikimedia.org/wikipedia/commons/a/ab/Synthetic-second.png",
              },
            ],
          },
        },
      },
    };
    const png = await sharp({
      create: { width: 640, height: 360, channels: 3, background: "blue" },
    })
      .png()
      .toBuffer();
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(fixture))
      .mockResolvedValueOnce(
        new Response("synthetic-invalid-raster", {
          headers: { "Content-Type": "image/png" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(png, { headers: { "Content-Type": "image/png" } }),
      );
    const observed = vi.fn(() => {
      throw Error("synthetic-private-observer-failure");
    });
    const asset = await new CommonsPictureSource(
      request,
      undefined,
      undefined,
      undefined,
      {
        licenseFilter: "none",
        maxCandidates: 20,
        maxDownloads: 3,
        timeoutMs: 20000,
        observed,
      },
    ).find(planetRequest, new AbortController().signal);
    expect(asset).toMatchObject({
      repository: "wikimedia-commons",
      license: "CC BY-SA",
      pageId: 2,
    });
    expect(request).toHaveBeenCalledTimes(3);
    expect(
      new URL(String(request.mock.calls[0]![0])).searchParams.get("gsrlimit"),
    ).toBe("20");
    expect(observed).toHaveBeenCalledWith({ candidates: 2, downloads: 2 });
    for (const [, init] of request.mock.calls)
      expect(init).toMatchObject({ redirect: "error", credentials: "omit" });
  });
  it("searches the precise planned depiction and treats completed empty results as a normal miss", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ batchcomplete: "" }));
    const critique = vi.fn(),
      report = vi.fn();
    expect(
      await new CommonsPictureSource(request, undefined, critique, report).find(
        planetRequest,
        new AbortController().signal,
      ),
    ).toBeNull();
    expect(
      new URL(String(request.mock.calls[0]![0])).searchParams.get("gsrsearch"),
    ).toBe("Mars planet photograph filetype:bitmap");
    expect(request).toHaveBeenCalledOnce();
    expect(critique).not.toHaveBeenCalled();
    expect(report).toHaveBeenCalledExactlyOnceWith({
      pictureCandidates: 0,
      relevanceRejected: 0,
      rightsRejected: 0,
    });
  });
  it("rejects an unrelated game logo and ranks the contextual screenshot above weaker licensed results", async () => {
    const base = metadata().query.pages["1"];
    const page = (id: number, title: string, description: string) => ({
      ...base,
      pageid: id,
      title,
      imageinfo: [
        {
          ...base.imageinfo[0]!,
          thumburl: `https://upload.wikimedia.org/wikipedia/commons/${id}.png`,
          extmetadata: {
            ...base.imageinfo[0]!.extmetadata,
            ImageDescription: { value: description },
          },
        },
      ],
    });
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json({
          query: {
            pages: {
              "1": page(
                1,
                "File:Fast-food videogame logo.png",
                "Restaurant game logo",
              ),
              "2": page(
                2,
                "File:Game screenshot.png",
                "A landscape in a video game screenshot",
              ),
              "3": page(
                3,
                "File:Video game landscape screenshot.png",
                "A scenic gameplay environment",
              ),
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(Buffer.from([0xff, 0xd8, 0xff, 0xd9]), {
          headers: { "content-type": "image/jpeg" },
        }),
      );
    const report = vi.fn();
    const normalize = vi.fn(async () => ({
      bytes: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
      width: 1,
      height: 1,
    }));
    const asset = await new CommonsPictureSource(
      request,
      normalize,
      undefined,
      report,
    ).find(
      {
        kind: "game",
        brief: {
          scene: "A scenic game environment",
          searchQuery: "video game landscape screenshot",
          requiredTerms: ["landscape", "screenshot"],
          avoidTerms: ["restaurant"],
        },
      },
      new AbortController().signal,
    );
    expect(asset?.pageId).toBe(3);
    expect(String(request.mock.calls[1]![0])).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/3.png",
    );
    expect(request).toHaveBeenCalledTimes(2);
    expect(report).toHaveBeenCalledExactlyOnceWith({
      pictureCandidates: 3,
      relevanceRejected: 1,
      rightsRejected: 0,
    });
  });
  it.each(["irrelevant", "undersized"])(
    "does not download a %s licensed candidate",
    async (kind) => {
      const data = metadata();
      const info = data.query.pages["1"].imageinfo[0]!;
      if (kind === "undersized") info.height = 80;
      else data.query.pages["1"].title = "File:Unrelated restaurant.png";
      const request = vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json(data));
      expect(
        await new CommonsPictureSource(request).find(
          planetRequest,
          new AbortController().signal,
        ),
      ).toBeNull();
      expect(request).toHaveBeenCalledOnce();
    },
  );
  it("accepts the current thumbnail host and strips its tracking parameters", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json(
          metadata(
            "CC0",
            "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Synthetic.png/960px-Synthetic.png?utm_source=synthetic&utm_content=thumbnail",
          ),
        ),
      )
      .mockResolvedValueOnce(
        new Response(Buffer.from([0xff, 0xd8, 0xff, 0xd9]), {
          headers: { "content-type": "image/jpeg" },
        }),
      );
    const normalize = vi.fn(async () => ({
      bytes: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
      width: 1,
      height: 1,
    }));
    expect(
      await new CommonsPictureSource(request, normalize).find(
        planetRequest,
        new AbortController().signal,
      ),
    ).not.toBeNull();
    expect(new URL(String(request.mock.calls[1]![0])).search).toBe("");
    expect(request).toHaveBeenCalledTimes(2);
  });
  it("searches once, downloads once and normalizes a real synthetic raster without metadata", async () => {
    const png = await sharp({
      create: { width: 1920, height: 1080, channels: 3, background: "#2859cc" },
    })
      .png()
      .toBuffer();
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(metadata()))
      .mockResolvedValueOnce(
        new Response(png, { headers: { "content-type": "image/png" } }),
      );
    const asset = await new CommonsPictureSource(request).find(
      planetRequest,
      new AbortController().signal,
    );
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[0]![1]).toMatchObject({
      redirect: "error",
      credentials: "omit",
    });
    expect(
      new URL(String(request.mock.calls[0]![0])).searchParams.get("gsrsearch"),
    ).toBe("Mars planet photograph filetype:bitmap");
    expect(asset).toMatchObject({
      repository: "wikimedia-commons",
      license: "CC0",
      width: 920,
      height: 518,
    });
    const data = Buffer.from(asset!.dataUri.slice(23), "base64");
    expect(data.length).toBeLessThanOrEqual(policy.maxRasterBytes);
    expect(asset!.sha256).toBe(createHash("sha256").update(data).digest("hex"));
    const info = await sharp(data).metadata();
    expect(info.format).toBe("jpeg");
    expect(info.exif).toBeUndefined();
  });
  it.each(["CC BY-SA 4.0", "unknown"])(
    "does not download unapproved %s media",
    async (license) => {
      const request = vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json(metadata(license)));
      expect(
        await new CommonsPictureSource(request).find(
          planetRequest,
          new AbortController().signal,
        ),
      ).toBeNull();
      expect(request).toHaveBeenCalledTimes(1);
    },
  );
  it.each([
    "http://upload.wikimedia.org/wikipedia/commons/a.png",
    "https://127.0.0.1/a.png",
    "https://upload.wikimedia.org.evil.test/a.png",
    "https://upload.wikimedia.org:444/wikipedia/commons/a.png",
    "https://user:pass@upload.wikimedia.org/wikipedia/commons/a.png",
    "https://upload.wikimedia.org/private/a.png",
  ])("rejects an untrusted raster destination before download", async (url) => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(metadata("CC0", url)));
    expect(
      await new CommonsPictureSource(request).find(
        planetRequest,
        new AbortController().signal,
      ),
    ).toBeNull();
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("rejects oversized metadata and closes the reader without retry", async () => {
    const cancel = vi.fn();
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new Uint8Array(policy.maxMetadataBytes + 1));
          },
          cancel,
        }),
      ),
    );
    await expect(
      new CommonsPictureSource(request).find(
        planetRequest,
        new AbortController().signal,
      ),
    ).rejects.toThrow("contextual_picture_unavailable");
    expect(cancel).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledOnce();
  });
  it.each([302, 429, 500])(
    "does not retry metadata HTTP %s",
    async (status) => {
      const request = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status }));
      await expect(
        new CommonsPictureSource(request).find(
          planetRequest,
          new AbortController().signal,
        ),
      ).rejects.toThrow("contextual_picture_unavailable");
      expect(request).toHaveBeenCalledOnce();
    },
  );
  it("rejects unexpected MIME before decoding and never retries a failed image", async () => {
    const normalize = vi.fn();
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(metadata()))
      .mockResolvedValueOnce(
        new Response("<svg>synthetic</svg>", {
          headers: { "content-type": "image/svg+xml" },
        }),
      );
    await expect(
      new CommonsPictureSource(request, normalize).find(
        planetRequest,
        new AbortController().signal,
      ),
    ).rejects.toThrow("contextual_picture_unavailable");
    expect(normalize).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledTimes(2);
  });
  it("rejects decoder-disguised non-raster data", async () => {
    await expect(
      normalizePicture(
        Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>',
        ),
      ),
    ).rejects.toThrow("image_format_unsupported");
  });
  it("rejects a download over its byte cap and closes the body without retry", async () => {
    const cancel = vi.fn();
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(metadata()))
      .mockResolvedValueOnce(
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new Uint8Array(policy.maxDownloadBytes + 1));
            },
            cancel,
          }),
          { headers: { "content-type": "image/png" } },
        ),
      );
    await expect(
      new CommonsPictureSource(request).find(
        planetRequest,
        new AbortController().signal,
      ),
    ).rejects.toThrow("contextual_picture_unavailable");
    expect(cancel).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledTimes(2);
  });
  it("does not admit capability query parameters even on the trusted image host", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json(
          metadata(
            "CC0",
            "https://thumb.wikimedia.org/wikipedia/commons/a.png?token=synthetic",
          ),
        ),
      );
    expect(
      await new CommonsPictureSource(request).find(
        planetRequest,
        new AbortController().signal,
      ),
    ).toBeNull();
    expect(request).toHaveBeenCalledOnce();
  });
  it("does not dispatch after cancellation", async () => {
    const request = vi.fn<typeof fetch>();
    const abort = new AbortController();
    abort.abort();
    await expect(
      new CommonsPictureSource(request).find(planetRequest, abort.signal),
    ).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
  });
});
