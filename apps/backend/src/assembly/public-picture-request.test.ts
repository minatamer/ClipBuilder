import { beforeEach, expect, it, vi } from "vitest";
import { EventEmitter } from "node:events";
import {
  IncomingMessage,
  createServer,
  get as httpGet,
  type RequestOptions,
} from "node:http";
import { Socket } from "node:net";
import sharp from "sharp";
const doubles = vi.hoisted(() => ({ lookup: vi.fn(), get: vi.fn() }));
vi.mock("node:dns/promises", () => ({ lookup: doubles.lookup }));
vi.mock("node:https", () => ({ get: doubles.get }));
import { readPublicPicture } from "./public-picture-request.js";
import { WebPictureSource } from "./web-pictures.js";
import type { ExecutionTrace } from "../../../../packages/contracts/local/execution-diagnostics.ts";

beforeEach(() => {
  doubles.lookup.mockReset();
  doubles.get.mockReset();
});
it.each([
  { autoSelectFamily: true, cancel: false },
  { autoSelectFamily: false, cancel: false },
  { autoSelectFamily: true, cancel: true },
])(
  "uses Node's actual client for synthetic download/decode/cancel (%j)",
  async ({ autoSelectFamily, cancel }) => {
    const controller = new AbortController();
    const image = await sharp({
      create: {
        width: 24,
        height: 12,
        channels: 3,
        background: "#128fea",
      },
    })
      .png()
      .toBuffer();
    const answers = [
      { address: "8.8.8.8", family: 4 },
      { address: "2606:4700:4700::1111", family: 6 },
    ];
    doubles.lookup.mockResolvedValue(answers);
    let downloads = 0;
    let closed: Promise<void> | undefined;
    const server = createServer((_request, response) => {
      downloads++;
      closed = new Promise<void>((resolve) => response.once("close", resolve));
      response.writeHead(200, { "Content-Type": "image/png" });
      if (cancel) response.write(image.subarray(0, 4));
      else response.end(image);
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("fake_listener_missing");
    const requestedAll: boolean[] = [];
    doubles.get.mockImplementation(
      (
        url: URL,
        options: RequestOptions,
        callback: (response: IncomingMessage) => void,
      ) => {
        const pinnedLookup = options.lookup;
        if (!pinnedLookup) throw new Error("pinned_lookup_missing");
        // Keep production DNS validation/pinning intact. Only this fake transport
        // maps the checked fixture peers to loopback; the actual Node client still
        // consumes the callback's original single/all shape and family contract.
        return httpGet(
          `http://localhost:${address.port}/image`,
          {
            ...options,
            autoSelectFamily,
            lookup: (_host, lookupOptions, done) => {
              requestedAll.push(lookupOptions.all === true);
              pinnedLookup(
                url.hostname,
                lookupOptions,
                (error, peers, family) => {
                  if (Array.isArray(peers)) {
                    expect(peers).toEqual(answers);
                    done(
                      error,
                      peers.map(() => ({ address: "127.0.0.1", family: 4 })),
                    );
                  } else {
                    expect(peers).toBe(answers[0]!.address);
                    done(error, "127.0.0.1", family);
                  }
                },
              );
            },
          },
          callback,
        );
      },
    );
    try {
      const discover = vi.fn(async () => ({
        candidates: [
          { url: "https://images.example.test/synthetic.png", kind: "image" },
        ],
      }));
      const source = new WebPictureSource(
        discover,
        undefined,
        (url, maxBytes, signal, observed) =>
          readPublicPicture(url, maxBytes, signal, (detail) => {
            observed?.(detail);
            if (
              cancel &&
              detail.phase === "body" &&
              detail.outcome === "started"
            )
              controller.abort();
          }),
      );
      const result = source.find(
        {
          kind: "object",
          brief: {
            scene: "Synthetic image",
            searchQuery: "synthetic",
            requiredTerms: [],
            avoidTerms: [],
          },
        },
        AbortSignal.any([controller.signal, AbortSignal.timeout(3000)]),
      );
      if (cancel) await expect(result).rejects.toThrow();
      else
        await expect(result).resolves.toMatchObject({
          repository: "web",
          width: 24,
          height: 12,
        });
      expect(closed).toBeDefined();
      await closed;
      expect(requestedAll).toEqual([autoSelectFamily]);
      expect(downloads).toBe(1);
      expect(discover).toHaveBeenCalledTimes(1);
      expect(doubles.lookup).toHaveBeenCalledTimes(1);
      expect(doubles.get).toHaveBeenCalledTimes(1);
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  },
);
it("records DNS failure at its origin with the OS code and no hostname", async () => {
  const trace: ExecutionTrace[] = [];
  doubles.lookup.mockRejectedValue(
    Object.assign(Error("private-hostname secret"), { code: "ENOTFOUND" }),
  );
  await expect(
    readPublicPicture(
      new URL("https://private.invalid/image"),
      1024,
      AbortSignal.timeout(1000),
      (entry) => trace.push(entry),
    ),
  ).rejects.toThrow();
  expect(trace.at(-1)).toMatchObject({
    phase: "dns",
    outcome: "failed",
    error: { category: "dns", systemCode: "ENOTFOUND" },
  });
  expect(doubles.get).not.toHaveBeenCalled();
  expect(JSON.stringify(trace)).not.toMatch(/private|secret/u);
});
it("pins checked DNS to each socket and checks a redirect before following it", async () => {
  const trace: ExecutionTrace[] = [];
  const pinned: string[] = [];
  doubles.lookup.mockImplementation(async (host: string) => [
    { address: host === "example.test" ? "8.8.8.8" : "1.1.1.1", family: 4 },
  ]);
  doubles.get.mockImplementation(
    (
      url: URL,
      options: {
        signal: AbortSignal;
        lookup: (
          host: string,
          options: object,
          callback: (error: null, address: string, family: number) => void,
        ) => void;
        headers: Record<string, string>;
      },
      callback: (response: IncomingMessage) => void,
    ) => {
      options.lookup(url.hostname, {}, (_error, address) =>
        pinned.push(address),
      );
      expect(options.headers.Authorization).toBeUndefined();
      const response = new IncomingMessage(new Socket());
      response.statusCode = url.hostname === "example.test" ? 302 : 200;
      response.headers =
        response.statusCode === 302
          ? { location: "https://cdn.example.test/image" }
          : { "content-type": "image/png" };
      response.push(Buffer.from("synthetic"));
      response.push(null);
      callback(response);
      return new EventEmitter();
    },
  );
  expect(
    (
      await readPublicPicture(
        new URL("https://example.test/page"),
        100,
        AbortSignal.timeout(1000),
        (entry) => trace.push(entry),
      )
    ).bytes.toString(),
  ).toBe("synthetic");
  expect(pinned).toEqual(["8.8.8.8", "1.1.1.1"]);
  expect(doubles.get).toHaveBeenCalledTimes(2);
  expect(trace).toContainEqual(
    expect.objectContaining({
      phase: "http",
      outcome: "succeeded",
      httpStatus: 302,
    }),
  );
  expect(trace).toContainEqual(
    expect.objectContaining({
      phase: "body",
      outcome: "succeeded",
      outputBytes: 9,
    }),
  );
  expect(JSON.stringify(trace)).not.toMatch(/example\.test|synthetic/u);
});
it("rejects a redirected private destination without opening its socket", async () => {
  doubles.lookup.mockImplementation(async (host: string) => [
    {
      address: host === "example.test" ? "8.8.8.8" : "169.254.169.254",
      family: 4,
    },
  ]);
  doubles.get.mockImplementation(
    (
      _url: URL,
      _options: unknown,
      callback: (response: IncomingMessage) => void,
    ) => {
      const response = new IncomingMessage(new Socket());
      response.statusCode = 302;
      response.headers = { location: "http://internal.test/private" };
      callback(response);
      return new EventEmitter();
    },
  );
  await expect(
    readPublicPicture(
      new URL("https://example.test/page"),
      100,
      AbortSignal.timeout(1000),
    ),
  ).rejects.toThrow("image_address_blocked");
  expect(doubles.get).toHaveBeenCalledTimes(1);
});
it("blocks mixed public/private DNS answers and bounds the body while closing it", async () => {
  doubles.lookup.mockResolvedValue([
    { address: "8.8.8.8", family: 4 },
    { address: "10.0.0.1", family: 4 },
  ]);
  await expect(
    readPublicPicture(
      new URL("https://example.test/page"),
      1,
      AbortSignal.timeout(1000),
    ),
  ).rejects.toThrow("image_address_blocked");
  expect(doubles.get).not.toHaveBeenCalled();
  doubles.lookup.mockResolvedValue([{ address: "8.8.8.8", family: 4 }]);
  const response = new IncomingMessage(new Socket());
  response.statusCode = 200;
  response.push(Buffer.from("too large"));
  response.push(null);
  doubles.get.mockImplementation(
    (
      _url: URL,
      _options: unknown,
      callback: (response: IncomingMessage) => void,
    ) => {
      callback(response);
      return new EventEmitter();
    },
  );
  await expect(
    readPublicPicture(
      new URL("https://example.test/page"),
      1,
      AbortSignal.timeout(1000),
    ),
  ).rejects.toThrow("image_download_limit");
  expect(response.destroyed).toBe(true);
});
