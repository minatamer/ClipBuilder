import { createHash } from "node:crypto";
import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import {
  GENERATED_PICTURE_MODEL,
  contextualPictureAssetSchema,
} from "@clipbuilder/contracts";
import {
  GeminiPictureGenerator,
  GEMINI_PICTURE_POLICY,
  composeGeminiPictureGenerator,
} from "./gemini-pictures.js";
import { loadConfig } from "../config/loadConfig.js";
import { AnalysisDiagnostics } from "../analysis/analysis.diagnostics.js";
import {
  createLiveValidationEnvironment,
  createSafeTestEnvironment,
} from "../../test/environment.fixture.js";

const brief = {
  kind: "object" as const,
  brief: {
    scene: "Generic people sharing a creative activity",
    searchQuery: "creative activity",
    requiredTerms: ["activity"],
    avoidTerms: ["logo"],
  },
};
const content = (data = Buffer.from("synthetic").toString("base64")) => ({
  candidates: [
    {
      finishReason: "STOP",
      content: { parts: [{ inlineData: { mimeType: "image/png", data } }] },
    },
  ],
});
describe("bounded ungrounded Gemini picture generation", () => {
  it("makes exactly one fixed image call and normalizes synthetic returned pixels with explicit provenance", async () => {
    const png = await sharp({
      create: { width: 1024, height: 576, channels: 3, background: "#123456" },
    })
      .png()
      .toBuffer();
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(content(png.toString("base64"))));
    const image = await new GeminiPictureGenerator(
      "synthetic-key",
      request,
    ).find(brief, new AbortController().signal);
    expect(request).toHaveBeenCalledOnce();
    expect(String(request.mock.calls[0]![0])).toBe(
      `https://generativelanguage.googleapis.com/v1beta/models/${GENERATED_PICTURE_MODEL}:generateContent`,
    );
    const options = request.mock.calls[0]![1]!;
    expect(options).toMatchObject({
      method: "POST",
      redirect: "error",
      credentials: "omit",
    });
    const body = JSON.parse(String(options.body)) as Record<string, unknown>;
    expect(body).toMatchObject({
      tools: [],
      generationConfig: {
        candidateCount: 1,
        responseModalities: ["IMAGE"],
        maxOutputTokens: 4096,
        imageConfig: { imageSize: "1K", aspectRatio: "16:9" },
      },
    });
    expect(String(options.body)).not.toMatch(
      /synthetic-key|fileData|http|referenceImage/,
    );
    expect(image).toMatchObject({
      repository: "google-gemini",
      model: GENERATED_PICTURE_MODEL,
      policy: "contextual-generated-v1",
      width: 920,
      height: 518,
    });
    expect(image).not.toHaveProperty("pageId");
    expect(image).not.toHaveProperty("license");
    const bytes = Buffer.from(image.dataUri.slice(23), "base64");
    expect(image.sha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect((await sharp(bytes).metadata()).format).toBe("jpeg");
    expect(
      contextualPictureAssetSchema.safeParse({ ...image, license: "CC0" })
        .success,
    ).toBe(false);
  });
  it.each([401, 429, 503])(
    "consumes one HTTP %i attempt without retry or decoding",
    async (status) => {
      const request = vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json({ privateProviderError: "not logged" }, { status }),
        );
      const normalize = vi.fn();
      await expect(
        new GeminiPictureGenerator("synthetic-key", request, normalize).find(
          brief,
          new AbortController().signal,
        ),
      ).rejects.toThrow("contextual_picture_unavailable");
      expect(request).toHaveBeenCalledOnce();
      expect(normalize).not.toHaveBeenCalled();
    },
  );
  it.each([
    "no-image",
    "multiple-images",
    "unfinished",
    "noncanonical",
    "invalid-raster",
    "oversized-body",
  ])("rejects %s with one attempt", async (shape) => {
    const value = content();
    if (shape === "no-image") value.candidates[0]!.content.parts = [];
    if (shape === "multiple-images")
      value.candidates[0]!.content.parts.push(
        value.candidates[0]!.content.parts[0]!,
      );
    if (shape === "unfinished")
      value.candidates[0]!.finishReason = "MAX_TOKENS";
    if (shape === "noncanonical")
      value.candidates[0]!.content.parts[0]!.inlineData.data = "aaaaa";
    const response =
      shape === "oversized-body"
        ? new Response(
            new Uint8Array(GEMINI_PICTURE_POLICY.responseBytes + 1),
            { headers: { "Content-Type": "application/json" } },
          )
        : Response.json(value);
    const request = vi.fn<typeof fetch>().mockResolvedValue(response);
    await expect(
      new GeminiPictureGenerator("synthetic-key", request).find(
        brief,
        new AbortController().signal,
      ),
    ).rejects.toThrow();
    expect(request).toHaveBeenCalledOnce();
  });
  it("does not dispatch after abort and discards late results without normalizing", async () => {
    const abort = new AbortController(),
      request = vi.fn<typeof fetch>();
    abort.abort();
    await expect(
      new GeminiPictureGenerator("synthetic-key", request).find(
        brief,
        abort.signal,
      ),
    ).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
    const during = new AbortController(),
      normalize = vi.fn();
    request.mockImplementation(async () => {
      during.abort();
      return Response.json(content());
    });
    await expect(
      new GeminiPictureGenerator("synthetic-key", request, normalize).find(
        brief,
        during.signal,
      ),
    ).rejects.toThrow();
    expect(request).toHaveBeenCalledOnce();
    expect(normalize).not.toHaveBeenCalled();
  });
  it("requires separate image approval and refuses fake/test/public composition", () => {
    const approved = loadConfig({
      ...createLiveValidationEnvironment(),
      PAID_VALIDATION_STAGE: "assembly",
    });
    const normal = loadConfig({
      ...createLiveValidationEnvironment(),
      PAID_VALIDATION_STAGE: "assembly",
      GEMINI_IMAGE_GENERATION_APPROVED: "false",
    });
    expect(normal.features.liveImageGeneration).toBe(false);
    expect(approved.admission.maxProcessDispatches).toBe(6);
    expect(
      composeGeminiPictureGenerator(approved, new AnalysisDiagnostics()),
    ).toBeInstanceOf(GeminiPictureGenerator);
    for (const config of [
      normal,
      loadConfig({
        ...createLiveValidationEnvironment(),
        PAID_VALIDATION_STAGE: "assembly",
        PAID_DEMO_ENABLED: "false",
        GEMINI_IMAGE_GENERATION_APPROVED: "true",
      }),
      loadConfig(createSafeTestEnvironment()),
      { ...approved, nodeEnv: "test" as const },
      { ...approved, appEnv: "production" as const },
      { ...approved, paidDemoEnabled: false },
    ])
      expect(
        composeGeminiPictureGenerator(config, new AnalysisDiagnostics()),
      ).toBeUndefined();
  });
});
