import { randomUUID } from "node:crypto";

import {
  errorEnvelopeSchema,
  publicConfigResponseSchema,
  PUBLIC_LIMITS,
} from "@clipbuilder/contracts";
import express, { type Express } from "express";

import type { BackendConfig } from "./config/env.schema.js";
import { ApplicationError, mapError } from "./http/errorMapper.js";
import { createHealthRouter } from "./http/routes/health.route.js";
import { createSampleRouter } from "./http/routes/sample.route.js";
import { sendNoStoreJson } from "./http/response.js";
import { SampleSession } from "./demo/sampleSession.js";
import { composeAdmission } from "./admission/admission.composition.js";
import { createAdmissionRouter } from "./http/routes/admission.route.js";
import { composeAnalysis } from "./analysis/analysis.composition.js";
import { createSessionExitRouter } from "./http/routes/session-exit.route.js";
import { createAnalysisRouter } from "./http/routes/analysis.route.js";
import { composeRetainedSample } from "./media/retained-sample.gcs.js";
import { createRetainedSampleRouter } from "./http/routes/retained-sample.route.js";
import { AnalysisDiagnostics } from "./analysis/analysis.diagnostics.js";
import { createBrowserDiagnosticRouter } from "./http/routes/browser-diagnostic.route.js";
import {
  GoogleFrontendCaller,
  rejectFrontendCaller,
  type FrontendCallerVerifier,
} from "./http/frontend-caller.js";
import type { IncomingMessage, ServerResponse } from "node:http";

export type LocalWorkflowSlot = {
  current: {
    dispatch: (
      request: IncomingMessage,
      response: ServerResponse,
    ) => Promise<void>;
  } | null;
};

export function createApplication(
  config: BackendConfig,
  diagnostics = new AnalysisDiagnostics(),
  injectedFrontendCaller?: FrontendCallerVerifier,
  localWorkflow?: LocalWorkflowSlot,
  hostedWorkflow?: LocalWorkflowSlot,
): Express {
  const application = express();

  application.disable("x-powered-by");
  application.use((request, response, next) => {
    response.set({
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy":
        "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    });
    if (request.secure)
      response.setHeader("Strict-Transport-Security", "max-age=31536000");
    const requestId = `req_${randomUUID().replaceAll("-", "")}`;
    response.setHeader("X-Request-Id", requestId);
    response.locals.requestId = requestId;
    next();
  });

  application.use("/v1", createHealthRouter(config.appRevision));
  application.use("/v1/local", (request, response) => {
    if (
      config.appEnv !== "local" ||
      !["127.0.0.1", "::ffff:127.0.0.1", "::1"].includes(
        request.socket.remoteAddress ?? "",
      ) ||
      !localWorkflow?.current
    ) {
      response.status(404).end();
      return;
    }
    request.url = `/api${request.url}`;
    void localWorkflow.current.dispatch(request, response);
  });
  const frontendCaller =
    injectedFrontendCaller ??
    (config.appEnv !== "local" &&
    config.frontendCallerEmail &&
    config.backendAudience
      ? new GoogleFrontendCaller(
          config.backendAudience,
          config.frontendCallerEmail,
        )
      : null);
  let activeHttp = 0;
  application.use("/v1", async (request, response, next) => {
    if (activeHttp >= 8) throw new ApplicationError({ code: "CAPACITY_FULL" });
    activeHttp++;
    let released = false;
    let authenticationSettled = false;
    let responseEnded = false;
    const release = () => {
      responseEnded = true;
      if (released || !authenticationSettled) return;
      released = true;
      activeHttp--;
      response.removeListener("close", release);
      response.removeListener("finish", release);
    };
    response.once("close", release);
    response.once("finish", release);
    try {
      if (config.appEnv !== "local" && frontendCaller) {
        if (
          !(await frontendCaller.verify(
            request.get("X-ClipBuilder-Frontend-Authorization"),
          ))
        )
          throw rejectFrontendCaller();
        if (response.destroyed) return;
        response.locals.trustedFrontend = true;
      } else if (config.appEnv !== "local" && config.paidDemoEnabled) {
        throw rejectFrontendCaller();
      }
    } finally {
      authenticationSettled = true;
      if (responseEnded) release();
    }
    next();
  });
  application.use("/v1/editing", (request, response, next) => {
    if (config.appEnv === "local" || !hostedWorkflow?.current)
      return response.status(404).end();
    void hostedWorkflow.current.dispatch(request, response).catch(next);
  });
  application.use(
    "/v1/diagnostics",
    createBrowserDiagnosticRouter(
      config.session.csrfAllowedOrigins,
      diagnostics,
    ),
  );
  application.use("/v1/analysis", (request, response, next) => {
    if (config.appEnv !== "local") {
      response.status(404).end();
      return;
    }
    const action = request.path.slice(1);
    if (!(
      (request.method === "GET" &&
        (action === "preview" ||
          action === "output" ||
          action === "download")) ||
      (request.method === "POST" &&
        (action === "upload" ||
          action === "sample" ||
          action === "run" ||
          action === "clear" ||
          action === "assemble" ||
          action === "preview" ||
          action === "render" ||
          action === "render-result" ||
          action === "output" ||
          action === "session" ||
          action === "grant"))
    ))
      return next();
    diagnostics.request(String(response.locals.requestId), action, (finish) => {
      response.once("finish", () => finish("completed", response.statusCode));
      response.once("close", () => finish("disconnected", response.statusCode));
      next();
    });
  });
  application.use("/v1/admission", (_request, response, next) => {
    if (config.appEnv !== "local") {
      response.status(404).end();
      return;
    }
    next();
  });
  const admission = composeAdmission(config);
  application.use("/v1/session", (request, response, next) => {
    if (request.method !== "POST" || request.path !== "/exit") return next();
    diagnostics.request(String(response.locals.requestId), "exit", (finish) => {
      response.once("finish", () => finish("completed", response.statusCode));
      response.once("close", () => finish("disconnected", response.statusCode));
      next();
    });
  });
  const retainedSample = composeRetainedSample(config);
  application.use("/v1/retained-sample", (request, response, next) => {
    if (request.method !== "GET" || request.path !== "/video") return next();
    diagnostics.request(
      String(response.locals.requestId),
      "retained-video",
      (finish) => {
        response.once("finish", () => finish("completed", response.statusCode));
        response.once("close", () =>
          finish("disconnected", response.statusCode),
        );
        next();
      },
    );
  });
  if (retainedSample)
    application.use(
      "/v1/retained-sample",
      createRetainedSampleRouter(retainedSample, config.frontendOrigin),
    );
  const processing = composeAnalysis(config, admission, diagnostics);
  const analysis = processing?.analysis ?? null;
  const sample =
    config.providerMode === "fake" && config.appEnv === "local"
      ? new SampleSession()
      : null;
  application.use(
    "/v1/session",
    createSessionExitRouter(
      config.session.csrfAllowedOrigins,
      async (cookie, origin) => {
        if (analysis)
          await analysis.exit({
            cookie,
            origin,
            fetchSite: "same-origin",
            signal: AbortSignal.timeout(5000),
          });
      },
      (token) => sample?.clear(token),
    ),
  );
  if (analysis && admission)
    application.use(
      "/v1/analysis",
      createAnalysisRouter(
        admission,
        analysis,
        config.session.csrfAllowedOrigins,
        processing?.assembly ?? null,
        processing?.preview ?? null,
        processing?.render ?? null,
        processing?.output ?? null,
      ),
    );
  if (admission)
    application.use(
      "/v1/admission",
      createAdmissionRouter(admission, config.session.csrfAllowedOrigins),
    );
  application.get("/v1/sample/config", (_request, response) => {
    const developmentPreview =
      config.providerMode === "fake" && config.appEnv === "local";
    sendNoStoreJson(
      response,
      200,
      publicConfigResponseSchema.parse({
        mode: config.providerMode,
        sampleEnabled: developmentPreview,
        retainedSampleEnabled: retainedSample !== null,
        localMediaEnabled:
          config.providerMode === "live" &&
          (config.appEnv === "local" || config.publicPaidProcessingApproved),
        liveAnalysisEnabled: analysis !== null,
        ...(analysis ? { processingSiteKey: config.turnstile.siteKey } : {}),
        liveAssemblyEnabled:
          processing?.preview !== null && processing?.preview !== undefined,
        liveRenderEnabled:
          processing?.output !== null && processing?.output !== undefined,
        limits: {
          sourceBytes: config.limits.sourceBytes,
          sourceSeconds: config.limits.sourceSeconds,
          clipSecondsMin: PUBLIC_LIMITS.minClipSeconds,
          clipSecondsMax: config.limits.clipSeconds,
          candidateTarget: PUBLIC_LIMITS.candidateTarget,
          candidateMax: PUBLIC_LIMITS.maxCandidateCount,
          renders: 1,
        },
        features: {
          activeSpeakerFraming:
            developmentPreview || Boolean(processing?.assembly),
          contextualVisuals: Boolean(processing?.assembly),
          trendSignals: false,
          languages: ["en"],
        },
        accessTtlSeconds: config.session.accessTtlSeconds,
        deletionCopyVersion: developmentPreview
          ? "development-preview-v1"
          : "local-workspace-v1",
      }),
    );
  });
  if (sample) {
    application.use(
      "/v1/sample",
      express.json({ limit: "8kb" }),
      createSampleRouter(sample, config.frontendOrigin),
    );
  }

  application.use((_request, response) => {
    const mapped = mapError(
      new ApplicationError({ code: "OPERATION_NOT_FOUND" }),
      String(response.locals.requestId),
    );
    sendNoStoreJson(
      response,
      mapped.status,
      errorEnvelopeSchema.parse({ error: mapped.error }),
    );
  });

  application.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction,
    ) => {
      void _next;
      const mapped = mapError(error, String(response.locals.requestId));
      diagnostics.failure("request", error, mapped.status);
      if (response.headersSent) {
        response.destroy();
        return;
      }
      sendNoStoreJson(
        response,
        mapped.status,
        errorEnvelopeSchema.parse({ error: mapped.error }),
      );
    },
  );

  return application;
}
