import { AnalysisCoverageStatus } from "./analysis-coverage-status";
import { MomentRangeDialog } from "./moment-range-dialog";
import { useTimestampExchange } from "./use-timestamp-exchange";
import { manualPreviewJumpSeconds } from "./manual-time.ts";
import {
  exportOwnerTimestamps,
  importOwnerTimestamps,
  OWNER_TIMESTAMP_FILE_BYTES,
} from "../../../../../packages/contracts/local/timestamp-exchange.ts";
import { OWNER_COLLECTION_PAGE_ITEMS as REVIEW_PAGE_ITEMS } from "../../../../../packages/contracts/local/collection-pages.ts";
import { readOwnerAnalysis } from "./collection-pages.ts";
import { Button } from "../../shared/ui/button";
import { ControlPanel, ControlTabs } from "./control-tabs";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import { ZodError } from "zod";
import {
  Play,
  Trash2,
  Clock3,
  Sparkles,
  CircleAlert,
  Film,
  Plus,
  ScanLine,
  ListVideo,
  Pencil,
} from "lucide-react";
import { ProcessingState } from "../../shared/ui/processing-state";
import { VideoThumbnail } from "../../shared/ui/video-thumbnail";
import { WorkflowActions } from "./workflow-actions.tsx";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { localCodexError, LocalCodexError } from "./codex-errors.ts";
import {
  OWNER_LIMITS,
  type OwnerWorkspace,
} from "../../../../../packages/contracts/local/index.ts";
import {
  OWNER_FPS,
  ownerAnalysisRequestForCapacity,
  ownerCut,
  ownerTimestamp,
  type OwnerAnalysis,
  type OwnerMomentExport,
  type OwnerMoment,
} from "../../../../../packages/contracts/local/selection.ts";
import type { OwnerRuntimeCapabilities } from "../../../../../packages/contracts/local/runtime.ts";
import {
  OWNER_DEFAULT_AI_COUNT,
  OWNER_MANUAL_ROW_LIMIT,
  OWNER_MAX_REQUESTED_CLIP_MS,
} from "../../../../../packages/contracts/local/policy.ts";
import {
  ownerAnalysisWindow,
  ownerAvailableSourceWindow,
  ownerOriginalSourceTime,
  ownerSourceTimestamp,
  parseOwnerSourceTimestamp,
  ownerWindowFrames,
} from "../../../../../packages/contracts/local/source-window.ts";
import {
  correctedMomentSelection,
  defaultMomentSelection,
  momentDuration,
} from "./moment-selection.ts";
import {
  HOSTED_DEMO_POLICY,
  limitHostedDemoInputs,
} from "../../../../../packages/contracts/local/hosted-editing.ts";
import { DemoLimitToast } from "./demo-limit-toast.tsx";
import { CodexPreparationSteps } from "./codex-preparation-steps.tsx";

const SELECTION_TABS = ["add", "clips"] as const;
type SelectionTab = (typeof SELECTION_TABS)[number];

type TimeField = { text: string; preservedMs?: number };
type Row = { id: string; start: TimeField; end: TimeField };
const restoredTime = (
  milliseconds: number,
  offsetMs = 0,
  precise = false,
): TimeField => ({
  text: precise
    ? ownerSourceTimestamp(milliseconds + offsetMs).replace(/\.000$/u, "")
    : ownerTimestamp(milliseconds + offsetMs).replace(/\.\d{3}$/u, ""),
  preservedMs: milliseconds,
});
const fieldMilliseconds = (field: TimeField, offsetMs = 0) =>
  field.preservedMs ?? parseOwnerSourceTimestamp(field.text) - offsetMs;
const normalizedTime = (field: TimeField): TimeField => ({
  ...field,
  text: ownerSourceTimestamp(parseOwnerSourceTimestamp(field.text)).replace(
    /\.000$/u,
    "",
  ),
});
type Props = {
  workspace: OwnerWorkspace;
  capabilities: OwnerRuntimeCapabilities;
  busy: boolean;
  onBusy: (busy: boolean) => void;
  onChoose: (selection: OwnerMomentExport[]) => void;
  previewReady: boolean;
  onCaptureTime: () => string | null;
  onJumpTo: (seconds: number) => void;
  onResultsViewChange: (visible: boolean) => void;
  actionTarget?: HTMLElement | null | undefined;
  actionsVisible?: boolean;
};

export function OwnerSelectionPanel({
  workspace,
  capabilities,
  busy,
  onBusy,
  onChoose,
  previewReady,
  onCaptureTime,
  onJumpTo,
  onResultsViewChange,
  actionTarget,
  actionsVisible = true,
}: Props) {
  const demoLimit =
    "execution" in capabilities && capabilities.demoClipLimit !== null
      ? HOSTED_DEMO_POLICY.clips
      : null;
  const expanded =
    "capacity" in capabilities && capabilities.capacity?.manyClips === true;
  const clipLimit =
    demoLimit ?? (expanded ? Number.MAX_SAFE_INTEGER : OWNER_LIMITS.clips);
  const local = capabilities.localMedia;
  const {
    enabled: timestampExchange,
    reader: timestampReaderRef,
    url: timestampUrlRef,
  } = useTimestampExchange(local);
  const timestampInput = useRef<HTMLInputElement>(null);
  const timestampReadingRef = useRef(false);
  const originalOffset = workspace.source.origin?.startMs ?? 0;
  const availableSource = ownerAvailableSourceWindow(workspace.source);
  const [windowed, setWindowed] = useState(false);
  const [windowStart, setWindowStart] = useState(() =>
    restoredTime(availableSource.startMs, originalOffset, true),
  );
  const [windowEnd, setWindowEnd] = useState(() =>
    restoredTime(availableSource.endMs, originalOffset, true),
  );
  const [findAll, setFindAll] = useState(false);
  const [limitNotice, setLimitNotice] = useState(0);
  const analysisAvailable =
    capabilities.aiMode !== "unavailable" &&
    workspace.mode === capabilities.aiMode;
  const [rows, setRows] = useState<Row[]>([]);
  const [minimum, setMinimum] = useState("10"),
    [maximum, setMaximum] = useState(
      String(OWNER_MAX_REQUESTED_CLIP_MS / 1000),
    );
  const [manualOnly, setManualOnly] = useState(
      capabilities.aiMode === "synthetic-ai",
    ),
    [policyRevision, setPolicyRevision] = useState(0);
  const [count, setCount] = useState(
    String(Math.min(OWNER_DEFAULT_AI_COUNT, clipLimit)),
  );
  const [analysis, setAnalysis] = useState<OwnerAnalysis | null>(null);
  const [editingMoment, setEditingMoment] = useState<{
    moment: OwnerMoment;
    number: number;
  } | null>(null);
  function closeMomentEditor(momentId = editingMoment?.moment.id) {
    setEditingMoment(null);
    if (momentId)
      requestAnimationFrame(() =>
        root.current
          ?.querySelector<HTMLButtonElement>(
            `[data-moment-id="${momentId}"] .moment-edit`,
          )
          ?.focus(),
      );
  }
  const [analyzing, setAnalyzing] = useState(false),
    [selected, setSelected] = useState<string[]>([]);
  const [reviewPage, setReviewPage] = useState(0);
  const currentReviewPage = Math.min(
    reviewPage,
    Math.max(0, Math.ceil(selected.length / REVIEW_PAGE_ITEMS) - 1),
  );
  const visibleMoments = new Set(
    selected.slice(
      currentReviewPage * REVIEW_PAGE_ITEMS,
      currentReviewPage * REVIEW_PAGE_ITEMS + REVIEW_PAGE_ITEMS,
    ),
  );
  const [restoring, setRestoring] = useState(true);
  const waiting = analyzing || restoring;
  const [message, setMessage] = useState("");
  const [messageArea, setMessageArea] = useState<
    "analysis" | "manual" | "ai" | "import" | "results" | "action"
  >("action");
  const [limitArea, setLimitArea] = useState<
    "manual" | "ai" | "action" | "results"
  >("manual");
  const [tab, setTab] = useState<SelectionTab>("add");
  const [creationTab, setCreationTab] = useState<"manual" | "ai">(
    capabilities.aiMode === "synthetic-ai" ? "manual" : "ai",
  );
  const tabsId = useId();
  const creationTabsId = `${tabsId}-creation`;
  const root = useRef<HTMLElement>(null);
  const removedAt = useRef<number | null>(null);
  const pending = useRef<AbortController | null>(null),
    mounted = useRef(false);
  const acceptAnalysis = useCallback(
    (result: OwnerAnalysis) => {
      const all = defaultMomentSelection(result);
      const next = demoLimit ? all.slice(0, demoLimit) : all;
      if (next.length < all.length) {
        setLimitArea("results");
        setLimitNotice((value) => value + 1);
      }
      setReviewPage(0);
      setAnalysis(result);
      setSelected(next.map(({ momentId }) => momentId));
      onChoose(next);
      setTab(next.length ? "clips" : "add");
    },
    [onChoose, demoLimit],
  );
  useEffect(() => {
    onResultsViewChange(tab === "clips");
  }, [tab, onResultsViewChange]);
  useEffect(() => {
    if (removedAt.current === null) return;
    const buttons =
      root.current?.querySelectorAll<HTMLButtonElement>(".moment-remove");
    if (buttons?.length)
      buttons[Math.min(removedAt.current, buttons.length - 1)]?.focus();
    else document.getElementById(`${tabsId}-add`)?.focus();
    removedAt.current = null;
  }, [selected, tabsId]);
  function openTab(value: SelectionTab) {
    if (value === "clips" && selected.length === 0) return;
    setTab(value);
  }
  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    onBusy(true);
    void (async () => {
      try {
        const response = await fetch(
          `/api/local/workspace/${workspace.id}/analysis`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("unavailable");
        const restored = await readOwnerAnalysis(
          response,
          workspace.id,
          controller.signal,
        );
        if (restored && !controller.signal.aborted) {
          setRows(
            restored.inputs.ranges.map((input) => {
              const corrected = restored.manual.find((moment) =>
                moment.rangeIds.includes(input.id),
              );
              const row = corrected
                ? {
                    ...input,
                    startMs: (corrected.cut.startFrame * 1000) / OWNER_FPS,
                    endMs: (corrected.cut.endFrame * 1000) / OWNER_FPS,
                  }
                : input;
              return {
                id: row.id,
                start: restoredTime(
                  Math.round(row.startMs),
                  originalOffset,
                  true,
                ),
                end: restoredTime(Math.round(row.endMs), originalOffset, true),
              };
            }),
          );
          setMinimum(String(restored.inputs.aiDuration.minMs / 1000));
          setMaximum(String(restored.inputs.aiDuration.maxMs / 1000));
          setManualOnly(restored.inputs.manualOnly);
          setCreationTab(restored.inputs.manualOnly ? "manual" : "ai");
          setWindowed(Boolean(restored.inputs.window));
          const savedWindow = ownerAnalysisWindow(
            workspace.source,
            restored.inputs.window,
          );
          setWindowStart(
            restoredTime(savedWindow.startMs, originalOffset, true),
          );
          setWindowEnd(restoredTime(savedWindow.endMs, originalOffset, true));
          setFindAll(local && restored.inputs.aiCount === "all");
          setCount(
            String(
              typeof restored.inputs.aiCount === "number"
                ? restored.inputs.aiCount
                : OWNER_DEFAULT_AI_COUNT,
            ),
          );
          setPolicyRevision(restored.inputs.policyRevision);
          acceptAnalysis(restored);
          setMessage("");
        }
      } catch {
        if (!controller.signal.aborted)
          setMessage("Couldn’t load moments. Try Find moments.");
      } finally {
        if (!controller.signal.aborted) {
          setRestoring(false);
          onBusy(false);
        }
      }
    })();
    return () => {
      mounted.current = false;
      if (timestampReadingRef.current) {
        timestampReadingRef.current = false;
        onBusy(false);
      }
      controller.abort();
      pending.current?.abort();
    };
  }, [
    workspace.id,
    workspace.source,
    originalOffset,
    onBusy,
    acceptAnalysis,
    local,
  ]);
  function changed() {
    setPolicyRevision((value) => value + 1);
    setAnalysis(null);
    setSelected([]);
    onChoose([]);
    setMessage("");
  }
  function captureAnalysis(field: "start" | "end") {
    setMessageArea("analysis");
    if (busy || analyzing || !previewReady) return;
    const time = onCaptureTime();
    if (time === null) {
      setMessage("Wait for the source preview to finish seeking.");
      return;
    }
    try {
      const captured = { text: time };
      ownerAnalysisWindow(workspace.source, {
        startMs: fieldMilliseconds(
          field === "start" ? captured : windowStart,
          originalOffset,
        ),
        endMs: fieldMilliseconds(
          field === "end" ? captured : windowEnd,
          originalOffset,
        ),
      });
      changed();
      (field === "start" ? setWindowStart : setWindowEnd)(captured);
    } catch {
      setMessage("Keep Start/End inside the video, at least 1s apart.");
    }
  }
  function exportTimestamps() {
    setMessageArea("results");
    if (!timestampExchange || !analysis || busy) return;
    try {
      const moments = [...analysis.manual, ...analysis.suggestions].filter(
        (moment) => selected.includes(moment.id),
      );
      const text = exportOwnerTimestamps(
        workspace.source,
        moments.map((moment) => moment.cut),
      );
      if (timestampUrlRef.current) URL.revokeObjectURL(timestampUrlRef.current);
      const url = URL.createObjectURL(
        new Blob([text], { type: "application/json" }),
      );
      timestampUrlRef.current = url;
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "clipbuilder-timestamps.json";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
    } catch {
      setMessage("Couldn’t export timestamps. Keep fewer clips in this file.");
    }
  }
  function importTimestamps(file: File) {
    setMessageArea("import");
    if (!timestampExchange || busy) return;
    if (file.size > OWNER_TIMESTAMP_FILE_BYTES) {
      setMessage("Choose a timestamps JSON file smaller than 1 MiB.");
      return;
    }
    timestampReaderRef.current?.abort();
    const reader = new FileReader();
    timestampReaderRef.current = reader;
    timestampReadingRef.current = true;
    onBusy(true);
    reader.onload = () => {
      if (!mounted.current || timestampReaderRef.current !== reader) return;
      try {
        if (typeof reader.result !== "string") throw Error("timestamp_invalid");
        const ranges = importOwnerTimestamps(reader.result, workspace.source);
        changed();
        setRows(
          ranges.map((range) => ({
            id: crypto.randomUUID(),
            start: restoredTime(range.startMs, originalOffset, true),
            end: restoredTime(range.endMs, originalOffset, true),
          })),
        );
        setManualOnly(true);
        setWindowed(false);
        setTab("add");
      } catch (error) {
        setMessage(
          error instanceof Error &&
            error.message === "timestamp_source_mismatch"
            ? "These timestamps belong to a different saved video. Open its matching source."
            : error instanceof Error &&
                error.message === "timestamp_range_invalid"
              ? "Keep timestamps inside this video's available range and supported clip duration."
              : "Choose a valid ClipBuilder timestamps JSON file.",
        );
      } finally {
        timestampReadingRef.current = false;
        if (mounted.current) onBusy(false);
      }
    };
    reader.onerror = () => {
      timestampReadingRef.current = false;
      if (mounted.current) {
        setMessage("Couldn’t read this timestamps file. Try again.");
        onBusy(false);
      }
    };
    reader.onabort = () => {
      timestampReadingRef.current = false;
      if (mounted.current) onBusy(false);
    };
    reader.readAsText(file);
  }
  function editTime(id: string, field: "start" | "end", text: string) {
    changed();
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, [field]: { text } } : row,
      ),
    );
  }
  function manualJumpTime(row: Row, field: "start" | "end") {
    try {
      return manualPreviewJumpSeconds(
        fieldMilliseconds(row[field], originalOffset),
        workspace.source,
        field,
      );
    } catch {
      return null;
    }
  }
  function normalizeTime(id: string, field: "start" | "end") {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) return row;
        try {
          return {
            ...row,
            [field]: normalizedTime(row[field]),
          };
        } catch {
          return row;
        }
      }),
    );
  }
  function parsed(markArea: (area: "analysis" | "manual" | "ai") => void) {
    markArea("analysis");
    const window = ownerAnalysisWindow(
      workspace.source,
      windowed
        ? {
            startMs: fieldMilliseconds(windowStart, originalOffset),
            endMs: fieldMilliseconds(windowEnd, originalOffset),
          }
        : undefined,
    );
    markArea("manual");
    const ranges = rows.map((row) => ({
      id: row.id,
      startMs: fieldMilliseconds(row.start, originalOffset),
      endMs: fieldMilliseconds(row.end, originalOffset),
    }));
    markArea("ai");
    const inputs = ownerAnalysisRequestForCapacity({
      manyClips: expanded,
    }).parse({
      sourceRevision: workspace.revision,
      policyRevision,
      ranges,
      aiDuration: {
        minMs: Number(minimum) * 1000,
        maxMs: Number(maximum) * 1000,
      },
      manualOnly,
      aiCount: local && findAll ? "all" : Number(count),
      ...(windowed ? { window } : {}),
    });
    markArea("manual");
    const bound = ownerWindowFrames(window);
    if (
      inputs.ranges.some((range) => {
        const cut = ownerCut(range, workspace.source.durationMs);
        return (
          cut.startFrame < bound.startFrame || cut.endFrame > bound.endFrame
        );
      })
    )
      throw new Error("manual_outside_source_window");
    if (
      !demoLimit &&
      !expanded &&
      typeof inputs.aiCount === "number" &&
      inputs.aiCount > OWNER_LIMITS.suggestions
    ) {
      markArea("ai");
      throw Error("ai_count_limit");
    }
    return demoLimit ? limitHostedDemoInputs(inputs) : inputs;
  }
  function rounded(row: Row): string {
    try {
      if (
        fieldMilliseconds(row.end, originalOffset) -
          fieldMilliseconds(row.start, originalOffset) >
        OWNER_MAX_REQUESTED_CLIP_MS
      )
        return `Keep clips to ${OWNER_MAX_REQUESTED_CLIP_MS / 1000} seconds or less.`;
      const cut = ownerCut(
        {
          startMs: fieldMilliseconds(row.start, originalOffset),
          endMs: fieldMilliseconds(row.end, originalOffset),
        },
        workspace.source.durationMs,
      );
      return `${Number(((cut.endFrame - cut.startFrame) / OWNER_FPS).toFixed(2))}s`;
    } catch {
      return `Check Start/End (1–${OWNER_MAX_REQUESTED_CLIP_MS / 1000}s).`;
    }
  }
  async function findMoments() {
    if (busy || !analysisAvailable) return;
    let inputs;
    const validation: { area: "analysis" | "manual" | "ai" } = {
      area: "analysis",
    };
    try {
      inputs = parsed((area) => {
        validation.area = area;
      });
      if (
        demoLimit &&
        (inputs.ranges.length !== rows.length ||
          inputs.aiCount !== Number(count) ||
          inputs.manualOnly !== manualOnly)
      ) {
        setLimitArea("action");
        setLimitNotice((value) => value + 1);
        setRows((current) => current.slice(0, demoLimit));
        setCount(String(inputs.aiCount));
        setManualOnly(inputs.manualOnly);
      }
      for (const row of inputs.ranges)
        ownerCut(row, workspace.source.durationMs);
      setRows(
        rows.map((row) => ({
          ...row,
          start: normalizedTime(row.start),
          end: normalizedTime(row.end),
        })),
      );
    } catch (error) {
      const field =
        error instanceof ZodError ? error.issues[0]?.path[0] : undefined;
      const area =
        field === "ranges"
          ? "manual"
          : field === "window"
            ? "analysis"
            : validation.area;
      setMessageArea(area);
      setMessage(
        error instanceof Error && error.message === "ai_count_limit"
          ? "Choose between one and ten suggestions."
          : error instanceof Error &&
              error.message === "manual_outside_source_window"
            ? "Keep manual clips inside the analysis range."
            : field === "aiCount"
              ? "Choose a positive whole number of suggestions."
              : area === "analysis"
                ? "Check the analysis start and end."
                : area === "ai"
                  ? `Use AI durations of 10–${OWNER_MAX_REQUESTED_CLIP_MS / 1000}s, with Max at least Min.`
                  : `Clips must be 1–${OWNER_MAX_REQUESTED_CLIP_MS / 1000}s. Check Start/End.`,
      );
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setAnalyzing(true);
    onBusy(true);
    setAnalysis(null);
    setSelected([]);
    onChoose([]);
    setMessage("");
    setMessageArea("action");
    try {
      const response = await fetch(
        `/api/local/workspace/${workspace.id}/analysis`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputs),
          signal: controller.signal,
        },
      );
      if (!response.ok)
        throw "aiProvider" in capabilities &&
          capabilities.aiProvider === "codex"
          ? await localCodexError(response)
          : new Error("unavailable");
      const result = await readOwnerAnalysis(
        response,
        workspace.id,
        controller.signal,
      );
      if (!result) throw Error("analysis_unavailable");
      if (!controller.signal.aborted && mounted.current) {
        acceptAnalysis(result);
        root.current?.scrollIntoView({ block: "start", behavior: "smooth" });
        setMessage("");
      }
    } catch (failure) {
      setMessageArea("action");
      if (mounted.current)
        setMessage(
          controller.signal.aborted
            ? "Canceled."
            : "aiProvider" in capabilities &&
                capabilities.aiProvider === "codex" &&
                failure instanceof LocalCodexError
              ? failure.message
              : "Couldn’t find moments. Try again.",
        );
    } finally {
      pending.current = null;
      if (mounted.current) {
        setAnalyzing(false);
        onBusy(false);
      }
    }
  }
  function choices(moments: OwnerMoment[], label: string, offset = 0) {
    const retained = moments
      .map((moment, index) => ({ moment, number: offset + index + 1 }))
      .filter(({ moment }) => visibleMoments.has(moment.id));
    if (!retained.length) return null;
    return (
      <section aria-label={label}>
        <div className="moment-section-heading">
          <h3>{label}</h3>
          {timestampExchange &&
            (moments === analysis?.manual ||
              !analysis?.manual.some((moment) =>
                visibleMoments.has(moment.id),
              )) && (
              <>
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={exportTimestamps}
                >
                  Export Timestamps
                </Button>
                <div
                  className="moment-section-feedback"
                  hidden={messageArea !== "results" || !message}
                >
                  <InlineFeedback
                    reserve={false}
                    message={messageArea === "results" ? message : undefined}
                  />
                </div>
              </>
            )}
        </div>
        <ul className="moments">
          {retained.map(({ moment, number }) => (
            <li
              key={moment.id}
              className="moment-card"
              data-moment-id={moment.id}
            >
              <div className="moment-card-still">
                <VideoThumbnail
                  request={{
                    source: `/api/local/workspace/${workspace.id}/source`,
                    timeMs: Math.round(
                      (moment.cut.startFrame * 1000) / OWNER_FPS,
                    ),
                    width: 160,
                    height: 90,
                  }}
                />
                <span className="moment-card-number" aria-hidden="true">
                  {number}
                </span>
              </div>
              <div className="moment-card-body">
                <h4 className="moment-card-title">
                  {moment.evidence?.title ?? `Clip ${number}`}
                </h4>
                <div className="moment-card-meta">
                  <span className="moment-card-range">
                    {ownerTimestamp(
                      ownerOriginalSourceTime(
                        workspace.source,
                        (moment.cut.startFrame * 1000) / OWNER_FPS,
                      ),
                    ).replace(/\.\d{3}$/u, "")}
                    {" – "}
                    {ownerTimestamp(
                      ownerOriginalSourceTime(
                        workspace.source,
                        (moment.cut.endFrame * 1000) / OWNER_FPS,
                      ),
                    ).replace(/\.\d{3}$/u, "")}
                  </span>
                  <span
                    className="moment-card-duration"
                    aria-label={`Duration ${momentDuration(moment.cut)}`}
                  >
                    <Clock3 size={14} aria-hidden="true" />
                    {momentDuration(moment.cut)}
                  </span>
                </div>
              </div>
              <div className="moment-card-actions">
                <Button
                  variant="secondary"
                  icon={Play}
                  aria-label={`Jump to clip ${number}`}
                  disabled={busy || !previewReady}
                  onClick={() => onJumpTo(moment.cut.startFrame / OWNER_FPS)}
                >
                  Jump to
                </Button>
                <div className="moment-card-secondary-actions">
                  <Button
                    variant="quiet"
                    className="moment-edit"
                    icon={Pencil}
                    aria-label={`Edit timestamps for clip ${number}`}
                    aria-haspopup="dialog"
                    disabled={busy}
                    onClick={() => setEditingMoment({ moment, number })}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="quiet"
                    className="moment-remove"
                    icon={Trash2}
                    aria-label={`Remove clip ${number}`}
                    title={`Remove clip ${number}`}
                    disabled={busy}
                    onClick={() => {
                      removedAt.current = selected.indexOf(moment.id);
                      const next = selected.filter((id) => id !== moment.id);
                      setSelected(next);
                      if (!next.length) setTab("add");
                      onChoose(
                        next.map((momentId) => ({
                          analysisId: analysis!.id,
                          momentId,
                          policyRevision: analysis!.inputs.policyRevision,
                        })),
                      );
                    }}
                  >
                    <span>Remove</span>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  return (
    <section
      ref={root}
      className="selection"
      data-waiting={waiting || undefined}
      aria-labelledby="selection-title"
    >
      <h2 id="selection-title" className="local-sr-only">
        Choose moments
      </h2>
      <div
        className="moment-tabs"
        role="tablist"
        aria-label="Choose clips"
        hidden={waiting}
      >
        {SELECTION_TABS.map((value, index) => (
          <button
            key={value}
            id={`${tabsId}-${value}`}
            type="button"
            role="tab"
            aria-selected={tab === value}
            aria-label={value === "add" ? "Add clips" : "Your clips"}
            aria-describedby={
              message &&
              ((value === "add" &&
                (messageArea !== "results" || selected.length === 0)) ||
                (value === "clips" &&
                  selected.length > 0 &&
                  messageArea === "results"))
                ? `${tabsId}-${value}-issue`
                : undefined
            }
            aria-controls={`${tabsId}-${value}-panel`}
            tabIndex={tab === value ? 0 : -1}
            disabled={busy || (value === "clips" && selected.length === 0)}
            onClick={() => openTab(value)}
            onKeyDown={(event) => {
              if (
                busy ||
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const next =
                SELECTION_TABS[
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? 1
                      : (index + 1) % 2
                ]!;
              if (next === "clips" && selected.length === 0) return;
              openTab(next);
              document.getElementById(`${tabsId}-${next}`)?.focus();
            }}
          >
            {value === "add" ? (
              <Plus size={16} aria-hidden="true" />
            ) : (
              <ListVideo size={16} aria-hidden="true" />
            )}
            {value === "add" ? "Add clips" : "Your clips"}
            {value === "clips" && selected.length > 0 && (
              <span className="moment-tab-count" aria-hidden="true">
                {selected.length}
              </span>
            )}
            {message &&
              ((value === "add" &&
                (messageArea !== "results" || selected.length === 0)) ||
                (value === "clips" &&
                  selected.length > 0 &&
                  messageArea === "results")) && (
                <>
                  <CircleAlert
                    size={14}
                    className="editor-tab-issue"
                    aria-hidden="true"
                  />
                  <span
                    className="local-sr-only"
                    id={`${tabsId}-${value}-issue`}
                  >
                    {message}
                  </span>
                </>
              )}
          </button>
        ))}
      </div>
      {!analysisAvailable && (
        <p role="status">
          {capabilities.aiMode === "unavailable"
            ? "AI unavailable. Prepared clips still work."
            : "Reopen this video to use the current AI mode."}
        </p>
      )}
      {restoring && (
        <ProcessingState
          layout="compact"
          className="moment-restoring"
          label="Loading moments"
        />
      )}
      {analyzing && (
        <ProcessingState
          className="moments-processing"
          label={manualOnly ? "Preparing moments" : "Finding moments"}
        >
          {"aiProvider" in capabilities &&
            capabilities.aiProvider === "codex" && (
              <CodexPreparationSteps
                key={workspace.id}
                workspaceId={workspace.id}
              />
            )}
        </ProcessingState>
      )}
      <div
        id={`${tabsId}-add-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-add`}
        hidden={waiting || tab !== "add"}
        tabIndex={0}
        className="moment-form-panel"
      >
        <fieldset
          disabled={busy}
          className="source-window moment-settings-card"
        >
          <legend className="local-sr-only">Analysis range</legend>
          <div className="moment-group-heading" aria-hidden="true">
            <ScanLine size={17} />
            <h3>Analysis range</h3>
          </div>
          <label>
            <span className="local-sr-only">Video range</span>
            <select
              aria-label="Analysis range"
              value={windowed ? "range" : "all"}
              onChange={(event) => {
                changed();
                setWindowed(event.currentTarget.value === "range");
              }}
            >
              <option value="all">
                {workspace.source.availableWindow
                  ? "Entire section"
                  : "Entire video"}
              </option>
              <option value="range">Choose range</option>
            </select>
          </label>
          {windowed && (
            <div className="duration-row">
              {(["start", "end"] as const).map((field) => {
                const value = field === "start" ? windowStart : windowEnd;
                const set = field === "start" ? setWindowStart : setWindowEnd;
                return (
                  <div className="range-time" key={field}>
                    <label>
                      {field === "start" ? "Start" : "End"}
                      <input
                        aria-label={`Analysis ${field}`}
                        aria-invalid={
                          (messageArea === "analysis" && !!message) || undefined
                        }
                        aria-describedby={
                          messageArea === "analysis" && message
                            ? `${tabsId}-analysis-feedback`
                            : undefined
                        }
                        placeholder="HH:MM:SS"
                        maxLength={32}
                        value={value.text}
                        onChange={(event) => {
                          changed();
                          set({ text: event.currentTarget.value });
                        }}
                        onBlur={() => {
                          try {
                            set(
                              restoredTime(
                                fieldMilliseconds(value, originalOffset),
                                originalOffset,
                                true,
                              ),
                            );
                          } catch {
                            /* Keep the invalid input for correction. */
                          }
                        }}
                      />
                    </label>
                    <div className="moment-feedback-row">
                      <Button
                        variant="quiet"
                        icon={Clock3}
                        aria-label={`Capture analysis ${field}`}
                        title="Use current source preview time"
                        disabled={busy || analyzing || !previewReady}
                        onClick={() => captureAnalysis(field)}
                      >
                        Capture
                      </Button>
                      {field === "start" && (
                        <InlineFeedback
                          id={`${tabsId}-analysis-feedback`}
                          message={
                            messageArea === "analysis" ? message : undefined
                          }
                          inline
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!windowed && (
            <InlineFeedback
              id={`${tabsId}-analysis-feedback`}
              message={messageArea === "analysis" ? message : undefined}
              reserve={false}
            />
          )}
        </fieldset>
        <hr className="moment-creation-separator" />
        <section
          className="moment-settings-card moment-creation-card"
          aria-label="Clip creation"
        >
          <ControlTabs
            id={creationTabsId}
            label="Clip creation method"
            className="moment-creation-tabs"
            value={creationTab}
            onChange={setCreationTab}
            disabled={busy}
            items={[
              {
                value: "manual",
                label: `Manual clips${rows.length ? ` · ${rows.length}` : ""}`,
                icon: Film,
                issue:
                  messageArea === "manual" || messageArea === "import"
                    ? message || undefined
                    : undefined,
              },
              {
                value: "ai",
                label: "AI moments",
                icon: Sparkles,
                issue: messageArea === "ai" ? message || undefined : undefined,
              },
            ]}
          />
          <ControlPanel id={creationTabsId} value="manual" active={creationTab}>
            <fieldset disabled={busy} className="moment-method-fields">
              <legend className="local-sr-only">Manual clips</legend>
              {rows.length === 0 && (
                <div className="manual-clips-empty">
                  <Film size={22} aria-hidden="true" />
                  <span>No manual clips</span>
                </div>
              )}
              {rows.map((row, index) => (
                <div className="range-row" key={row.id}>
                  <div className="range-row-heading">
                    <strong>Clip {index + 1}</strong>
                    <Button
                      variant="quiet"
                      icon={Trash2}
                      aria-label={`Remove clip ${index + 1}`}
                      onClick={() => {
                        changed();
                        setRows((current) =>
                          current.filter((item) => item.id !== row.id),
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="range-endpoints">
                    {(["start", "end"] as const).map((field) => {
                      const jumpTime = manualJumpTime(row, field);
                      return (
                        <div className="range-time" key={field}>
                          <label>
                            {field === "start" ? "Start" : "End"}
                            <input
                              value={row[field].text}
                              maxLength={32}
                              aria-label={`Clip ${index + 1} ${field}`}
                              placeholder="HH:MM:SS"
                              aria-describedby={`cut-${row.id}`}
                              aria-invalid={
                                !/^[\d.]+s$/u.test(rounded(row)) || undefined
                              }
                              onChange={(event) =>
                                editTime(row.id, field, event.target.value)
                              }
                              onBlur={() => normalizeTime(row.id, field)}
                            />
                          </label>
                          <div className="manual-time-actions">
                            <Button
                              variant="quiet"
                              icon={Clock3}
                              disabled={!previewReady}
                              aria-label={`Set clip ${index + 1} ${field} to current time`}
                              title="Use current preview time"
                              onClick={() => {
                                if (busy || !previewReady) return;
                                const time = onCaptureTime();
                                if (time !== null)
                                  editTime(row.id, field, time);
                              }}
                            >
                              Capture
                            </Button>
                            <Button
                              variant="quiet"
                              icon={Play}
                              disabled={
                                busy || !previewReady || jumpTime === null
                              }
                              aria-label={`Jump to clip ${index + 1} ${field}`}
                              title="Preview this time"
                              onClick={() => {
                                if (!busy && previewReady && jumpTime !== null)
                                  onJumpTo(jumpTime);
                              }}
                            >
                              Jump to
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <InlineFeedback
                    id={`cut-${row.id}`}
                    message={rounded(row)}
                    tone={/^[\d.]+s$/u.test(rounded(row)) ? "status" : "error"}
                  />
                </div>
              ))}
              <div className="manual-clip-actions moment-feedback-row">
                <InlineFeedback
                  message={
                    (messageArea === "manual" &&
                      rows.every((row) => /^[\d.]+s$/u.test(rounded(row)))) ||
                    messageArea === "import"
                      ? message
                      : undefined
                  }
                  inline
                />
                <Button
                  variant="secondary"
                  disabled={
                    !demoLimit &&
                    rows.length >=
                      (expanded ? OWNER_MANUAL_ROW_LIMIT : OWNER_LIMITS.ranges)
                  }
                  onClick={() => {
                    setLimitArea("manual");
                    if (demoLimit && rows.length >= demoLimit) {
                      setLimitNotice((value) => value + 1);
                      return;
                    }
                    let bounds = availableSource;
                    try {
                      bounds = ownerAnalysisWindow(
                        workspace.source,
                        windowed
                          ? {
                              startMs: fieldMilliseconds(
                                windowStart,
                                originalOffset,
                              ),
                              endMs: fieldMilliseconds(
                                windowEnd,
                                originalOffset,
                              ),
                            }
                          : undefined,
                      );
                    } catch {
                      setMessageArea("analysis");
                      setMessage(
                        "Choose a valid analysis range inside this video.",
                      );
                      return;
                    }
                    changed();
                    setManualOnly(true);
                    setRows((current) => [
                      ...current,
                      {
                        id: crypto.randomUUID(),
                        start: restoredTime(bounds.startMs, originalOffset),
                        end: restoredTime(
                          Math.min(bounds.startMs + 10_000, bounds.endMs),
                          originalOffset,
                        ),
                      },
                    ]);
                  }}
                >
                  Add clip
                </Button>
                {timestampExchange && (
                  <>
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() => timestampInput.current?.click()}
                    >
                      Import JSON
                    </Button>
                    <input
                      ref={timestampInput}
                      type="file"
                      accept="application/json,.json"
                      hidden
                      aria-label="Import timestamps JSON"
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = "";
                        if (file) importTimestamps(file);
                      }}
                    />
                  </>
                )}
              </div>
              {limitNotice > 0 && limitArea === "manual" && (
                <DemoLimitToast key={limitNotice} />
              )}
            </fieldset>
          </ControlPanel>
          <ControlPanel id={creationTabsId} value="ai" active={creationTab}>
            <fieldset
              className="moment-method-fields"
              disabled={busy}
              aria-describedby={
                message && messageArea === "ai"
                  ? `${tabsId}-ai-feedback`
                  : undefined
              }
            >
              <legend className="local-sr-only">AI moments</legend>
              <div className="moment-feedback-row">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={!manualOnly}
                    onChange={(event) => {
                      setLimitArea("ai");
                      if (
                        event.target.checked &&
                        demoLimit &&
                        rows.length >= demoLimit
                      ) {
                        setLimitNotice((value) => value + 1);
                        return;
                      }
                      changed();
                      setManualOnly(!event.target.checked);
                      if (demoLimit) {
                        if (
                          event.target.checked &&
                          Number(count) > demoLimit - rows.length
                        )
                          setLimitNotice((value) => value + 1);
                        setCount(
                          String(
                            Math.min(
                              Number(count) || 1,
                              demoLimit - rows.length,
                            ),
                          ),
                        );
                      }
                    }}
                  />
                  Suggest clips
                </label>
                <InlineFeedback
                  id={`${tabsId}-ai-feedback`}
                  message={messageArea === "ai" ? message : undefined}
                  inline
                />
              </div>
              {!manualOnly && (
                <div className="moment-ai-options">
                  <div className="duration-row">
                    <label>
                      Clips
                      <input
                        type="number"
                        min="1"
                        max={
                          demoLimit
                            ? Math.max(1, demoLimit - rows.length)
                            : expanded
                              ? undefined
                              : OWNER_LIMITS.suggestions
                        }
                        step="1"
                        value={count}
                        disabled={manualOnly || (local && findAll)}
                        onChange={(event) => {
                          setLimitArea("ai");
                          changed();
                          const value = event.currentTarget.value;
                          if (
                            demoLimit &&
                            value !== "" &&
                            Number(value) > demoLimit - rows.length
                          ) {
                            setCount(
                              String(Math.max(1, demoLimit - rows.length)),
                            );
                            setLimitNotice((current) => current + 1);
                          } else setCount(value);
                        }}
                      />
                    </label>
                    {local && (
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={findAll}
                          onChange={(event) => {
                            changed();
                            setFindAll(event.target.checked);
                          }}
                        />
                        <Sparkles size={16} aria-hidden="true" />
                        Find all
                      </label>
                    )}
                  </div>
                  <div className="duration-row">
                    <label>
                      Min (s)
                      <input
                        type="number"
                        min="10"
                        max={OWNER_MAX_REQUESTED_CLIP_MS / 1000}
                        step="1"
                        value={minimum}
                        onChange={(event) => {
                          changed();
                          setMinimum(event.target.value);
                        }}
                      />
                    </label>
                    <label>
                      Max (s)
                      <input
                        type="number"
                        min="10"
                        max={OWNER_MAX_REQUESTED_CLIP_MS / 1000}
                        step="1"
                        value={maximum}
                        onChange={(event) => {
                          changed();
                          setMaximum(event.target.value);
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}
              {limitNotice > 0 && limitArea === "ai" && (
                <DemoLimitToast key={limitNotice} />
              )}
            </fieldset>
          </ControlPanel>
        </section>
        {analysis && selected.length === 0 && (
          <div className="moment-empty-results">
            <AnalysisCoverageStatus coverage={analysis.coverage} />
            <InlineFeedback
              message="No clips yet. Adjust your settings to try again."
              tone="status"
              reserve={false}
            />
          </div>
        )}
      </div>
      {actionsVisible && tab === "add" && (
        <WorkflowActions target={actionTarget} label="Moment actions">
          <InlineFeedback
            message={
              messageArea === "action" ||
              (messageArea === "results" && selected.length === 0)
                ? message
                : undefined
            }
            tone={message === "Canceled." ? "status" : "error"}
          />
          {limitNotice > 0 && limitArea === "action" && (
            <DemoLimitToast key={limitNotice} />
          )}
          {!waiting && (
            <Button
              variant="primary"
              disabled={
                busy || !analysisAvailable || (manualOnly && rows.length === 0)
              }
              onClick={() => void findMoments()}
              aria-busy={analyzing}
            >
              {manualOnly
                ? "Use clips"
                : local && findAll
                  ? "Find all moments"
                  : "Find moments"}
            </Button>
          )}
          {analyzing && (
            <Button
              variant="secondary"
              onClick={() => pending.current?.abort()}
            >
              Cancel analysis
            </Button>
          )}
        </WorkflowActions>
      )}
      <div
        id={`${tabsId}-clips-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-clips`}
        hidden={waiting || tab !== "clips"}
        tabIndex={0}
      >
        {analysis && (
          <>
            <AnalysisCoverageStatus coverage={analysis.coverage} />
            <p className="selection-count" role="status">
              {selected.length} {selected.length === 1 ? "clip" : "clips"}
              {selected.length > clipLimit
                ? ` · Remove ${selected.length - clipLimit} to keep ${clipLimit} or fewer.`
                : ""}
            </p>
            {limitNotice > 0 && limitArea === "results" && (
              <DemoLimitToast key={limitNotice} />
            )}
            <InlineFeedback
              reserve={false}
              message={
                !analysis.inputs.manualOnly &&
                analysis.inputs.aiCount !== "all" &&
                analysis.suggestions.length <
                  (analysis.inputs.aiCount ?? OWNER_DEFAULT_AI_COUNT)
                  ? `${analysis.suggestions.length} of ${analysis.inputs.aiCount ?? OWNER_DEFAULT_AI_COUNT} suggestions found.`
                  : undefined
              }
              tone="status"
            />
            {selected.length > REVIEW_PAGE_ITEMS && (
              <nav className="collection-navigation" aria-label="Moment pages">
                <Button
                  variant="secondary"
                  disabled={busy || currentReviewPage === 0}
                  onClick={() => setReviewPage(currentReviewPage - 1)}
                >
                  Previous
                </Button>
                <span>
                  {currentReviewPage * REVIEW_PAGE_ITEMS + 1}–
                  {Math.min(
                    selected.length,
                    (currentReviewPage + 1) * REVIEW_PAGE_ITEMS,
                  )}{" "}
                  of {selected.length}
                </span>
                <Button
                  variant="secondary"
                  disabled={
                    busy ||
                    (currentReviewPage + 1) * REVIEW_PAGE_ITEMS >=
                      selected.length
                  }
                  onClick={() => setReviewPage(currentReviewPage + 1)}
                >
                  Next
                </Button>
              </nav>
            )}
            <div className="choices">
              {choices(analysis.manual, "Manual clips")}
              {choices(
                analysis.suggestions,
                analysis.mode === "synthetic-ai"
                  ? "Demo suggestions"
                  : "Suggestions",
                analysis.manual.length,
              )}
            </div>
          </>
        )}
      </div>
      {editingMoment && analysis && (
        <MomentRangeDialog
          workspace={workspace}
          analysis={analysis}
          moment={editingMoment.moment}
          number={editingMoment.number}
          onBusy={onBusy}
          onClose={() => closeMomentEditor()}
          onAccepted={(result, replacementId) => {
            const next = correctedMomentSelection(analysis, result, selected);
            setAnalysis(result);
            setSelected(next.map((item) => item.momentId));
            onChoose(next);
            closeMomentEditor(replacementId);
          }}
        />
      )}
    </section>
  );
}
