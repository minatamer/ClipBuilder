import { expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import {
  ownerTextLayerSchema,
  ownerTextLayersSchema,
} from "../packages/contracts/local/text-layers.ts";
import { ownerEditDocumentSchema } from "../packages/contracts/local/editor.ts";
import { compileOwnerOverlay } from "../packages/contracts/local/edit-overlay.ts";
import { applyOwnerEdit } from "../apps/backend/local/edit-clip.ts";
import {
  initialOwnerEdit,
  ownerEditOperations,
  sameOwnerEdit,
} from "../apps/frontend/src/features/local-editing/editor-state.ts";
import { syntheticTextClip, syntheticTextLayer } from "./owner-text-fixture.ts";

it("validates bounded multiline plain text, strict typography, unique layers and exact clip clocks", () => {
  const layer = syntheticTextLayer();
  expect(
    ownerTextLayerSchema.parse({ ...layer, text: "  One\r\nTwo  " }).text,
  ).toBe("One\nTwo");
  for (const bad of [
    "",
    " ",
    "x".repeat(501),
    "a\u0000b",
    "a\u202eb",
    Array(11).fill("line").join("\n"),
  ])
    expect(
      ownerTextLayerSchema.safeParse({ ...layer, text: bad }).success,
    ).toBe(false);
  expect(
    ownerTextLayerSchema.safeParse({
      ...layer,
      text: Array(10).fill("line").join("\n"),
    }).success,
  ).toBe(true);
  for (const change of [
    { startFrame: NaN },
    { startFrame: -1 },
    { endFrame: 15 },
    { endFrame: 0 },
    { endFrame: Infinity },
    { startFrame: 0.5 },
    { style: { ...layer.style, font: "Remote" } },
    { style: { ...layer.style, outlineWidth: 13 } },
    { style: { ...layer.style, backgroundOpacity: 1.1 } },
    {
      style: {
        ...layer.style,
        backgroundColor: "url(https://invalid.example)",
      },
    },
    { style: { ...layer.style, box: { x: 0, y: 0, width: 1, height: 1 } } },
  ])
    expect(
      ownerTextLayerSchema.safeParse({ ...layer, ...change }).success,
    ).toBe(false);
  expect(ownerTextLayersSchema.safeParse([layer, layer]).success).toBe(false);
  expect(
    ownerTextLayersSchema.safeParse(
      Array.from({ length: 11 }, () => ({ ...layer, id: randomUUID() })),
    ).success,
  ).toBe(false);
  const clip = syntheticTextClip(),
    doc = initialOwnerEdit(clip);
  expect(() =>
    compileOwnerOverlay(
      clip.base!,
      { ...doc, texts: [{ ...layer, endFrame: 91 }] },
      [],
    ),
  ).toThrow();
  expect(ownerEditDocumentSchema.parse(doc).texts).toBeUndefined();
});

it("applies, removes and restores text through revision-bound edits with immutable base and caption clocks", () => {
  const clip = syntheticTextClip(),
    base = structuredClone(clip.base),
    original = initialOwnerEdit(clip),
    layer = syntheticTextLayer();
  const draft = { ...original, texts: [layer] };
  expect(sameOwnerEdit(original, draft)).toBe(false);
  const operations = ownerEditOperations(original, draft, clip);
  expect(operations).toEqual([{ kind: "text-layers", layers: [layer] }]);
  const request = {
    operationId: randomUUID(),
    expectedRevision: 0,
    baseHash: clip.baseHash,
    operations,
  };
  const edit = applyOwnerEdit(clip, request);
  expect(edit.texts).toEqual([layer]);
  expect(compileOwnerOverlay(clip.base!, edit, []).captions).toEqual(
    base!.overlay.captions,
  );
  expect(clip.base).toEqual(base);
  expect(compileOwnerOverlay(clip.base!, edit, []).texts).toEqual([layer]);
  expect(() => applyOwnerEdit({ ...clip, revision: 1, edit }, request)).toThrow(
    "stale_edit_revision",
  );
  const removed = { ...edit, texts: [] };
  expect(ownerEditOperations(edit, removed, clip)).toEqual([
    { kind: "text-layers", layers: [] },
  ]);
  expect(sameOwnerEdit({ ...original, texts: [] }, original)).toBe(true);
});
