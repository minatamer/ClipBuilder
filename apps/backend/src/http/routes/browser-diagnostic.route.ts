import { Router, json } from "express";
import {
  browserDiagnosticSchema,
  BROWSER_DIAGNOSTIC_LIMITS,
} from "@clipbuilder/contracts";
import type { AnalysisDiagnostics } from "../../analysis/analysis.diagnostics.js";
import { ApplicationError } from "../errorMapper.js";

export function createBrowserDiagnosticRouter(
  allowedOrigins: readonly string[],
  diagnostics: AnalysisDiagnostics,
  now = Date.now,
): Router {
  const router = Router();
  let windowStart = now(),
    requests = 0;
  router.post(
    "/",
    (request, response, next) => {
      if (
        !allowedOrigins.includes(request.get("Origin") ?? "") ||
        request.get("Sec-Fetch-Site") !== "same-origin" ||
        !request.is("application/json") ||
        (request.get("Content-Encoding") ?? "identity") !== "identity"
      )
        return next(new ApplicationError({ code: "INVALID_REQUEST" }));
      const time = now();
      if (time < windowStart || time - windowStart >= 60000) {
        windowStart = time;
        requests = 0;
      }
      if (requests >= BROWSER_DIAGNOSTIC_LIMITS.requestsPerMinute)
        return next(new ApplicationError({ code: "RATE_LIMITED" }));
      requests++;
      diagnostics.request(
        String(response.locals.requestId),
        "diagnostics",
        (finish) => {
          response.once("finish", () =>
            finish("completed", response.statusCode),
          );
          response.once("close", () =>
            finish("disconnected", response.statusCode),
          );
          next();
        },
      );
    },
    json({ limit: BROWSER_DIAGNOSTIC_LIMITS.requestBytes, strict: true }),
    (request, response) => {
      const record = browserDiagnosticSchema.safeParse(request.body);
      if (!record.success)
        throw new ApplicationError({ code: "INVALID_REQUEST" });
      diagnostics.browser(record.data);
      response.status(204).end();
    },
  );
  return router;
}
