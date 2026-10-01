import { randomUUID } from "node:crypto";
import {
  assemblyStartResponseSchema,
  renderStartResponseSchema,
  sessionResponseSchema,
  startSessionResponseSchema,
  PUBLIC_LIMITS,
  type AnalysisBundleV1,
  type AssemblyBundleV1,
  type AssemblyRequest,
  type RenderRequest,
  type UploadAuthorizeRequest,
  type ErrorCode,
  type OperationStatusV1,
  type SessionResponse,
} from "@clipbuilder/contracts";
import { SystemClock, type Clock } from "./fakeClock.js";
import { FakeIdSource, FakeOperationStore } from "./fakeFixtures.js";
import { CONVERSATION_SAMPLE } from "./conversationSample.js";
import { conversationAssembly } from "./conversationAssembly.js";

export class SampleSessionFailure extends Error {
  constructor(readonly code: ErrorCode) {
    super(code);
  }
}
type FixtureSession = {
  token: string;
  sessionId: string;
  expiresAt: string;
  mode: "sample" | "upload";
  stage: SessionResponse["provenStage"];
  selectedCandidateId: string | null;
  operation: OperationStatusV1 | null;
  operations: FakeOperationStore;
  upload: {
    uploadId: string;
    declaredBytes: number;
    contentType: string;
  } | null;
  assembly: AssemblyBundleV1 | null;
  renderId: string | null;
};

// Local development preview only, never a production grant or output store.
export class SampleSession {
  readonly #sessions = new Map<string, FixtureSession>();
  readonly #clock: Clock;
  readonly #analysis: AnalysisBundleV1;
  readonly #ids = new FakeIdSource();
  #inspectionStarts = 0;
  #analysisStarts = 0;
  #assemblyStarts = 0;
  #renderStarts = 0;
  constructor(
    clock: Clock = new SystemClock(),
    analysis: AnalysisBundleV1 = CONVERSATION_SAMPLE,
  ) {
    this.#clock = clock;
    this.#analysis = analysis;
  }
  #operationStore() {
    const success = (
      kind: OperationStatusV1["kind"],
      stages: string[],
      resultRevision: string,
    ) => ({
      kind,
      stages,
      latencyMs: 0,
      terminal: { state: "succeeded" as const, resultRevision },
    });
    return new FakeOperationStore(
      this.#clock,
      {
        inspection: success(
          "media-inspection",
          ["media.inspecting", "media.inspecting"],
          this.#analysis.revision,
        ),
        analysis: success(
          "analysis",
          [
            "analysis.queued",
            "analysis.extracting-audio",
            "analysis.transcribing",
            "analysis.selecting-candidates",
            "analysis.complete",
          ],
          this.#analysis.revision,
        ),
        assembly: success(
          "assembly",
          [
            "assembly.queued",
            "assembly.detecting-active-speaker",
            "assembly.planning-visuals",
            "assembly.creating-visual-assets",
            "assembly.compiling-preview-bundle",
            "assembly.complete",
          ],
          `rev_${"d".repeat(22)}`,
        ),
        render: success(
          "render",
          [
            "render.queued",
            "render.validating-manifest",
            "render.compiling-captions",
            "render.encoding",
            "render.validating-output",
            "render.complete",
          ],
          `rev_${"d".repeat(22)}`,
        ),
      },
      this.#ids,
    );
  }
  get callCounts() {
    return {
      provider: 0,
      inspection: this.#inspectionStarts,
      analysis: this.#analysisStarts,
      assembly: this.#assemblyStarts,
      render: this.#renderStarts,
    };
  }
  start(previousToken: string | null, mode: "sample" | "upload" = "sample") {
    const now = this.#clock.now();
    for (const [token, session] of this.#sessions)
      if (Date.parse(session.expiresAt) <= now.getTime())
        this.#sessions.delete(token);
    const existing =
      previousToken === null ? undefined : this.#sessions.get(previousToken);
    if (existing !== undefined) {
      if (
        mode === "upload" &&
        existing.mode === "upload" &&
        (existing.stage === "intake" || existing.stage === "upload-authorized")
      ) {
        return {
          token: existing.token,
          response: startSessionResponseSchema.parse({
            sessionId: existing.sessionId,
            mode,
            expiresAt: existing.expiresAt,
            stage: "intake",
          }),
        };
      }
      throw new SampleSessionFailure("ACTIVE_SESSION_EXISTS");
    }
    if (this.#sessions.size >= 16)
      throw new SampleSessionFailure("CAPACITY_FULL");
    const token = randomUUID().replaceAll("-", "");
    const session: FixtureSession = {
      token,
      sessionId: `ses_${randomUUID().replaceAll("-", "").slice(0, 22)}`,
      expiresAt: new Date(now.getTime() + 7_200_000).toISOString(),
      mode,
      stage: mode === "sample" ? "candidates" : "intake",
      selectedCandidateId: null,
      operation: null,
      operations: this.#operationStore(),
      upload: null,
      assembly: null,
      renderId: null,
    };
    this.#sessions.set(token, session);
    return {
      token,
      response: startSessionResponseSchema.parse({
        sessionId: session.sessionId,
        mode,
        expiresAt: session.expiresAt,
        stage: mode === "sample" ? "candidates" : "intake",
        ...(mode === "sample"
          ? { sampleAnalysisId: this.#analysis.analysisId }
          : {}),
      }),
    };
  }
  #require(token: string | null) {
    const session = token === null ? undefined : this.#sessions.get(token);
    if (session === undefined)
      throw new SampleSessionFailure("SESSION_MISSING");
    if (Date.parse(session.expiresAt) <= this.#clock.now().getTime()) {
      this.#sessions.delete(session.token);
      throw new SampleSessionFailure("SESSION_EXPIRED");
    }
    return session;
  }
  evidence(token: string | null) {
    const session = this.#require(token);
    const analyzed = [
      "candidates",
      "assembling",
      "clip-review",
      "rendering",
      "result",
    ].includes(session.stage);
    const assembled =
      session.stage === "clip-review" ||
      session.stage === "rendering" ||
      session.stage === "result";
    return sessionResponseSchema.parse({
      sessionId: session.sessionId,
      mode: session.mode,
      expiresAt: session.expiresAt,
      accessState: "active",
      provenStage: session.stage,
      media:
        session.stage === "intake" || session.stage === "upload-authorized"
          ? null
          : this.#analysis.media,
      activeOperation: session.operation,
      analysisId: analyzed ? this.#analysis.analysisId : null,
      analysisRevision: analyzed ? this.#analysis.revision : null,
      assemblyId: assembled ? session.assembly?.assemblyId : null,
      assemblyRevision: assembled ? session.assembly?.revision : null,
      manifestId: assembled ? session.assembly?.manifestId : null,
      manifestHash: assembled ? session.assembly?.manifestHash : null,
      renderId: session.renderId,
      outputAvailable: session.stage === "result",
      remaining: {
        analysisRetries: 0,
        renderAttempts: session.renderId === null ? 1 : 0,
      },
    });
  }
  authorize(token: string | null, request: UploadAuthorizeRequest) {
    const session = this.#require(token);
    if (request.declaredBytes > PUBLIC_LIMITS.maxSourceBytes)
      throw new SampleSessionFailure("SOURCE_TOO_LARGE");
    if (
      session.mode !== "upload" ||
      !["intake", "upload-authorized"].includes(session.stage)
    )
      throw new SampleSessionFailure("ACTION_IN_PROGRESS");
    if (
      session.upload !== null &&
      (session.upload.declaredBytes !== request.declaredBytes ||
        session.upload.contentType !== request.declaredContentType)
    )
      throw new SampleSessionFailure("STALE_REVISION");
    session.upload ??= {
      uploadId: this.#ids.next("upl"),
      declaredBytes: request.declaredBytes,
      contentType: request.declaredContentType,
    };
    session.stage = "upload-authorized";
    return { uploadId: session.upload.uploadId };
  }
  completeUpload(
    token: string | null,
    uploadId: string,
    observedBytes: number,
  ) {
    const session = this.#require(token);
    if (
      session.upload?.uploadId !== uploadId ||
      session.upload.declaredBytes !== observedBytes
    )
      throw new SampleSessionFailure("STALE_REVISION");
    if (
      session.stage === "uploaded" &&
      session.operation?.kind === "media-inspection"
    )
      return session.operation;
    if (session.stage !== "upload-authorized")
      throw new SampleSessionFailure("ACTION_IN_PROGRESS");
    session.operation = session.operations.start("inspection");
    session.stage = "uploaded";
    this.#inspectionStarts += 1;
    return session.operation;
  }
  analyze(token: string | null, mediaId: string) {
    const session = this.#require(token);
    if (mediaId !== this.#analysis.media.mediaId)
      throw new SampleSessionFailure("STALE_REVISION");
    if (session.operation?.kind === "analysis") return session.operation;
    if (session.stage !== "media-inspected")
      throw new SampleSessionFailure("ACTION_IN_PROGRESS");
    session.operation = session.operations.start("analysis");
    session.stage = "analyzing";
    this.#analysisStarts += 1;
    return session.operation;
  }
  async poll(token: string | null, operationId: string) {
    const session = this.#require(token);
    if (session.operation?.operationId !== operationId)
      throw new SampleSessionFailure("OPERATION_NOT_FOUND");
    const next = await session.operations.advance(operationId);
    // Clear/expiry while the fixture clock yields cannot resurrect a session.
    if (this.#require(token) !== session)
      throw new SampleSessionFailure("SESSION_MISSING");
    session.operation = next;
    if (next.state === "succeeded")
      session.stage =
        next.kind === "media-inspection"
          ? "media-inspected"
          : next.kind === "analysis"
            ? "candidates"
            : next.kind === "assembly"
              ? "clip-review"
              : "result";
    return next;
  }
  analysis(token: string | null, analysisId: string) {
    const session = this.#require(token);
    if (
      analysisId !== this.#analysis.analysisId ||
      ![
        "candidates",
        "assembling",
        "clip-review",
        "rendering",
        "result",
      ].includes(session.stage)
    )
      throw new SampleSessionFailure("RESULT_NOT_FOUND");
    return this.#analysis;
  }
  build(token: string | null, request: AssemblyRequest) {
    const session = this.#require(token);
    const selected = this.#analysis.candidates.find(
      (candidate) => candidate.id === request.selection.candidateId,
    );
    if (
      request.analysisId !== this.#analysis.analysisId ||
      selected === undefined ||
      selected.startWordId !== request.selection.startWordId ||
      selected.endWordId !== request.selection.endWordId
    )
      throw new SampleSessionFailure("STALE_REVISION");
    if (
      session.selectedCandidateId !== null &&
      session.selectedCandidateId !== selected.id
    )
      throw new SampleSessionFailure("ACTION_IN_PROGRESS");
    if (session.assembly === null) {
      if (session.stage !== "candidates")
        throw new SampleSessionFailure("ACTION_IN_PROGRESS");
      session.assembly = conversationAssembly(
        this.#analysis,
        selected.id,
        this.#ids.next("asm"),
      );
      session.operation = session.operations.start("assembly");
      session.stage = "assembling";
      this.#assemblyStarts += 1;
    }
    if (session.operation?.kind !== "assembly")
      throw new SampleSessionFailure("ACTION_IN_PROGRESS");
    session.selectedCandidateId = selected.id;
    return assemblyStartResponseSchema.parse({
      assemblyId: session.assembly.assemblyId,
      operation: session.operation,
    });
  }
  assembly(token: string | null, assemblyId: string) {
    const session = this.#require(token);
    if (
      session.assembly?.assemblyId !== assemblyId ||
      !["clip-review", "rendering", "result"].includes(session.stage)
    )
      throw new SampleSessionFailure("RESULT_NOT_FOUND");
    return session.assembly;
  }
  render(token: string | null, request: RenderRequest) {
    const session = this.#require(token);
    if (
      session.assembly === null ||
      request.analysisId !== this.#analysis.analysisId ||
      request.assemblyId !== session.assembly.assemblyId ||
      request.manifestHash !== session.assembly.manifestHash
    )
      throw new SampleSessionFailure("STALE_REVISION");
    if (session.renderId === null) {
      if (session.stage !== "clip-review")
        throw new SampleSessionFailure("ACTION_IN_PROGRESS");
      session.renderId = this.#ids.next("rnd");
      session.operation = session.operations.start("render");
      session.stage = "rendering";
      this.#renderStarts += 1;
    }
    return renderStartResponseSchema.parse({
      renderId: session.renderId,
      operation: session.operation,
    });
  }
  clear(token: string | null): void {
    if (token !== null) this.#sessions.delete(token);
  }
}
