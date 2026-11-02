import { OWNER_COLLECTION_PAGE_ITEMS as REVIEW_PAGE_ITEMS } from "../../../../../packages/contracts/local/collection-pages.ts";
import { readOwnerAnalysis } from "./collection-pages.ts";
import { Button } from "../../shared/ui/button";
import { Play, Trash2, Clock3, Sparkles } from "lucide-react";
import { ProcessingState } from "../../shared/ui/processing-state";
import { WorkflowActions } from "./workflow-actions.tsx";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { localCodexError, LocalCodexError } from "./codex-errors.ts";
import {
  OWNER_LIMITS,
  type OwnerWorkspace,
} from "../../../../../packages/contracts/local/index.ts";
import {
  OWNER_FPS,
  ownerAnalysisRequestSchema,
  ownerCut,
  ownerTimestamp,
  type OwnerAnalysis,
  type OwnerMomentExport,
  type OwnerMoment,
} from "../../../../../packages/contracts/local/selection.ts";
import type { OwnerRuntimeCapabilities } from "../../../../../packages/contracts/local/runtime.ts";
import {
  OWNER_DEFAULT_AI_COUNT,
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
import { defaultMomentSelection, momentDuration } from "./moment-selection.ts";
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
  footerTarget?: HTMLElement | null | undefined;
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
  footerTarget,
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
  const [tab, setTab] = useState<SelectionTab>("add");
  const tabsId = useId();
  const root = useRef<HTMLElement>(null);
  const removedAt = useRef<number | null>(null);
  const pending = useRef<AbortController | null>(null),
    mounted = useRef(false);
  const acceptAnalysis = useCallback(
    (result: OwnerAnalysis) => {
      const all = defaultMomentSelection(result);
      const next = demoLimit ? all.slice(0, demoLimit) : all;
      if (next.length < all.length) setLimitNotice((value) => value + 1);
      setReviewPage(0);
      setAnalysis(result);
      setSelected(next.map(({ momentId }) => momentId));
      onChoose(next);
      setTab("clips");
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
    else document.getElementById(`${tabsId}-clips-panel`)?.focus();
    removedAt.current = null;
  }, [selected, tabsId]);
  function openTab(value: SelectionTab) {
    setTab(value);
    root.current?.scrollIntoView({ block: "start", behavior: "smooth" });
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
            restored.inputs.ranges.map((row) => ({
              id: row.id,
              start: restoredTime(row.startMs, originalOffset),
              end: restoredTime(row.endMs, originalOffset),
            })),
          );
          setMinimum(String(restored.inputs.aiDuration.minMs / 1000));
          setMaximum(String(restored.inputs.aiDuration.maxMs / 1000));
          setManualOnly(restored.inputs.manualOnly);
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
  function editTime(id: string, field: "start" | "end", text: string) {
    changed();
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, [field]: { text } } : row,
      ),
    );
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
  function parsed() {
    const window = ownerAnalysisWindow(
      workspace.source,
      windowed
        ? {
            startMs: fieldMilliseconds(windowStart, originalOffset),
            endMs: fieldMilliseconds(windowEnd, originalOffset),
          }
        : undefined,
    );
    const inputs = ownerAnalysisRequestSchema.parse({
      sourceRevision: workspace.revision,
      policyRevision,
      ranges: rows.map((row) => ({
        id: row.id,
        startMs: fieldMilliseconds(row.start, originalOffset),
        endMs: fieldMilliseconds(row.end, originalOffset),
      })),
      aiDuration: {
        minMs: Number(minimum) * 1000,
        maxMs: Number(maximum) * 1000,
      },
      manualOnly,
      aiCount: local && findAll ? "all" : Number(count),
      ...(windowed ? { window } : {}),
    });
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
    )
      throw Error("ai_count_limit");
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
      return "Check start and end times.";
    }
  }
  async function findMoments() {
    if (busy || !analysisAvailable) return;
    let inputs;
    try {
      inputs = parsed();
      if (
        demoLimit &&
        (inputs.ranges.length !== rows.length ||
          inputs.aiCount !== Number(count) ||
          inputs.manualOnly !== manualOnly)
      ) {
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
      setMessage(
        error instanceof Error && error.message === "ai_count_limit"
          ? "Choose between one and ten suggestions."
          : error instanceof Error &&
              error.message === "manual_outside_source_window"
            ? "Keep manual clips inside the analysis range."
            : windowed
              ? "Choose a valid analysis range inside this video, and check clip times."
              : manualOnly
                ? `Manual clips must be 1–${OWNER_MAX_REQUESTED_CLIP_MS / 1000} seconds. Check start and end times.`
                : `Check clip times: manual clips must be 1–${OWNER_MAX_REQUESTED_CLIP_MS / 1000}s and AI durations 10–${OWNER_MAX_REQUESTED_CLIP_MS / 1000}s.`,
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
        setMessage(
          !result.inputs.manualOnly &&
            result.inputs.aiCount !== "all" &&
            result.suggestions.length <
              (result.inputs.aiCount ?? OWNER_DEFAULT_AI_COUNT)
            ? `${result.suggestions.length} of ${result.inputs.aiCount ?? OWNER_DEFAULT_AI_COUNT} suggestions found.`
            : "",
        );
      }
    } catch (failure) {
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
        <h3>{label}</h3>
        <ul className="moments">
          {retained.map(({ moment, number }) => (
            <li key={moment.id} className="moment-card">
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
                <Button
                  variant="quiet"
                  className="moment-remove"
                  icon={Trash2}
                  aria-label={`Remove clip ${number}`}
                  disabled={busy}
                  onClick={() => {
                    removedAt.current = selected.indexOf(moment.id);
                    const next = selected.filter((id) => id !== moment.id);
                    setSelected(next);
                    onChoose(
                      next.map((momentId) => ({
                        analysisId: analysis!.id,
                        momentId,
                        policyRevision: analysis!.inputs.policyRevision,
                      })),
                    );
                  }}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  return (
    <section ref={root} className="selection" aria-labelledby="selection-title">
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
            aria-controls={`${tabsId}-${value}-panel`}
            tabIndex={tab === value ? 0 : -1}
            disabled={busy || (value === "clips" && !analysis)}
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
              if (next === "clips" && !analysis) return;
              openTab(next);
              document.getElementById(`${tabsId}-${next}`)?.focus();
            }}
          >
            {value === "add" ? "Add clips" : "Your clips"}
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
      <p className="flow-notice" role="status" aria-live="polite">
        {message}
      </p>
      {limitNotice > 0 && <DemoLimitToast key={limitNotice} />}
      {waiting && (
        <ProcessingState
          label={
            restoring
              ? "Loading moments"
              : manualOnly
                ? "Preparing moments"
                : "Finding moments"
          }
        >
          {analyzing &&
            "aiProvider" in capabilities &&
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
      >
        <fieldset disabled={busy} className="source-window">
          <legend>Analysis range</legend>
          <label>
            Video range
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
                  <label key={field}>
                    {field === "start" ? "Start" : "End"}
                    <input
                      aria-label={`Analysis ${field}`}
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
                );
              })}
            </div>
          )}
        </fieldset>
        <fieldset disabled={busy}>
          <legend>Manual clips</legend>
          {rows.map((row, index) => (
            <div className="range-row" key={row.id}>
              {(["start", "end"] as const).map((field) => (
                <div className="range-time" key={field}>
                  <label>
                    {field === "start" ? "Start" : "End"}
                    <input
                      value={row[field].text}
                      maxLength={32}
                      aria-label={`Clip ${index + 1} ${field}`}
                      placeholder="HH:MM:SS"
                      aria-describedby={`cut-${row.id}`}
                      onChange={(event) =>
                        editTime(row.id, field, event.target.value)
                      }
                      onBlur={() => normalizeTime(row.id, field)}
                    />
                  </label>
                  <Button
                    variant="quiet"
                    icon={Clock3}
                    disabled={!previewReady}
                    aria-label={`Set clip ${index + 1} ${field} to current time`}
                    title="Use current preview time"
                    onClick={() => {
                      if (busy || !previewReady) return;
                      const time = onCaptureTime();
                      if (time !== null) editTime(row.id, field, time);
                    }}
                  >
                    Capture
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
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
              <p id={`cut-${row.id}`}>{rounded(row)}</p>
            </div>
          ))}
          <Button
            variant="secondary"
            disabled={!demoLimit && rows.length >= OWNER_LIMITS.ranges}
            onClick={() => {
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
                        startMs: fieldMilliseconds(windowStart, originalOffset),
                        endMs: fieldMilliseconds(windowEnd, originalOffset),
                      }
                    : undefined,
                );
              } catch {
                setMessage("Choose a valid analysis range inside this video.");
                return;
              }
              changed();
              if (demoLimit && !manualOnly) {
                const remaining = demoLimit - rows.length - 1;
                if (Number(count) > remaining) {
                  setCount(String(Math.max(1, remaining)));
                  setLimitNotice((value) => value + 1);
                }
                if (!remaining) setManualOnly(true);
              }
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
        </fieldset>
        <fieldset disabled={busy}>
          <legend>AI moments</legend>
          <label className="check">
            <input
              type="checkbox"
              checked={!manualOnly}
              onChange={(event) => {
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
                      Math.min(Number(count) || 1, demoLimit - rows.length),
                    ),
                  );
                }
              }}
            />
            Suggest clips
          </label>
          {!manualOnly && (
            <>
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
                      changed();
                      const value = event.currentTarget.value;
                      if (
                        demoLimit &&
                        value !== "" &&
                        Number(value) > demoLimit - rows.length
                      ) {
                        setCount(String(Math.max(1, demoLimit - rows.length)));
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
            </>
          )}
        </fieldset>
      </div>
      {actionsVisible && tab === "add" && (
        <WorkflowActions target={footerTarget} label="Moment actions">
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
            {analysis.coverage && analysis.coverage.state !== "complete" && (
              <p role="status">
                {analysis.coverage.state === "canceled"
                  ? "Canceled"
                  : "Partial results"}{" "}
                � {analysis.coverage.completed}/{analysis.coverage.planned}{" "}
                sections complete. Use Add clips to retry; completed work is
                retained.
              </p>
            )}
            <p className="selection-count" role="status">
              {selected.length} {selected.length === 1 ? "clip" : "clips"}
              {selected.length > clipLimit
                ? ` · Remove ${selected.length - clipLimit} to keep ${clipLimit} or fewer.`
                : ""}
            </p>
            {selected.length === 0 && <p>No clips yet.</p>}
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
    </section>
  );
}
