import express from "express";
import { ZodError } from "zod";
import {
  TEMPORARY_MEDIA_LIMITS,
  mediaUploadRequestSchema,
  mediaUploadResponseSchema,
  mediaPrepareRequestSchema,
  mediaRenderRequestSchema,
  mediaCancelRequestSchema,
  mediaSelectRequestSchema,
  mediaPreviewRequestSchema,
  mediaPreviewAccessSchema,
  rendererFailureResponseSchema,
} from "@clipbuilder/contracts";
import type { CallerVerifier } from "./auth/caller-verifier.js";
import { MediaFailure } from "./media/media.failure.js";
import type { MediaOperations } from "./media/media-operations.js";
export function createRendererApplication(
  operations: MediaOperations,
  verifier: CallerVerifier,
): express.Express {
  const app = express();
  app.disable("x-powered-by");
  app.enable("strict routing");
  app.enable("case sensitive routing");
  app.use((_request, response, next) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader(
      "Content-Security-Policy",
      "default-src 'none'; frame-ancestors 'none'",
    );
    next();
  });
  app.get("/v1/health", (_request, response) =>
    response.status(200).json({ status: "ok" }),
  );
  app.use("/internal", async (request, response, next) => {
    const purpose = await verifier.verify(request.headers.authorization);
    if ((request.path === "/expiry") !== (purpose === "expiry"))
      throw new MediaFailure("unauthorized");
    response.locals.purpose = purpose;
    next();
  });
  const parseDescriptor = express.json({
    limit: TEMPORARY_MEDIA_LIMITS.descriptorBytes,
  });
  const parseRenderDescriptor = express.json({
    limit: TEMPORARY_MEDIA_LIMITS.renderDescriptorBytes,
  });
  app.use(
    "/internal",
    (request, _response, next) => {
      if (
        request.method !== "POST" ||
        !request.is("application/json") ||
        (request.get("Content-Encoding") ?? "identity") !== "identity"
      )
        throw new MediaFailure("invalid");
      next();
    },
    (request, response, next) => {
      const parse =
        request.path === "/render" ? parseRenderDescriptor : parseDescriptor;
      parse(request, response, next);
    },
  );
  let admitting = false,
    sweeping = false;
  app.post("/internal/upload", async (request, response) => {
    operations.assertIntakeReady();
    if (admitting || sweeping) throw new MediaFailure("busy");
    const input = mediaUploadRequestSchema.parse(request.body);
    admitting = true;
    const owned = requestSignal(response);
    try {
      const signal = AbortSignal.any([
        owned.signal,
        AbortSignal.timeout(TEMPORARY_MEDIA_LIMITS.sweepDeadlineMs),
      ]);
      response.json(
        mediaUploadResponseSchema.parse(
          await operations.sessions.store.withSignal(signal, () =>
            operations.sessions.admit(input, signal),
          ),
        ),
      );
    } finally {
      admitting = false;
      owned.dispose();
    }
  });
  function requestSignal(response: express.Response) {
    const controller = new AbortController(),
      abort = () => {
        if (!response.writableEnded) controller.abort();
      };
    response.once("close", abort);
    return {
      signal: controller.signal,
      dispose: () => response.removeListener("close", abort),
    };
  }
  app.post("/internal/prepare", async (request, response) => {
    const input = mediaPrepareRequestSchema.parse(request.body),
      owned = requestSignal(response);
    try {
      response.json(await operations.prepare(input, owned.signal));
    } finally {
      owned.dispose();
    }
  });
  app.post("/internal/render", async (request, response) => {
    const input = mediaRenderRequestSchema.parse(request.body),
      owned = requestSignal(response);
    try {
      response.json(await operations.render(input, owned.signal));
    } finally {
      owned.dispose();
    }
  });
  app.post("/internal/select", async (request, response) => {
    const input = mediaSelectRequestSchema.parse(request.body),
      owned = requestSignal(response);
    try {
      response.json(await operations.select(input, owned.signal));
    } finally {
      owned.dispose();
    }
  });
  app.post("/internal/preview", async (request, response) => {
    const input = mediaPreviewRequestSchema.parse(request.body),
      owned = requestSignal(response);
    try {
      response.json(await operations.preview(input, owned.signal));
    } finally {
      owned.dispose();
    }
  });
  app.post("/internal/preview-info", async (request, response) => {
    const input = mediaPreviewAccessSchema.parse(request.body),
      owned = requestSignal(response);
    try {
      response.json(
        await operations.sessions.store.withSignal(owned.signal, () =>
          operations.sessions.previewArtifact(input),
        ),
      );
    } finally {
      owned.dispose();
    }
  });
  app.post("/internal/preview-content", async (request, response) => {
    const input = mediaPreviewAccessSchema.parse(request.body),
      owned = requestSignal(response);
    try {
      await operations.previewContent(
        input,
        request.get("Range"),
        response,
        owned.signal,
        (status, headers) => {
          response.status(status).set(headers);
        },
      );
    } finally {
      owned.dispose();
    }
  });
  app.post("/internal/output-info", async (request, response) => {
    const input = mediaPreviewAccessSchema.parse(request.body),
      owned = requestSignal(response);
    try {
      response.json(
        await operations.sessions.store.withSignal(owned.signal, () =>
          operations.sessions.outputArtifact(input),
        ),
      );
    } finally {
      owned.dispose();
    }
  });
  app.post("/internal/output-content", async (request, response) => {
    const input = mediaPreviewAccessSchema.parse(request.body),
      owned = requestSignal(response);
    try {
      await operations.outputContent(
        input,
        request.get("Range"),
        response,
        owned.signal,
        (status, fields) => {
          response.status(status).set(fields);
        },
      );
    } finally {
      owned.dispose();
    }
  });
  app.post("/internal/analysis-audio", async (request, response) => {
    const { binding } = mediaCancelRequestSchema.parse(request.body),
      owned = requestSignal(response);
    try {
      response.setHeader("Content-Type", "audio/m4a");
      response.send(
        await operations.analysisProxy(binding, owned.signal, "audio"),
      );
    } finally {
      owned.dispose();
    }
  });
  app.post("/internal/analysis-proxy", async (request, response) => {
    const { binding } = mediaCancelRequestSchema.parse(request.body),
      owned = requestSignal(response);
    try {
      response
        .type("video/mp4")
        .send(await operations.analysisProxy(binding, owned.signal, "video"));
    } finally {
      owned.dispose();
    }
  });
  app.post("/internal/release-analysis-proxy", async (request, response) => {
    const { binding } = mediaCancelRequestSchema.parse(request.body),
      owned = requestSignal(response);
    try {
      await operations.releaseAnalysisProxy(binding, owned.signal);
      response.json({ deleted: true });
    } finally {
      owned.dispose();
    }
  });
  app.post("/internal/cancel", async (request, response) => {
    const input = mediaCancelRequestSchema.parse(request.body);
    await operations.cancel(input.binding);
    response.json({ deleted: true });
  });
  app.post("/internal/expiry", async (request, response) => {
    if (sweeping || admitting) throw new MediaFailure("busy");
    if (
      request.body !== undefined &&
      (typeof request.body !== "object" ||
        request.body === null ||
        Object.keys(request.body).length)
    )
      throw new MediaFailure("invalid");
    sweeping = true;
    const owned = requestSignal(response);
    try {
      const signal = AbortSignal.any([
        owned.signal,
        AbortSignal.timeout(TEMPORARY_MEDIA_LIMITS.sweepDeadlineMs),
      ]);
      const result = await operations.sessions.store.withSignal(signal, () =>
        operations.sweep(),
      );
      if (result.unresolved) throw new MediaFailure("cleanup_pending");
      response.json(result);
    } finally {
      sweeping = false;
      owned.dispose();
    }
  });
  app.use((_request, response) =>
    response.status(404).json({ code: "invalid" }),
  );
  app.use(
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
      const parserFailure =
        typeof error === "object" && error !== null && "type" in error
          ? error.type === "entity.too.large"
            ? "too_large"
            : error.type === "entity.parse.failed"
              ? "invalid_json"
              : undefined
          : undefined;
      const code =
        error instanceof MediaFailure
          ? error.code
          : error instanceof ZodError || parserFailure
            ? "invalid"
            : "media_failed";
      const status =
        parserFailure === "too_large"
          ? 413
          : code === "unauthorized"
            ? 403
            : code === "invalid"
              ? 400
              : code === "expired"
                ? 410
                : code === "cleanup_pending"
                  ? 503
                  : code === "media_failed"
                    ? 422
                    : 409;
      response.status(status).json(
        rendererFailureResponseSchema.parse({
          code,
          ...(parserFailure ? { stage: "request_parse" } : {}),
          ...(error instanceof MediaFailure && error.stage
            ? { stage: error.stage }
            : {}),
          ...(error instanceof MediaFailure && error.underlyingCode
            ? { underlyingCode: error.underlyingCode }
            : {}),
        }),
      );
    },
  );
  return app;
}
