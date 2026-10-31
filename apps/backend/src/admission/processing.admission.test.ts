import { createHash, randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import {
  createLiveValidationEnvironment,
  createLiveValidationConnections,
} from "../../test/environment.fixture.js";
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
  const startInput = () => ({
    origin,
    fetchSite: "same-origin",
    startNonce: randomUUID(),
    turnstileToken: "synthetic-start",
    rightsAcknowledged: true as const,
    dataTransferAcknowledged: true as const,
    signal: new AbortController().signal,
  });
  it("invalid bootstrap proofs consume no genuine grant slots or paid dispatches", async () => {
    const f = fixture({ maxRecords: 32 });
    f.abuse.verify.mockResolvedValue(false);
    for (let i = 0; i < 3; i++)
      await expect(f.admission.start(startInput())).rejects.toThrow(
        "ABUSE_CHECK_FAILED",
      );
    f.abuse.verify.mockResolvedValue(true);
    await f.admission.start(startInput());
    await f.admission.start(startInput());
    await expect(f.admission.start(startInput())).rejects.toThrow(
      "RATE_LIMITED",
    );
    expect(f.abuse.verify).toHaveBeenCalledTimes(5);
    for (const call of Object.values(f.calls))
      expect(call).not.toHaveBeenCalled();
  });
  it("bounds pending bootstrap work and rechecks grant capacity after verification", async () => {
    const f = fixture({ maxRecords: 32 });
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    f.abuse.verify.mockImplementation(async () => {
      await gate;
      return true;
    });
    const first = f.admission.start(startInput()),
      second = f.admission.start(startInput());
    await expect(f.admission.start(startInput())).rejects.toThrow(
      "CAPACITY_FULL",
    );
    expect(f.abuse.verify).toHaveBeenCalledTimes(2);
    f.admission.issue(origin, "same-origin");
    release();
    const settled = await Promise.allSettled([first, second]);
    expect(
      settled.filter((value) => value.status === "fulfilled"),
    ).toHaveLength(1);
    expect(settled.filter((value) => value.status === "rejected")).toHaveLength(
      1,
    );
    for (const call of Object.values(f.calls))
      expect(call).not.toHaveBeenCalled();
  });
  it("cannot allocate a grant when verification finishes after cancellation", async () => {
    const f = fixture({ maxRecords: 32 });
    const controller = new AbortController();
    f.abuse.verify.mockImplementationOnce(async () => {
      controller.abort();
      return true;
    });
    await expect(
      f.admission.start({ ...startInput(), signal: controller.signal }),
    ).rejects.toBeDefined();
    await f.admission.start(startInput());
    await f.admission.start(startInput());
    expect(f.abuse.verify).toHaveBeenCalledTimes(3);
  });
  it("rejects malformed bootstrap binding and untrusted origin before outbound work", async () => {
    const f = fixture({ maxRecords: 32 });
    await expect(
      f.admission.start({ ...startInput(), startNonce: "wrong" }),
    ).rejects.toBeDefined();
    await expect(
      f.admission.start({ ...startInput(), origin: "https://other.test" }),
    ).rejects.toThrow("ABUSE_CHECK_FAILED");
    expect(f.abuse.verify).not.toHaveBeenCalled();
  });
  it("reserves at most three image attempts only inside the running assembly and consumes the process budget", async () => {
    const f = fixture({ maxDispatches: 4 });
    expect(() => f.admission.reserveImageCall(f.context)).toThrow();
    await f.admission.run(
      f.context,
      { ...input, action: "visual-plan" },
      () => {},
      async () => {
        for (let index = 0; index < 3; index++) {
          f.admission.reserveImageCall(f.context);
          f.calls.image();
        }
        expect(() => f.admission.reserveImageCall(f.context)).toThrow();
        return "done";
      },
    );
    expect(f.calls.image).toHaveBeenCalledTimes(3);
    expect(() => f.admission.reserveImageCall(f.context)).toThrow();
    await expect(
      f.admission.run(f.context, input, () => {}, f.calls.text),
    ).rejects.toThrow();
    expect(f.calls.text).not.toHaveBeenCalled();
  });
  it("separately bounds three search and three fallback requests inside the same global budget", async () => {
    const f = fixture({ maxDispatches: 7 });
    expect(() => f.admission.reserveImageCall(f.context, "search")).toThrow();
    await f.admission.run(
      f.context,
      { ...input, action: "visual-plan" },
      () => {},
      async () => {
        for (let index = 0; index < 3; index++)
          f.admission.reserveImageCall(f.context, "search");
        expect(() =>
          f.admission.reserveImageCall(f.context, "search"),
        ).toThrow();
        for (let index = 0; index < 3; index++)
          f.admission.reserveImageCall(f.context);
        expect(() => f.admission.reserveImageCall(f.context)).toThrow();
        return "done";
      },
    );
    await expect(
      f.admission.run(f.context, input, () => {}, f.calls.text),
    ).rejects.toThrow();
    expect(f.calls.text).not.toHaveBeenCalled();
  });
  it("does not reclaim uncertain image spend or dispatch another image after cancellation", async () => {
    const f = fixture({ maxDispatches: 2 });
    await f.admission.run(
      f.context,
      { ...input, action: "visual-plan" },
      () => {},
      async () => {
        f.admission.reserveImageCall(f.context);
        try {
          throw new Error("uncertain provider response");
        } catch {
          /* consumed */
        }
        expect(() => f.admission.reserveImageCall(f.context)).toThrow();
      },
    );
    const replay = vi.fn();
    await expect(
      f.admission.run(
        f.context,
        { ...input, action: "visual-plan" },
        () => {},
        replay,
      ),
    ).rejects.toThrow();
    expect(replay).not.toHaveBeenCalled();
    const canceled = fixture({ maxDispatches: 4 });
    await expect(
      canceled.admission.run(
        canceled.context,
        { ...input, action: "visual-plan" },
        () => {},
        async () => {
          canceled.controller.abort();
          expect(() =>
            canceled.admission.reserveImageCall(canceled.context),
          ).toThrow();
        },
      ),
    ).rejects.toThrow();
  });
  it("refuses spend if the clock moves behind admission while abuse verification is pending", async () => {
    const f = fixture();
    f.abuse.verify.mockImplementation(async () => {
      f.setTime(0);
      return true;
    });
    await expect(
      f.admission.run(f.context, input, () => {}, f.calls.text),
    ).rejects.toMatchObject({ code: "SESSION_INVALID" });
    expect(f.calls.text).not.toHaveBeenCalled();
    expect(f.calls.transcription).not.toHaveBeenCalled();
    expect(f.calls.image).not.toHaveBeenCalled();
    expect(f.calls.job).not.toHaveBeenCalled();
    expect(f.calls.cloud).not.toHaveBeenCalled();
  });
  it("distinguishes session expiry before dispatch and after a consumed dispatch", async () => {
    const before = fixture();
    before.abuse.verify.mockImplementation(async () => {
      before.setTime(before.issued.grant.expiresAtMs);
      return true;
    });
    await expect(
      before.admission.run(before.context, input, () => {}, before.calls.text),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    expect(before.calls.text).not.toHaveBeenCalled();
    const after = fixture();
    after.calls.text.mockImplementation(async () => {
      after.setTime(after.issued.grant.expiresAtMs);
      return "synthetic late result";
    });
    await expect(
      after.admission.run(after.context, input, () => {}, after.calls.text),
    ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    expect(after.calls.text).toHaveBeenCalledOnce();
    await expect(
      after.admission.run(after.context, input, () => {}, after.calls.text),
    ).rejects.toThrow();
    expect(after.calls.text).toHaveBeenCalledOnce();
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
      const rejected = expect(result).rejects.toMatchObject({
        code: kind === "timeout" ? "REQUEST_TIMEOUT" : "CLIENT_ABORTED",
      });
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
    const off = composeBackend({
      FAKE_MODE: "true",
      PAID_DEMO_ENABLED: "false",
    }).application;
    await request(off).post("/v1/admission/grant").send({}).expect(404);
    const enabled = composeBackend({
      ...createLiveValidationEnvironment(),
      ...createLiveValidationConnections(),
      FRONTEND_ORIGIN: origin,
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
