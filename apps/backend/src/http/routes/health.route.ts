import { healthResponseSchema } from "@clipbuilder/contracts";
import { Router } from "express";

import { sendNoStoreJson } from "../response.js";

export function createHealthRouter(appRevision: string): Router {
  const router = Router();

  router.get("/health", (_request, response) => {
    sendNoStoreJson(
      response,
      200,
      healthResponseSchema.parse({
        status: "ok",
        service: "clipping-api",
        version: appRevision,
      }),
    );
  });

  return router;
}
