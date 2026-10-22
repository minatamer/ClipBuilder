import { useEffect, useRef, useState } from "react";
import {
  ownerAcquisitionProgressSchema,
  ownerYoutubeOfferSchema,
  type OwnerAcquisitionProgress,
  type OwnerYoutubeOffer,
  type OwnerYoutubeSupportReason,
} from "../../../packages/contracts/owner/acquisition.ts";
import {
  ownerSourceCatalogSchema,
  ownerSourceLookupSchema,
  ownerSourceImportSchema,
  type OwnerSourceCatalog,
  type OwnerSavedSourceEntry,
  type OwnerSourceDestination,
} from "../../../packages/contracts/owner/acquisition-flow.ts";
import {
  OWNER_LIMITS,
  ownerWorkspaceSchema,
  type OwnerWorkspace,
} from "../../../packages/contracts/owner/index.ts";

const reasons: Record<OwnerYoutubeSupportReason, string> = {
  "video-codec": "Unsupported video codec",
  "audio-codec": "Unsupported audio codec",
  hdr: "HDR requires an unsupported conversion",
  "dynamic-range-unknown": "Dynamic range is not verified",
  drm: "Protected source is unavailable",
  protocol: "Unsupported transfer protocol",
  resolution: "Source dimensions exceed the local profile",
  "frame-rate": "Unsupported source frame rate",
  "audio-layout": "Unsupported audio channel count or sample rate",
  duration: "Source duration exceeds the local profile",
  "source-unavailable": "Source is unavailable",
  bytes: "Source size exceeds the local profile",
  "audio-ambiguous": "Choose an explicit audio variant",
  "audio-missing": "No supported audio stream",
};
const stages: Record<OwnerAcquisitionProgress["stage"], string> = {
  queued: "Queued locally",
  video: "Acquiring video",
  audio: "Acquiring audio",
  merging: "Merging streams locally",
  inspecting: "Inspecting and decoding source",
  publishing: "Saving the complete source",
  ready: "Source ready",
  canceling: "Canceling and draining owned work",
  canceled: "Canceled",
  failed: "Import failed",
};
const running = (progress: OwnerAcquisitionProgress | null) =>
  !!progress && !["ready", "canceled", "failed"].includes(progress.stage);
const size = (bytes: number | null) =>
  bytes === null
    ? "size unknown"
    : bytes >= 1024 ** 3
      ? `${(bytes / 1024 ** 3).toFixed(2)} GiB`
      : `${(bytes / 1024 ** 2).toFixed(1)} MiB`;

function SavedSourceEntries({
  entries,
  group,
  busy,
  pending,
  active,
  workspace,
  catalogError,
  action,
}: {
  entries: OwnerSavedSourceEntry[];
  group: string;
  busy: boolean;
  pending: boolean;
  active: boolean;
  workspace: OwnerWorkspace | null;
  catalogError: boolean;
  action: (
    kind: "open" | "delete" | "locate",
    entry: OwnerSavedSourceEntry,
    file?: File,
  ) => Promise<void>;
}) {
  return (
    <ol className="clip-list">
      {entries.map((entry) => {
        const variant = entry.variant,
          label = `${group} source ${variant.id.slice(0, 8)} at ${variant.actual.width} by ${variant.actual.height}`;
        return (
          <li key={`${entry.destination}-${variant.id}`}>
            <h3>
              Saved source {variant.id.slice(0, 8)} · {variant.state}
            </h3>
            <p>
              {variant.actual.width} × {variant.actual.height} ·{" "}
              {variant.actual.fps}fps · {variant.video.codec}/
              {variant.audio.codec} · {size(variant.actual.bytes)} ·{" "}
              {entry.destination === "downloads" ? "Downloads" : "Desktop"}
            </p>
            <p>
              Saved {new Date(variant.acquiredAt).toLocaleString()} ·{" "}
              {variant.selection.kind === "best"
                ? "Best at acquisition time"
                : "Selected saved variant"}
              . This does not check today’s online maximum.
              {variant.mode === "synthetic-source"
                ? " Synthetic generated source; no YouTube media."
                : ""}
            </p>
            <nav>
              <button
                type="button"
                disabled={
                  busy ||
                  pending ||
                  active ||
                  !!workspace ||
                  variant.state !== "ready" ||
                  catalogError
                }
                aria-label={`Use ${label}`}
                onClick={() => void action("open", entry)}
              >
                Use saved video
              </button>
              <button
                type="button"
                disabled={
                  busy || pending || active || !!workspace || catalogError
                }
                aria-label={`Delete ${label}`}
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete only ${label} and its unshared saved master? Sources referenced by another variant or draft remain protected.`,
                    )
                  )
                    void action("delete", entry);
                }}
              >
                Delete saved variant
              </button>
            </nav>
            {variant.state !== "ready" && (
              <label className="file">
                Locate matching local MP4 for {variant.id.slice(0, 8)}
                <input
                  type="file"
                  accept="video/mp4"
                  disabled={
                    busy || pending || active || !!workspace || catalogError
                  }
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) void action("locate", entry, file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function OwnerAcquisitionPanel({
  workspace,
  busy,
  onBusy,
  onOpen,
}: {
  workspace: OwnerWorkspace | null;
  busy: boolean;
  onBusy: (busy: boolean) => void;
  onOpen: (workspace: OwnerWorkspace) => void;
}) {
  const [url, setUrl] = useState("");
  const [checkedUrl, setCheckedUrl] = useState("");
  const [lookup, setLookup] = useState<ReturnType<
    typeof ownerSourceLookupSchema.parse
  > | null>(null);
  const [offer, setOffer] = useState<OwnerYoutubeOffer | null>(null);
  const [choice, setChoice] = useState("best");
  const [rights, setRights] = useState(false);
  const [destination, setDestination] =
    useState<OwnerSourceDestination>("downloads");
  const [catalog, setCatalog] = useState<OwnerSourceCatalog | null>(null);
  const [progress, setProgress] = useState<OwnerAcquisitionProgress | null>(
    null,
  );
  const [pending, setPending] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [catalogError, setCatalogError] = useState(false);
  const [message, setMessage] = useState(
    "Look for a saved source first, or use a saved video without entering a URL.",
  );
  const alive = useRef(false),
    request = useRef<AbortController | null>(null),
    ownedBusy = useRef(false),
    revision = useRef(0),
    completed = useRef<string | null>(null),
    busyCallback = useRef(onBusy),
    openCallback = useRef(onOpen),
    currentWorkspace = useRef(workspace?.id ?? null);
  const active = running(progress);
  const checked = !!lookup && checkedUrl === url.trim();
  const selected = offer?.choices.find(
    (item) => item.id === (choice === "best" ? offer.bestChoiceId : choice),
  );
  const blockedChoice =
    !selected ||
    !selected.supported ||
    (choice === "best" && offer?.bestReason !== null);
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
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const readCatalog = async () => {
      const atRevision = revision.current;
      try {
        const response = await fetch("/api/sources", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("unavailable");
        const value = ownerSourceCatalogSchema.parse(await response.json());
        if (!controller.signal.aborted && atRevision === revision.current) {
          setCatalog(value);
          setCatalogError(false);
          setLookup((current) =>
            current
              ? {
                  ...current,
                  saved: value.entries.filter(
                    (entry) =>
                      entry.variant.sourceId === current.sourceId &&
                      (!current.mode || entry.variant.mode === current.mode),
                  ),
                }
              : null,
          );
        }
      } catch {
        if (!controller.signal.aborted && atRevision === revision.current)
          setCatalogError(true);
      }
    };
    const readProgress = async () => {
      const atRevision = revision.current;
      try {
        const response = await fetch("/api/sources/state", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("unavailable");
        const value = ownerAcquisitionProgressSchema
          .nullable()
          .parse(await response.json());
        if (!controller.signal.aborted && atRevision === revision.current) {
          setProgress(value);
          if (value?.stage === "ready" && completed.current !== value.id) {
            await readCatalog();
            if (!currentWorkspace.current) {
              const opened = await fetch("/api/workspace", {
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
          setMessage(
            "Import status is unavailable. Completed sources remain saved; refresh local status before retrying an action.",
          );
      }
      if (!controller.signal.aborted)
        timer = setTimeout(() => void readProgress(), 1000);
    };
    void readCatalog();
    void readProgress();
    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [refresh]);
  async function action(
    kind:
      | "lookup"
      | "metadata"
      | "import"
      | "open"
      | "delete"
      | "locate"
      | "cancel",
    entry?: OwnerSavedSourceEntry,
    file?: File,
  ) {
    if (request.current || (busy && kind !== "cancel")) return;
    if (["import", "open", "locate"].includes(kind) && workspace) return;
    const controller = new AbortController();
    request.current = controller;
    revision.current++;
    setPending(true);
    try {
      let path = `/api/sources/${kind}`,
        method = "POST",
        body: BodyInit | undefined;
      let headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (kind === "lookup") body = JSON.stringify({ url: url.trim() });
      else if (kind === "metadata") {
        if (!checked || !rights) throw new Error("unavailable");
        body = JSON.stringify({ url: checkedUrl, rightsAcknowledged: true });
      } else if (kind === "import") {
        if (!offer || !selected || blockedChoice || !rights || !checked)
          throw new Error("unavailable");
        body = JSON.stringify(
          ownerSourceImportSchema.parse({
            destination,
            request: {
              sourceId: offer.sourceId,
              revision: offer.revision,
              choiceId: selected.id,
              selection:
                choice === "best" ? { kind: "best" } : { kind: "variant" },
              rightsAcknowledged: true,
            },
          }),
        );
      } else if (kind === "open") {
        if (!entry) throw new Error("unavailable");
        body = JSON.stringify({
          destination: entry.destination,
          variantId: entry.variant.id,
        });
      } else if (kind === "delete" || kind === "locate") {
        if (!entry) throw new Error("unavailable");
        path = `/api/sources/${entry.destination}/${entry.variant.id}${kind === "locate" ? "/locate" : ""}`;
        if (kind === "delete") method = "DELETE";
        else {
          if (!file || file.size < 1 || file.size > OWNER_LIMITS.sourceBytes)
            throw new Error("unavailable");
          body = file;
          headers = { "Content-Type": "video/mp4" };
        }
      }
      const response = await fetch(path, {
        method,
        signal: controller.signal,
        headers,
        ...(body === undefined ? {} : { body }),
      });
      if (!response.ok) throw new Error("unavailable");
      revision.current++;
      if (kind === "lookup") {
        const value = ownerSourceLookupSchema.parse(await response.json());
        if (!alive.current) return;
        setLookup(value);
        setCheckedUrl(url.trim());
        setOffer(null);
        setChoice("best");
        setMessage(
          value.saved.length
            ? "Saved variants found locally. Use one below without a platform or downloader request."
            : "No saved matching variant. Request offered qualities explicitly if you want a new acquisition.",
        );
      } else if (kind === "metadata") {
        const value = ownerYoutubeOfferSchema.parse(await response.json());
        if (!alive.current) return;
        setOffer(value);
        setChoice("best");
        setMessage(
          value.mode === "synthetic-source"
            ? "Synthetic offered variants are ready. These describe generated fixtures, not availability on YouTube."
            : "Offered source variants are ready. Choose the exact video/audio variant before Import.",
        );
      } else if (kind === "import" || kind === "cancel") {
        const value = ownerAcquisitionProgressSchema.parse(
          await response.json(),
        );
        if (!alive.current) return;
        setProgress(value);
        setMessage(
          kind === "cancel"
            ? value.stage === "ready"
              ? "The import had already completed. Its saved source is preserved."
              : "Cancellation requested. Owned work drains before partial scratch is removed."
            : "Import admitted. The app handles component preparation, local merge, full inspection and saved-source publication.",
        );
      } else if (kind === "open" || kind === "locate") {
        const value = ownerWorkspaceSchema.parse(await response.json());
        if (!alive.current) return;
        onOpen(value);
        setMessage(
          kind === "locate"
            ? "The supplied local file matched the saved digest and supported profile; source reopened without a download."
            : "Saved source validated locally and opened without platform metadata, download or AI calls.",
        );
      } else
        setMessage(
          "The selected saved variant was removed. Other variants, shared masters and saved drafts remain protected by the local host.",
        );
      if (alive.current) setRefresh((value) => value + 1);
    } catch {
      if (alive.current && !controller.signal.aborted)
        setMessage(
          "The action was unavailable or not acknowledged. No lower quality or different file was substituted. Existing saved sources remain; refresh local status before an explicit retry.",
        );
    } finally {
      request.current = null;
      if (alive.current) setPending(false);
    }
  }
  return (
    <section className="selection" aria-labelledby="acquisition-title">
      <h2 id="acquisition-title">YouTube link or saved local source</h2>
      <p role="status" aria-live="polite">
        {message}
      </p>
      <p>
        Current fake mode simulates acquisition with a generated 16-second
        source at the selected dimensions. It does not download YouTube media or
        prove real video availability. Native merge, inspection and encoding run
        locally without AI keys.
      </p>
      <fieldset disabled={busy || pending || active} style={{ minWidth: 0 }}>
        <legend>Full conversation source</legend>
        <label>
          YouTube link
          <input
            type="url"
            style={{ width: "100%", maxWidth: 720 }}
            value={url}
            autoComplete="off"
            onChange={(event) => {
              setUrl(event.currentTarget.value);
              setLookup(null);
              setCheckedUrl("");
              setOffer(null);
              setChoice("best");
              setRights(false);
            }}
            placeholder="Paste a watch, shorts or youtu.be link"
          />
        </label>
        <nav>
          <button
            type="button"
            disabled={!url.trim()}
            onClick={() => void action("lookup")}
          >
            Look for saved source locally
          </button>
        </nav>
        {checked && (
          <>
            <p>
              {lookup?.saved.length ?? 0} saved variants matched this link.
              Local lookup precedes any offered-format request.
            </p>
            <label className="check">
              <input
                type="checkbox"
                checked={rights}
                onChange={(event) => setRights(event.currentTarget.checked)}
              />
              I have the required source rights and permission to acquire it
              through this method.
            </label>
            <button
              type="button"
              disabled={!rights || !!workspace || !lookup?.metadataAvailable}
              onClick={() => void action("metadata")}
            >
              {offer
                ? "Refresh offered qualities explicitly"
                : "Get offered qualities explicitly"}
            </button>
            {!lookup?.metadataAvailable && (
              <p>
                Offered-quality inspection is unavailable in this runtime.
                Intact saved sources still open without downloader or provider
                access.
              </p>
            )}
          </>
        )}
        {offer && (
          <>
            <p>
              {offer.mode === "synthetic-source" ? "Synthetic" : "Offered"}{" "}
              source · {(offer.durationMs / 1000).toFixed(1)} seconds. Each
              choice binds video/audio identities; numeric dimensions are exact,
              never a ceiling.
            </p>
            <label>
              Source resolution and audio variant
              <select
                style={{ width: "100%", maxWidth: "100%" }}
                value={choice}
                onChange={(event) => setChoice(event.currentTarget.value)}
              >
                <option value="best">
                  Best available
                  {offer.bestReason ? ` · ${reasons[offer.bestReason]}` : ""}
                </option>
                {offer.choices.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    disabled={!item.supported}
                  >
                    {item.tier}p · {item.video.width}×{item.video.height} ·{" "}
                    {item.video.fps}fps · {item.video.codec}/
                    {item.audio?.codec ?? "no audio"} ·{" "}
                    {item.video.dynamicRange}
                    {item.audio?.language
                      ? ` · ${item.audio.language}`
                      : ""} · {item.audio?.role ?? "unknown audio"} ·{" "}
                    {item.bytesEstimated ? "estimated " : ""}
                    {size(item.bytes)}
                    {item.reason ? ` · ${reasons[item.reason]}` : ""}
                  </option>
                ))}
              </select>
            </label>
            {selected && (
              <p>
                Selected {selected.video.width} × {selected.video.height},{" "}
                {selected.video.fps}fps · {selected.video.codec}/
                {selected.audio?.codec ?? "no audio"}. Source quality is
                separate from final 1080×1920 export.
              </p>
            )}
            {blockedChoice && (
              <p role="status">
                The chosen option cannot be imported. Choose an explicitly
                offered supported variant; no compatible or lower fallback is
                selected automatically.
              </p>
            )}
            <label>
              Save completed source in
              <select
                value={destination}
                onChange={(event) =>
                  setDestination(
                    event.currentTarget.value as OwnerSourceDestination,
                  )
                }
              >
                <option value="downloads">
                  Downloads / ClipBuilder / Sources
                </option>
                <option
                  value="desktop"
                  disabled={!catalog?.destinations.includes("desktop")}
                >
                  Desktop / ClipBuilder / Sources
                </option>
              </select>
            </label>
            <nav>
              <button
                type="button"
                disabled={blockedChoice || !rights || !checked || !!workspace}
                onClick={() => void action("import")}
              >
                Import selected source in background
              </button>
            </nav>
          </>
        )}
      </fieldset>
      {checked && lookup && lookup.saved.length > 0 && (
        <section aria-label="Saved variants matching the link">
          <SavedSourceEntries
            entries={lookup.saved}
            group="matching"
            busy={busy}
            pending={pending}
            active={active}
            workspace={workspace}
            catalogError={catalogError}
            action={action}
          />
        </section>
      )}
      {workspace && (
        <p>
          Clear the processing workspace before deleting saved sources,
          importing or opening another saved source. Completed source masters
          remain saved independently.
        </p>
      )}
      {progress && (
        <article aria-label="Background source import progress">
          <h3>{stages[progress.stage]}</h3>
          <p>
            {progress.mode === "synthetic-source"
              ? "Simulated platform acquisition; generated source."
              : "Source acquisition."}{" "}
            {size(progress.downloadedBytes)}
            {progress.totalBytes === null
              ? " · total unknown"
              : ` of ${size(progress.totalBytes)}`}
          </p>
          {progress.totalBytes !== null && active && (
            <progress
              aria-label="Source transfer bytes"
              max={progress.totalBytes}
              value={progress.downloadedBytes}
            />
          )}
          {progress.error && (
            <p role="status">
              Source action ended with {progress.error}. Existing completed
              sources remain available.
            </p>
          )}
          <button
            type="button"
            disabled={!active || pending || progress.stage === "canceling"}
            onClick={() => void action("cancel")}
          >
            Cancel background source import
          </button>
        </article>
      )}
      <section aria-label="Saved local video chooser">
        <h3>Use saved video · no URL or online check needed</h3>
        <button
          type="button"
          disabled={busy || pending}
          onClick={() => setRefresh((value) => value + 1)}
        >
          Refresh local saved sources
        </button>
        {catalogError && (
          <p role="alert">
            The local source catalog is unavailable. Refresh before opening or
            deleting a displayed entry.
          </p>
        )}
        {catalog && (
          <p>
            Saved source storage: {size(catalog.bytes)}
            {catalog.warning
              ? " · exceeds the 50 GiB advisory threshold; nothing is deleted automatically."
              : "."}
          </p>
        )}
        {catalog && !catalog.entries.length && (
          <p>No completed saved sources are listed.</p>
        )}
        {catalog && (
          <SavedSourceEntries
            entries={catalog.entries}
            group="catalog"
            busy={busy}
            pending={pending}
            active={active}
            workspace={workspace}
            catalogError={catalogError}
            action={action}
          />
        )}
      </section>
      <p>
        Completed sources survive clipping failures, cancellation, workspace
        clear and app restart. Missing or changed bytes require explicit
        locate-and-validate or a new acquisition. Real downloading remains gated
        on verified tools, source/method permission and a separate owner check;
        real AI continuation also needs its implemented provider adapters, keys,
        live flags and approvals. No offline AI model is supplied.
      </p>
    </section>
  );
}
