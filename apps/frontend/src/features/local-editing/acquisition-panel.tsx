import { Button } from "../../shared/ui/button";
import { Progress } from "../../shared/ui/progress";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, Link2, LoaderCircle } from "lucide-react";
import {
  ownerAcquisitionProgressSchema,
  ownerYoutubeOfferSchema,
  type OwnerAcquisitionProgress,
  type OwnerYoutubeOffer,
} from "../../../../../packages/contracts/local/acquisition.ts";
import {
  ownerSourceLookupSchema,
  ownerSourceImportSchema,
  type OwnerSavedSourceEntry,
} from "../../../../../packages/contracts/local/acquisition-flow.ts";
import {
  ownerWorkspaceSchema,
  type OwnerWorkspace,
} from "../../../../../packages/contracts/local/index.ts";
import type { OwnerRuntimeCapabilities } from "../../../../../packages/contracts/local/runtime.ts";
import {
  resolutionChoices,
  savedResolutionChoices,
  youtubeAudioTrack,
} from "./resolution-choices.ts";
import { YoutubePreview } from "./youtube-preview.tsx";
import {
  ownerAnalysisWindow,
  ownerSourceTimestamp,
  parseOwnerSourceTimestamp,
  type OwnerSourceWindow,
} from "../../../../../packages/contracts/local/source-window.ts";
import { ownerSourceCoversOriginalWindow } from "../../../../../packages/contracts/local/acquisition-section.ts";

const stages: Record<OwnerAcquisitionProgress["stage"], string> = {
  queued: "Starting download…",
  video: "Downloading video…",
  audio: "Downloading audio…",
  merging: "Preparing video…",
  inspecting: "Checking video…",
  publishing: "Saving video…",
  ready: "Video ready",
  canceling: "Canceling…",
  canceled: "Download canceled",
  failed: "Download failed",
};
const running = (progress: OwnerAcquisitionProgress | null) =>
  !!progress && !["ready", "canceled", "failed"].includes(progress.stage);
const size = (bytes: number) =>
  bytes >= 1024 ** 3
    ? (bytes / 1024 ** 3).toFixed(1) + " GB"
    : (bytes / 1024 ** 2).toFixed(1) + " MB";
const savedChoice = (entry: OwnerSavedSourceEntry) =>
  "saved:" + entry.destination + ":" + entry.variant.id;
type Action = "resolve" | "metadata" | "use" | "cancel";

export function OwnerAcquisitionPanel({
  workspace,
  capabilities,
  busy,
  initializing = false,
  onBusy,
  onOpen,
}: {
  workspace: OwnerWorkspace | null;
  capabilities: OwnerRuntimeCapabilities | null;
  busy: boolean;
  initializing?: boolean;
  onBusy: (busy: boolean) => void;
  onOpen: (workspace: OwnerWorkspace) => void;
}) {
  const formId = useId();
  const resolutionId = useId();
  const [url, setUrl] = useState("");
  const [checkedUrl, setCheckedUrl] = useState("");
  const [step, setStep] = useState<"url" | "resolution">("url");
  const [lookup, setLookup] = useState<ReturnType<
    typeof ownerSourceLookupSchema.parse
  > | null>(null);
  const [offer, setOffer] = useState<OwnerYoutubeOffer | null>(null);
  const [choice, setChoice] = useState("");
  const [audioTrack, setAudioTrack] = useState("");
  const [sectionOnly, setSectionOnly] = useState(false);
  const [sectionStart, setSectionStart] = useState("00:00:00");
  const [sectionEnd, setSectionEnd] = useState<string | null>(null);
  const [downloadSettings, setDownloadSettings] = useState<"quality" | "range">(
    "quality",
  );
  const [progress, setProgress] = useState<OwnerAcquisitionProgress | null>(
    null,
  );
  const [pending, setPending] = useState<Action | null>(null);
  const [message, setMessage] = useState("");
  const [shownDownload, setShownDownload] = useState<string | null>(null);
  const alive = useRef(false),
    request = useRef<AbortController | null>(null),
    ownedBusy = useRef(false),
    revision = useRef(0),
    completed = useRef<string | null>(null),
    busyCallback = useRef(onBusy),
    openCallback = useRef(onOpen),
    currentWorkspace = useRef(workspace?.id ?? null);
  const active = running(progress);
  const ready = capabilities !== null && !initializing;
  const checked = !!lookup && checkedUrl === url.trim();
  const codex = capabilities?.localMedia && capabilities.aiProvider === "codex";
  const originalDuration =
    offer?.durationMs ??
    lookup?.saved[0]?.variant.actual.origin?.durationMs ??
    lookup?.saved[0]?.variant.actual.durationMs ??
    0;
  let downloadWindow: OwnerSourceWindow | undefined,
    validWindow = !sectionOnly;
  try {
    if (sectionOnly) {
      downloadWindow = ownerAnalysisWindow(
        { durationMs: originalDuration },
        {
          startMs: parseOwnerSourceTimestamp(sectionStart),
          endMs: parseOwnerSourceTimestamp(
            sectionEnd ?? ownerSourceTimestamp(originalDuration),
          ),
        },
      );
      validWindow = true;
    }
  } catch {
    /* Keep invalid fields editable, without dispatch. */
  }
  const tracks = [
    ...new Map(
      [
        ...(offer?.choices
          .filter((item) => item.supported && item.audio)
          .map((item) => item.audio!) ?? []),
        ...(lookup?.saved.map((entry) => entry.variant.audio) ?? []),
      ].map((audio) => [youtubeAudioTrack(audio), audio]),
    ).entries(),
  ];
  const effectiveTrack = tracks.some(([key]) => key === audioTrack)
    ? audioTrack
    : (tracks.find(([, audio]) => audio.role === "original")?.[0] ??
      tracks[0]?.[0]);
  const saved = savedResolutionChoices(
    (lookup?.saved ?? []).filter(
      (entry) =>
        (!codex || youtubeAudioTrack(entry.variant.audio) === effectiveTrack) &&
        (!downloadWindow ||
          ownerSourceCoversOriginalWindow(
            entry.variant.actual,
            downloadWindow,
          )),
    ),
    codex,
  );
  const resolutions = resolutionChoices(
    (offer?.choices ?? [])
      .map((item) =>
        downloadWindow && ["duration", "bytes"].includes(item.reason ?? "")
          ? { ...item, supported: true, reason: null }
          : item,
      )
      .filter(
        (item) =>
          !codex ||
          (!!item.audio && youtubeAudioTrack(item.audio) === effectiveTrack),
      ),
    codex,
  ).filter(
    (item) =>
      codex ||
      !saved.some(
        (entry) =>
          Math.min(entry.variant.actual.width, entry.variant.actual.height) ===
          item.tier,
      ),
  );
  const highest = [
    ...saved
      .filter((entry) =>
        ownerSourceCoversOriginalWindow(entry.variant.actual, downloadWindow),
      )
      .map((entry) => ({
        value: savedChoice(entry),
        tier: Math.min(entry.variant.actual.width, entry.variant.actual.height),
        fps: entry.variant.actual.fps,
      })),
    ...resolutions.map((item) => ({
      value: item.id,
      tier: item.tier,
      fps: item.video.fps,
    })),
  ].sort((a, b) => b.tier - a.tier || b.fps - a.fps)[0];
  const resolvedChoice = choice === "highest" ? highest?.value : choice;
  const selectedSaved = saved.find(
    (entry) => savedChoice(entry) === resolvedChoice,
  );
  const selected = resolutions.find((item) => item.id === resolvedChoice);
  const canUse =
    checked &&
    validWindow &&
    !workspace &&
    Boolean(
      selectedSaved ||
      (capabilities?.sourceMode &&
        offer?.mode === capabilities.sourceMode &&
        selected?.supported),
    );
  useEffect(() => {
    busyCallback.current = onBusy;
    openCallback.current = onOpen;
    currentWorkspace.current = workspace?.id ?? null;
  }, [onBusy, onOpen, workspace?.id]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
      if (ownedBusy.current) busyCallback.current(false);
    };
  }, []);
  useEffect(() => {
    if (active || pending) {
      ownedBusy.current = true;
      onBusy(true);
    } else if (ownedBusy.current) {
      ownedBusy.current = false;
      onBusy(false);
    }
  }, [active, pending, onBusy]);
  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const read = async () => {
      const atRevision = revision.current;
      try {
        const response = await fetch("/api/local/sources/state", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("unavailable");
        const value = ownerAcquisitionProgressSchema
          .nullable()
          .parse(await response.json());
        if (!controller.signal.aborted && atRevision === revision.current) {
          if (value && running(value)) {
            setShownDownload(value.id);
            setStep("resolution");
          }
          setProgress(value);
          if (value?.stage === "ready" && completed.current !== value.id) {
            if (!currentWorkspace.current) {
              const opened = await fetch("/api/local/workspace", {
                signal: controller.signal,
              });
              if (!opened.ok) throw new Error("unavailable");
              const restored = ownerWorkspaceSchema
                .nullable()
                .parse(await opened.json());
              if (restored && !controller.signal.aborted)
                openCallback.current(restored);
            }
            completed.current = value.id;
          }
        }
      } catch {
        if (!controller.signal.aborted)
          setMessage("Download status unavailable.");
      }
      if (!controller.signal.aborted)
        timer = setTimeout(() => void read(), 1000);
    };
    void read();
    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [ready]);
  async function post(
    path: string,
    body: unknown,
    signal: AbortSignal,
  ): Promise<unknown> {
    const response = await fetch("/api/local/sources/" + path, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("unavailable");
    return response.json();
  }
  async function loadOffer(link: string, signal: AbortSignal) {
    const value = ownerYoutubeOfferSchema.parse(
      await post("metadata", { url: link }, signal),
    );
    if (!alive.current || signal.aborted) return;
    setOffer(value);
    setChoice("");
  }
  async function action(kind: Action) {
    if (!ready || !capabilities) return;
    if (request.current || (busy && kind !== "cancel")) return;
    if ((active || workspace) && kind !== "cancel") return;
    const controller = new AbortController();
    request.current = controller;
    revision.current++;
    setPending(kind);
    setMessage("");
    try {
      if (kind === "resolve") {
        const link = url.trim();
        const value = ownerSourceLookupSchema.parse(
          await post("lookup", { url: link }, controller.signal),
        );
        if (!alive.current || controller.signal.aborted) return;
        setLookup(value);
        setCheckedUrl(link);
        setStep("resolution");
        setOffer(null);
        const ready = savedResolutionChoices(value.saved, codex)[0];
        if (ready) setChoice(savedChoice(ready));
        else if (value.metadataAvailable && capabilities.sourceMode)
          await loadOffer(link, controller.signal);
        else
          setMessage(
            codex
              ? "No supported video available."
              : "No English video available at 480p–1440p.",
          );
      } else if (kind === "metadata") {
        if (!checked || !lookup?.metadataAvailable || !capabilities.sourceMode)
          throw new Error("unavailable");
        await loadOffer(checkedUrl, controller.signal);
      } else if (kind === "use") {
        if (!canUse) return;
        if (selectedSaved) {
          const value = ownerWorkspaceSchema.parse(
            await post(
              "open",
              {
                destination: selectedSaved.destination,
                variantId: selectedSaved.variant.id,
                ...(downloadWindow ? { window: downloadWindow } : {}),
              },
              controller.signal,
            ),
          );
          if (alive.current && !controller.signal.aborted) onOpen(value);
        } else {
          if (!offer || !selected) return;
          const value = ownerAcquisitionProgressSchema.parse(
            await post(
              "import",
              ownerSourceImportSchema.parse({
                destination: "downloads",
                request: {
                  sourceId: offer.sourceId,
                  revision: offer.revision,
                  choiceId: selected.id,
                  selection: { kind: "variant" },
                  ...(downloadWindow ? { window: downloadWindow } : {}),
                },
              }),
              controller.signal,
            ),
          );
          if (alive.current && !controller.signal.aborted) {
            setShownDownload(value.id);
            setProgress(value);
          }
        }
      } else {
        const value = ownerAcquisitionProgressSchema.parse(
          await post("cancel", undefined, controller.signal),
        );
        if (alive.current && !controller.signal.aborted) setProgress(value);
      }
    } catch {
      if (alive.current && !controller.signal.aborted)
        setMessage(
          kind === "use"
            ? "Couldn’t open this video. Try again."
            : kind === "cancel"
              ? "Couldn’t confirm cancellation."
              : "Couldn’t load resolutions. Try again.",
        );
    } finally {
      request.current = null;
      if (alive.current) setPending(null);
    }
  }
  function changeLink() {
    setShownDownload(null);
    setStep("url");
    setLookup(null);
    setCheckedUrl("");
    setOffer(null);
    setChoice("");
    setAudioTrack("");
    setSectionOnly(false);
    setSectionStart("00:00:00");
    setSectionEnd(null);
    setDownloadSettings("quality");
    setMessage("");
  }
  const disabled = !ready || busy || !!pending || active || !!workspace;
  const hasChoices = saved.length > 0 || !!offer;
  const openingSaved = pending === "use" && !!selectedSaved;
  const transferring = active || (pending === "use" && !selectedSaved);
  const transfer = active ? progress : null;
  const outcome =
    progress?.id === shownDownload &&
    ["failed", "canceled"].includes(progress.stage)
      ? progress
      : null;
  const fraction =
    transfer &&
    ["video", "audio"].includes(transfer.stage) &&
    transfer.totalBytes !== null
      ? transfer.downloadedBytes / transfer.totalBytes
      : undefined;
  const retry =
    !hasChoices && capabilities?.sourceMode && lookup?.metadataAvailable;
  const settingsVisible =
    step === "resolution" &&
    originalDuration > 0 &&
    !transferring &&
    !openingSaved;
  return (
    <section
      className="source-card youtube-card"
      aria-labelledby="acquisition-title"
    >
      <div className="source-card-heading">
        <span className="source-icon">
          <Link2 size={24} aria-hidden="true" />
        </span>
        <h2
          id="acquisition-title"
          className={settingsVisible ? "local-sr-only" : undefined}
        >
          {step === "url"
            ? "YouTube link"
            : transferring
              ? "Downloading video"
              : "Choose resolution"}
        </h2>
        {settingsVisible && (
          <div
            className="control-tabs acquisition-tabs"
            role="group"
            aria-label="Download settings"
          >
            {(["quality", "range"] as const).map((tab) => (
              <Button
                key={tab}
                variant="quiet"
                disabled={disabled}
                aria-pressed={downloadSettings === tab}
                onClick={() => setDownloadSettings(tab)}
              >
                {tab === "quality" ? "Quality" : "Range"}
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="source-card-body">
        {step === "resolution" &&
          (selectedSaved ? (
            <YoutubePreview
              key={savedChoice(selectedSaved)}
              source={{
                kind: "saved",
                destination: selectedSaved.destination,
                variantId: selectedSaved.variant.id,
              }}
              title={offer?.preview?.title ?? "Saved video"}
              resolution={Math.min(
                selectedSaved.variant.actual.width,
                selectedSaved.variant.actual.height,
              )}
            />
          ) : offer?.preview ? (
            <YoutubePreview
              key={offer.sourceId}
              source={{ kind: "youtube", sourceId: offer.sourceId }}
              title={offer.preview.title}
              resolution={selected?.tier}
            />
          ) : codex ? null : (
            <div className="youtube-preview-placeholder" aria-hidden="true" />
          ))}
        {step === "url" ? (
          <form
            id={formId}
            onSubmit={(event) => {
              event.preventDefault();
              void action("resolve");
            }}
          >
            <p>Paste a video link.</p>
            <fieldset className="link-fields" disabled={disabled}>
              <legend className="local-sr-only">YouTube video</legend>
              <label>
                Video URL
                <span className="youtube-url-field">
                  <input
                    type="url"
                    aria-label="YouTube link"
                    value={url}
                    autoComplete="off"
                    onChange={(event) => {
                      setUrl(event.currentTarget.value);
                      setMessage("");
                    }}
                    placeholder="youtube.com/watch?v=…"
                    required
                  />
                  {initializing && (
                    <span className="youtube-startup-indicator" role="status">
                      <LoaderCircle
                        size={18}
                        className="acquisition-spinner"
                        aria-hidden="true"
                      />
                      <span className="local-sr-only">Loading YouTube…</span>
                    </span>
                  )}
                </span>
              </label>
            </fieldset>
          </form>
        ) : transferring ? (
          <article
            className="download-progress"
            aria-label="Video download progress"
          >
            <Progress
              label={stages[transfer?.stage ?? "queued"]}
              {...(fraction === undefined ? {} : { fraction })}
              {...(transfer
                ? {
                    valueText: `${size(transfer.downloadedBytes)}${transfer.totalBytes === null ? "" : " / " + size(transfer.totalBytes)}`,
                  }
                : {})}
            />
            {transfer &&
              (transfer.downloadedBytes > 0 ||
                transfer.totalBytes !== null) && (
                <p className="download-bytes">
                  {size(transfer.downloadedBytes)}
                  {transfer.totalBytes === null
                    ? ""
                    : " / " + size(transfer.totalBytes)}
                </p>
              )}
          </article>
        ) : (
          <>
            <fieldset className="link-fields" disabled={disabled}>
              <legend className="local-sr-only">Video quality</legend>
              {originalDuration > 0 && downloadSettings === "range" && (
                <div className="download-window">
                  <label>
                    Download range
                    <select
                      aria-label="Download range"
                      value={sectionOnly ? "section" : "all"}
                      onChange={(event) => {
                        setSectionOnly(event.currentTarget.value === "section");
                        setChoice("");
                      }}
                    >
                      <option value="all">
                        {selectedSaved &&
                        !ownerSourceCoversOriginalWindow(
                          selectedSaved.variant.actual,
                        )
                          ? "Entire saved section"
                          : "Entire video"}
                      </option>
                      <option value="section">Choose range</option>
                    </select>
                  </label>
                  {sectionOnly && (
                    <div className="duration-row">
                      {(["start", "end"] as const).map((edge) => (
                        <label key={edge}>
                          {edge === "start" ? "Start" : "End"}
                          <input
                            aria-label={`Download ${edge}`}
                            placeholder="HH:MM:SS"
                            maxLength={32}
                            value={
                              edge === "start"
                                ? sectionStart
                                : (sectionEnd ??
                                  ownerSourceTimestamp(
                                    originalDuration,
                                  ).replace(/\.000$/u, ""))
                            }
                            onChange={(event) => {
                              (edge === "start"
                                ? setSectionStart
                                : setSectionEnd)(event.currentTarget.value);
                              setChoice("");
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  )}
                  {!validWindow && (
                    <p role="status">
                      Choose start and end times inside this video.
                    </p>
                  )}
                </div>
              )}
              <div
                className={codex ? "download-quality-pair" : undefined}
                hidden={downloadSettings !== "quality"}
              >
                {codex && tracks.length > 0 && (
                  <label>
                    <span>Audio track</span>
                    <select
                      aria-label="Audio track"
                      value={effectiveTrack}
                      onChange={(event) => {
                        setAudioTrack(event.currentTarget.value);
                        setChoice("");
                      }}
                    >
                      {tracks.map(([key, audio]) => (
                        <option key={key} value={key}>
                          {audio.language ?? "Unknown language"} · {audio.role}
                          {audio.trackId ? ` · ${audio.trackId}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {(saved.length > 0 || resolutions.length > 0) && (
                  <label>
                    <span>Resolution</span>
                    <select
                      className="select-control"
                      id={resolutionId}
                      value={choice}
                      onChange={(event) => setChoice(event.currentTarget.value)}
                    >
                      <option value="" disabled>
                        Select resolution
                      </option>
                      {codex && highest && (
                        <option value="highest">
                          Highest · {highest.tier}p
                        </option>
                      )}
                      {saved.length > 0 && (
                        <optgroup label="Saved on this device">
                          {saved.map((entry) => (
                            <option
                              key={savedChoice(entry)}
                              value={savedChoice(entry)}
                            >
                              {Math.min(
                                entry.variant.actual.width,
                                entry.variant.actual.height,
                              )}
                              p ·{" "}
                              {ownerSourceCoversOriginalWindow(
                                entry.variant.actual,
                              )
                                ? "Saved"
                                : "Saved section"}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {offer && (
                        <optgroup label="Available to download">
                          {resolutions.map((item) => (
                            <option
                              key={item.id}
                              value={item.id}
                              disabled={!item.supported}
                            >
                              {item.tier}p
                              {codex
                                ? ` · ${item.video.fps} fps · ${item.video.codec}`
                                : ""}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </label>
                )}
                {pending === "resolve" || pending === "metadata" ? (
                  <p className="acquisition-loading" role="status">
                    <LoaderCircle
                      size={18}
                      className="acquisition-spinner"
                      aria-hidden="true"
                    />
                    Loading resolutions…
                  </p>
                ) : hasChoices ? (
                  <>
                    {offer && !resolutions.length && !selectedSaved && (
                      <p role="status">
                        {codex
                          ? "No supported video available for this audio track."
                          : "No English video available at 480p–1440p."}
                      </p>
                    )}
                    {!offer &&
                      lookup?.metadataAvailable &&
                      capabilities?.sourceMode && (
                        <Button
                          variant="quiet"
                          onClick={() => void action("metadata")}
                        >
                          More resolutions
                        </Button>
                      )}
                  </>
                ) : null}
              </div>
            </fieldset>
            {outcome && (
              <p className="download-outcome" role="status">
                {outcome.error === "capacity"
                  ? "Not enough free disk space. Free space and retry."
                  : sectionOnly && outcome.stage === "failed"
                    ? "Couldn’t download this section. Retry or choose Entire video."
                    : stages[outcome.stage]}
              </p>
            )}
          </>
        )}
        <p className="flow-notice" role="status" aria-live="polite">
          {message}
        </p>
      </div>
      <footer className="source-card-footer">
        <nav
          className="source-actions youtube-actions"
          aria-label="YouTube actions"
        >
          {step === "url" ? (
            <Button
              type="submit"
              form={formId}
              disabled={disabled || !url.trim()}
            >
              {pending ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="acquisition-spinner"
                    aria-hidden="true"
                  />
                  Checking…
                </>
              ) : (
                "Continue"
              )}
            </Button>
          ) : transferring ? (
            <Button
              variant="secondary"
              disabled={!!pending || transfer?.stage === "canceling"}
              onClick={() => void action("cancel")}
            >
              Cancel download
            </Button>
          ) : retry ? (
            <Button disabled={disabled} onClick={() => void action("metadata")}>
              Try again
            </Button>
          ) : (
            <Button
              disabled={disabled || !canUse}
              aria-busy={openingSaved}
              aria-label={openingSaved ? "Opening video" : undefined}
              onClick={() => void action("use")}
            >
              {openingSaved ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="acquisition-spinner"
                    aria-hidden="true"
                  />
                  Opening…
                </>
              ) : selectedSaved ? (
                "Use video"
              ) : (
                "Download video"
              )}
            </Button>
          )}
          {step === "resolution" && (
            <Button
              variant="quiet"
              icon={ArrowLeft}
              disabled={disabled}
              onClick={changeLink}
            >
              Change link
            </Button>
          )}
        </nav>
        <span className="source-card-footnote source-hint">
          {capabilities?.sourceMode === "synthetic-source"
            ? "Simulated download."
            : capabilities && !capabilities.sourceMode
              ? "Downloads unavailable. Saved copies still work."
              : null}
        </span>
      </footer>
    </section>
  );
}
