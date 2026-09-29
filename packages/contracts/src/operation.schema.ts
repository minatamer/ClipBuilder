import { z } from "zod";

import { offsetDateTimeSchema } from "./boundary-primitives.schema.js";
import { safeErrorSchema } from "./errors.schema.js";
import { operationIdSchema, revisionIdSchema } from "./ids.schema.js";

export const OPERATION_STATES = [
  "queued",
  "running",
  "cancel-requested",
  "succeeded",
  "failed",
  "cancelled",
  "expired",
] as const;

export const operationStateSchema = z.enum(OPERATION_STATES);
export type OperationState = z.infer<typeof operationStateSchema>;

export const operationStatusSchema = z
  .object({
    operationId: operationIdSchema,
    kind: z.enum([
      "media-inspection",
      "analysis",
      "assembly",
      "render",
      "cleanup",
    ]),
    state: operationStateSchema,
    stageCode: z
      .string()
      .min(1)
      .max(80)
      .regex(/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/u),
    startedAt: offsetDateTimeSchema.nullable(),
    updatedAt: offsetDateTimeSchema,
    completedAt: offsetDateTimeSchema.nullable(),
    pollAfterMs: z.number().int().min(1_000).max(10_000),
    resultRevision: revisionIdSchema.nullable(),
    error: safeErrorSchema.nullable(),
  })
  .strict()
  .superRefine((operation, context) => {
    const terminal = isTerminalOperationState(operation.state);

    if (operation.state === "queued" && operation.startedAt !== null) {
      context.addIssue({
        code: "custom",
        message: "Queued operations cannot have a start time.",
        path: ["startedAt"],
      });
    }
    if (
      operation.state !== "queued" &&
      operation.state !== "expired" &&
      operation.startedAt === null
    ) {
      context.addIssue({
        code: "custom",
        message: "Started operations require a start time.",
        path: ["startedAt"],
      });
    }
    if (terminal !== (operation.completedAt !== null)) {
      context.addIssue({
        code: "custom",
        message: "Only terminal operations require a completion time.",
        path: ["completedAt"],
      });
    }
    if (operation.state === "succeeded" && operation.resultRevision === null) {
      context.addIssue({
        code: "custom",
        message: "Succeeded operations require a result revision.",
        path: ["resultRevision"],
      });
    }
    if (operation.state === "failed" && operation.error === null) {
      context.addIssue({
        code: "custom",
        message: "Failed operations require a safe error.",
        path: ["error"],
      });
    }
    if (operation.state !== "failed" && operation.error !== null) {
      context.addIssue({
        code: "custom",
        message: "Only failed operations may contain an error.",
        path: ["error"],
      });
    }
  });

const LEGAL_OPERATION_TRANSITIONS: Readonly<
  Record<OperationState, readonly OperationState[]>
> = {
  queued: ["running", "cancel-requested", "failed", "cancelled", "expired"],
  running: ["cancel-requested", "succeeded", "failed", "cancelled", "expired"],
  "cancel-requested": ["succeeded", "failed", "cancelled", "expired"],
  succeeded: [],
  failed: [],
  cancelled: [],
  expired: [],
};

export function isTerminalOperationState(state: OperationState): boolean {
  return (
    state === "succeeded" ||
    state === "failed" ||
    state === "cancelled" ||
    state === "expired"
  );
}

export function canOperationTransition(
  current: OperationState,
  next: OperationState,
): boolean {
  return LEGAL_OPERATION_TRANSITIONS[current].includes(next);
}

export type OperationStatusV1 = z.infer<typeof operationStatusSchema>;
