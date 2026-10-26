import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import {
  ownerRuntimeCapabilitiesSchema,
  type OwnerRuntimeCapabilities,
} from "../../../../../packages/contracts/local/runtime.ts";
import { ownerWorkspaceSchema } from "../../../../../packages/contracts/local/index.ts";
import { OwnerAcquisitionPanel } from "./acquisition-panel.tsx";
import { OwnerClipBatchPanel } from "./clip-batch-panel.tsx";
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

it("labels provider capabilities truthfully while restoration keeps submission unavailable", () => {
  const render = (runtime: OwnerRuntimeCapabilities) =>
    renderToStaticMarkup(
      <OwnerSelectionPanel
        workspace={workspace}
        capabilities={runtime}
        busy={false}
        onBusy={noop}
        onChoose={noop}
        onResultsViewChange={noop}
        previewReady={false}
        onCaptureTime={() => null}
        onJumpTo={noop}
      />,
    );
  const provider = render(capabilities);
  expect(provider).not.toContain("provider calls");
  expect(provider).not.toMatch(/simulated|fictional/iu);
  expect(provider).toContain("Loading moments");
  expect(provider).not.toContain(">Find moments</button>");
  const unavailable = render({ ...capabilities, aiMode: "unavailable" });
  expect(unavailable).toContain("AI unavailable");
  expect(unavailable).not.toContain(">Find moments</button>");
  const mismatch = render({ ...capabilities, aiMode: "synthetic-ai" });
  expect(mismatch).toContain("current AI mode");
  expect(mismatch).not.toContain(">Find moments</button>");
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
  expect(buttonDisabled(render(true), "Process clips")).toBe(false);
  const unavailable = render(false);
  expect(buttonDisabled(unavailable, "Process clips")).toBe(true);
  expect(unavailable).toContain("Prepared clips still work");
  expect(unavailable).not.toContain("Actual AI calls: zero");
});

it("keeps processing in the results view and disables it after every clip is removed", () => {
  const render = (selectionReady: boolean) =>
    renderToStaticMarkup(
      <OwnerClipBatchPanel
        workspace={workspace}
        capabilities={capabilities}
        selected={[]}
        onActive={noop}
        selectionReady={selectionReady}
      />,
    );
  expect(buttonDisabled(render(true), "Process clips")).toBe(true);
  expect(render(false)).not.toContain("Process clips");
});

it.each([
  [0, true],
  [10, false],
  [11, true],
] as const)(
  "enforces the processing limit for %i retained clips without hiding results",
  (count, disabled) => {
    const html = renderToStaticMarkup(
      <OwnerClipBatchPanel
        workspace={workspace}
        capabilities={capabilities}
        selected={Array.from({ length: count }, () => ({
          analysisId: crypto.randomUUID(),
          momentId: crypto.randomUUID(),
          policyRevision: 0,
        }))}
        onActive={noop}
        selectionReady
      />,
    );
    expect(buttonDisabled(html, "Process clips")).toBe(disabled);
  },
);

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
  expect(render("synthetic-source")).toContain("Simulated download");
  const provider = render("provider-source");
  expect(provider).toContain("Paste a video link");
  expect(provider).not.toContain("16-second");
  expect(provider).not.toContain("Current fake");
  const offline = render(null);
  expect(offline).toContain("Downloads unavailable");
  expect(buttonDisabled(offline, "Continue")).toBe(true);
});

it("keeps the real URL form disabled while capabilities are unknown without claiming a fake source mode", () => {
  const html = renderToStaticMarkup(
    <OwnerAcquisitionPanel
      workspace={null}
      capabilities={null}
      initializing
      busy
      onBusy={noop}
      onOpen={noop}
    />,
  );
  expect(html).toContain('aria-label="YouTube link"');
  expect(html).toMatch(/<fieldset[^>]*disabled/);
  expect(html).toContain("youtube-startup-indicator");
  expect(html).toContain("Loading YouTube");
  expect(html).not.toContain("Simulated download");
  expect(html).not.toContain("Downloads unavailable");
});
