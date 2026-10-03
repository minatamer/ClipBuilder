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
import { createAnalysisRouter } from "./http/routes/analysis.route.js";
import { composeRetainedSample } from "./media/retained-sample.gcs.js";
import { createRetainedSampleRouter } from "./http/routes/retained-sample.route.js";

export function createApplication(config: BackendConfig): Express {
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
  const admission = composeAdmission(config);
  const retainedSample = composeRetainedSample(config);
  if (retainedSample)
    application.use(
      "/v1/retained-sample",
      createRetainedSampleRouter(retainedSample, config.frontendOrigin),
    );
  const processing = composeAnalysis(config, admission);
  const analysis = processing?.analysis ?? null;
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
          config.providerMode === "live" && config.appEnv === "local",
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
          activeSpeakerFraming: developmentPreview,
          contextualVisuals: false,
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
  if (config.providerMode === "fake" && config.appEnv === "local") {
    application.use(
      "/v1/sample",
      express.json({ limit: "8kb" }),
      createSampleRouter(new SampleSession(), config.frontendOrigin),
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
      if (response.headersSent) {
        response.destroy();
        return;
      }
      const mapped = mapError(error, String(response.locals.requestId));
      sendNoStoreJson(
        response,
        mapped.status,
        errorEnvelopeSchema.parse({ error: mapped.error }),
      );
    },
  );

  return application;
}
