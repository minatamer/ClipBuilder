import { createHash, randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { composeBackend } from "../composition.js";
import {
  ProcessingAdmission,
  type AdmissionContext,
  type AdmissionPolicy,
  type ActionInput,
} from "./processing.admission.js";
import { ProcessingGrantCodec } from "./processing.grant.js";

const key = Buffer.alloc(32, 7).toString("base64url");
const keys = { test: key };
const origin = "https://clipbuilder.example.test";
const input: ActionInput = {
  bytes: new Uint8Array([1, 2, 3]),
  contentType: "application/json",
  allowedContentTypes: ["application/json"],
  maxBytes: 10,
  turnstileToken: "synthetic",
  action: "candidate-analysis",
};
function fixture(overrides: Partial<AdmissionPolicy> = {}) {
  let now = 1000;
  const clock = () => now;
  const codec = new ProcessingGrantCodec(
    keys,
    "test",
    randomUUID(),
    clock,
    7200000,
  );
  const policy: AdmissionPolicy = {
    ttlMs: 7200000,
    maxRecords: 8,
    maxConcurrent: 1,
    maxDispatches: 2,
    rateWindowMs: 300000,
    maxGrantsPerWindow: 3,
    allowedOrigins: [origin],
    paidEnabled: true,
    timeoutMs: 1000,
    ...overrides,
  };
  const abuse = { verify: vi.fn(async () => true) };
  const admission = new ProcessingAdmission(
    codec,
    policy,
    abuse,
    clock,
    new Uint8Array(32).fill(2),
  );
  const issued = admission.issue(origin, "same-origin");
  const controller = new AbortController();
  const context: AdmissionContext = {
    cookie: issued.cookie,
    origin,
    fetchSite: "same-origin",
    csrf: issued.grant.csrf,
    signal: controller.signal,
  };
  const calls = {
    transcription: vi.fn(),
    text: vi.fn(async () => "normalized-synthetic-result"),
    image: vi.fn(),
    job: vi.fn(),
    cloud: vi.fn(),
  };
  return {
    admission,
    codec,
    context,
    controller,
    issued,
    abuse,
    calls,
    setTime: (value: number) => {
      now = value;
    },
  };
}
afterEach(() => vi.useRealTimers());
describe("process-lifetime protected admission", () => {
  it("refuses spend if the clock moves behind admission while abuse verification is pending", async () => {
    const f = fixture();
    f.abuse.verify.mockImplementation(async () => {
      f.setTime(0);
      return true;
    });
    await expect(
      f.admission.run(f.context, input, () => {}, f.calls.text),
    ).rejects.toThrow();
    expect(f.calls.text).not.toHaveBeenCalled();
    expect(f.calls.transcription).not.toHaveBeenCalled();
    expect(f.calls.image).not.toHaveBeenCalled();
    expect(f.calls.job).not.toHaveBeenCalled();
    expect(f.calls.cloud).not.toHaveBeenCalled();
  });
  it.each([
    "origin",
    "csrf",
    "fetchSite",
    "size",
    "format",
    "paid",
    "capacity",
    "budget",
    "input",
    "abuse",
    "canceled",
  ])("rejects %s before any provider/job/cloud call", async (kind) => {
    const f = fixture(
      kind === "paid"
        ? { paidEnabled: false }
        : kind === "budget"
          ? { maxDispatches: 0 }
          : kind === "capacity"
            ? { maxConcurrent: 0 }
            : {},
    );
    const context = { ...f.context };
    const body = { ...input };
    if (kind === "origin") context.origin = "https://wrong.example.test";
    if (kind === "csrf") context.csrf = "wrong";
    if (kind === "fetchSite") context.fetchSite = "cross-site";
    if (kind === "size") body.bytes = new Uint8Array(11);
    if (kind === "format") body.contentType = "video/mp4";
    if (kind === "abuse") f.abuse.verify.mockResolvedValue(false);
    if (kind === "canceled") f.controller.abort();
    const validate = () => {
      if (kind === "input") throw new Error("synthetic-rejection");
    };
    await expect(
      f.admission.run(context, body, validate, f.calls.text),
    ).rejects.toThrow();
    for (const call of Object.values(f.calls))
      expect(call).toHaveBeenCalledTimes(0);
    if (!["abuse"].includes(kind))
      expect(f.abuse.verify).toHaveBeenCalledTimes(0);
  });
  it("claims before await and rejects identical/conflicting concurrency without another dispatch", async () => {
    const f = fixture();
    let resolve: (value: string) => void = () => {};
    f.calls.text.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const first = f.admission.run(f.context, input, () => {}, f.calls.text);
    await expect(
      f.admission.run(f.context, input, () => {}, f.calls.text),
    ).rejects.toMatchObject({ code: "ACTION_IN_PROGRESS" });
    await expect(
      f.admission.run(
        f.context,
        { ...input, bytes: new Uint8Array([4]) },
        () => {},
        f.calls.text,
      ),
    ).rejects.toMatchObject({ code: "STALE_REVISION" });
    await vi.waitFor(() => expect(f.calls.text).toHaveBeenCalledTimes(1));
    resolve("result");
    expect(await first).toBe("result");
    expect(f.calls.text).toHaveBeenCalledWith(expect.any(AbortSignal), {
      maxCalls: 1,
      automaticRetries: 0,
    });
    await expect(
      f.admission.run(f.context, input, () => {}, f.calls.text),
    ).rejects.toThrow();
  });
  it("retains tombstones through expiry and never evicts capacity to admit another grant", () => {
    const f = fixture({ maxRecords: 4 });
    f.admission.clear(f.context);
    expect(() => f.admission.issue(origin, "same-origin")).toThrow(
      "CAPACITY_FULL",
    );
    f.setTime(f.issued.grant.expiresAtMs);
    expect(f.admission.issue(origin, "same-origin").grant.sessionId).not.toBe(
      f.issued.grant.sessionId,
    );
    expect(() => f.codec.decode(f.context.cookie)).toThrow("SESSION_INVALID");
  });
  it("invalidates stale, forged, oversized, wrong-key and restart cookies", async () => {
    const f = fixture();
    const restarted = new ProcessingGrantCodec(
      keys,
      "test",
      randomUUID(),
      () => 1000,
      7200000,
    );
    for (const cookie of [
      f.context.cookie + "a",
      "x".repeat(4097),
      f.context.cookie.replace("test.", "missing."),
    ])
      expect(() => f.codec.decode(cookie)).toThrow("SESSION_INVALID");
    expect(() => restarted.decode(f.context.cookie)).toThrow("SESSION_INVALID");
    f.setTime(0);
    await expect(
      f.admission.run(f.context, input, () => {}, f.calls.text),
    ).rejects.toThrow();
    expect(f.calls.text).not.toHaveBeenCalled();
  });
  it.each(["disconnect", "timeout", "clear"])(
    "consumes %s and holds capacity until the underlying transport closes",
    async (kind) => {
      vi.useFakeTimers();
      const f = fixture();
      let resolve: (value: string) => void = () => {};
      f.calls.text.mockImplementation(
        () =>
          new Promise((done) => {
            resolve = done;
          }),
      );
      const result = f.admission.run(f.context, input, () => {}, f.calls.text);
      const rejected = expect(result).rejects.toThrow();
      await Promise.resolve();
      await Promise.resolve();
      expect(f.calls.text).toHaveBeenCalledTimes(1);
      if (kind === "disconnect") f.controller.abort();
      if (kind === "clear") f.admission.clear(f.context);
      if (kind === "timeout") await vi.advanceTimersByTimeAsync(1000);
      await rejected;
      const second = f.admission.issue(origin, "same-origin");
      await expect(
        f.admission.run(
          {
            ...f.context,
            cookie: second.cookie,
            csrf: second.grant.csrf,
            signal: new AbortController().signal,
          },
          input,
          () => {},
          f.calls.text,
        ),
      ).rejects.toThrow("CAPACITY_FULL");
      resolve("lost result");
      await Promise.resolve();
      await Promise.resolve();
      await expect(
        f.admission.run(
          { ...f.context, signal: new AbortController().signal },
          input,
          () => {},
          f.calls.text,
        ),
      ).rejects.toThrow();
      expect(f.calls.text).toHaveBeenCalledTimes(1);
    },
  );
  it("binds integrity receipts to completed action, boot, digests, expiry and clear", async () => {
    const f = fixture();
    await f.admission.run(f.context, input, () => {}, f.calls.text);
    const requestDigest = createHash("sha256")
      .update(input.action)
      .update("\0")
      .update(input.contentType)
      .update("\0")
      .update(input.bytes)
      .digest("hex");
    const claims = {
      version: 1 as const,
      bootEpoch: f.codec.bootEpoch,
      sessionId: f.issued.grant.sessionId,
      action: input.action,
      nonce: f.issued.grant.nonces[input.action],
      sourceRevision: `rev_${"r".repeat(22)}`,
      requestDigest,
      resultDigest: "a".repeat(64),
      expiresAtMs: f.issued.grant.expiresAtMs,
    };
    const receipt = f.admission.receipt(claims);
    expect(f.admission.verifyReceipt(receipt)).toEqual(claims);
    expect(() => f.admission.verifyReceipt(receipt + "x")).toThrow();
    f.admission.clear(f.context);
    expect(() => f.admission.verifyReceipt(receipt)).toThrow();
  });
  it("does not compose protected routes or paid ports by default, and rejects insecure enabled requests", async () => {
    const off = composeBackend({ FAKE_MODE: "true" }).application;
    await request(off).post("/v1/admission/grant").send({}).expect(404);
    const enabled = composeBackend({
      FAKE_MODE: "false",
      PROCESSING_GRANTS_ENABLED: "true",
      PROCESSING_GRANT_ACTIVE_KEY_ID: "test",
      PROCESSING_GRANT_KEYS_JSON: JSON.stringify(keys),
      FRONTEND_ORIGIN: origin,
      CSRF_ALLOWED_ORIGINS: origin,
    }).application;
    await request(enabled)
      .post("/v1/admission/grant")
      .set("Origin", origin)
      .set("Sec-Fetch-Site", "same-origin")
      .set("X-Forwarded-Proto", "https")
      .send({ rightsAcknowledged: true, dataTransferAcknowledged: true })
      .expect(403);
  });
});
