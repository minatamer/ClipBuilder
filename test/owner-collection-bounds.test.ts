import { expect, it } from "vitest";
import {
  ownerTextLayersSchema,
  OWNER_TEXT_LIMITS,
} from "../packages/contracts/local/text-layers.ts";
import { ownerEditRequestSchema } from "../packages/contracts/local/editor.ts";
import { syntheticTextLayer } from "./owner-text-fixture.ts";

it("rejects oversized Text collections before reading any layer fields", () => {
  let visits = 0;
  const layers = Array.from({ length: 4096 }, () => ({
    get id() {
      visits++;
      return "invalid";
    },
  }));
  const result = ownerTextLayersSchema.safeParse(layers);
  expect(result.success).toBe(false);
  expect(visits).toBe(0);
  if (!result.success) {
    expect(result.error.issues).toHaveLength(1);
    expect(result.error.issues[0]?.code).toBe("too_big");
  }
  expect(
    ownerTextLayersSchema.parse(
      Array.from({ length: OWNER_TEXT_LIMITS.layers }, () =>
        syntheticTextLayer(),
      ),
    ),
  ).toHaveLength(OWNER_TEXT_LIMITS.layers);
});

it("rejects oversized edit batches before inspecting operations and retains valid edits", () => {
  let visits = 0;
  const request = {
    operationId: "00000000-0000-4000-8000-000000000001",
    expectedRevision: 0,
    baseHash: "a".repeat(64),
    operations: Array.from({ length: 4096 }, () => ({
      get kind() {
        visits++;
        return "unknown";
      },
    })),
  };
  const result = ownerEditRequestSchema.safeParse(request);
  expect(result.success).toBe(false);
  expect(visits).toBe(0);
  if (!result.success) {
    expect(result.error.issues).toHaveLength(1);
    expect(result.error.issues[0]?.path).toEqual(["operations"]);
    expect(result.error.issues[0]?.code).toBe("too_big");
  }
  expect(
    ownerEditRequestSchema.parse({
      ...request,
      operations: [{ kind: "text-layers", layers: [syntheticTextLayer()] }],
    }).operations,
  ).toHaveLength(1);
});
