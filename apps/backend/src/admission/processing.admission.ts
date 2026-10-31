import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import {
  ASSEMBLY_LIMITS,
  integrityReceiptClaimsSchema,
  processingActionSchema,
  sessionStartProofSchema,
  type SessionStartProof,
  type ProcessingChallengeAction,
  type IntegrityReceiptClaims,
  type ProcessingAction,
} from "@clipbuilder/contracts";
import { ApplicationError } from "../http/errorMapper.js";
import {
  equalToken,
  ProcessingGrantCodec,
  type ProcessingGrant,
} from "./processing.grant.js";

type ActionRecord = {
  nonce: string;
  digest: string | null;
  state:
    | "available"
    | "reserved"
    | "running"
    | "completed"
    | "uncertain"
    | "canceled";
  controller: AbortController | null;
};
type GrantRecord = {
  grant: ProcessingGrant;
  imageCalls: number;
  imageSearchCalls: number;
  actions: Record<ProcessingAction, ActionRecord>;
};
export type AdmissionPolicy = {
  ttlMs: number;
  maxRecords: number;
  maxConcurrent: number;
  maxDispatches: number;
  rateWindowMs: number;
  maxGrantsPerWindow: number;
  allowedOrigins: readonly string[];
  paidEnabled: boolean;
  timeoutMs: number;
};
export type AdmissionContext = {
  cookie: string;
  origin: string;
  fetchSite: string;
  csrf: string;
  signal: AbortSignal;
};
export type ActionInput = {
  bytes: Uint8Array;
  contentType: string;
  allowedContentTypes: readonly string[];
  maxBytes: number;
  turnstileToken: string;
  action: ProcessingAction;
};
export interface AbuseVerifier {
  verify(input: {
    token: string;
    action: ProcessingChallengeAction;
    sessionId: string;
    signal: AbortSignal;
  }): Promise<boolean>;
}

export class ProcessingAdmission {
  private records = new Map<string, GrantRecord>();
  private active = 0;
  private dispatches = 0;
  private grantTimes: number[] = [];
  private pendingStarts = 0;
  constructor(
    private readonly codec: ProcessingGrantCodec,
    private readonly policy: AdmissionPolicy,
    private readonly abuse: AbuseVerifier,
    private readonly now: () => number,
    private readonly receiptKey: Uint8Array,
  ) {}

  private reject(
    code: ConstructorParameters<typeof ApplicationError>[0]["code"],
  ): never {
    throw new ApplicationError({ code });
  }
  private sweep(): void {
    for (const [id, record] of this.records)
      if (record.grant.expiresAtMs <= this.now()) {
        for (const action of Object.values(record.actions))
          action.controller?.abort();
        this.records.delete(id);
      }
    this.grantTimes = this.grantTimes.filter(
      (time) => time > this.now() - this.policy.rateWindowMs,
    );
  }
  private origin(origin: string, fetchSite: string): void {
    if (
      !this.policy.allowedOrigins.includes(origin) ||
      !["same-origin", "same-site", "none"].includes(fetchSite)
    )
      this.reject("ABUSE_CHECK_FAILED");
  }
  private canIssue(origin: string, fetchSite: string): void {
    this.origin(origin, fetchSite);
    this.sweep();
    if (
      (this.records.size + 1) * processingActionSchema.options.length >
      this.policy.maxRecords
    )
      this.reject("CAPACITY_FULL");
    if (this.grantTimes.length >= this.policy.maxGrantsPerWindow)
      this.reject("RATE_LIMITED");
  }
  async start(
    input: SessionStartProof & {
      origin: string;
      fetchSite: string;
      signal: AbortSignal;
    },
  ): Promise<{ cookie: string; grant: ProcessingGrant }> {
    this.canIssue(input.origin, input.fetchSite);
    if (!this.policy.paidEnabled) this.reject("PAID_DEMO_DISABLED");
    const proof = sessionStartProofSchema.safeParse({
      startNonce: input.startNonce,
      turnstileToken: input.turnstileToken,
    });
    if (!proof.success) this.reject("INVALID_REQUEST");
    input.signal.throwIfAborted();
    // Reserve before verification awaits; invalid proofs never consume grants.
    if (this.pendingStarts >= 2) this.reject("CAPACITY_FULL");
    this.pendingStarts++;
    const signal = AbortSignal.any([input.signal, AbortSignal.timeout(5000)]);
    try {
      const verified = await this.abuse.verify({
        token: proof.data.turnstileToken,
        action: "session-start",
        sessionId: proof.data.startNonce,
        signal,
      });
      signal.throwIfAborted();
      if (!verified) this.reject("ABUSE_CHECK_FAILED");
      return this.issue(input.origin, input.fetchSite);
    } finally {
      // Hold the slot until the verifier settles even if its caller disconnects.
      this.pendingStarts--;
    }
  }
  // Internal allocation primitive; HTTP entry points must use verified start().
  issue(
    origin: string,
    fetchSite: string,
  ): { cookie: string; grant: ProcessingGrant } {
    this.canIssue(origin, fetchSite);
    const issuedAtMs = this.now();
    const nonces = Object.fromEntries(
      processingActionSchema.options.map((action) => [action, randomUUID()]),
    );
    const grant: ProcessingGrant = {
      version: 1,
      bootEpoch: this.codec.bootEpoch,
      sessionId: `ses_${randomBytes(16).toString("base64url")}`,
      issuedAtMs,
      expiresAtMs: issuedAtMs + this.policy.ttlMs,
      csrf: randomBytes(32).toString("base64url"),
      nonces: {
        transcription: nonces.transcription!,
        "candidate-analysis": nonces["candidate-analysis"]!,
        "visual-plan": nonces["visual-plan"]!,
        render: nonces.render!,
      },
    };
    const actions = Object.fromEntries(
      processingActionSchema.options.map((action) => [
        action,
        {
          nonce: grant.nonces[action],
          digest: null,
          state: "available" as const,
          controller: null,
        },
      ]),
    );
    this.records.set(grant.sessionId, {
      grant,
      imageCalls: 0,
      imageSearchCalls: 0,
      actions: {
        transcription: actions.transcription!,
        "candidate-analysis": actions["candidate-analysis"]!,
        "visual-plan": actions["visual-plan"]!,
        render: actions.render!,
      },
    });
    this.grantTimes.push(issuedAtMs);
    return { cookie: this.codec.encode(grant), grant };
  }
  private current(context: AdmissionContext): GrantRecord {
    this.origin(context.origin, context.fetchSite);
    this.sweep();
    const grant = this.codec.decode(context.cookie);
    if (!equalToken(context.csrf, grant.csrf))
      this.reject("ABUSE_CHECK_FAILED");
    const record = this.records.get(grant.sessionId);
    if (!record || !equalToken(record.grant.csrf, grant.csrf))
      this.reject("SESSION_INVALID");
    if (context.signal.aborted) this.reject("CLIENT_ABORTED");
    return record;
  }

  async run<T>(
    context: AdmissionContext,
    input: ActionInput,
    validate: (bytes: Uint8Array) => void,
    dispatch: (
      signal: AbortSignal,
      options: { maxCalls: 1; automaticRetries: 0 },
    ) => Promise<T>,
  ): Promise<T> {
    const record = this.current(context);
    if (!this.policy.paidEnabled) this.reject("PAID_DEMO_DISABLED");
    if (
      !processingActionSchema.safeParse(input.action).success ||
      !input.allowedContentTypes.includes(input.contentType)
    )
      this.reject("UNSUPPORTED_CONTENT_TYPE");
    if (
      !Number.isSafeInteger(input.maxBytes) ||
      input.maxBytes <= 0 ||
      input.bytes.byteLength === 0 ||
      input.bytes.byteLength > input.maxBytes
    )
      this.reject("REQUEST_TOO_LARGE");
    if (input.turnstileToken.length < 1 || input.turnstileToken.length > 2048)
      this.reject("ABUSE_CHECK_FAILED");
    const action = record.actions[input.action];
    const digest = createHash("sha256")
      .update(input.action)
      .update("\0")
      .update(input.contentType)
      .update("\0")
      .update(input.bytes)
      .digest("hex");
    if (action.state !== "available")
      this.reject(
        action.digest === digest ? "ACTION_IN_PROGRESS" : "STALE_REVISION",
      );
    if (this.active >= this.policy.maxConcurrent) this.reject("CAPACITY_FULL");
    if (this.dispatches >= this.policy.maxDispatches)
      this.reject("PROVIDER_BUDGET_EXHAUSTED");
    validate(input.bytes);
    // Synchronous claim happens before the first await, including abuse verification.
    action.state = "reserved";
    action.digest = digest;
    const controller = new AbortController();
    action.controller = controller;
    this.active++;
    const uncertain = () => {
      if (action.state !== "canceled") action.state = "uncertain";
    };
    let rejectAbort: (reason: unknown) => void = () => {};
    const abortError = () =>
      new ApplicationError({
        code:
          controller.signal.reason instanceof DOMException &&
          controller.signal.reason.name === "TimeoutError"
            ? "REQUEST_TIMEOUT"
            : "CLIENT_ABORTED",
      });
    const abort = () => rejectAbort(abortError());
    const aborted = new Promise<never>((_, reject) => {
      rejectAbort = reject;
      controller.signal.addEventListener("abort", abort, { once: true });
    });
    const cancel = () => controller.abort(context.signal.reason);
    context.signal.addEventListener("abort", cancel, { once: true });
    const timer = setTimeout(
      () =>
        controller.abort(
          new DOMException("Processing deadline elapsed", "TimeoutError"),
        ),
      this.policy.timeoutMs,
    );
    if (context.signal.aborted) cancel();
    const checkExecution = () => {
      if (controller.signal.aborted) throw abortError();
      const time = this.now();
      if (time < record.grant.issuedAtMs) this.reject("SESSION_INVALID");
      if (time >= record.grant.expiresAtMs) this.reject("SESSION_EXPIRED");
    };
    const execution = (async () => {
      try {
        if (controller.signal.aborted) throw abortError();
        if (
          !(await this.abuse.verify({
            token: input.turnstileToken,
            action: input.action,
            sessionId: record.grant.sessionId,
            signal: controller.signal,
          }))
        )
          this.reject("ABUSE_CHECK_FAILED");
        checkExecution();
        if (this.dispatches >= this.policy.maxDispatches)
          this.reject("PROVIDER_BUDGET_EXHAUSTED");
        action.state = "running";
        this.dispatches++;
        const result = await dispatch(controller.signal, {
          maxCalls: 1,
          automaticRetries: 0,
        });
        checkExecution();
        action.state = "completed";
        return result;
      } catch (error) {
        uncertain();
        throw error;
      } finally {
        this.active--;
        action.controller = null;
        clearTimeout(timer);
        context.signal.removeEventListener("abort", cancel);
        controller.signal.removeEventListener("abort", abort);
      }
    })();
    try {
      return await Promise.race([execution, aborted]);
    } catch (error) {
      uncertain();
      throw error;
    }
  }

  reserveImageCall(
    context: AdmissionContext,
    purpose: "generate" | "search" = "generate",
  ): void {
    const record = this.current(context),
      action = record.actions["visual-plan"];
    if (
      !this.policy.paidEnabled ||
      action.state !== "running" ||
      !action.controller ||
      action.controller.signal.aborted
    )
      this.reject("FEATURE_DISABLED");
    if (
      (purpose === "search" ? record.imageSearchCalls : record.imageCalls) >=
        ASSEMBLY_LIMITS.maxGeneratedImageCalls ||
      this.dispatches >= this.policy.maxDispatches
    )
      this.reject("PROVIDER_BUDGET_EXHAUSTED");
    // A failed/uncertain provider attempt is consumed before its first await.
    if (purpose === "search") record.imageSearchCalls++;
    else record.imageCalls++;
    this.dispatches++;
  }

  session(context: AdmissionContext): ProcessingGrant {
    return this.current(context).grant;
  }
  restoreSession(context: Omit<AdmissionContext, "csrf">): ProcessingGrant {
    const grant = this.codec.decode(context.cookie);
    return this.current({ ...context, csrf: grant.csrf }).grant;
  }

  completedReceipt(
    context: AdmissionContext,
    actionName: ProcessingAction,
    sourceRevision: string,
    resultDigest: string,
  ): string {
    const { grant, actions } = this.current(context);
    const action = actions[actionName];
    return this.receipt({
      version: 1,
      bootEpoch: grant.bootEpoch,
      sessionId: grant.sessionId,
      action: actionName,
      nonce: action.nonce,
      sourceRevision,
      requestDigest: action.digest ?? "",
      resultDigest,
      expiresAtMs: grant.expiresAtMs,
    });
  }

  clear(context: AdmissionContext): void {
    const record = this.current(context);
    for (const action of Object.values(record.actions)) {
      action.state = "canceled";
      action.controller?.abort();
    }
  }

  exit(context: AdmissionContext): void {
    const record = this.current(context);
    this.clear(context);
    this.records.delete(record.grant.sessionId);
  }

  receipt(claims: IntegrityReceiptClaims): string {
    const parsed = integrityReceiptClaimsSchema.parse(claims);
    const record = this.records.get(parsed.sessionId);
    const action = record?.actions[parsed.action];
    if (
      !record ||
      parsed.bootEpoch !== this.codec.bootEpoch ||
      parsed.expiresAtMs !== record.grant.expiresAtMs ||
      record.grant.issuedAtMs > this.now() ||
      parsed.expiresAtMs <= this.now() ||
      action?.state !== "completed" ||
      parsed.nonce !== action.nonce ||
      parsed.requestDigest !== action.digest
    )
      this.reject("SESSION_INVALID");
    const payload = Buffer.from(JSON.stringify(parsed)).toString("base64url");
    return `${payload}.${createHmac("sha256", this.receiptKey).update(payload).digest("base64url")}`;
  }
  verifyReceipt(receipt: string): IntegrityReceiptClaims {
    try {
      if (receipt.length > 4096) throw new Error();
      const parts = receipt.split(".");
      if (
        parts.length !== 2 ||
        !equalToken(
          parts[1]!,
          createHmac("sha256", this.receiptKey)
            .update(parts[0]!)
            .digest("base64url"),
        )
      )
        throw new Error();
      const claims = integrityReceiptClaimsSchema.parse(
        JSON.parse(Buffer.from(parts[0]!, "base64url").toString("utf8")),
      );
      if (
        claims.bootEpoch !== this.codec.bootEpoch ||
        claims.expiresAtMs <= this.now()
      )
        throw new Error();
      const record = this.records.get(claims.sessionId);
      const action = record?.actions[claims.action];
      if (
        !record ||
        record.grant.issuedAtMs > this.now() ||
        action?.state !== "completed" ||
        action.nonce !== claims.nonce ||
        action.digest !== claims.requestDigest ||
        record.grant.expiresAtMs !== claims.expiresAtMs
      )
        throw new Error();
      return claims;
    } catch {
      return this.reject("SESSION_INVALID");
    }
  }
}
