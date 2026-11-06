import { expect, it } from "vitest";
import { z } from "zod";
import { codexOutputSchema, codexOutputValue } from "./codex-schema.ts";
import {
  localCodexFocusSchema,
  localCodexCandidatesSchema,
} from "../../../packages/contracts/local/codex.ts";
import { contextualPictureBriefSchema } from "../../../packages/contracts/src/contextual-picture.schema.ts";
import { webPictureCandidatesSchema } from "../src/assembly/web-pictures.ts";
import { decodePlannedText } from "./planned-text.ts";

it("adapts Unicode patterns and optional object keys without changing bounds, IDs or source schema", () => {
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
          additionalProperties: false,
          required: ["query", "id"],
          properties: {
            query: {
              anyOf: [
                { type: "string", minLength: 2, maxLength: 100 },
                { type: "null" },
              ],
            },
            id: {
              anyOf: [
                schema.properties.items.items.properties.id,
                { type: "null" },
              ],
            },
          },
        },
      },
    },
    $defs: { other: { anyOf: [{ type: "string" }, { type: "null" }] } },
  });
  expect(schema).toEqual(original);
});

it.each([
  localCodexFocusSchema,
  localCodexCandidatesSchema,
  webPictureCandidatesSchema,
])(
  "satisfies strict object requirements throughout a production response schema",
  (source) => {
    const wire = codexOutputSchema(
      z.toJSONSchema(source, { io: "input", unrepresentable: "any" }),
    );
    function check(value: unknown) {
      if (Array.isArray(value)) {
        value.forEach(check);
        return;
      }
      if (!value || typeof value !== "object") return;
      if ("type" in value && value.type === "object") {
        expect(value).toHaveProperty("additionalProperties", false);
        const properties = "properties" in value ? value.properties : {};
        expect(properties && typeof properties === "object").toBe(true);
        expect("required" in value ? value.required : undefined).toEqual(
          Object.keys(properties!),
        );
      }
      Object.values(value).forEach(check);
    }
    check(wire);
  },
);

it("round-trips actual title emphasis null placeholders into valid optional typography", () => {
  const schema = z.toJSONSchema(localCodexFocusSchema, {
    io: "input",
    unrepresentable: "any",
  });
  const response = {
    people: [],
    decisions: [],
    hookSuggestion: null,
    pictures: [],
    texts: [
      {
        title: "Synthetic focus",
        hookStyle: "curiosity-gap",
        wordIds: ["w_000001"],
        startFrame: 0,
        endFrame: 60,
        treatment: null,
        emphasis: [
          {
            text: "focus",
            occurrence: 0,
            style: {
              font: null,
              fontSize: null,
              fontWeight: null,
              color: "#FF3B30",
              outlineColor: null,
              outlineWidth: null,
              highlightColor: null,
            },
          },
        ],
      },
    ],
  };
  const value = codexOutputValue(schema, response);
  expect(localCodexFocusSchema.safeParse(value).success).toBe(true);
  expect(value).toMatchObject({
    hookSuggestion: null,
    texts: [{ emphasis: [{ style: { color: "#FF3B30" } }] }],
  });
  const layers = decodePlannedText(
    value,
    [
      {
        id: "w_000001",
        text: "Synthetic",
        punctuatedText: "Synthetic",
        startMs: 0,
        endMs: 1000,
        confidence: null,
        speakerId: null,
      },
    ],
    120,
  );
  expect(layers).toHaveLength(1);
  expect(layers[0]?.spans).toEqual([
    { start: 10, end: 15, style: { color: "#FF3B30" } },
  ]);
  expect(response.texts[0]?.emphasis[0]?.style.font).toBeNull();
  const plain = structuredClone(response);
  Reflect.set(plain.texts[0]!, "emphasis", null);
  expect(
    localCodexFocusSchema.safeParse(codexOutputValue(schema, plain)).success,
  ).toBe(true);
});

it("preserves required and explicitly nullable fields while resolving optional nested references and union branches", () => {
  const schema = {
    type: "object",
    properties: {
      requiredNull: { type: ["string", "null"] },
      optionalNull: { type: ["string", "null"] },
      nested: { $ref: "#/$defs/nested" },
      variant: {
        anyOf: [
          {
            type: "object",
            properties: { kind: { const: "a" }, accent: { type: "string" } },
            required: ["kind"],
          },
          {
            type: "object",
            properties: {
              kind: { const: "b" },
              accent: { type: ["string", "null"] },
            },
            required: ["kind", "accent"],
          },
        ],
      },
    },
    required: ["requiredNull"],
    $defs: {
      nested: { type: "object", properties: { accent: { type: "string" } } },
    },
  };
  const input = {
    requiredNull: null,
    optionalNull: null,
    nested: { accent: null },
    variant: { kind: "b", accent: null },
  };
  expect(codexOutputValue(schema, input)).toEqual({ ...input, nested: {} });
  expect(
    codexOutputValue(schema, {
      ...input,
      variant: { kind: "a", accent: null },
    }),
  ).toMatchObject({ variant: { kind: "a" } });
  expect(input.nested).toEqual({ accent: null });
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
