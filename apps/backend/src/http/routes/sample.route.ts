import {
  analysisIdSchema,
  analysisRequestSchema,
  assemblyIdSchema,
  assemblyRequestSchema,
  operationIdSchema,
  renderRequestSchema,
  uploadAuthorizeRequestSchema,
  uploadCompleteRequestSchema,
  startSessionRequestSchema,
} from "@clipbuilder/contracts";
import { Router, type Request } from "express";

import {
  SampleSession,
  SampleSessionFailure,
} from "../../demo/sampleSession.js";
import { ApplicationError } from "../errorMapper.js";
import { sendNoStoreJson } from "../response.js";

const COOKIE_NAME = "clipbuilder_fixture";

function token(request: Request): string | null {
  const cookies = request.headers.cookie?.split(";") ?? [];
  const value = cookies
    .map((cookie) => cookie.trim().split("="))
    .find(([name]) => name === COOKIE_NAME)?.[1];
  return value !== undefined && /^[a-f0-9]{32}$/u.test(value) ? value : null;
}

export function createSampleRouter(
  sample: SampleSession,
  allowedOrigin: string,
): Router {
  const router = Router();
  router.use((request, _response, next) => {
    if (
      request.headers.origin !== allowedOrigin ||
      request.headers["sec-fetch-site"] === "cross-site"
    ) {
      next(new ApplicationError({ code: "ABUSE_CHECK_FAILED" }));
      return;
    }
    next();
  });
  router.post("/sessions", (request, response) => {
    const parsed = startSessionRequestSchema.safeParse(request.body);
    if (!parsed.success)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    const started = sample.start(token(request), parsed.data.mode);
    response.cookie(COOKIE_NAME, started.token, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 7_200_000,
    });
    sendNoStoreJson(response, 201, started.response);
  });
  router.get("/session", (request, response) => {
    sendNoStoreJson(response, 200, sample.evidence(token(request)));
  });
  router.get("/analysis/:analysisId", (request, response) => {
    const parsed = analysisIdSchema.safeParse(request.params.analysisId);
    if (!parsed.success)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    sendNoStoreJson(
      response,
      200,
      sample.analysis(token(request), parsed.data),
    );
  });
  router.post("/assemble", (request, response) => {
    const parsed = assemblyRequestSchema.safeParse(request.body);
    if (!parsed.success)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    sendNoStoreJson(response, 202, sample.build(token(request), parsed.data));
  });
  router.post("/upload/authorize", (request, response) => {
    const parsed = uploadAuthorizeRequestSchema.safeParse(request.body);
    if (!parsed.success)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    sendNoStoreJson(
      response,
      200,
      sample.authorize(token(request), parsed.data),
    );
  });
  router.post("/upload/complete", (request, response) => {
    const parsed = uploadCompleteRequestSchema.safeParse(request.body);
    if (!parsed.success)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    sendNoStoreJson(
      response,
      202,
      sample.completeUpload(
        token(request),
        parsed.data.uploadId,
        parsed.data.observedBytes,
      ),
    );
  });
  router.post("/analyze", (request, response) => {
    const parsed = analysisRequestSchema.safeParse(request.body);
    if (!parsed.success)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    sendNoStoreJson(
      response,
      202,
      sample.analyze(token(request), parsed.data.mediaId),
    );
  });
  router.get("/operations/:operationId", async (request, response) => {
    const parsed = operationIdSchema.safeParse(request.params.operationId);
    if (!parsed.success)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    sendNoStoreJson(
      response,
      200,
      await sample.poll(token(request), parsed.data),
    );
  });
  router.get("/assembly/:assemblyId", (request, response) => {
    const parsed = assemblyIdSchema.safeParse(request.params.assemblyId);
    if (!parsed.success)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    sendNoStoreJson(
      response,
      200,
      sample.assembly(token(request), parsed.data),
    );
  });
  router.post("/render", (request, response) => {
    const parsed = renderRequestSchema.safeParse(request.body);
    if (!parsed.success)
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    sendNoStoreJson(response, 202, sample.render(token(request), parsed.data));
  });
  router.post("/clear", (request, response) => {
    sample.clear(token(request));
    response.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
    });
    response.status(204).setHeader("Cache-Control", "no-store").end();
  });
  router.use(
    (
      error: unknown,
      _request: Request,
      _response: unknown,
      next: (error: unknown) => void,
    ) => {
      next(
        error instanceof SampleSessionFailure
          ? new ApplicationError({ code: error.code })
          : error,
      );
    },
  );
  return router;
}
