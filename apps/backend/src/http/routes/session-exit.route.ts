import { Router, json } from "express";
import { ApplicationError } from "../errorMapper.js";

/** Session exit acknowledges access revocation, never physical deletion. */
export function createSessionExitRouter(
  origins: readonly string[],
  cleanup: (cookie: string, origin: string) => Promise<void>,
  clearFixture: (token: string) => void = () => {},
): Router {
  const router = Router();
  router.post(
    "/exit",
    (request, _response, next) => {
      const origin = request.get("Origin") ?? "";
      const local =
        ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
          request.socket.remoteAddress ?? "",
        ) && origin === "http://localhost:3000";
      if (
        (!request.secure && !local) ||
        !origins.includes(origin) ||
        request.get("Sec-Fetch-Site") !== "same-origin"
      )
        throw new ApplicationError({ code: "ABUSE_CHECK_FAILED" });
      if (
        !request.is("application/json") ||
        (request.get("Content-Encoding") ?? "identity") !== "identity"
      )
        throw new ApplicationError({ code: "UNSUPPORTED_CONTENT_TYPE" });
      next();
    },
    json({ limit: "1kb", strict: true }),
    (request, response) => {
      if (
        !request.body ||
        typeof request.body !== "object" ||
        Array.isArray(request.body) ||
        Object.keys(request.body).length
      )
        throw new ApplicationError({ code: "INVALID_REQUEST" });
      const cookie = (request.get("Cookie") ?? "")
        .split(";")
        .map((value) => value.trim())
        .filter((value) => value.startsWith("__Host-clipping_session="));
      const fixture = (request.get("Cookie") ?? "")
        .split(";")
        .map((value) => value.trim())
        .filter((value) => value.startsWith("clipbuilder_fixture="));
      if (
        fixture.length === 1 &&
        /^clipbuilder_fixture=[a-f0-9]{32}$/.test(fixture[0]!)
      )
        clearFixture(fixture[0]!.slice("clipbuilder_fixture=".length));
      response.clearCookie("__Host-clipping_session", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
      });
      response.clearCookie("clipbuilder_fixture", {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
      });
      // A missing, expired or invalid cookie must not prevent leaving the workflow.
      if (cookie.length === 1 && cookie[0]!.length <= 8192)
        void cleanup(
          cookie[0]!.slice("__Host-clipping_session=".length),
          request.get("Origin")!,
        ).catch(() => undefined);
      response.status(204).end();
    },
  );
  return router;
}
