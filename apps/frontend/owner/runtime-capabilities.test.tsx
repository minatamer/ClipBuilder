import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import {
  ownerRuntimeCapabilitiesSchema,
  type OwnerRuntimeCapabilities,
} from "../../../packages/contracts/owner/runtime.ts";
import { ownerWorkspaceSchema } from "../../../packages/contracts/owner/index.ts";
import { OwnerAcquisitionPanel } from "./acquisition-panel.tsx";
import { OwnerClipBatchPanel } from "./clip-batch-panel.tsx";
import { OwnerDraftPanel } from "./draft-panel.tsx";
import { OwnerSelectionPanel } from "./selection-panel.tsx";

const capabilities: OwnerRuntimeCapabilities = {
  aiMode: "provider-ai",
  sourceMode: "provider-source",
  planningAvailable: true,
  localMedia: true,
  cloud: false,
};
const workspace = ownerWorkspaceSchema.parse({
  id: crypto.randomUUID(),
  mode: "provider-ai",
  revision: 0,
  source: {
    fingerprint: "a".repeat(64),
    bytes: 24,
    durationMs: 16_000,
    width: 1920,
    height: 1080,
    fps: 30,
  },
});
const noop = () => undefined;
function buttonDisabled(html: string, text: string) {
  const button = [...html.matchAll(/<button\b([^>]*)>(.*?)<\/button>/gu)].find(
    (match) => match[2] === text,
  );
  expect(button, text).toBeDefined();
  return button![1]!.includes("disabled");
}

it("accepts only content-free local runtime capabilities, including unavailable ports", () => {
  expect(ownerRuntimeCapabilitiesSchema.parse(capabilities)).toEqual(
    capabilities,
  );
  expect(
    ownerRuntimeCapabilitiesSchema.parse({
      ...capabilities,
      aiMode: "unavailable",
      sourceMode: null,
      planningAvailable: false,
    }).aiMode,
  ).toBe("unavailable");
  for (const invalid of [
    { ...capabilities, cloud: true },
    { ...capabilities, localMedia: false },
    { ...capabilities, token: "not-public" },
    { ...capabilities, aiMode: "fake" },
  ])
    expect(ownerRuntimeCapabilitiesSchema.safeParse(invalid).success).toBe(
      false,
    );
});

it("labels fresh provider analysis truthfully and blocks unavailable or mismatched analysis", () => {
  const render = (runtime: OwnerRuntimeCapabilities) =>
    renderToStaticMarkup(
      <OwnerSelectionPanel
        workspace={workspace}
        capabilities={runtime}
        busy={false}
        onBusy={noop}
        onChoose={noop}
      />,
    );
  const provider = render(capabilities);
  expect(provider).toContain("Fresh analysis uses the configured provider");
  expect(provider).not.toMatch(/simulated|fictional/iu);
  expect(buttonDisabled(provider, "Find moments")).toBe(false);
  const unavailable = render({ ...capabilities, aiMode: "unavailable" });
  expect(unavailable).toContain("Fresh analysis is unavailable");
  expect(buttonDisabled(unavailable, "Find moments")).toBe(true);
  const mismatch = render({ ...capabilities, aiMode: "synthetic-ai" });
  expect(mismatch).toContain("different AI provenance");
  expect(buttonDisabled(mismatch, "Find moments")).toBe(true);
});

it("blocks new automatic plans separately from local prepared-clip work", () => {
  const selected = [
    {
      analysisId: crypto.randomUUID(),
      momentId: crypto.randomUUID(),
      policyRevision: 0,
    },
  ];
  const render = (planningAvailable: boolean) =>
    renderToStaticMarkup(
      <OwnerClipBatchPanel
        workspace={workspace}
        capabilities={{ ...capabilities, planningAvailable }}
        selected={selected}
        onActive={noop}
      />,
    );
  expect(buttonDisabled(render(true), "Process selected clips")).toBe(false);
  const unavailable = render(false);
  expect(buttonDisabled(unavailable, "Process selected clips")).toBe(true);
  expect(unavailable).toContain("Prepared clips remain editable");
  expect(unavailable).not.toContain("Actual AI calls: zero");
});

it("describes synthetic generation only for a synthetic source port and keeps offline reuse available", () => {
  const render = (sourceMode: OwnerRuntimeCapabilities["sourceMode"]) =>
    renderToStaticMarkup(
      <OwnerAcquisitionPanel
        workspace={null}
        capabilities={{ ...capabilities, sourceMode }}
        busy={false}
        onBusy={noop}
        onOpen={noop}
      />,
    );
  expect(render("synthetic-source")).toContain("generates a 16-second source");
  const provider = render("provider-source");
  expect(provider).toContain("admitted downloader");
  expect(provider).not.toContain("16-second");
  expect(provider).not.toContain("Current fake");
  const offline = render(null);
  expect(offline).toContain("New source acquisition is unavailable");
  expect(buttonDisabled(offline, "Refresh local saved sources")).toBe(false);
});

it("keeps offline draft reopening independent of the current AI port", () => {
  const html = renderToStaticMarkup(
    <OwnerDraftPanel
      workspace={workspace}
      capabilities={{
        ...capabilities,
        aiMode: "unavailable",
        planningAvailable: false,
      }}
      busy={false}
      active={false}
      onBusy={noop}
      onOpen={noop}
    />,
  );
  expect(html).toContain(
    "Saved clips keep their original AI and picture provenance",
  );
  expect(html).toContain("Fresh automatic analysis is unavailable");
  expect(html).not.toContain("Fake mode");
  expect(buttonDisabled(html, "Refresh saved drafts and status")).toBe(false);
});
