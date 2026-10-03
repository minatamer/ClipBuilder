import { Router } from "express";
import type { RetainedSample } from "../../media/retained-sample.js";
import { ApplicationError } from "../errorMapper.js";

export function createRetainedSampleRouter(
  sample: RetainedSample,
  origin: string,
): Router {
  const router = Router();
  router.get("/video", async (request, response) => {
    if (
      request.headers.origin !== origin ||
      request.headers["sec-fetch-site"] !== "same-origin" ||
      Object.keys(request.query).length !== 0
    )
      throw new ApplicationError({ code: "ABUSE_CHECK_FAILED" });
    const controller = new AbortController();
    const abort = () => controller.abort();
    request.on("aborted", abort);
    response.on("close", abort);
    try {
      await sample.stream({
        range: request.headers.range,
        signal: controller.signal,
        destination: response,
        headers: (status, fields) => {
          response.status(status).set(fields);
        },
      });
    } finally {
      request.off("aborted", abort);
      response.off("close", abort);
    }
  });
  return router;
}
