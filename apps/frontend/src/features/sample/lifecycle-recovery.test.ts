import { describe, expect, it, vi } from "vitest";
import {
  operationStatusSchema,
  type OperationStatusV1,
} from "@clipbuilder/contracts";
import { SessionEffectRegistry } from "../session/session.effects";
import { clippingSessionReducer } from "../session/session.reducer";
import {
  analysis,
  assembly,
  identity,
  media,
  operation,
  reviewSession,
} from "../session/session.test-fixtures";
import {
  initialClippingSessionState,
  type ClippingSessionEvent,
  type ClippingSessionState,
} from "../session/session.types";
import { developmentInput } from "./development.input";
import { runDevelopmentStage } from "./development.progress";
import { createSampleApi } from "./sample.api";

const availability = { sample: false, upload: true };

function activeState(
  stage:
    "uploading" | "media-inspecting" | "analyzing" | "assembling" | "rendering",
): ClippingSessionState {
  const uploadedIdentity = { ...identity, mode: "upload" as const };
  const snapshot = {
    analysisId: analysis.analysisId,
    revision: analysis.revision,
    bundle: analysis,
  };
  switch (stage) {
    case "uploading":
      return {
        stage,
        identity: uploadedIdentity,
        localSource: developmentInput(),
        upload: {
          status: "requesting",
          uploadId: `upl_${"u".repeat(22)}`,
          bytesSent: 8388608,
          totalBytes: 8388608,
        },
        diagnosticCode: null,
      };
    case "media-inspecting":
      return {
        stage,
        identity: uploadedIdentity,
        operation: operation("media-inspection", "media.inspecting", "i"),
        diagnosticCode: null,
      };
    case "analyzing":
      return {
        stage,
        identity: uploadedIdentity,
        operation: operation("analysis", "analysis.queued", "a"),
        lastKnown: { media },
        diagnosticCode: null,
      };
    case "assembling":
      return {
        stage,
        identity: uploadedIdentity,
        operation: operation("assembly", "assembly.queued", "b"),
        lastKnown: {
          analysis: snapshot,
          selectedId: assembly.compositionManifest.baseCandidateId,
          startWordId: assembly.selectedStartWordId,
          endWordId: assembly.selectedEndWordId,
        },
        diagnosticCode: null,
      };
    case "rendering":
      return {
        stage,
        identity: uploadedIdentity,
        operation: operation("render", "render.queued", "r"),
        lastKnown: { analysis: snapshot, assembly, review: reviewSession() },
        diagnosticCode: null,
      };
  }
}

describe("development cancellation and repeated restart", () => {
  it.each([
    "uploading",
    "media-inspecting",
    "analyzing",
    "assembling",
    "rendering",
  ] as const)(
    "ignores late %s completion after clear and accepts fresh inputs repeatedly",
    async (stage) => {
      const transport = vi.fn<typeof fetch>();
      const effects = new SessionEffectRegistry();
      for (let cycle = 1; cycle <= 3; cycle += 1) {
        let resolveLate: (value: OperationStatusV1) => void = () => {
          throw new Error("Missing pending operation.");
        };
        const late = new Promise<OperationStatusV1>((resolve) => {
          resolveLate = resolve;
        });
        const poll = vi.fn(async () => late);
        const completeUpload = vi.fn(async () => late);
        const startUpload = vi.fn(async () => ({
          ...identity,
          mode: "upload" as const,
          sessionId: `ses_${String(cycle).repeat(22)}`,
        }));
        const authorize = vi.fn(async () => ({
          uploadId: `upl_${String(cycle).repeat(22)}`,
        }));
        const api = {
          ...createSampleApi(transport),
          poll,
          completeUpload,
          startUpload,
          authorize,
        };
        let state = activeState(stage);
        const original = state;
        const controller = new AbortController();
        const stop = effects.registerStopper(() => controller.abort());
        const events: ClippingSessionEvent[] = [];
        const dispatch = (event: ClippingSessionEvent) => {
          events.push(event);
          state = clippingSessionReducer(state, event);
        };
        const pending = runDevelopmentStage(
          state,
          api,
          dispatch,
          controller.signal,
          async () => {},
        ).finally(stop);
        await Promise.resolve();
        expect(
          stage === "uploading" ? completeUpload : poll,
        ).toHaveBeenCalledOnce();
        effects.clear();
        dispatch({ type: "CLEAR" });
        expect(state.stage).toBe("clearing");
        dispatch({ type: "CLEAR_SUCCEEDED", availability });
        const localSource =
          cycle === 2
            ? developmentInput({ size: 16384, type: "video/webm" })
            : developmentInput();
        dispatch({ type: "FILE_SELECTED", localSource });
        expect(state).toMatchObject({
          stage: "local-inspection",
          diagnosticCode: null,
        });
        const oldOperation =
          "operation" in original
            ? original.operation
            : operation("media-inspection", "media.inspecting", "i");
        resolveLate(
          operationStatusSchema.parse({
            ...oldOperation,
            state: "succeeded",
            stageCode:
              oldOperation.kind === "media-inspection"
                ? "media.inspecting"
                : `${oldOperation.kind}.complete`,
            startedAt: identity.expiresAt,
            completedAt: identity.expiresAt,
            resultRevision:
              oldOperation.kind === "assembly" || oldOperation.kind === "render"
                ? assembly.revision
                : analysis.revision,
          }),
        );
        await pending;
        expect(events.map((event) => event.type)).toEqual([
          "CLEAR",
          "CLEAR_SUCCEEDED",
          "FILE_SELECTED",
        ]);
        expect(effects.ownedEffectCount).toBe(0);
        expect(controller.signal.aborted).toBe(true);
        const freshController = new AbortController();
        await runDevelopmentStage(
          state,
          api,
          dispatch,
          freshController.signal,
          async () => {},
        );
        await runDevelopmentStage(
          state,
          api,
          dispatch,
          freshController.signal,
          async () => {},
        );
        expect(state).toMatchObject({
          stage: "uploading",
          diagnosticCode: null,
          identity: { sessionId: `ses_${String(cycle).repeat(22)}` },
          upload: {
            uploadId: `upl_${String(cycle).repeat(22)}`,
            bytesSent: 0,
            totalBytes: localSource.declaredBytes,
          },
        });
        expect(startUpload).toHaveBeenCalledOnce();
        expect(authorize).toHaveBeenCalledOnce();
        expect(authorize).toHaveBeenCalledWith(
          {
            declaredBytes: localSource.declaredBytes,
            declaredContentType: localSource.contentType,
            turnstileToken: "local-synthetic-fixture",
          },
          freshController.signal,
        );
      }
      expect(transport).not.toHaveBeenCalled();
      expect(effects.ownedEffectCount).toBe(0);
      expect(
        clippingSessionReducer(initialClippingSessionState, {
          type: "RESTORE_EMPTY",
          availability,
        }).stage,
      ).toBe("intake");
    },
  );
});
