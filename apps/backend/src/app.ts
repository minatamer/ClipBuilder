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

export function createApplication(config: BackendConfig): Express {
  const application = express();

  application.disable("x-powered-by");
  application.use((request, response, next) => {
    const requestId = `req_${randomUUID().replaceAll("-", "")}`;
    response.setHeader("X-Request-Id", requestId);
    response.locals.requestId = requestId;
    next();
  });

  application.use("/v1", createHealthRouter(config.appRevision));
  const admission = composeAdmission(config);
  const analysis = composeAnalysis(config, admission);
  if (analysis && admission)
    application.use(
      "/v1/analysis",
      createAnalysisRouter(
        admission,
        analysis,
        config.session.csrfAllowedOrigins,
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
        localMediaEnabled:
          config.providerMode === "live" && config.appEnv === "local",
        liveAnalysisEnabled: analysis !== null,
        ...(analysis ? { processingSiteKey: config.turnstile.siteKey } : {}),
        liveAssemblyEnabled: false,
        liveRenderEnabled: false,
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
