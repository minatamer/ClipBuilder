import { describe, expect, it } from "vitest";
import {
  browserDiagnosticSchema,
  cloudUploadDiagnosticSchema,
  previewDiagnosticSchema,
} from "./browser-diagnostic.schema.js";
describe("content-free browser diagnostics", () => {
  it("allows only bounded editor codes/counters, rejecting clip content and arbitrary component paths", () => {
    const record = {
      kind: "browser-console",
      level: "error",
      source: "console",
      argumentCount: 1,
      reactIssue: "maximum-update-depth",
      components: ["FocusPreviewControls"],
      editor: {
        traceId: "12345678-1234-4234-9234-123456789012",
        section: "focus",
        occurrence: "hook",
        action: "edit",
        revision: 1,
        commits: 50,
        readyReports: 1,
        activityReports: 2,
        selectionReports: 1,
        previewSubscriptions: 2,
        previewReleases: 0,
        previewEvents: 20,
        captures: 0,
        abortedCaptures: 0,
        seeks: 1,
        previewSignal: "frame",
        edits: 40,
        applies: 1,
        discards: 0,
        tabChanges: 3,
        dirty: true,
        pending: false,
        previewReady: true,
        hasHook: true,
      },
    };
    expect(browserDiagnosticSchema.safeParse(record).success).toBe(true);
    for (const invalid of [
      { ...record, components: ["/private/ClipEditor.tsx"] },
      { ...record, editor: { ...record.editor, text: "synthetic-private" } },
      { ...record, editor: { ...record.editor, commits: 1_000_001 } },
      { ...record, reactIssue: "raw exception" },
    ])
      expect(browserDiagnosticSchema.safeParse(invalid).success).toBe(false);
  });
  it("accepts a content-free worker failure while rejecting raw worker error details", () => {
    const record = {
      kind: "browser-console",
      level: "error",
      source: "worker-error",
      argumentCount: 0,
    };
    expect(browserDiagnosticSchema.parse(record)).toEqual(record);
    expect(
      browserDiagnosticSchema.safeParse({
        ...record,
        message: "synthetic-private-worker-sentinel",
      }).success,
    ).toBe(false);
  });
  it("retains every upload field", () => {
    const record = {
      operationId: `op_${"a".repeat(22)}`,
      stage: "failed",
      chunk: 2,
      request: "chunk",
      durationMs: 60000,
      status: 503,
      statusQueries: 1,
      resends: 1,
      confirmedBytes: 4194304,
      totalBytes: 8388608,
      reason: "timeout",
    };
    expect(cloudUploadDiagnosticSchema.parse(record)).toEqual(record);
  });
  it("retains every playback field", () => {
    const record = {
      traceId: "12345678-1234-4234-9234-123456789012",
      event: "closed",
      captions: 3,
      cards: 2,
      matched: 1,
      held: 0,
      wide: 1,
      samples: 10,
      bufferingEvents: 1,
      automaticSeeks: 2,
      userSeeks: 1,
      backwardsMediaJumps: 0,
      shownVisuals: 2,
      maxDriftMs: 150,
      elapsedMs: 3000,
    };
    expect(previewDiagnosticSchema.parse(record)).toEqual(record);
  });
  it.each([
    { kind: "view-failed", digest: "private-value" },
    { kind: "workflow-failed", code: "INTERNAL_ERROR", stack: "private-path" },
    { kind: "cleanup-failed", resource: "blob:private" },
  ])("rejects arbitrary strings and unknown keys", (value) => {
    expect(browserDiagnosticSchema.safeParse(value).success).toBe(false);
  });
});
