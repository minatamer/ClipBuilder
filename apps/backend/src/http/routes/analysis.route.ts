import { Router, json } from "express";
import {
  GROUNDED_ANALYSIS_LIMITS,
  TEMPORARY_MEDIA_LIMITS,
  processingGrantRequestSchema,
  processingGrantResponseSchema,
  sourceAnalysisUploadSchema,
  sourceAnalysisRequestSchema,
  selectedAssemblyRequestSchema,
  finalRenderRequestSchema,
} from "@clipbuilder/contracts";
import type {
  ProcessingAdmission,
  AdmissionContext,
} from "../../admission/processing.admission.js";
import type { SourceAnalysis } from "../../analysis/analysis.usecase.js";
import type { SelectedAssembly } from "../../assembly/selected-assembly.usecase.js";
import type { PreviewPlayback } from "../../media/preview-playback.js";
import type { FinalRender } from "../../render/final-render.usecase.js";
import type { OutputDelivery } from "../../media/output-delivery.js";
import { ApplicationError } from "../errorMapper.js";
import { sendNoStoreJson } from "../response.js";

const cookieName = "__Host-clipping_session";
export function createAnalysisRouter(
  admission: ProcessingAdmission,
  analysis: SourceAnalysis,
  origins: readonly string[],
  assembly: SelectedAssembly | null = null,
  preview: PreviewPlayback | null = null,
  render: FinalRender | null = null,
  output: OutputDelivery | null = null,
): Router {
  const router = Router();
  router.use((request, response, next) => {
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
    const controller = new AbortController(),
      abort = () => {
        if (!response.writableEnded) controller.abort();
      };
    const timer = setTimeout(() => {
      controller.abort();
      request.destroy();
    }, TEMPORARY_MEDIA_LIMITS.workDeadlineMs);
    const bodyTimer = setTimeout(() => {
      controller.abort();
      request.destroy();
    }, 5000);
    response.locals.analysisBodyTimer = bodyTimer;
    response.locals.analysisSignal = controller.signal;
    response.once("close", () => {
      abort();
      clearTimeout(timer);
      clearTimeout(bodyTimer);
    });
    next();
  });
  router.use((request, response, next) => {
    const assembling =
      request.method === "POST" &&
      [
        "/assemble",
        "/preview",
        "/render",
        "/render-result",
        "/output",
      ].includes(request.path);
    if (assembling) {
      if (!assembly) throw new ApplicationError({ code: "FEATURE_DISABLED" });
      admission.session(context(request, response));
    }
    json({
      limit: assembling
        ? GROUNDED_ANALYSIS_LIMITS.responseBytes
        : GROUNDED_ANALYSIS_LIMITS.requestBytes,
      strict: true,
    })(request, response, next);
  });
  router.use((_request, response, next) => {
    clearTimeout(response.locals.analysisBodyTimer);
    next();
  });
  function context(
    request: import("express").Request,
    response: import("express").Response,
  ): AdmissionContext {
    const cookies = (request.get("Cookie") ?? "")
      .split(";")
      .map((v) => v.trim())
      .filter((v) => v.startsWith(`${cookieName}=`));
    if (cookies.length !== 1 || cookies[0]!.length > 8192)
      throw new ApplicationError({ code: "SESSION_MISSING" });
    return {
      cookie: cookies[0]!.slice(cookieName.length + 1),
      origin: request.get("Origin")!,
      fetchSite: request.get("Sec-Fetch-Site")!,
      csrf: request.get("X-CSRF-Token") ?? "",
      signal: response.locals.analysisSignal,
    };
  }
  router.post("/grant", (request, response) => {
    if (!processingGrantRequestSchema.safeParse(request.body).success)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    if (request.get("Cookie")?.includes(`${cookieName}=`))
      throw new ApplicationError({ code: "ACTIVE_SESSION_EXISTS" });
    const result = admission.issue(
      request.get("Origin")!,
      request.get("Sec-Fetch-Site")!,
    );
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
  });
  router.post("/upload", async (request, response) => {
    const parsed = sourceAnalysisUploadSchema.safeParse(request.body);
    if (!parsed.success)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    sendNoStoreJson(
      response,
      201,
      await analysis.upload(context(request, response), parsed.data),
    );
  });
  router.post("/session", (request, response) => {
    const grant = admission.restoreSession(context(request, response));
    sendNoStoreJson(
      response,
      200,
      processingGrantResponseSchema.parse({
        sessionId: grant.sessionId,
        csrfToken: grant.csrf,
        expiresAtMs: grant.expiresAtMs,
      }),
    );
  });
  router.post("/run", async (request, response) => {
    const parsed = sourceAnalysisRequestSchema.safeParse(request.body);
    if (!parsed.success)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    sendNoStoreJson(
      response,
      200,
      await analysis.analyze(context(request, response), parsed.data),
    );
  });
  router.post("/clear", async (request, response) => {
    preview?.clear(context(request, response));
    output?.clear(context(request, response));
    await analysis.clear(context(request, response));
    response.clearCookie(cookieName, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });
    response.status(204).end();
  });
  router.post("/assemble", async (request, response) => {
    const parsed = selectedAssemblyRequestSchema.safeParse(request.body);
    if (!parsed.success || !assembly)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    sendNoStoreJson(
      response,
      200,
      await assembly.run(context(request, response), parsed.data),
    );
  });
  router.post("/preview", async (request, response) => {
    if (!preview) throw new ApplicationError({ code: "FEATURE_DISABLED" });
    sendNoStoreJson(
      response,
      200,
      await preview.open(context(request, response), request.body),
    );
  });
  router.get("/preview", async (request, response) => {
    if (!preview) throw new ApplicationError({ code: "FEATURE_DISABLED" });
    await preview.stream(
      context(request, response),
      request.get("Range"),
      response,
      (status, headers) => {
        response.status(status).set(headers);
      },
    );
  });
  router.post("/render", async (request, response) => {
    if (!render) throw new ApplicationError({ code: "FEATURE_DISABLED" });
    const parsed = finalRenderRequestSchema.safeParse(request.body);
    if (!parsed.success)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    sendNoStoreJson(
      response,
      200,
      await render.run(context(request, response), parsed.data),
    );
  });
  router.post("/render-result", async (request, response) => {
    if (!render) throw new ApplicationError({ code: "FEATURE_DISABLED" });
    sendNoStoreJson(
      response,
      200,
      await render.restore(context(request, response), request.body),
    );
  });
  router.post("/output", async (request, response) => {
    if (!output) throw new ApplicationError({ code: "FEATURE_DISABLED" });
    sendNoStoreJson(
      response,
      200,
      await output.open(context(request, response), request.body),
    );
  });
  for (const path of ["/output", "/download"])
    router.get(path, async (request, response) => {
      if (!output) throw new ApplicationError({ code: "FEATURE_DISABLED" });
      await output.stream(
        context(request, response),
        request.get("Range"),
        response,
        (status, headers) => {
          response.status(status).set(headers);
        },
        path === "/download",
      );
    });
  return router;
}
