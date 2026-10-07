import { afterEach, describe, expect, it, vi } from "vitest";
import { PUBLIC_LIMITS } from "@clipbuilder/contracts";
import {
  CLOUD_UPLOAD_CHUNK_BYTES as CHUNK,
  CLOUD_UPLOAD_REQUEST_TIMEOUT_MS,
  transferCloudUpload,
} from "./cloud-upload";
import { createSourceAnalysisApi } from "./source-analysis.api";

function incomplete(offset: number | null) {
  return new Response(null, {
    headers: {
      "X-HTTP-Status-Code-Override": "308",
      ...(offset === null ? {} : { Range: `bytes=0-${offset - 1}` }),
    },
  });
}
function complete(size: number) {
  return Response.json({ generation: "12", size: String(size) });
}
function fixture(size = CHUNK * 2 + 7) {
  const controller = new AbortController();
  const transport = vi.fn<typeof fetch>();
  const progress = vi.fn();
  const diagnostic = vi.fn();
  const input = {
    admitted: {
      uploadUrl:
        "https://storage.googleapis.com/upload/storage/v1/b/synthetic/o?upload_id=synthetic",
      expiresAtMs: Date.now() + 600_000,
    },
    file: new Blob([new Uint8Array(size)], { type: "video/mp4" }),
    signal: controller.signal,
    transport,
    progress,
    diagnostic,
  };
  return { input, transport, progress, diagnostic, controller };
}
function offsets(f: ReturnType<typeof fixture>) {
  return f.progress.mock.calls.map(([p]) => p.confirmedBytes);
}
function ranges(f: ReturnType<typeof fixture>) {
  return f.transport.mock.calls.map(([, init]) =>
    new Headers(init?.headers).get("Content-Range"),
  );
}
afterEach(() => vi.useRealTimers());

describe("bounded acknowledged browser upload", () => {
  it("correlates records using only a validated content-free operation ID", async () => {
    for (const operationId of ["op_" + "a".repeat(22), "synthetic-private"]) {
      const f = fixture(7);
      f.transport.mockResolvedValueOnce(complete(7));
      await transferCloudUpload({ ...f.input, operationId });
      for (const [value] of f.diagnostic.mock.calls) {
        expect(value.operationId).toBe(
          operationId.startsWith("op_") ? operationId : undefined,
        );
      }
      expect(JSON.stringify(f.diagnostic.mock.calls)).not.toContain(
        "synthetic-private",
      );
    }
  });
  it("sends sequential slices, reports only confirmed bytes and validates final metadata", async () => {
    const f = fixture();
    f.transport.mockResolvedValueOnce(incomplete(CHUNK));
    f.transport.mockImplementationOnce(async () => {
      expect(offsets(f)).toEqual([0, CHUNK]);
      return incomplete(CHUNK * 2);
    });
    f.transport.mockResolvedValueOnce(complete(f.input.file.size));
    await expect(transferCloudUpload(f.input)).resolves.toBe("12");
    expect(offsets(f)).toEqual([0, CHUNK, CHUNK * 2, f.input.file.size]);
    expect(ranges(f)).toEqual([
      `bytes 0-${CHUNK - 1}/${f.input.file.size}`,
      `bytes ${CHUNK}-${CHUNK * 2 - 1}/${f.input.file.size}`,
      `bytes ${CHUNK * 2}-${f.input.file.size - 1}/${f.input.file.size}`,
    ]);
    expect(
      f.transport.mock.calls.map(([, init]) => (init?.body as Blob).size),
    ).toEqual([CHUNK, CHUNK, 7]);
    for (const [url, init] of f.transport.mock.calls) {
      expect(url).toBe(f.input.admitted.uploadUrl);
      expect(init).toMatchObject({
        method: "PUT",
        credentials: "omit",
        redirect: "error",
        cache: "no-store",
      });
      expect(new Headers(init?.headers).get("X-GUploader-No-308")).toBe("yes");
    }
    expect(f.diagnostic.mock.calls[0]?.[0]).toMatchObject({
      confirmedBytes: CHUNK,
      statusQueries: 0,
      resends: 0,
    });
    expect(JSON.stringify(f.diagnostic.mock.calls)).not.toMatch(
      /https|upload_id|generation|synthetic/,
    );
  });
  it.each([1, CHUNK, CHUNK * 2])(
    "handles %i bytes without an empty extra chunk",
    async (size) => {
      const f = fixture(size);
      if (size > CHUNK) f.transport.mockResolvedValueOnce(incomplete(CHUNK));
      f.transport.mockResolvedValueOnce(complete(size));
      await expect(transferCloudUpload(f.input)).resolves.toBe("12");
      expect(f.transport).toHaveBeenCalledTimes(Math.ceil(size / CHUNK));
      expect(offsets(f).at(-1)).toBe(size);
    },
  );
  it("resends only a partially acknowledged chunk remainder once, without double counting", async () => {
    const f = fixture(CHUNK + 7);
    f.transport.mockResolvedValueOnce(incomplete(CHUNK / 2));
    f.transport.mockResolvedValueOnce(incomplete(CHUNK));
    f.transport.mockResolvedValueOnce(complete(f.input.file.size));
    await transferCloudUpload(f.input);
    expect(ranges(f)[1]).toBe(
      `bytes ${CHUNK / 2}-${CHUNK - 1}/${f.input.file.size}`,
    );
    expect(offsets(f)).toEqual([0, CHUNK / 2, CHUNK, CHUNK + 7]);
    expect(f.diagnostic.mock.calls.at(-1)?.[0]).toMatchObject({
      resends: 1,
      statusQueries: 0,
    });
  });
  it.each(["network", "server"])(
    "queries the same session after an ambiguous %s result",
    async (failure) => {
      const f = fixture(CHUNK + 7);
      if (failure === "network")
        f.transport.mockRejectedValueOnce(new TypeError("synthetic-private"));
      else
        f.transport.mockResolvedValueOnce(new Response(null, { status: 503 }));
      f.transport.mockResolvedValueOnce(incomplete(CHUNK));
      f.transport.mockResolvedValueOnce(complete(f.input.file.size));
      await transferCloudUpload(f.input);
      expect(ranges(f)).toEqual([
        `bytes 0-${CHUNK - 1}/${CHUNK + 7}`,
        `bytes */${CHUNK + 7}`,
        `bytes ${CHUNK}-${CHUNK + 6}/${CHUNK + 7}`,
      ]);
      expect(offsets(f)).toEqual([0, CHUNK, CHUNK + 7]);
      expect(f.transport).toHaveBeenCalledTimes(3);
    },
  );
  it("reconciles a lost final response without resending the source or showing early completion", async () => {
    const f = fixture(7);
    f.transport.mockRejectedValueOnce(new TypeError());
    f.transport.mockImplementationOnce(async () => {
      expect(offsets(f)).toEqual([0]);
      return complete(7);
    });
    await transferCloudUpload(f.input);
    expect(ranges(f)).toEqual(["bytes 0-6/7", "bytes */7"]);
    expect((f.transport.mock.calls[1]?.[1]?.body as Blob).size).toBe(0);
    expect(offsets(f)).toEqual([0, 7]);
  });
  it("permits one resend after a status query confirms zero accepted bytes", async () => {
    const f = fixture(7);
    f.transport.mockRejectedValueOnce(new TypeError());
    f.transport.mockResolvedValueOnce(incomplete(null));
    f.transport.mockResolvedValueOnce(complete(7));
    await transferCloudUpload(f.input);
    expect(offsets(f)).toEqual([0, 7]);
    expect(f.transport).toHaveBeenCalledTimes(3);
  });
  it("reconciles a lost metadata body and fails a refused status query without another data PUT", async () => {
    const f = fixture(7);
    f.transport.mockResolvedValueOnce(
      new Response(
        new ReadableStream({
          start(controller) {
            controller.error(new TypeError());
          },
        }),
      ),
    );
    f.transport.mockResolvedValueOnce(complete(7));
    await expect(transferCloudUpload(f.input)).resolves.toBe("12");
    expect(ranges(f)).toEqual(["bytes 0-6/7", "bytes */7"]);
    const refused = fixture(7);
    refused.transport.mockRejectedValueOnce(new TypeError());
    refused.transport.mockResolvedValueOnce(
      new Response(null, { status: 404 }),
    );
    await expect(transferCloudUpload(refused.input)).rejects.toThrow(
      "cloud-upload-failed",
    );
    expect(refused.transport).toHaveBeenCalledTimes(2);
    expect(offsets(refused)).toEqual([0]);
  });
  it("stops after one status query and one resend if uncertainty repeats", async () => {
    const f = fixture(7);
    f.transport.mockRejectedValueOnce(new TypeError());
    f.transport.mockResolvedValueOnce(incomplete(null));
    f.transport.mockRejectedValueOnce(new TypeError());
    await expect(transferCloudUpload(f.input)).rejects.toThrow(
      "cloud-upload-failed",
    );
    expect(f.transport).toHaveBeenCalledTimes(3);
    expect(offsets(f)).toEqual([0]);
  });
  it("bounds repeated no-progress acknowledgements", async () => {
    const f = fixture(CHUNK * 2 + 7);
    f.transport.mockResolvedValueOnce(incomplete(CHUNK));
    f.transport.mockResolvedValueOnce(incomplete(CHUNK));
    f.transport.mockResolvedValueOnce(incomplete(CHUNK));
    await expect(transferCloudUpload(f.input)).rejects.toThrow(
      "cloud-upload-failed",
    );
    expect(f.transport).toHaveBeenCalledTimes(3);
    expect(offsets(f)).toEqual([0, CHUNK]);
  });
  it.each([
    null,
    "bytes=1-10",
    "bytes=0-9007199254740999",
    `bytes=0-${CHUNK}`,
    "bytes=0--1",
    "garbage",
  ])("rejects missing, malformed or impossible Range %s", async (range) => {
    const f = fixture();
    const response = incomplete(null);
    if (range !== null) response.headers.set("Range", range);
    f.transport.mockResolvedValueOnce(response);
    await expect(transferCloudUpload(f.input)).rejects.toThrow(
      "cloud-upload-failed",
    );
    expect(f.transport).toHaveBeenCalledOnce();
    expect(offsets(f)).toEqual([0]);
  });
  it("rejects regressed status offsets rather than resetting or resending confirmed bytes", async () => {
    const f = fixture();
    f.transport.mockResolvedValueOnce(incomplete(CHUNK));
    f.transport.mockRejectedValueOnce(new TypeError());
    f.transport.mockResolvedValueOnce(incomplete(CHUNK / 2));
    await expect(transferCloudUpload(f.input)).rejects.toThrow(
      "cloud-upload-failed",
    );
    expect(offsets(f)).toEqual([0, CHUNK]);
    expect(f.transport).toHaveBeenCalledTimes(3);
  });
  it.each([
    () => incomplete(7),
    () => Response.json({ generation: "12" }),
    () => Response.json({ generation: "invalid", size: "7" }),
    () => Response.json({ generation: "12", size: "8" }),
    () => new Response("{bad-json"),
    () => new Response("x".repeat(8193)),
    () => new Response(null, { status: 308 }),
    () => new Response(null, { status: 403 }),
    () =>
      new Response(null, {
        status: 302,
        headers: { Location: "https://example.invalid" },
      }),
  ])(
    "does not report 100%% for incomplete or invalid final responses %#",
    async (makeResponse) => {
      const f = fixture(7);
      f.transport.mockResolvedValueOnce(makeResponse());
      await expect(transferCloudUpload(f.input)).rejects.toThrow(
        "cloud-upload-failed",
      );
      expect(f.transport).toHaveBeenCalledOnce();
      expect(offsets(f)).toEqual([0]);
    },
  );
  it("refuses a final response before all bytes have been sent", async () => {
    const f = fixture();
    f.transport.mockResolvedValueOnce(complete(f.input.file.size));
    await expect(transferCloudUpload(f.input)).rejects.toThrow(
      "cloud-upload-failed",
    );
    expect(offsets(f)).toEqual([0]);
  });
  it("rejects invalid inputs and expired capabilities with zero storage requests", async () => {
    for (const change of [
      (f: ReturnType<typeof fixture>) => {
        f.input.admitted.expiresAtMs = Date.now() - 1;
      },
      (f: ReturnType<typeof fixture>) => {
        f.input.admitted.uploadUrl = "https://example.invalid/";
      },
      (f: ReturnType<typeof fixture>) => {
        f.input.file = new Blob([]);
      },
      (f: ReturnType<typeof fixture>) => {
        Object.defineProperty(f.input.file, "size", {
          value: PUBLIC_LIMITS.maxSourceBytes + 1,
        });
      },
    ]) {
      const f = fixture(7);
      change(f);
      await expect(transferCloudUpload(f.input)).rejects.toThrow(
        "cloud-upload-failed",
      );
      expect(f.transport).toHaveBeenCalledTimes(0);
      expect(f.progress).toHaveBeenCalledTimes(0);
    }
  });
  it("bounds request time, reconciles once, and releases timers", async () => {
    vi.useFakeTimers();
    const f = fixture(7);
    f.transport.mockImplementationOnce(() => new Promise(() => {}));
    f.transport.mockResolvedValueOnce(complete(7));
    const pending = transferCloudUpload(f.input);
    await vi.advanceTimersByTimeAsync(CLOUD_UPLOAD_REQUEST_TIMEOUT_MS);
    await expect(pending).resolves.toBe("12");
    expect(f.transport).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not reconcile an expired capability", async () => {
    vi.useFakeTimers();
    const f = fixture(7);
    f.input.admitted.expiresAtMs = Date.now() + 10;
    f.transport.mockImplementationOnce(() => new Promise(() => {}));
    const pending = expect(transferCloudUpload(f.input)).rejects.toThrow(
      "cloud-upload-failed",
    );
    await vi.advanceTimersByTimeAsync(10);
    await pending;
    expect(f.transport).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("aborts during a chunk and discards late responses and their bodies", async () => {
    const f = fixture();
    let release: (response: Response) => void = () => {};
    f.transport.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const pending = expect(transferCloudUpload(f.input)).rejects.toThrow(
      "cloud-upload-failed",
    );
    await vi.waitFor(() => expect(f.transport).toHaveBeenCalledOnce());
    f.controller.abort();
    await pending;
    const cancel = vi.fn();
    release(new Response(new ReadableStream({ cancel })));
    await vi.waitFor(() => expect(cancel).toHaveBeenCalledOnce());
    expect(f.transport.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    expect(offsets(f)).toEqual([0]);
    expect(f.transport).toHaveBeenCalledOnce();
  });
  it("does not start an already cancelled transfer", async () => {
    const f = fixture(7);
    f.controller.abort();
    await expect(transferCloudUpload(f.input)).rejects.toThrow(
      "cloud-upload-failed",
    );
    expect(f.transport).toHaveBeenCalledTimes(0);
    expect(f.progress).toHaveBeenCalledTimes(0);
  });
  it("cancels a hanging final metadata reader and suppresses completion", async () => {
    const f = fixture(7);
    const cancel = vi.fn();
    f.transport.mockResolvedValueOnce(
      new Response(new ReadableStream({ cancel })),
    );
    const pending = expect(transferCloudUpload(f.input)).rejects.toThrow(
      "cloud-upload-failed",
    );
    await vi.waitFor(() => expect(f.transport).toHaveBeenCalledOnce());
    f.controller.abort();
    await pending;
    expect(cancel).toHaveBeenCalledOnce();
    expect(offsets(f)).toEqual([0]);
  });
  it("stops subsequent chunks if the owner cancels after acknowledgement", async () => {
    const f = fixture();
    f.transport.mockResolvedValueOnce(incomplete(CHUNK));
    f.progress.mockImplementation((p) => {
      if (p.confirmedBytes === CHUNK) f.controller.abort();
    });
    await expect(transferCloudUpload(f.input)).rejects.toThrow(
      "cloud-upload-failed",
    );
    expect(f.transport).toHaveBeenCalledOnce();
    expect(offsets(f)).toEqual([0, CHUNK]);
  });
  it("contains errors at the API boundary and treats diagnostic sink failure as nonfatal", async () => {
    const f = fixture(7);
    f.transport.mockResolvedValueOnce(complete(7));
    f.diagnostic.mockImplementation(() => {
      throw new Error("sink-failed");
    });
    await expect(transferCloudUpload(f.input)).resolves.toBe("12");
    f.transport.mockResolvedValueOnce(
      new Response("synthetic-private", { status: 400 }),
    );
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    try {
      await expect(
        createSourceAnalysisApi(f.transport, f.diagnostic).transfer(
          f.input.admitted,
          f.input.file,
          f.input.signal,
        ),
      ).rejects.toThrow("ClipBuilder could not complete the request.");
      expect(JSON.stringify(log.mock.calls)).not.toContain("synthetic-private");
    } finally {
      log.mockRestore();
    }
  });
});
