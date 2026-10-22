import { createConnection, createServer, type Socket } from "node:net";
import { once } from "node:events";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  admittedAcquisitionHost,
  createAcquisitionEgress,
  publicAcquisitionAddress,
} from "./acquisition-egress.ts";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});
async function tunnel(proxy: string, authority: string, authorized = true) {
  const address = new URL(proxy);
  const socket = createConnection({
    host: "127.0.0.1",
    port: Number(address.port),
  });
  cleanup.push(async () => {
    socket.destroy();
  });
  await once(socket, "connect");
  socket.write(
    `CONNECT ${authority} HTTP/1.1\r\nHost: ${authority}\r\nProxy-Authorization: Basic ${Buffer.from(authorized ? `${address.username}:${address.password}` : "wrong").toString("base64")}\r\n\r\n`,
  );
  return socket;
}
async function reply(socket: Socket): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("test_socket_timeout")),
      2000,
    );
    socket.once("data", (value) => {
      clearTimeout(timer);
      resolve(value.toString());
    });
    socket.once("close", () => {
      clearTimeout(timer);
      resolve("");
    });
    socket.once("error", () => {
      clearTimeout(timer);
      resolve("");
    });
  });
}

describe("acquisition egress policy", () => {
  it.each([
    "www.youtube.com",
    "youtubei.googleapis.com",
    "rr2---sn-a.googlevideo.com",
  ])("admits required host %s", (host) => {
    expect(admittedAcquisitionHost(host)).toBe(true);
  });
  it.each([
    "youtube.com.evil.test",
    "googlevideo.com",
    "googlevideo.com.evil.test",
    "127.0.0.1",
    "localhost",
    "www.youtube.com.",
    "www.Youtube.com",
    "a.b.googlevideo.com",
    "www.google.com",
  ])("denies broad or malformed host %s", (host) => {
    expect(admittedAcquisitionHost(host)).toBe(false);
  });
  it.each([
    "0.0.0.0",
    "10.2.3.4",
    "100.64.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "172.20.1.1",
    "192.168.1.1",
    "192.0.0.8",
    "192.0.2.1",
    "192.88.99.1",
    "198.19.1.1",
    "198.51.100.1",
    "203.0.113.1",
    "224.0.0.1",
    "255.255.255.255",
    "::",
    "::1",
    "::ffff:8.8.8.8",
    "fc00::1",
    "fe80::1",
    "ff02::1",
    "2001:db8::1",
    "2001:20::1",
    "2002:808:808::1",
    "3fff::1",
  ])("denies reserved address %s", (address) => {
    expect(publicAcquisitionAddress(address)).toBe(false);
  });
  it.each([
    "8.8.8.8",
    "1.1.1.1",
    "2606:4700:4700::1111",
    "2001:4860:4860::8888",
  ])("admits global address %s", (address) => {
    expect(publicAcquisitionAddress(address)).toBe(true);
  });
  it("authenticates before DNS and refuses unsupported authorities", async () => {
    const resolve = vi.fn(async () => [{ address: "8.8.8.8", family: 4 }]);
    const connect = vi.fn<() => Socket>();
    const broker = await createAcquisitionEgress(new AbortController().signal, {
      resolve,
      connect,
    });
    cleanup.push(broker.close);
    for (const [authority, authorized] of [
      ["www.youtube.com:443", false],
      ["www.youtube.com:80", true],
      ["127.0.0.1:443", true],
      ["evil.test:443", true],
    ] as const) {
      expect(
        await reply(await tunnel(broker.proxy, authority, authorized)),
      ).toBe("");
    }
    expect(resolve).not.toHaveBeenCalled();
    expect(connect).not.toHaveBeenCalled();
  });
  it("rejects mixed public/private answers and rechecks DNS for each redirect tunnel", async () => {
    const resolve = vi
      .fn()
      .mockResolvedValueOnce([
        { address: "8.8.8.8", family: 4 },
        { address: "127.0.0.1", family: 4 },
      ])
      .mockResolvedValueOnce([{ address: "::ffff:7f00:1", family: 6 }]);
    const connect = vi.fn<() => Socket>();
    const broker = await createAcquisitionEgress(new AbortController().signal, {
      resolve,
      connect,
    });
    cleanup.push(broker.close);
    expect(await reply(await tunnel(broker.proxy, "www.youtube.com:443"))).toBe(
      "",
    );
    expect(
      await reply(await tunnel(broker.proxy, "rr1.googlevideo.com:443")),
    ).toBe("");
    expect(resolve.mock.calls.map((args) => args[0])).toEqual([
      "www.youtube.com",
      "rr1.googlevideo.com",
    ]);
    expect(connect).not.toHaveBeenCalled();
  });
  it("pins an admitted IP and drains owned tunnels on cancellation", async () => {
    const peer = createServer((socket) => socket.on("error", () => undefined));
    peer.listen(0, "127.0.0.1");
    await once(peer, "listening");
    const port = peer.address();
    if (!port || typeof port === "string") throw new Error("test_unavailable");
    cleanup.push(async () => {
      await new Promise<void>((done) => peer.close(() => done()));
    });
    const controller = new AbortController();
    const connect = vi.fn((address: string, family: number) => {
      expect({ address, family }).toEqual({ address: "8.8.8.8", family: 4 });
      return createConnection({ host: "127.0.0.1", port: port.port });
    });
    const broker = await createAcquisitionEgress(controller.signal, {
      resolve: async () => [{ address: "8.8.8.8", family: 4 }],
      connect,
    });
    cleanup.push(broker.close);
    const client = await tunnel(broker.proxy, "www.youtube.com:443");
    expect(await reply(client)).toContain("200 Connection Established");
    const closed = once(client, "close");
    controller.abort();
    await closed;
    expect(() => broker.assertHealthy()).toThrow(
      "acquisition_egress_unavailable",
    );
    expect(connect).toHaveBeenCalledTimes(1);
  });
});
