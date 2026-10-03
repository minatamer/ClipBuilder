import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi, afterEach } from "vitest";
import {
  operationStatusSchema,
  sessionResponseSchema,
  type OperationStatusV1,
} from "@clipbuilder/contracts";
import {
  analysis,
  assembly,
  identity,
  media,
  operation,
  reviewState,
} from "../session/session.test-fixtures";
import { clippingSessionReducer } from "../session/session.reducer";
import { selectAvailableActions } from "../session/session.selectors";
import {
  initialClippingSessionState,
  type ClippingSessionEvent,
  type ClippingSessionState,
} from "../session/session.types";
import { projectSessionState } from "../session/session.persistence";
import { reconcileSessionProjection } from "../session/session.reconciliation";
import {
  abortableDelay,
  developmentOperationFraction,
  runDevelopmentStage,
  confirmDevelopmentAnalysis,
} from "./development.progress";
import { createSampleApi } from "./sample.api";
import { ClipReview } from "./clip.review";
import { developmentInput } from "./development.input";

afterEach(() => vi.useRealTimers());

describe("simulated operation progress", () => {
  it.each([
    {
      kind: "analysis",
      stages: [
        "queued",
        "extracting-audio",
        "transcribing",
        "selecting-candidates",
        "complete",
      ],
      fractions: [0, 3 / 9, 4 / 9, 6 / 9, 1],
    },
    {
      kind: "assembly",
      stages: [
        "queued",
        "detecting-active-speaker",
        "planning-visuals",
        "creating-visual-assets",
        "compiling-preview-bundle",
        "complete",
      ],
      fractions: [0, 5 / 12, 7 / 12, 9 / 12, 10 / 12, 1],
    },
    {
      kind: "render",
      stages: [
        "queued",
        "validating-manifest",
        "compiling-captions",
        "encoding",
        "validating-output",
        "complete",
      ],
      fractions: [0, 2 / 12, 7 / 12, 9 / 12, 10 / 12, 1],
    },
  ] as const)(
    "advances with the reported $kind script without a second clock",
    ({ kind, stages, fractions }) => {
      expect(
        stages.map((stage, index) =>
          developmentOperationFraction({
            kind,
            stageCode: `${kind}.${stage}`,
            state:
              index === 0
                ? "queued"
                : index === stages.length - 1
                  ? "succeeded"
                  : "running",
          }),
        ),
      ).toEqual(fractions);
    },
  );

  it("does not advance stalled stages or report completion before success", () => {
    const pending = {
      kind: "analysis",
      stageCode: "analysis.selecting-candidates",
      state: "running",
    } as const;
    expect(developmentOperationFraction(pending)).toBe(6 / 9);
    vi.useFakeTimers();
    vi.advanceTimersByTime(60_000);
    expect(developmentOperationFraction(pending)).toBe(6 / 9);
    expect(vi.getTimerCount()).toBe(0);
    expect(
      developmentOperationFraction({
        ...pending,
        stageCode: "analysis.complete",
      }),
    ).toBe(0.99);
    expect(
      developmentOperationFraction({ ...pending, state: "succeeded" }),
    ).toBe(1);
  });

  it("keeps unknown and stopped progress unclaimed and handles single-stage inspection", () => {
    const inspection = {
      kind: "media-inspection",
      stageCode: "media.inspecting",
      state: "running",
    } as const;
    expect(developmentOperationFraction(inspection)).toBe(0.5);
    expect(
      developmentOperationFraction({ ...inspection, state: "succeeded" }),
    ).toBe(1);
    expect(
      developmentOperationFraction({
        ...inspection,
        stageCode: "media.unknown",
      }),
    ).toBeUndefined();
    const stopped: OperationStatusV1["state"][] = [
      "failed",
      "cancelled",
      "cancel-requested",
      "expired",
    ];
    for (const state of stopped)
      expect(
        developmentOperationFraction({ ...inspection, state }),
      ).toBeUndefined();
  });
});

describe("complete frontend development flow", () => {
  it("accepts only declared type/size without reading file names or bytes", () => {
    const input = {
      size: 524288000,
      type: "video/mp4",
      get name() {
        throw new Error("Do not read names.");
      },
      arrayBuffer() {
        throw new Error("Do not read bytes.");
      },
    };
    expect(developmentInput(input).validation.status).toBe("accepted");
    expect(developmentInput()).toMatchObject({
      declaredBytes: 8388608,
      validation: { status: "accepted" },
    });
    expect(
      developmentInput({ size: 1, type: "video/webm" }).validation.status,
    ).toBe("accepted");
    for (const size of [0, 524288001, NaN, 0.5])
      expect(developmentInput({ size, type: "video/mp4" }).validation).toEqual({
        status: "rejected",
        reasonCode: "size",
      });
    expect(
      developmentInput({ size: 1, type: "text/plain" }).validation,
    ).toEqual({ status: "rejected", reasonCode: "type" });
  });
  it.each(["file", "sample"] as const)(
    "uses %s fixture input from intake to result, restores immutable review, and sends no media or download requests",
    async (inputKind) => {
      const uploadedIdentity = { ...identity, mode: "upload" as const };
      const inspection = operation("media-inspection", "media.inspecting", "i");
      const analyzing = operation("analysis", "analysis.queued", "a");
      const building = operation("assembly", "assembly.queued", "b");
      const rendering = operation("render", "render.queued", "r");
      let current = inspection;
      let provenStage = "intake";
      const transport = vi.fn<typeof fetch>(async (input, init) => {
        const path = String(input).replace("/api/sample/", "");
        if (path === "sessions")
          return Response.json({
            ...uploadedIdentity,
            remaining: undefined,
            stage: "intake",
          });
        if (path === "upload/authorize")
          return Response.json({ uploadId: `upl_${"u".repeat(22)}` });
        if (path === "upload/complete") {
          provenStage = "uploaded";
          current = inspection;
          return Response.json(current);
        }
        if (path === "analyze") {
          provenStage = "analyzing";
          current = analyzing;
          return Response.json(current);
        }
        if (path === "assemble") {
          provenStage = "assembling";
          current = building;
          return Response.json({
            assemblyId: assembly.assemblyId,
            operation: current,
          });
        }
        if (path === "render") {
          provenStage = "rendering";
          current = rendering;
          return Response.json({
            renderId: `rnd_${"r".repeat(22)}`,
            operation: current,
          });
        }
        if (path.startsWith("operations/")) {
          current = operationStatusSchema.parse({
            ...current,
            state: "succeeded",
            stageCode:
              current.kind === "media-inspection"
                ? "media.inspecting"
                : `${current.kind}.complete`,
            startedAt: identity.expiresAt,
            updatedAt: identity.expiresAt,
            completedAt: identity.expiresAt,
            resultRevision:
              current.kind === "analysis" || current.kind === "media-inspection"
                ? analysis.revision
                : assembly.revision,
          });
          provenStage =
            current.kind === "media-inspection"
              ? "media-inspected"
              : current.kind === "analysis"
                ? "candidates"
                : current.kind === "assembly"
                  ? "clip-review"
                  : "result";
          return Response.json(current);
        }
        if (path === "session")
          return Response.json(
            sessionResponseSchema.parse({
              ...uploadedIdentity,
              accessState: "active",
              provenStage,
              media,
              activeOperation: current,
              analysisId: analysis.analysisId,
              analysisRevision: analysis.revision,
              assemblyId:
                provenStage === "clip-review" || provenStage === "result"
                  ? assembly.assemblyId
                  : null,
              assemblyRevision:
                provenStage === "clip-review" || provenStage === "result"
                  ? assembly.revision
                  : null,
              manifestId:
                provenStage === "clip-review" || provenStage === "result"
                  ? assembly.manifestId
                  : null,
              manifestHash:
                provenStage === "clip-review" || provenStage === "result"
                  ? assembly.manifestHash
                  : null,
              renderId:
                provenStage === "result" ? `rnd_${"r".repeat(22)}` : null,
              outputAvailable: provenStage === "result",
            }),
          );
        if (path.startsWith("analysis/")) return Response.json(analysis);
        if (path.startsWith("assembly/")) return Response.json(assembly);
        void init;
        throw new Error("Unexpected preview request.");
      });
      const api = createSampleApi(transport);
      const signal = new AbortController().signal;
      let state: ClippingSessionState = clippingSessionReducer(
        initialClippingSessionState,
        { type: "RESTORE_EMPTY", availability: { sample: true, upload: true } },
      );
      const events: ClippingSessionEvent[] = [];
      const dispatch = (event: ClippingSessionEvent) => {
        events.push(event);
        state = clippingSessionReducer(state, event);
        expect(state.diagnosticCode).toBeNull();
      };
      expect(selectAvailableActions(state)).toContain("select-sample");
      expect(transport).not.toHaveBeenCalled();
      dispatch({
        type: "FILE_SELECTED",
        localSource:
          inputKind === "sample"
            ? developmentInput()
            : developmentInput({ size: 100, type: "video/mp4" }),
      });
      for (let step = 0; step < 4; step += 1)
        await runDevelopmentStage(state, api, dispatch, signal, async () => {});
      expect(state.stage).toBe("analysis-confirmation");
      const beforeConfirm = transport.mock.calls.length;
      await runDevelopmentStage(state, api, dispatch, signal, async () => {});
      expect(state.stage).toBe("analysis-confirmation");
      expect(transport).toHaveBeenCalledTimes(beforeConfirm);
      await confirmDevelopmentAnalysis(state, api, dispatch, signal);
      expect(transport).toHaveBeenCalledTimes(beforeConfirm + 1);
      await runDevelopmentStage(state, api, dispatch, signal, async () => {});
      expect(state.stage).toBe("candidates");
      dispatch({
        type: "CANDIDATE_SELECTED",
        candidateId: assembly.compositionManifest.baseCandidateId,
      });
      const built = await api.build(
        {
          analysisId: analysis.analysisId,
          selection: {
            candidateId: assembly.compositionManifest.baseCandidateId,
            startWordId: assembly.selectedStartWordId,
            endWordId: assembly.selectedEndWordId,
          },
          turnstileToken: "local-synthetic-fixture",
        },
        signal,
      );
      dispatch({
        type: "BUILD_SELECTED",
        operation: built.operation,
        startWordId: assembly.selectedStartWordId,
        endWordId: assembly.selectedEndWordId,
      });
      await runDevelopmentStage(state, api, dispatch, signal, async () => {});
      expect(state.stage).toBe("clip-review");
      const projection = projectSessionState(
        state,
        new Date("2026-09-29T10:00:00.000Z"),
      );
      if (projection === null) throw new Error("Missing review projection.");
      const evidence = await api.evidence(identity.sessionId, signal);
      const restored = reconcileSessionProjection(
        projection,
        evidence,
        new Date("2026-09-29T10:00:01.000Z"),
        { sample: true, upload: true },
      );
      if (restored.status !== "restored")
        throw new Error("Review restore failed.");
      state = restored.state;
      dispatch({ type: "REVIEW_BUNDLES_REFRESHED", analysis, assembly });
      expect(selectAvailableActions(state)).toContain("confirm-render");
      const rendered = await api.render(
        {
          analysisId: analysis.analysisId,
          assemblyId: assembly.assemblyId,
          manifestHash: assembly.manifestHash,
          turnstileToken: "local-synthetic-fixture",
        },
        signal,
      );
      dispatch({ type: "RENDER_CONFIRMED", operation: rendered.operation });
      await runDevelopmentStage(state, api, dispatch, signal, async () => {});
      expect(state.stage).toBe("result");
      expect(
        events.filter((event) => event.type === "UPLOAD_PROGRESS"),
      ).toHaveLength(5);
      expect(
        events.filter((event) => event.type === "RENDER_CONFIRMED"),
      ).toHaveLength(1);
      expect(
        transport.mock.calls.every(
          ([, options]) => !String(options?.body).includes("filename"),
        ),
      ).toBe(true);
      expect(
        transport.mock.calls.some(([path]) =>
          String(path).includes("download"),
        ),
      ).toBe(false);
      expect(
        transport.mock.calls.every(([path]) =>
          String(path).startsWith("/api/sample/"),
        ),
      ).toBe(true);
    },
  );
  it("cancels owned delays without timers, listeners, dispatch or transport", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const remove = vi.spyOn(controller.signal, "removeEventListener");
    const promise = abortableDelay(400, controller.signal);
    controller.abort();
    await expect(promise).rejects.toThrow("stopped");
    expect(vi.getTimerCount()).toBe(0);
    expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
    const transport = vi.fn<typeof fetch>();
    const dispatch = vi.fn();
    await runDevelopmentStage(
      reviewState(),
      createSampleApi(transport),
      dispatch,
      controller.signal,
    );
    await confirmDevelopmentAnalysis(
      reviewState(),
      createSampleApi(transport),
      dispatch,
      controller.signal,
    );
    expect(transport).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
  it("allows proven success to settle, but aborting that delay prevents the next screen", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const done = operationStatusSchema.parse({
      ...operation("media-inspection", "media.inspecting", "i"),
      state: "succeeded",
      startedAt: identity.expiresAt,
      completedAt: identity.expiresAt,
      resultRevision: analysis.revision,
    });
    const evidence = sessionResponseSchema.parse({
      ...identity,
      accessState: "active",
      provenStage: "media-inspected",
      media,
      activeOperation: done,
      analysisId: null,
      analysisRevision: null,
      assemblyId: null,
      assemblyRevision: null,
      manifestId: null,
      manifestHash: null,
      renderId: null,
      outputAvailable: false,
    });
    const transport = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(evidence));
    const dispatch = vi.fn();
    const state: ClippingSessionState = {
      stage: "media-inspecting",
      identity,
      operation: done,
      diagnosticCode: null,
    };
    const pending = runDevelopmentStage(
      state,
      createSampleApi(transport),
      dispatch,
      controller.signal,
    );
    const rejection = expect(pending).rejects.toThrow("stopped");
    await vi.advanceTimersByTimeAsync(499);
    expect(dispatch).not.toHaveBeenCalled();
    expect(transport).toHaveBeenCalledTimes(1);
    controller.abort();
    await rejection;
    expect(vi.getTimerCount()).toBe(0);
    expect(dispatch).not.toHaveBeenCalled();
  });
  it("rejects foreign review hydration and keeps the preview read-only and labelled", () => {
    const state = reviewState();
    const refreshed = clippingSessionReducer(
      {
        ...state,
        assembly: null,
        analysis: { ...state.analysis, bundle: null },
      },
      {
        type: "REVIEW_BUNDLES_REFRESHED",
        analysis,
        assembly: { ...assembly, manifestHash: "9".repeat(64) },
      },
    );
    expect(refreshed.diagnosticCode).toBe("invalid-manifest");
    const markup = renderToStaticMarkup(
      <ClipReview analysis={analysis} assembly={assembly} />,
    );
    expect(markup).toContain("Video placeholder");
    expect(markup).toContain("Agentic Notes");
    expect(markup).toContain("Clip transcript");
    expect(markup).not.toContain("<video");
    expect(markup).not.toMatch(/Trim|caption style|visual settings|Undo|Redo/);
  });
});
