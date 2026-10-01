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
  application.get("/v1/sample/config", (_request, response) => {
    const developmentPreview =
      config.providerMode === "fake" && config.appEnv === "local";
    sendNoStoreJson(
      response,
      200,
      publicConfigResponseSchema.parse({
        mode: config.providerMode,
        sampleEnabled: developmentPreview,
        // No real adapter is implemented or admitted in this packet.
        liveUploadEnabled: false,
        liveAnalysisEnabled: false,
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
          activeSpeakerFraming: true,
          contextualVisuals: false,
          trendSignals: false,
          languages: ["en"],
        },
        accessTtlSeconds: config.session.accessTtlSeconds,
        deletionCopyVersion: "development-preview-v1",
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
