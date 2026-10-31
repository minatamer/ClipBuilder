import { describe, expect, it, vi } from "vitest";
import {
  compositionManifestV3Schema,
  GENERATED_PICTURE_MODEL,
  type TranscriptWord,
} from "@clipbuilder/contracts";
import { AnalysisDiagnostics } from "../analysis/analysis.diagnostics.js";
import { compileContextualPictures } from "./contextual-pictures.js";
const context = {
  range: { startMs: 0, endMs: 15000 },
  words: [
    {
      id: "w_000001",
      startMs: 2000,
      endMs: 2500,
      text: "Mars",
      punctuatedText: "Mars",
      speakerId: "spk_0",
      confidence: null,
    },
  ] satisfies TranscriptWord[],
};
const manifest = compositionManifestV3Schema.parse({
  version: 3,
  source: {
    fingerprint: "a".repeat(64),
    durationMs: 15000,
    width: 1920,
    height: 1080,
  },
  range: context.range,
  output: { width: 1080, height: 1920, fps: 30 },
  focus: [{ startMs: 0, endMs: 15000, mode: "wide", reason: "initial" }],
  captions: [],
  cards: [],
});
const picture = {
  kind: "planet",
  brief: {
    scene: "A planet photograph",
    searchQuery: "Mars planet photograph",
    requiredTerms: ["planet"],
    avoidTerms: [],
  },
  anchorWordId: "w_000001",
  subject: { startWordId: "w_000001", endWordId: "w_000001" },
  durationMs: 2000,
};
const asset = {
  repository: "wikimedia-commons" as const,
  license: "CC0" as const,
  pageId: 1,
  title: "Synthetic planet",
  width: 1,
  height: 1,
  sha256: "a".repeat(64),
  dataUri: "data:image/jpeg;base64,/9j/2Q==",
};
describe("grounded picture compilation", () => {
  it("reserves a metered search before lookup and generation only after a miss", async () => {
    const order: string[] = [];
    const result = await compileContextualPictures(
      { pictures: [picture] },
      context,
      manifest,
      {
        providerSearch: true,
        find: async () => {
          order.push("search");
          return null;
        },
      },
      AbortSignal.timeout(1000),
      new AnalysisDiagnostics(),
      {
        reserveSearch: () => {
          order.push("reserve-search");
        },
        reserve: () => {
          order.push("reserve-generation");
        },
        source: {
          find: async () => {
            order.push("generate");
            return asset;
          },
        },
      },
    );
    expect(order).toEqual([
      "reserve-search",
      "search",
      "reserve-generation",
      "generate",
    ]);
    expect(result.manifest.pictures).toHaveLength(1);
  });
  it("keeps scene notes only for retained pictures and leaves them out of the renderer manifest and safe logs", async () => {
    const next = {
      ...context.words[0]!,
      id: "w_000002",
      startMs: 6000,
      endMs: 6400,
    };
    const find = vi
      .fn()
      .mockResolvedValueOnce(asset)
      .mockResolvedValueOnce(null);
    const sink = vi.fn();
    const { manifest: result, pictureNotes } = await compileContextualPictures(
      {
        pictures: [
          picture,
          {
            ...picture,
            anchorWordId: next.id,
            subject: { startWordId: next.id, endWordId: next.id },
            brief: {
              ...picture.brief,
              scene: "An unavailable synthetic scene",
            },
          },
        ],
      },
      { ...context, words: [...context.words, next] },
      manifest,
      { find },
      new AbortController().signal,
      new AnalysisDiagnostics(sink),
    );
    expect(pictureNotes).toEqual([
      { anchorWordId: picture.anchorWordId, scene: picture.brief.scene },
    ]);
    expect(result.pictures).toHaveLength(1);
    expect(result).not.toHaveProperty("pictureNotes");
    expect(find).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(sink.mock.calls)).not.toContain(picture.brief.scene);
    expect(JSON.stringify(pictureNotes)).not.toContain("unavailable");
  });
  it("fits a 5.2-second supporting phrase into a 4.5-second grounded display window", async () => {
    const words = Array.from({ length: 9 }, (_, index) => ({
      ...context.words[0]!,
      id: `w_${String(index + 1).padStart(6, "0")}`,
      startMs: 2000 + Math.floor((index * 5200) / 9),
      endMs: 2000 + Math.floor(((index + 1) * 5200) / 9),
    }));
    const find = vi.fn(async () => asset);
    const diagnostics = new AnalysisDiagnostics();
    const facts = vi.spyOn(diagnostics, "assembly");
    const { manifest: result } = await compileContextualPictures(
      {
        pictures: [
          {
            ...picture,
            durationMs: 3800,
            anchorWordId: words[2]!.id,
            subject: { startWordId: words[0]!.id, endWordId: words.at(-1)!.id },
          },
        ],
      },
      { ...context, words },
      manifest,
      { find },
      new AbortController().signal,
      diagnostics,
    );
    expect(result.pictures).toHaveLength(1);
    expect(result.pictures![0]).toMatchObject({
      startMs: 2000,
      endMs: 6500,
      anchorWordId: words[0]!.id,
      subjectWordIds: words.slice(0, 7).map((word) => word.id),
    });
    expect(find).toHaveBeenCalledOnce();
    expect(facts).toHaveBeenCalledWith(
      "assembly_pictures",
      expect.objectContaining({
        plannedPictures: 1,
        validatedPictures: 1,
        retimedPicturePlans: 1,
        pictures: 1,
      }),
    );
  });
  it("cuts a long phrase's image at the next readable beat and keeps contiguous evidence inside each window", async () => {
    const words = Array.from({ length: 9 }, (_, index) => ({
      ...context.words[0]!,
      id: `w_${String(index + 1).padStart(6, "0")}`,
      startMs: 2000 + index * 600,
      endMs: 2500 + index * 600,
    }));
    const find = vi
      .fn()
      .mockResolvedValueOnce(asset)
      .mockResolvedValueOnce({
        ...asset,
        pageId: 2,
        sha256: "b".repeat(64),
      });
    const { manifest: result } = await compileContextualPictures(
      {
        pictures: [
          {
            ...picture,
            durationMs: 3800,
            subject: { startWordId: words[0]!.id, endWordId: words.at(-1)!.id },
          },
          {
            ...picture,
            anchorWordId: words[4]!.id,
            subject: { startWordId: words[4]!.id, endWordId: words[5]!.id },
          },
        ],
      },
      { ...context, words },
      manifest,
      { find },
      new AbortController().signal,
      new AnalysisDiagnostics(),
    );
    expect(
      result.pictures?.map((p) => ({
        startMs: p.startMs,
        endMs: p.endMs,
        ids: p.subjectWordIds,
      })),
    ).toEqual([
      { startMs: 2000, endMs: 4400, ids: words.slice(0, 4).map((w) => w.id) },
      { startMs: 4400, endMs: 6400, ids: words.slice(4, 6).map((w) => w.id) },
    ]);
    expect(find).toHaveBeenCalledTimes(2);
  });
  it("generates for a repeated Commons image without treating unrelated generated assets as duplicate page IDs", async () => {
    const nextWord = {
      ...context.words[0]!,
      id: "w_000002",
      startMs: 7000,
      endMs: 7500,
    };
    const expanded = { ...context, words: [...context.words, nextWord] };
    const generated = {
      repository: "google-gemini" as const,
      model: GENERATED_PICTURE_MODEL,
      policy: "contextual-generated-v1" as const,
      width: asset.width,
      height: asset.height,
      dataUri: asset.dataUri,
      sha256: "b".repeat(64),
    };
    const find = vi.fn(async () => asset),
      generate = vi.fn(async () => generated),
      reserve = vi.fn();
    const { manifest: result } = await compileContextualPictures(
      {
        pictures: [
          picture,
          {
            ...picture,
            anchorWordId: nextWord.id,
            subject: { startWordId: nextWord.id, endWordId: nextWord.id },
          },
        ],
      },
      expanded,
      manifest,
      { find },
      new AbortController().signal,
      new AnalysisDiagnostics(),
      { source: { find: generate }, reserve },
    );
    expect(result.pictures).toHaveLength(2);
    expect(find).toHaveBeenCalledTimes(2);
    expect(generate).toHaveBeenCalledOnce();
    expect(reserve).toHaveBeenCalledOnce();
  });
  it("caps failed generation attempts at three even when more pictures are submitted", async () => {
    const find = vi.fn(async () => null),
      generate = vi.fn(async () => {
        throw new Error("uncertain");
      }),
      reserve = vi.fn();
    const { manifest: result } = await compileContextualPictures(
      { pictures: Array.from({ length: 5 }, () => picture) },
      context,
      manifest,
      { find },
      new AbortController().signal,
      new AnalysisDiagnostics(),
      { source: { find: generate }, reserve },
    );
    expect(find).toHaveBeenCalledTimes(3);
    expect(generate).toHaveBeenCalledTimes(3);
    expect(reserve).toHaveBeenCalledTimes(3);
    expect(result).toEqual(manifest);
  });
  it.each([
    "hit",
    "miss",
    "retrieval-error",
    "generation-error",
    "budget-denied",
    "invalid-plan",
  ])(
    "routes %s without extra planning or generation retries",
    async (scenario) => {
      const find = vi.fn(async () => {
        if (scenario === "retrieval-error")
          throw new Error("private retrieval error");
        return scenario === "hit" ? asset : null;
      });
      const generate = vi.fn(async () => {
        if (scenario === "generation-error")
          throw new Error("private generation error");
        const {
          license: _license,
          pageId: _pageId,
          title: _title,
          ...raster
        } = asset;
        void _license;
        void _pageId;
        void _title;
        return {
          ...raster,
          repository: "google-gemini" as const,
          model: GENERATED_PICTURE_MODEL,
          policy: "contextual-generated-v1" as const,
        };
      });
      const reserve = vi.fn(() => {
        if (scenario === "budget-denied") throw new Error("budget");
      });
      const { manifest: result } = await compileContextualPictures(
        {
          pictures: [
            {
              ...picture,
              ...(scenario === "invalid-plan" ? { durationMs: 10 } : {}),
            },
          ],
        },
        context,
        manifest,
        { find },
        new AbortController().signal,
        new AnalysisDiagnostics(),
        { source: { find: generate }, reserve },
      );
      expect(generate).toHaveBeenCalledTimes(
        ["miss", "retrieval-error", "generation-error"].includes(scenario)
          ? 1
          : 0,
      );
      expect(reserve).toHaveBeenCalledTimes(
        ["hit", "invalid-plan"].includes(scenario) ? 0 : 1,
      );
      expect(result.focus).toEqual(manifest.focus);
      expect(result.captions).toEqual(manifest.captions);
      expect(result.pictures?.length ?? 0).toBe(
        ["hit", "miss", "retrieval-error"].includes(scenario) ? 1 : 0,
      );
    },
  );
  it("does not generate after Commons cancellation or publish a late generated image", async () => {
    for (const phase of ["commons", "generation"]) {
      const abort = new AbortController();
      const find = vi.fn(async () => {
        if (phase === "commons") abort.abort();
        return null;
      });
      const generate = vi.fn(async () => {
        abort.abort();
        return asset;
      });
      const reserve = vi.fn();
      await expect(
        compileContextualPictures(
          { pictures: [picture] },
          context,
          manifest,
          { find },
          abort.signal,
          new AnalysisDiagnostics(),
          { source: { find: generate }, reserve },
        ),
      ).rejects.toThrow();
      expect(generate).toHaveBeenCalledTimes(phase === "commons" ? 0 : 1);
      expect(reserve).toHaveBeenCalledTimes(phase === "commons" ? 0 : 1);
    }
  });
  it("normalizes longer phrases and middle-word anchors into three readable windows", async () => {
    let ordinal = 0;
    const groups = [
      { startMs: 3400, spanMs: 2800, count: 9, anchorOffset: 1, holdMs: 2800 },
      { startMs: 9300, spanMs: 3200, count: 5, anchorOffset: 2, holdMs: 3200 },
      { startMs: 15500, spanMs: 3500, count: 6, anchorOffset: 1, holdMs: 3000 },
    ].map((group) => ({
      ...group,
      words: Array.from({ length: group.count }, (_, index) => ({
        ...context.words[0]!,
        id: `w_${String(++ordinal).padStart(6, "0")}`,
        text: "Synthetic",
        punctuatedText: "Synthetic",
        startMs:
          group.startMs + Math.floor((index * group.spanMs) / group.count),
        endMs:
          group.startMs +
          Math.floor(((index + 1) * group.spanMs) / group.count),
      })),
    }));
    const normalizedContext = {
      range: { startMs: 0, endMs: 30000 },
      words: groups.flatMap((group) => group.words),
    };
    const normalizedManifest = compositionManifestV3Schema.parse({
      ...manifest,
      source: { ...manifest.source, durationMs: 30000 },
      range: normalizedContext.range,
      focus: [{ startMs: 0, endMs: 30000, mode: "wide", reason: "initial" }],
    });
    const plans = groups.map((group) => ({
      ...picture,
      kind: "object",
      durationMs: group.holdMs,
      anchorWordId: group.words[group.anchorOffset]!.id,
      subject: {
        startWordId: group.words[0]!.id,
        endWordId: group.words.at(-1)!.id,
      },
    }));
    let returned = 0;
    const find = vi.fn(async () => ({
      ...asset,
      pageId: ++returned,
      sha256: String(returned).repeat(64),
    }));
    const diagnostics = new AnalysisDiagnostics();
    const facts = vi.spyOn(diagnostics, "assembly");
    const { manifest: result } = await compileContextualPictures(
      { pictures: plans },
      normalizedContext,
      normalizedManifest,
      { find },
      new AbortController().signal,
      diagnostics,
    );
    expect(
      result.pictures?.map(({ startMs, endMs, anchorWordId }) => ({
        startMs,
        endMs,
        anchorWordId,
      })),
    ).toEqual([
      { startMs: 3400, endMs: 6200, anchorWordId: groups[0]!.words[0]!.id },
      { startMs: 9300, endMs: 12500, anchorWordId: groups[1]!.words[0]!.id },
      { startMs: 15500, endMs: 19000, anchorWordId: groups[2]!.words[0]!.id },
    ]);
    expect(result.pictures![0]!.subjectWordIds).toEqual(
      groups[0]!.words.slice(0, 7).map((word) => word.id),
    );
    expect(find).toHaveBeenCalledTimes(3);
    expect(facts).toHaveBeenCalledWith(
      "assembly_pictures",
      expect.objectContaining({
        plannedPictures: 3,
        validatedPictures: 3,
        retimedPicturePlans: 3,
        pictures: 3,
        pictureSearches: 3,
      }),
    );
    expect(result.focus).toEqual(normalizedManifest.focus);
    expect(result.captions).toEqual(normalizedManifest.captions);
  });
  it.each([24, 25])(
    "keeps supporting phrases bounded with %i supplied words",
    async (count) => {
      const words = Array.from({ length: count }, (_, index) => ({
        ...context.words[0]!,
        id: `w_${String(index + 1).padStart(6, "0")}`,
        startMs: 2400 + index * 75,
        endMs: 2475 + index * 75,
      }));
      const find = vi.fn(async () => asset);
      const { manifest: result } = await compileContextualPictures(
        {
          pictures: [
            {
              ...picture,
              anchorWordId: words.at(-1)!.id,
              subject: {
                startWordId: words[0]!.id,
                endWordId: words.at(-1)!.id,
              },
            },
          ],
        },
        { ...context, words },
        manifest,
        { find },
        new AbortController().signal,
        new AnalysisDiagnostics(),
      );
      expect(find).toHaveBeenCalledTimes(count === 24 ? 1 : 0);
      if (count === 24) {
        expect(result.pictures![0]).toMatchObject({
          startMs: 2400,
          endMs: 4400,
        });
        expect(result.pictures![0]!.subjectWordIds).toEqual(
          words.slice(0, 7).map((word) => word.id),
        );
      } else expect(result).toEqual(manifest);
    },
  );
  it("clamps an overrun hold at clip end when its evidence and two seconds remain", async () => {
    const words = [{ ...context.words[0]!, startMs: 12800, endMs: 14000 }];
    const find = vi.fn(async () => asset);
    const { manifest: result } = await compileContextualPictures(
      { pictures: [{ ...picture, durationMs: 3500 }] },
      { ...context, words },
      manifest,
      { find },
      new AbortController().signal,
      new AnalysisDiagnostics(),
    );
    expect(result.pictures![0]).toMatchObject({ startMs: 12800, endMs: 15000 });
    expect(find).toHaveBeenCalledOnce();
  });
  it.each(["opening", "end", "long-phrase"])(
    "preserves the edit without fetching when %s bounds make a readable grounded window impossible",
    async (condition) => {
      const words = [
        {
          ...context.words[0]!,
          startMs:
            condition === "opening" ? 1500 : condition === "end" ? 14400 : 2000,
          endMs:
            condition === "opening" ? 2200 : condition === "end" ? 14800 : 7000,
        },
      ];
      const find = vi.fn(async () => asset);
      const { manifest: result } = await compileContextualPictures(
        { pictures: [picture] },
        { ...context, words },
        manifest,
        { find },
        new AbortController().signal,
        new AnalysisDiagnostics(),
      );
      expect(result).toEqual(manifest);
      expect(find).not.toHaveBeenCalled();
    },
  );
  it("supports generic contextual people and readable adjacent pictures without age or grouping requirements", async () => {
    const words = ["collaboration", "surroundings", "craftsmanship"].map(
      (text, index) => ({
        ...context.words[0]!,
        id: `w_${String(index + 1).padStart(6, "0")}`,
        startMs: 2000 + index * 2000,
        endMs: 2300 + index * 2000,
        text,
        punctuatedText: text,
      }),
    );
    const scenes = [
      {
        kind: "person",
        scene: "People collaborating",
        query: "people teamwork photograph",
        term: "people",
      },
      {
        kind: "place",
        scene: "A broad outdoor environment",
        query: "open landscape photograph",
        term: "landscape",
      },
      {
        kind: "person",
        scene: "A person creating something by hand",
        query: "person craft photograph",
        term: "person",
      },
    ];
    const plans = scenes.map((scene, index) => ({
      ...picture,
      kind: scene.kind,
      anchorWordId: words[index]!.id,
      subject: {
        startWordId: words[index]!.id,
        endWordId: words[index]!.id,
      },
      durationMs: 2500,
      brief: {
        scene: scene.scene,
        searchQuery: scene.query,
        requiredTerms: [scene.term],
        avoidTerms: [],
      },
    }));
    let returned = 0;
    const find = vi.fn(async () => ({
      ...asset,
      pageId: ++returned,
      sha256: String(returned).repeat(64),
    }));
    const { manifest: result } = await compileContextualPictures(
      { pictures: plans },
      { ...context, words },
      manifest,
      { find },
      new AbortController().signal,
      new AnalysisDiagnostics(),
    );
    expect(find).toHaveBeenCalledTimes(3);
    expect(
      result.pictures?.map(({ startMs, endMs }) => ({
        startMs,
        endMs,
      })),
    ).toEqual([
      { startMs: 2000, endMs: 4000 },
      { startMs: 4000, endMs: 6000 },
      { startMs: 6000, endMs: 8500 },
    ]);
    expect(find.mock.calls[0]).toEqual([
      { kind: "person", brief: plans[0]!.brief },
      expect.any(AbortSignal),
    ]);
    expect(compositionManifestV3Schema.safeParse(result).success).toBe(true);
    // Earlier signed results may carry differently numbered sequences. They
    // cannot reintroduce a blank-gap requirement between readable pictures.
    const legacy = structuredClone(result);
    legacy.pictures!.forEach((item, index) => {
      item.sequence = index + 1;
    });
    expect(compositionManifestV3Schema.safeParse(legacy).success).toBe(true);
    const overlap = structuredClone(result);
    overlap.pictures![1]!.startMs--;
    expect(compositionManifestV3Schema.safeParse(overlap).success).toBe(false);
    const short = structuredClone(result);
    short.pictures![0]!.endMs--;
    expect(compositionManifestV3Schema.safeParse(short).success).toBe(false);
  });
  it.each([1999, 4501])(
    "rejects a %ims hold before fetching while retaining the edit",
    async (durationMs) => {
      const find = vi.fn(async () => asset);
      const { manifest: result } = await compileContextualPictures(
        { pictures: [{ ...picture, durationMs }] },
        context,
        manifest,
        { find },
        new AbortController().signal,
        new AnalysisDiagnostics(),
      );
      expect(result).toEqual(manifest);
      expect(find).not.toHaveBeenCalled();
    },
  );
  it.each(["close", "evidence"])(
    "preserves a longer contextual hold when the next anchor would cut %s evidence or readability",
    async (condition) => {
      const words = [
        { ...context.words[0]!, endMs: condition === "evidence" ? 5000 : 2500 },
        {
          ...context.words[0]!,
          id: "w_000002",
          startMs: condition === "evidence" ? 4000 : 3000,
          endMs: condition === "evidence" ? 4300 : 3300,
        },
      ];
      const find = vi.fn(async () => asset);
      const { manifest: result } = await compileContextualPictures(
        {
          pictures: [
            { ...picture, durationMs: 4000 },
            {
              ...picture,
              anchorWordId: "w_000002",
              subject: { startWordId: "w_000002", endWordId: "w_000002" },
            },
          ],
        },
        { ...context, words },
        manifest,
        { find },
        new AbortController().signal,
        new AnalysisDiagnostics(),
      );
      expect(result.pictures).toHaveLength(1);
      expect(result.pictures![0]).toMatchObject({ startMs: 2000, endMs: 6000 });
      expect(find).toHaveBeenCalledOnce();
    },
  );
  it("logs the proposed and retained counts and a nonfatal shortfall when retrieval returns only one picture", async () => {
    const words = [
      context.words[0]!,
      { ...context.words[0]!, id: "w_000002", startMs: 4000, endMs: 4300 },
    ];
    const find = vi
      .fn()
      .mockResolvedValueOnce(asset)
      .mockResolvedValueOnce(null);
    const lines: string[] = [];
    const diagnostics = new AnalysisDiagnostics((line) => lines.push(line));
    const result = await new Promise<typeof manifest>((resolve, reject) => {
      diagnostics.request(`req_${"d".repeat(32)}`, "assemble", (finish) => {
        compileContextualPictures(
          {
            pictures: [
              picture,
              {
                ...picture,
                anchorWordId: "w_000002",
                subject: { startWordId: "w_000002", endWordId: "w_000002" },
              },
            ],
          },
          { ...context, words },
          manifest,
          { find },
          new AbortController().signal,
          diagnostics,
        ).then((value) => {
          finish("completed", 200);
          resolve(value.manifest);
        }, reject);
      });
    });
    expect(result.pictures).toHaveLength(1);
    expect(result.focus).toEqual(manifest.focus);
    expect(result.captions).toEqual(manifest.captions);
    expect(find).toHaveBeenCalledTimes(2);
    const events = lines.map((line) => JSON.parse(line));
    expect(events).toContainEqual(
      expect.objectContaining({
        assembly: expect.objectContaining({
          plannedPictures: 2,
          validatedPictures: 2,
          pictures: 1,
          pictureSearches: 2,
        }),
      }),
    );
    expect(events).toContainEqual(
      expect.objectContaining({
        validation: expect.objectContaining({
          reason: "contextual_picture_target_unmet",
        }),
      }),
    );
    expect(lines.join("\n")).not.toMatch(/Mars|dataUri|photograph/);
  });
  it("does not count a repeated image as a second visual or abort the usable edit", async () => {
    const words = [
      context.words[0]!,
      { ...context.words[0]!, id: "w_000002", startMs: 4000, endMs: 4300 },
    ];
    const find = vi.fn(async () => asset);
    const { manifest: result } = await compileContextualPictures(
      {
        pictures: [
          picture,
          {
            ...picture,
            anchorWordId: "w_000002",
            subject: { startWordId: "w_000002", endWordId: "w_000002" },
          },
        ],
      },
      { ...context, words },
      manifest,
      { find },
      new AbortController().signal,
      new AnalysisDiagnostics(),
    );
    expect(find).toHaveBeenCalledTimes(2);
    expect(result.pictures).toHaveLength(1);
    expect(result.focus).toEqual(manifest.focus);
    expect(result.captions).toEqual(manifest.captions);
  });
  it("resolves only supplied subject words and mounts the accepted image in the same manifest", async () => {
    const find = vi.fn(async () => asset),
      diagnostics = new AnalysisDiagnostics();
    const { manifest: result } = await compileContextualPictures(
      { pictures: [picture] },
      context,
      manifest,
      { find },
      new AbortController().signal,
      diagnostics,
    );
    expect(find).toHaveBeenCalledExactlyOnceWith(
      { kind: "planet", brief: picture.brief },
      expect.any(AbortSignal),
    );
    expect(result.pictures?.[0]).toMatchObject({
      startMs: 2000,
      endMs: 4000,
      subjectWordIds: ["w_000001"],
      asset,
    });
  });
  it("does not fetch for fabricated evidence, overlapping windows or executable URL fields", async () => {
    const find = vi.fn(async () => asset);
    const { manifest: result } = await compileContextualPictures(
      {
        pictures: [
          {
            ...picture,
            subject: { startWordId: "w_999999", endWordId: "w_999999" },
          },
          { ...picture, url: "https://evil.test/synthetic" },
          { ...picture, anchorWordId: "w_999999" },
        ],
      },
      context,
      manifest,
      { find },
      new AbortController().signal,
      new AnalysisDiagnostics(),
    );
    expect(find).not.toHaveBeenCalled();
    expect(result.pictures).toBeUndefined();
  });
  it("logs retrieval failures without aborting, leaking the subject or changing captions/focus", async () => {
    const sink = vi.fn();
    const diagnostics = new AnalysisDiagnostics(sink);
    const find = vi.fn(async () => {
      throw new Error("private-subject-url");
    });
    const { manifest: result } = await compileContextualPictures(
      { pictures: [picture] },
      context,
      manifest,
      { find },
      new AbortController().signal,
      diagnostics,
    );
    expect(result).toEqual(manifest);
    expect(find).toHaveBeenCalledOnce();
    expect(JSON.stringify(sink.mock.calls)).not.toMatch(
      /Mars|private-subject-url|dataUri/,
    );
  });
  it("preserves cancellation as cancellation and leaves no image result", async () => {
    const abort = new AbortController();
    const find = vi.fn(async () => {
      abort.abort();
      throw new Error("canceled");
    });
    await expect(
      compileContextualPictures(
        { pictures: [picture] },
        context,
        manifest,
        { find },
        abort.signal,
        new AnalysisDiagnostics(),
      ),
    ).rejects.toThrow();
    expect(find).toHaveBeenCalledOnce();
  });
});
