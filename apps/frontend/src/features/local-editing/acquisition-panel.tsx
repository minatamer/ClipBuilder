import { Button } from "../../shared/ui/button";
import { Progress } from "../../shared/ui/progress";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, Link2, LoaderCircle } from "lucide-react";
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
} from "./resolution-choices.ts";
import { YoutubePreview } from "./youtube-preview.tsx";

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
  const saved = savedResolutionChoices(lookup?.saved ?? []);
  const selectedSaved = saved.find((entry) => savedChoice(entry) === choice);
  const resolutions = resolutionChoices(offer?.choices ?? []).filter(
    (item) =>
      !saved.some(
        (entry) =>
          Math.min(entry.variant.actual.width, entry.variant.actual.height) ===
          item.tier,
      ),
  );
  const selected = resolutions.find((item) => item.id === choice);
  const canUse =
    checked &&
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
        const ready = savedResolutionChoices(value.saved)[0];
        if (ready) setChoice(savedChoice(ready));
        else if (value.metadataAvailable && capabilities.sourceMode)
          await loadOffer(link, controller.signal);
        else setMessage("No English video available at 480p–1440p.");
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
  return (
    <section
      className="source-card youtube-card"
      aria-labelledby="acquisition-title"
    >
      <div className="source-card-heading">
        <span className="source-icon">
          <Link2 size={24} aria-hidden="true" />
        </span>
        <h2 id="acquisition-title">
          {step === "url"
            ? "YouTube link"
            : transferring
              ? "Downloading video"
              : "Choose resolution"}
        </h2>
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
          ) : (
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
              {(saved.length > 0 || resolutions.length > 0) && (
                <label>
                  <span>Resolution</span>
                  <span className="youtube-resolution-select">
                    <select
                      id={resolutionId}
                      value={choice}
                      onChange={(event) => setChoice(event.currentTarget.value)}
                    >
                      <option value="" disabled>
                        Select resolution
                      </option>
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
                              p · Saved
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
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <ChevronDown size={18} aria-hidden="true" />
                  </span>
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
                      No English video available at 480p–1440p.
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
            </fieldset>
            {outcome && (
              <p className="download-outcome" role="status">
                {stages[outcome.stage]}
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
