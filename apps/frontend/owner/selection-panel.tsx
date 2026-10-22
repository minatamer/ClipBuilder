import { useEffect, useRef, useState } from "react";
import {
  OWNER_LIMITS,
  type OwnerWorkspace,
} from "../../../packages/contracts/owner/index.ts";
import {
  OWNER_FPS,
  ownerAnalysisInputsSchema,
  ownerAnalysisSchema,
  ownerCut,
  ownerTimestamp,
  parseOwnerTimestamp,
  type OwnerAnalysis,
  type OwnerMomentExport,
  type OwnerMoment,
} from "../../../packages/contracts/owner/selection.ts";
import type { OwnerRuntimeCapabilities } from "../../../packages/contracts/owner/runtime.ts";

type Row = { id: string; start: string; end: string };
type Props = {
  workspace: OwnerWorkspace;
  capabilities: OwnerRuntimeCapabilities;
  busy: boolean;
  onBusy: (busy: boolean) => void;
  onChoose: (selection: OwnerMomentExport[]) => void;
};

export function OwnerSelectionPanel({
  workspace,
  capabilities,
  busy,
  onBusy,
  onChoose,
}: Props) {
  const synthetic = capabilities.aiMode === "synthetic-ai";
  const analysisAvailable =
    capabilities.aiMode !== "unavailable" &&
    workspace.mode === capabilities.aiMode;
  const [rows, setRows] = useState<Row[]>([]);
  const [minimum, setMinimum] = useState("10"),
    [maximum, setMaximum] = useState("60");
  const [manualOnly, setManualOnly] = useState(false),
    [policyRevision, setPolicyRevision] = useState(0);
  const [analysis, setAnalysis] = useState<OwnerAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false),
    [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState(
    "Add any exact ranges you already want, then find additional moments.",
  );
  const pending = useRef<AbortController | null>(null),
    mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    onBusy(true);
    void (async () => {
      try {
        const response = await fetch(
          `/api/workspace/${workspace.id}/analysis`,
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
              start: ownerTimestamp(row.startMs),
              end: ownerTimestamp(row.endMs),
            })),
          );
          setMinimum(String(restored.inputs.aiDuration.minMs / 1000));
          setMaximum(String(restored.inputs.aiDuration.maxMs / 1000));
          setManualOnly(restored.inputs.manualOnly);
          setPolicyRevision(restored.inputs.policyRevision);
          setAnalysis(restored);
          setMessage(
            "The last completed analysis is restored for this running session. Choose a moment to export.",
          );
        }
      } catch {
        if (!controller.signal.aborted)
          setMessage(
            "Saved session analysis is unavailable. You can submit new inputs.",
          );
      } finally {
        if (!controller.signal.aborted) onBusy(false);
      }
    })();
    return () => {
      mounted.current = false;
      controller.abort();
      pending.current?.abort();
    };
  }, [workspace.id, onBusy]);
  function changed() {
    setPolicyRevision((value) => value + 1);
    setAnalysis(null);
    setSelected([]);
    onChoose([]);
    setMessage("Inputs changed. Choose Find moments to run the next analysis.");
  }
  function parsed() {
    return ownerAnalysisInputsSchema.parse({
      sourceRevision: workspace.revision,
      policyRevision,
      ranges: rows.map((row) => ({
        id: row.id,
        startMs: parseOwnerTimestamp(row.start),
        endMs: parseOwnerTimestamp(row.end),
      })),
      aiDuration: {
        minMs: Number(minimum) * 1000,
        maxMs: Number(maximum) * 1000,
      },
      manualOnly,
    });
  }
  function rounded(row: Row): string {
    try {
      const cut = ownerCut(
        {
          startMs: parseOwnerTimestamp(row.start),
          endMs: parseOwnerTimestamp(row.end),
        },
        workspace.source.durationMs,
      );
      return `Actual cut ${ownerTimestamp((cut.startFrame * 1000) / OWNER_FPS)}–${ownerTimestamp((cut.endFrame * 1000) / OWNER_FPS)} · ${cut.endFrame - cut.startFrame} frames`;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "This range is unsupported.";
    }
  }
  async function findMoments() {
    if (busy || !analysisAvailable) return;
    let inputs;
    try {
      inputs = parsed();
      for (const row of inputs.ranges)
        ownerCut(row, workspace.source.durationMs);
    } catch {
      setMessage(
        "Check each range below. AI minimum/maximum must be 10–60 seconds, minimum ≤ maximum, with a possible 30fps duration. Exact equal bounds are allowed.",
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
    setMessage(
      `Running one ${synthetic ? "simulated " : ""}transcription and independent selection…`,
    );
    try {
      const response = await fetch(`/api/workspace/${workspace.id}/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("unavailable");
      const result = ownerAnalysisSchema.parse(await response.json());
      if (!controller.signal.aborted && mounted.current) {
        setAnalysis(result);
        setMessage(
          `Ready: ${result.manual.length} manual cuts and ${result.suggestions.length} additional ${result.mode === "synthetic-ai" ? "simulated " : ""}suggestions. ${result.mode === "synthetic-ai" ? "Simulated" : "Provider"} calls: transcription ${result.calls.transcription}, selection ${result.calls.selection}.`,
        );
      }
    } catch {
      if (mounted.current)
        setMessage(
          controller.signal.aborted
            ? "Analysis canceled. Your manual rows are preserved."
            : "Analysis failed. Your manual rows are preserved; retry only when you choose.",
        );
    } finally {
      pending.current = null;
      if (mounted.current) {
        setAnalyzing(false);
        onBusy(false);
      }
    }
  }
  function choices(moments: OwnerMoment[], label: string) {
    return (
      <section aria-label={label}>
        <h3>{label}</h3>
        {moments.length === 0 ? (
          <p>
            {label !== "Your exact requests"
              ? "No qualifying AI suggestions. Manual requests remain available."
              : "No manual cuts requested."}
          </p>
        ) : (
          <ul className="moments">
            {moments.map((moment, index) => (
              <li key={moment.id}>
                <p>
                  {moment.evidence?.title ?? `Owner cut ${index + 1}`} ·{" "}
                  {ownerTimestamp((moment.cut.startFrame * 1000) / OWNER_FPS)}–
                  {ownerTimestamp((moment.cut.endFrame * 1000) / OWNER_FPS)} ·{" "}
                  {moment.cut.endFrame - moment.cut.startFrame} frames
                </p>
                <p>
                  {moment.rangeIds.length
                    ? `${moment.rangeIds.length} manual row(s)${moment.evidence ? " · also discovered independently" : ""}`
                    : analysis?.mode === "synthetic-ai"
                      ? "Independent simulated discovery"
                      : "Independent provider discovery"}
                </p>
                <button
                  disabled={
                    busy ||
                    (!selected.includes(moment.id) &&
                      selected.length >= OWNER_LIMITS.clips)
                  }
                  aria-pressed={selected.includes(moment.id)}
                  onClick={() => {
                    const next = selected.includes(moment.id)
                      ? selected.filter((id) => id !== moment.id)
                      : [...selected, moment.id];
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
                  Choose {label === "Your exact requests" ? "manual" : "AI"} cut{" "}
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }
  return (
    <section className="selection" aria-labelledby="selection-title">
      <h2 id="selection-title">Choose moments</h2>
      <p>
        {capabilities.aiMode === "unavailable"
          ? "Fresh analysis is unavailable. Local media playback and prepared edits do not need AI access."
          : !analysisAvailable
            ? "This workspace retains a different AI provenance from the current runtime. Open a new processing source for fresh analysis; saved results and prepared edits remain available."
            : synthetic
              ? "AI is simulated. Fictional transcript words do not describe your source. No provider calls or automatic real captions."
              : "Fresh analysis uses the configured provider. Review its timed words and suggestions before use."}
      </p>
      {analysis && (
        <p>
          {analysis.mode === "synthetic-ai"
            ? "The saved analysis below uses fictional simulated words and suggestions."
            : "The saved provider analysis below retains its supplied words and timings."}
        </p>
      )}
      <p role="status" aria-live="polite">
        {message}
      </p>
      <fieldset disabled={busy}>
        <legend>Exact manual requests</legend>
        <p>
          Up to ten ranges, 1–300 seconds each. AI duration settings do not
          change these requests. Endpoints round by at most one 30fps frame.
        </p>
        {rows.map((row, index) => (
          <div className="range-row" key={row.id}>
            <label>
              Range {index + 1} start
              <input
                value={row.start}
                aria-describedby={`cut-${row.id}`}
                onChange={(event) => {
                  changed();
                  setRows((current) =>
                    current.map((item) =>
                      item.id === row.id
                        ? { ...item, start: event.target.value }
                        : item,
                    ),
                  );
                }}
              />
            </label>
            <label>
              Range {index + 1} end
              <input
                value={row.end}
                aria-describedby={`cut-${row.id}`}
                onChange={(event) => {
                  changed();
                  setRows((current) =>
                    current.map((item) =>
                      item.id === row.id
                        ? { ...item, end: event.target.value }
                        : item,
                    ),
                  );
                }}
              />
            </label>
            <button
              onClick={() => {
                changed();
                setRows((current) =>
                  current.filter((item) => item.id !== row.id),
                );
              }}
            >
              Remove range {index + 1}
            </button>
            <p id={`cut-${row.id}`}>{rounded(row)}</p>
          </div>
        ))}
        <button
          disabled={rows.length >= OWNER_LIMITS.ranges}
          onClick={() => {
            changed();
            setRows((current) => [
              ...current,
              {
                id: crypto.randomUUID(),
                start: "00:00:00.000",
                end: ownerTimestamp(
                  Math.min(10_000, workspace.source.durationMs),
                ),
              },
            ]);
          }}
        >
          Add exact range
        </button>
      </fieldset>
      <fieldset disabled={busy}>
        <legend>Additional AI discovery</legend>
        <div className="duration-row">
          <label>
            AI minimum seconds
            <input
              type="number"
              min="10"
              max="60"
              step="0.001"
              value={minimum}
              onChange={(event) => {
                changed();
                setMinimum(event.target.value);
              }}
            />
          </label>
          <label>
            AI maximum seconds
            <input
              type="number"
              min="10"
              max="60"
              step="0.001"
              value={maximum}
              onChange={(event) => {
                changed();
                setMaximum(event.target.value);
              }}
            />
          </label>
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={manualOnly}
            onChange={(event) => {
              changed();
              setManualOnly(event.target.checked);
            }}
          />
          Manual-only run (one {synthetic ? "simulated " : ""}transcription
          still supplies cues)
        </label>
      </fieldset>
      <nav>
        <button
          disabled={busy || !analysisAvailable}
          onClick={() => void findMoments()}
        >
          Find moments
        </button>
        {analyzing && (
          <button onClick={() => pending.current?.abort()}>
            Cancel analysis
          </button>
        )}
      </nav>
      {analysis && (
        <div className="choices">
          {choices(analysis.manual, "Your exact requests")}
          {choices(
            analysis.suggestions,
            analysis.mode === "synthetic-ai"
              ? "Additional simulated AI suggestions"
              : "Additional AI suggestions",
          )}
        </div>
      )}
    </section>
  );
}
