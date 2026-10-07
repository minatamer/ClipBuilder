import {
  processingGrantRequestSchema,
  processingGrantResponseSchema,
  SESSION_START_REQUEST_BYTES,
} from "@clipbuilder/contracts";
import { Router, json } from "express";
import type { ProcessingAdmission } from "../../admission/processing.admission.js";
import { ApplicationError } from "../errorMapper.js";
import { sendNoStoreJson } from "../response.js";

const cookieName = "__Host-clipping_session";
function cookie(header: string | undefined): string {
  if (!header || header.length > 8192)
    throw new ApplicationError({ code: "SESSION_MISSING" });
  const values = header
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith(`${cookieName}=`));
  if (values.length !== 1)
    throw new ApplicationError({ code: "SESSION_INVALID" });
  return values[0]!.slice(cookieName.length + 1);
}

export function createAdmissionRouter(
  admission: ProcessingAdmission,
  allowedOrigins: readonly string[],
): Router {
  const router = Router();
  router.use((request, response, next) => {
    if (
      (!request.secure && !response.locals.trustedFrontend) ||
      !allowedOrigins.includes(request.get("Origin") ?? "") ||
      !["same-origin", "same-site", "none"].includes(
        request.get("Sec-Fetch-Site") ?? "",
      )
    )
      return next(new ApplicationError({ code: "ABUSE_CHECK_FAILED" }));
    next();
  });
  router.post(
    "/grant",
    json({ limit: SESSION_START_REQUEST_BYTES, strict: true, inflate: false }),
    async (request, response) => {
      const parsed = processingGrantRequestSchema.safeParse(request.body);
      if (!parsed.success)
        throw new ApplicationError({ code: "INVALID_REQUEST" });
      if (request.get("Cookie")?.includes(`${cookieName}=`))
        throw new ApplicationError({ code: "ACTIVE_SESSION_EXISTS" });
      const controller = new AbortController();
      const abort = () => {
        if (!response.writableEnded) controller.abort();
      };
      response.once("close", abort);
      let result;
      try {
        result = await admission.start({
          ...parsed.data,
          origin: request.get("Origin")!,
          fetchSite: request.get("Sec-Fetch-Site")!,
          signal: controller.signal,
        });
      } finally {
        response.off("close", abort);
      }
      response.cookie(cookieName, result.cookie, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: result.grant.expiresAtMs - result.grant.issuedAtMs,
      });
      sendNoStoreJson(
        response,
        201,
        processingGrantResponseSchema.parse({
          sessionId: result.grant.sessionId,
          csrfToken: result.grant.csrf,
          expiresAtMs: result.grant.expiresAtMs,
        }),
      );
    },
  );
  router.post("/clear", (request, response) => {
    const controller = new AbortController();
    admission.clear({
      cookie: cookie(request.get("Cookie")),
      origin: request.get("Origin")!,
      fetchSite: request.get("Sec-Fetch-Site")!,
      csrf: request.get("X-CSRF-Token") ?? "",
      signal: controller.signal,
    });
    response.clearCookie(cookieName, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });
    response.status(204).end();
  });
  return router;
}
