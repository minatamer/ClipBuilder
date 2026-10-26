import { expect, it, vi } from "vitest";
import request from "supertest";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { z } from "zod";
import {
  createHostedEditingWorkflow,
  EDITING_CSRF_COOKIE,
} from "./hosted-workflow.ts";
import { HostedUpload } from "./hosted-upload.ts";
import { LocalDiagnostics } from "./diagnostics.ts";

const hostFailure = vi.hoisted(() => ({ remaining: 0, closes: 0 }));
vi.mock("./server.ts", async (original) => {
  const serverModule = await original<typeof import("./server.ts")>();
  return {
    ...serverModule,
    createOwnerHost(
      options: Parameters<typeof serverModule.createOwnerHost>[0],
    ) {
      const host = serverModule.createOwnerHost(options);
      return {
        ...host,
        async close() {
          hostFailure.closes++;
          if (hostFailure.remaining-- > 0)
            throw Object.assign(new Error("synthetic_host_close_failure"), {
              code: "EIO",
            });
          await host.close();
        },
      };
    },
  };
});

it("discards an independent staged upload when host close fails and retries host recovery without metered work", async () => {
  const root = await mkdtemp(
    join(tmpdir(), "clipbuilder-hosted-cleanup-test-"),
  );
  let now = 1000;
  const media = vi.fn(),
    providers = vi.fn(() => ({}));
  const discard = vi.spyOn(HostedUpload.prototype, "discard");
  const lines: string[] = [];
  const origin = "https://frontend.run.app";
  const flow = createHostedEditingWorkflow({
    root,
    origin,
    ttlMs: 5000,
    now: () => now,
    aiMode: "synthetic-ai",
    siteKey: "synthetic-site-key",
    sourceLimits: { bytes: 100, durationMs: 60_000 },
    abuse: { verify: async () => true },
    capacity: async () => {},
    media,
    providers,
    diagnostics: new LocalDiagnostics((line) => lines.push(line)),
  });
  const app = createServer((req, res) => {
    void flow.dispatch(req, res);
  });
  try {
    const started = await request(app)
      .post("/session")
      .set({ Origin: origin, "Sec-Fetch-Site": "same-origin" })
      .send({ startNonce: randomUUID(), turnstileToken: "synthetic-proof" });
    expect(started.status).toBe(201);
    const cookies = z
      .array(z.string())
      .parse(started.headers["set-cookie"])
      .map((value) => value.split(";")[0]!);
    const csrf = cookies
      .find((value) => value.startsWith(EDITING_CSRF_COOKIE + "="))!
      .split("=")[1]!;
    const headers = {
      Origin: origin,
      "Sec-Fetch-Site": "same-origin",
      Cookie: cookies.join("; "),
      "X-CSRF-Token": csrf,
    };
    expect(
      (await request(app).post("/upload").set(headers).send({ bytes: 9 }))
        .status,
    ).toBe(201);
    expect(await readdir(root)).toHaveLength(1);
    discard.mockClear();
    hostFailure.closes = 0;
    hostFailure.remaining = 1;
    now = 7000;
    expect((await request(app).get("/session").set(headers)).body).toEqual({
      active: false,
    });
    await vi.waitFor(() => expect(discard).toHaveBeenCalledTimes(1));
    await vi.waitFor(async () => expect(await readdir(root)).toEqual([]), {
      timeout: 5000,
    });
    expect(hostFailure.closes).toBe(1);
    expect(
      lines.some(
        (line) =>
          line.includes('"operation":"cleanup"') &&
          line.includes('"systemCode":"EIO"'),
      ),
    ).toBe(true);
    expect(lines.join("\n")).not.toContain("synthetic_host_close_failure");
    // Once failed cleanup settles, the next sweep retries retained host ownership.
    await new Promise<void>((resolve) => setImmediate(resolve));
    await request(app).get("/session").set(headers);
    await vi.waitFor(() => expect(hostFailure.closes).toBe(2));
    expect(media).not.toHaveBeenCalled();
    expect(providers).toHaveBeenCalledTimes(1);
  } finally {
    hostFailure.remaining = 0;
    await flow.close();
    discard.mockRestore();
    expect(await readdir(root)).toEqual([]);
    await rm(root, { recursive: true, force: true });
  }
});
