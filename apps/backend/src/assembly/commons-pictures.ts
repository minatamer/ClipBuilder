import { createHash } from "node:crypto";
import { z } from "zod";
import {
  CONTEXTUAL_PICTURE_POLICY as policy,
  commonsPictureAssetSchema,
  contextualPictureBriefSchema,
  type ContextualPictureAsset,
  type ContextualPictureRequest,
} from "@clipbuilder/contracts";
import { pictureRelevance } from "./picture-relevance.js";
import { boundedPictureBody, normalizePicture } from "./picture-raster.js";

export interface ContextualPictureSource {
  find(
    request: ContextualPictureRequest,
    signal: AbortSignal,
  ): Promise<ContextualPictureAsset | null>;
}
const infoSchema = z.object({
  thumburl: z.string(),
  mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  extmetadata: z.object({
    LicenseShortName: z.object({ value: z.string() }),
    Copyrighted: z.object({ value: z.string() }).optional(),
    AttributionRequired: z.object({ value: z.string() }).optional(),
    ImageDescription: z.object({ value: z.string().max(16000) }).optional(),
    Categories: z.object({ value: z.string().max(16000) }).optional(),
  }),
});
const pageSchema = z.object({
  pageid: z.number().int().positive(),
  title: z.string().max(240),
  imageinfo: z.array(infoSchema).length(1),
});

export class CommonsPictureSource implements ContextualPictureSource {
  constructor(
    private readonly request: typeof fetch = fetch,
    private readonly normalize = normalizePicture,
    private readonly critique?: (error: unknown) => void,
    private readonly report?: (facts: {
      pictureCandidates: number;
      relevanceRejected: number;
      rightsRejected: number;
    }) => void,
  ) {}
  async find(request: ContextualPictureRequest, signal: AbortSignal) {
    const brief = contextualPictureBriefSchema.safeParse(request.brief);
    if (!brief.success) return null;
    // Preserve the planned depiction; broader same-subject alternatives are
    // supplied by the bounded caller, while required concepts still rank results.
    const query = brief.data.searchQuery;
    const deadline = AbortSignal.any([
      signal,
      AbortSignal.timeout(policy.timeoutMs),
    ]);
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.search = new URLSearchParams({
      action: "query",
      format: "json",
      generator: "search",
      gsrsearch: `${query} filetype:bitmap`,
      gsrnamespace: "6",
      gsrlimit: String(policy.maxCandidates),
      prop: "imageinfo",
      iiprop: "url|mime|size|extmetadata",
      iiurlwidth: String(policy.width),
      iiextmetadatafilter:
        "LicenseShortName|Copyrighted|AttributionRequired|ImageDescription|Categories",
    }).toString();
    const headers = {
      "User-Agent":
        "ClipBuilder/0.0 (owner-operated contextual picture lookup)",
      Accept: "application/json",
    };
    let response: Response | undefined;
    try {
      deadline.throwIfAborted();
      response = await this.request(url, {
        signal: deadline,
        redirect: "error",
        credentials: "omit",
        headers,
      });
      if (!response.ok) throw new Error("contextual_picture_unavailable");
      const decoded: unknown = JSON.parse(
        (await boundedPictureBody(response, policy.maxMetadataBytes)).toString(
          "utf8",
        ),
      );
      if (
        z.object({ batchcomplete: z.string() }).strict().safeParse(decoded)
          .success
      ) {
        this.report?.({
          pictureCandidates: 0,
          relevanceRejected: 0,
          rightsRejected: 0,
        });
        return null;
      }
      const parsed = z
        .object({
          query: z.object({ pages: z.record(z.string(), z.unknown()) }),
        })
        .safeParse(decoded);
      if (!parsed.success) {
        this.critique?.(parsed.error);
        return null;
      }
      const candidates: {
        page: z.infer<typeof pageSchema>;
        license: "CC0" | "public-domain";
        url: URL;
        score: number;
      }[] = [];
      const pages = Object.values(parsed.data.query.pages).slice(
        0,
        policy.maxCandidates,
      );
      let rejected = 0,
        rightsRejected = 0;
      for (const rawPage of pages) {
        const page = pageSchema.safeParse(rawPage);
        if (!page.success) {
          this.critique?.(page.error);
          continue;
        }
        const info = page.data.imageinfo[0]!,
          metadata = info.extmetadata;
        const license =
          metadata.LicenseShortName.value === "CC0"
            ? ("CC0" as const)
            : metadata.LicenseShortName.value === "Public domain" &&
                metadata.Copyrighted?.value.toLowerCase() === "false" &&
                metadata.AttributionRequired?.value.toLowerCase() === "false"
              ? ("public-domain" as const)
              : null;
        if (!license) {
          rightsRejected++;
          continue;
        }
        const score = pictureRelevance(request, {
          title: page.data.title,
          description: metadata.ImageDescription?.value ?? "",
          categories: metadata.Categories?.value ?? "",
          width: info.width,
          height: info.height,
        });
        if (
          !score ||
          info.width < policy.minInputWidth ||
          info.height < policy.minInputHeight
        ) {
          rejected++;
          continue;
        }
        const imageUrl = URL.canParse(info.thumburl)
          ? new URL(info.thumburl)
          : null;
        if (
          !imageUrl ||
          imageUrl.protocol !== "https:" ||
          !["upload.wikimedia.org", "thumb.wikimedia.org"].includes(
            imageUrl.hostname,
          ) ||
          imageUrl.port ||
          imageUrl.username ||
          imageUrl.password ||
          [...imageUrl.searchParams.keys()].some(
            (key) =>
              !["utm_source", "utm_campaign", "utm_content"].includes(key),
          ) ||
          imageUrl.hash ||
          !imageUrl.pathname.startsWith("/wikipedia/commons/")
        )
          continue;
        imageUrl.search = "";
        candidates.push({ page: page.data, license, url: imageUrl, score });
      }
      this.report?.({
        pictureCandidates: pages.length,
        relevanceRejected: rejected,
        rightsRejected,
      });
      const best = candidates.sort(
        (a, b) => b.score - a.score || a.page.pageid - b.page.pageid,
      )[0];
      if (best) {
        // At most one raster download per subject. No retry or browser hotlink.
        const imageResponse = await this.request(best.url, {
          signal: deadline,
          redirect: "error",
          credentials: "omit",
          headers: { ...headers, Accept: "image/jpeg,image/png,image/webp" },
        });
        try {
          if (
            !imageResponse.ok ||
            !/^(?:image\/jpeg|image\/png|image\/webp)(?:;|$)/iu.test(
              imageResponse.headers.get("content-type") ?? "",
            )
          )
            throw new Error("contextual_picture_unavailable");
          const normalized = await this.normalize(
            await boundedPictureBody(imageResponse, policy.maxDownloadBytes),
          );
          deadline.throwIfAborted();
          return commonsPictureAssetSchema.parse({
            repository: "wikimedia-commons",
            license: best.license,
            pageId: best.page.pageid,
            title: best.page.title,
            width: normalized.width,
            height: normalized.height,
            sha256: createHash("sha256").update(normalized.bytes).digest("hex"),
            dataUri: `data:image/jpeg;base64,${normalized.bytes.toString("base64")}`,
          });
        } finally {
          await imageResponse.body?.cancel().catch(() => undefined);
        }
      }
      return null;
    } catch (error) {
      this.critique?.(error);
      signal.throwIfAborted();
      throw new Error("contextual_picture_unavailable");
    } finally {
      if (response?.body && !response.body.locked)
        await response.body.cancel().catch(() => undefined);
    }
  }
}
