import { createServer } from "node:http";
import { lookup } from "node:dns/promises";
import { connect, isIP, type Socket } from "node:net";
import { randomBytes, timingSafeEqual } from "node:crypto";

import { OWNER_LIMITS } from "../../../packages/contracts/local/policy.ts";
import { OWNER_ACQUISITION_LIMITS } from "../../../packages/contracts/local/acquisition-profile.ts";

/** A job-scoped CONNECT policy, not an OS sandbox for a trusted executable. */
export function admittedAcquisitionHost(value: string): boolean {
  return (
    value === "www.youtube.com" ||
    value === "youtubei.googleapis.com" ||
    /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.googlevideo\.com$/.test(value)
  );
}

export function publicAcquisitionAddress(value: string): boolean {
  if (isIP(value) === 4) {
    const [a = 0, b = 0, c = 0] = value.split(".").map(Number);
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 &&
        (b === 168 ||
          (b === 0 && (c === 0 || c === 2)) ||
          (b === 88 && c === 99))) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113)
    );
  }
  if (isIP(value) !== 6 || value.includes(".")) return false;
  const sides = value.toLowerCase().split("::");
  const left = sides[0]?.split(":").filter(Boolean) ?? [];
  const right = sides[1]?.split(":").filter(Boolean) ?? [];
  const words = (
    sides.length === 2
      ? [
          ...left,
          ...Array<string>(8 - left.length - right.length).fill("0"),
          ...right,
        ]
      : left
  ).map((part) => parseInt(part, 16));
  const [a = 0, b = 0] = words;
  // Only global unicast, excluding transition/special/documentation ranges.
  return (
    words.length === 8 &&
    a >= 0x2000 &&
    a <= 0x3fff &&
    !(a === 0x2001 && (b <= 0x1ff || b === 0xdb8)) &&
    a !== 0x2002 &&
    !(a === 0x3fff && b <= 0xfff)
  );
}

export type AcquisitionEgressPorts = {
  resolve: (
    host: string,
  ) => Promise<readonly { address: string; family: number }[]>;
  connect: (address: string, family: number) => Socket;
};

const nativePorts: AcquisitionEgressPorts = {
  resolve: (host) => lookup(host, { all: true, verbatim: true }),
  connect: (host, family) => connect({ host, family, port: 443 }),
};

/** No I/O until explicitly called by an admitted acquisition action. */
export async function createAcquisitionEgress(
  signal: AbortSignal,
  ports: AcquisitionEgressPorts = nativePorts,
) {
  signal.throwIfAborted();
  const token = randomBytes(32).toString("hex");
  const authorization = Buffer.from(
    `Basic ${Buffer.from(`owner:${token}`).toString("base64")}`,
  );
  const sockets = new Set<Socket>();
  const tunnels = new Set<Socket>();
  const pending = new Set<Promise<void>>();
  let closing = false;
  let transferred = 0;
  let intervalBytes = 0;
  let intervalAt = Date.now();
  let failure = false;
  const stop = () => {
    closing = true;
    for (const socket of sockets) socket.destroy();
    server.close();
  };
  const server = createServer({ maxHeaderSize: 8192 }, (_req, res) => {
    res.writeHead(405, { Connection: "close" }).end();
  });
  server.requestTimeout = 5000;
  server.headersTimeout = 5000;
  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
    socket.setTimeout(OWNER_ACQUISITION_LIMITS.idleMs, () => socket.destroy());
  });
  server.on("clientError", (_error, socket) => socket.destroy());
  server.on("connect", (req, client, head) => {
    // HTTP server types include Duplex, but this is a plain TCP listener.
    const socket = client as Socket;
    const action = (async () => {
      const supplied = Buffer.from(req.headers["proxy-authorization"] ?? "");
      const match = req.url?.match(/^([a-z0-9.-]+):443$/);
      if (
        closing ||
        signal.aborted ||
        !match?.[1] ||
        head.length ||
        tunnels.size >= OWNER_ACQUISITION_LIMITS.maxConnections ||
        supplied.length !== authorization.length ||
        !timingSafeEqual(supplied, authorization) ||
        !admittedAcquisitionHost(match[1])
      )
        throw new Error("acquisition_egress_denied");
      tunnels.add(socket);
      socket.once("close", () => tunnels.delete(socket));
      let deadline: ReturnType<typeof setTimeout> | undefined;
      const answers = await Promise.race([
        ports.resolve(match[1]),
        new Promise<never>((_resolve, reject) => {
          deadline = setTimeout(
            () => reject(new Error("acquisition_dns_unavailable")),
            5000,
          );
        }),
      ]).finally(() => {
        if (deadline) clearTimeout(deadline);
      });
      if (
        closing ||
        signal.aborted ||
        socket.destroyed ||
        !answers.length ||
        answers.length > 64 ||
        answers.some(
          (answer) =>
            !publicAcquisitionAddress(answer.address) ||
            isIP(answer.address) !== answer.family,
        )
      )
        throw new Error("acquisition_egress_denied");
      const selected = answers[0]!;
      // Pin the checked address directly; do not resolve it again on connect.
      const upstream = ports.connect(selected.address, selected.family);
      sockets.add(upstream);
      upstream.once("close", () => sockets.delete(upstream));
      const finish = () => {
        socket.destroy();
        upstream.destroy();
      };
      socket.once("close", () => upstream.destroy());
      upstream.once("close", () => socket.destroy());
      socket.on("error", finish);
      upstream.on("error", finish);
      upstream.setTimeout(OWNER_ACQUISITION_LIMITS.idleMs, finish);
      const count = (chunk: Buffer) => {
        transferred += chunk.length;
        const now = Date.now();
        if (now - intervalAt >= 1000) {
          intervalAt = now;
          intervalBytes = 0;
        }
        intervalBytes += chunk.length;
        // Includes TLS overhead. Conservative failure never selects lower quality.
        if (
          transferred > OWNER_LIMITS.sourceBytes + 64 * 1024 ** 2 ||
          intervalBytes > OWNER_ACQUISITION_LIMITS.rateBytes
        ) {
          failure = true;
          stop();
        }
      };
      socket.on("data", count);
      upstream.on("data", count);
      upstream.once("connect", () => {
        if (closing || signal.aborted) {
          finish();
          return;
        }
        socket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
        upstream.pipe(socket);
        socket.pipe(upstream);
      });
    })().catch(() => {
      socket.destroy();
    });
    pending.add(action);
    void action.finally(() => pending.delete(action));
  });
  signal.addEventListener("abort", stop, { once: true });
  try {
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => {
        server.off("error", reject);
        resolve();
      });
    });
    signal.throwIfAborted();
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("acquisition_egress_unavailable");
    return {
      proxy: `http://owner:${token}@127.0.0.1:${address.port}`,
      assertHealthy() {
        if (failure || closing || signal.aborted)
          throw new Error("acquisition_egress_unavailable");
      },
      async close() {
        signal.removeEventListener("abort", stop);
        stop();
        await Promise.allSettled([...pending]);
        await new Promise<void>((resolve) => server.close(() => resolve()));
      },
    };
  } catch {
    signal.removeEventListener("abort", stop);
    stop();
    throw new Error("acquisition_egress_unavailable");
  }
}
