import { expect, it, vi } from "vitest";
import { browserDiagnosticSchema } from "@clipbuilder/contracts";
import {
  EditorLifecycleTrace,
  currentEditorDiagnostic,
  noteEditorPreview,
} from "./editor-lifecycle";

const state = {
  section: "focus" as const,
  occurrence: "hook" as const,
  revision: 4,
  dirty: false,
  pending: false,
  previewReady: true,
  hasHook: true,
};
it("counts preview signals and activity without sending a request per media tick", () => {
  const report = vi.fn(),
    trace = new EditorLifecycleTrace(report);
  trace.commit(state);
  noteEditorPreview("subscribe");
  for (let n = 0; n < 120; n++) noteEditorPreview("frame");
  noteEditorPreview("capture");
  noteEditorPreview("capture-aborted");
  noteEditorPreview("seek");
  noteEditorPreview("dispose");
  trace.activity();
  trace.action("selection");
  trace.ready();
  expect(trace.snapshot()).toMatchObject({
    previewSubscriptions: 1,
    previewReleases: 1,
    previewEvents: 120,
    captures: 1,
    abortedCaptures: 1,
    seeks: 1,
    activityReports: 1,
    selectionReports: 1,
    readyReports: 1,
  });
  expect(report).toHaveBeenCalledTimes(2);
  trace.close();
  expect(report).toHaveBeenCalledTimes(3);
});
it("records bounded content-free editor actions and render bursts without React updates or timers", () => {
  const report = vi.fn();
  let now = 100;
  const trace = new EditorLifecycleTrace(report, () => now);
  trace.commit(state);
  trace.action("edit");
  trace.commit({ ...state, dirty: true });
  for (let n = 0; n < 80; n++) trace.commit({ ...state, dirty: true });
  expect(report.mock.calls.map(([r]) => r.event)).toEqual([
    "opened",
    "render-burst",
  ]);
  trace.action("apply");
  trace.action("discard");
  expect(currentEditorDiagnostic()).toMatchObject({
    edits: 1,
    applies: 1,
    discards: 1,
    commits: 82,
  });
  for (let n = 0; n < 100; n++) trace.action("apply");
  expect(report).toHaveBeenCalledTimes(24);
  now += 60000;
  trace.commit(state);
  trace.action("apply");
  expect(report).toHaveBeenCalledTimes(25);
  trace.close();
  trace.close();
  expect(currentEditorDiagnostic()).toBeUndefined();
  expect(report).toHaveBeenCalledTimes(26);
  for (const [record] of report.mock.calls)
    expect(browserDiagnosticSchema.safeParse(record).success).toBe(true);
});
it("isolates failed logging and clears only its own active editor", async () => {
  const a = new EditorLifecycleTrace(() => {
    throw Error("synthetic private sentinel");
  });
  a.commit(state);
  const b = new EditorLifecycleTrace(() =>
    Promise.reject(Error("synthetic private sentinel")),
  );
  b.commit({ ...state, section: "text" });
  a.close();
  expect(currentEditorDiagnostic()?.section).toBe("text");
  b.close();
  await Promise.resolve();
  expect(currentEditorDiagnostic()).toBeUndefined();
});
