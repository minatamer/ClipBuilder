import { Button } from "../../shared/ui/button";
import { Play, Trash2, Clock3 } from "lucide-react";
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
  ownerAnalysisSchema,
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
import { normalizeManualTime, parseManualTime } from "./manual-time.ts";
import { defaultMomentSelection, momentDuration } from "./moment-selection.ts";
import {
  HOSTED_DEMO_POLICY,
  limitHostedDemoInputs,
} from "../../../../../packages/contracts/local/hosted-editing.ts";
import { DemoLimitToast } from "./demo-limit-toast.tsx";

const SELECTION_TABS = ["add", "clips"] as const;
type SelectionTab = (typeof SELECTION_TABS)[number];

type TimeField = { text: string; preservedMs?: number };
type Row = { id: string; start: TimeField; end: TimeField };
const restoredTime = (milliseconds: number): TimeField => ({
  text: ownerTimestamp(milliseconds).slice(0, 8),
  preservedMs: milliseconds,
});
const fieldMilliseconds = (field: TimeField) =>
  field.preservedMs ?? parseManualTime(field.text);
const normalizedTime = (field: TimeField): TimeField => ({
  ...field,
  text: normalizeManualTime(field.text),
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
  const clipLimit = demoLimit ?? OWNER_LIMITS.clips;
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
    String(demoLimit ?? OWNER_DEFAULT_AI_COUNT),
  );
  const [analysis, setAnalysis] = useState<OwnerAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false),
    [selected, setSelected] = useState<string[]>([]);
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
        const restored = ownerAnalysisSchema
          .nullable()
          .parse(await response.json());
        if (restored && !controller.signal.aborted) {
          setRows(
            restored.inputs.ranges.map((row) => ({
              id: row.id,
              start: restoredTime(row.startMs),
              end: restoredTime(row.endMs),
            })),
          );
          setMinimum(String(restored.inputs.aiDuration.minMs / 1000));
          setMaximum(String(restored.inputs.aiDuration.maxMs / 1000));
          setManualOnly(restored.inputs.manualOnly);
          setCount(String(restored.inputs.aiCount ?? OWNER_DEFAULT_AI_COUNT));
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
  }, [workspace.id, onBusy, acceptAnalysis]);
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
    const inputs = ownerAnalysisRequestSchema.parse({
      sourceRevision: workspace.revision,
      policyRevision,
      ranges: rows.map((row) => ({
        id: row.id,
        startMs: fieldMilliseconds(row.start),
        endMs: fieldMilliseconds(row.end),
      })),
      aiDuration: {
        minMs: Number(minimum) * 1000,
        maxMs: Number(maximum) * 1000,
      },
      manualOnly,
      aiCount: Number(count),
    });
    return demoLimit ? limitHostedDemoInputs(inputs) : inputs;
  }
  function rounded(row: Row): string {
    try {
      if (
        fieldMilliseconds(row.end) - fieldMilliseconds(row.start) >
        OWNER_MAX_REQUESTED_CLIP_MS
      )
        return `Keep clips to ${OWNER_MAX_REQUESTED_CLIP_MS / 1000} seconds or less.`;
      const cut = ownerCut(
        {
          startMs: fieldMilliseconds(row.start),
          endMs: fieldMilliseconds(row.end),
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
    } catch {
      setMessage(
        manualOnly
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
      const result = ownerAnalysisSchema.parse(await response.json());
      if (!controller.signal.aborted && mounted.current) {
        acceptAnalysis(result);
        root.current?.scrollIntoView({ block: "start", behavior: "smooth" });
        setMessage(
          !result.inputs.manualOnly &&
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
      .filter(({ moment }) => selected.includes(moment.id));
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
                      (moment.cut.startFrame * 1000) / OWNER_FPS,
                    ).slice(0, 8)}
                    {" – "}
                    {ownerTimestamp(
                      (moment.cut.endFrame * 1000) / OWNER_FPS,
                    ).slice(0, 8)}
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
        />
      )}
      <div
        id={`${tabsId}-add-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-add`}
        hidden={waiting || tab !== "add"}
        tabIndex={0}
      >
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
                  start: { text: "00:00:00" },
                  end: restoredTime(
                    Math.min(10_000, workspace.source.durationMs),
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
              <label>
                Clips
                <input
                  type="number"
                  min="1"
                  max={
                    demoLimit
                      ? Math.max(1, demoLimit - rows.length)
                      : OWNER_LIMITS.suggestions
                  }
                  step="1"
                  value={count}
                  disabled={manualOnly}
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
              {manualOnly ? "Use clips" : "Find moments"}
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
            <p className="selection-count" role="status">
              {selected.length} {selected.length === 1 ? "clip" : "clips"}
              {selected.length > clipLimit
                ? ` · Remove ${selected.length - clipLimit} to keep ${clipLimit} or fewer.`
                : ""}
            </p>
            {selected.length === 0 && <p>No clips yet.</p>}
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
