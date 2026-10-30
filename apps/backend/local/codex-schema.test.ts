import { expect, it } from "vitest";
import { z } from "zod";
import { codexOutputSchema } from "./codex-schema.ts";
import { localCodexFocusSchema } from "../../../packages/contracts/local/codex.ts";
import { contextualPictureBriefSchema } from "../../../packages/contracts/src/contextual-picture.schema.ts";

it("removes only Unicode-property wire patterns without changing bounds, IDs or source schema", () => {
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["items"],
    properties: {
      items: {
        type: "array",
        maxItems: 4,
        items: {
          type: "object",
          properties: {
            query: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              pattern: "^[\\p{L}\\p{N} -]+$",
            },
            id: { type: "string", pattern: "^person_[1-8]$" },
          },
        },
      },
    },
    $defs: {
      other: {
        anyOf: [{ type: "string", pattern: "\\P{L}" }, { type: "null" }],
      },
    },
  };
  const original = structuredClone(schema);
  const result = codexOutputSchema(schema);
  expect(result).toEqual({
    ...schema,
    properties: {
      items: {
        ...schema.properties.items,
        items: {
          type: "object",
          properties: {
            query: { type: "string", minLength: 2, maxLength: 100 },
            id: schema.properties.items.items.properties.id,
          },
        },
      },
    },
    $defs: { other: { anyOf: [{ type: "string" }, { type: "null" }] } },
  });
  expect(schema).toEqual(original);
});
it("adapts the actual clip schema while retaining multilingual runtime validation", () => {
  const schema = z.toJSONSchema(localCodexFocusSchema, {
    io: "input",
    unrepresentable: "any",
  });
  expect(JSON.stringify(schema)).toContain("\\\\p{");
  const result = codexOutputSchema(schema);
  expect(JSON.stringify(result)).not.toContain("\\\\p{");
  expect(result.required).toEqual(schema.required);
  expect(JSON.stringify(result)).toContain("^person_");
  expect(
    contextualPictureBriefSchema.safeParse({
      scene: "Synthetic concept",
      searchQuery: "حماية البيئة",
      requiredTerms: ["البيئة"],
      avoidTerms: [],
    }).success,
  ).toBe(true);
  expect(
    contextualPictureBriefSchema.safeParse({
      scene: "Synthetic concept",
      searchQuery: "<script>",
      requiredTerms: ["safe"],
      avoidTerms: [],
    }).success,
  ).toBe(false);
});
