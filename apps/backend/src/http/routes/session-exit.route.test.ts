import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createSessionExitRouter } from "./session-exit.route.js";
import { mapError } from "../errorMapper.js";

const origin = "http://localhost:3000";
function fixture(cleanup = vi.fn(async () => {})) {
  const app = express();
  app.use("/v1/session", createSessionExitRouter([origin], cleanup));
  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction,
    ) => {
      void _next;
      const mapped = mapError(error, `req_${"0".repeat(32)}`);
      response.status(mapped.status).json({ error: mapped.error });
    },
  );
  const post = () =>
    request(app).post("/v1/session/exit").set({
      Origin: origin,
      "Sec-Fetch-Site": "same-origin",
      Cookie: "__Host-clipping_session=synthetic",
    });
  return { app, post, cleanup };
}
describe("quiet session exit", () => {
  it("acknowledges exit while deletion remains pending and swallows its failure", async () => {
    let reject = (error: Error) => {
      void error;
    };
    const pending = new Promise<void>((_resolve, fail) => {
      reject = fail;
    });
    const f = fixture(vi.fn(() => pending));
    const response = await f.post().send({}).expect(204);
    expect(response.headers["set-cookie"]).toHaveLength(2);
    expect(response.headers["set-cookie"]?.[0]).toContain("Secure");
    expect(f.cleanup).toHaveBeenCalledWith("synthetic", origin);
    reject(new Error("deletion-unavailable"));
    await pending.catch(() => undefined);
  });
  it("accepts missing and stale cookies, but rejects unsafe requests without cleanup", async () => {
    const f = fixture();
    await f.post().unset("Cookie").send({}).expect(204);
    expect(f.cleanup).not.toHaveBeenCalled();
    await f
      .post()
      .set("Origin", "https://untrusted.example.test")
      .send({})
      .expect(403);
    await f.post().send({ session: "untrusted" }).expect(400);
    await f.post().set("Content-Type", "text/plain").send("{}").expect(415);
    expect(f.cleanup).not.toHaveBeenCalled();
  });
});
