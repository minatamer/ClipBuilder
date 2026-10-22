# CL-023 — Download a YouTube source in the background at the chosen resolution

Status: queued for fake/synthetic implementation after its design dependencies;
owner authorized the recommended design and sequential ticket commits 2026-10-22.
Dependencies: CL-017 local workspace/native readiness; CL-022 recorded go
decision, authorized acquisition path, supported source envelope and tooling
decision. If CL-022 is no-go, do not implement a downloader. CL-018–021 must
work with files without this ticket. Real retrieval remains unauthorized;
implement and validate only the fake/synthetic acquisition path for now.

## Objective and value

Implement paste a YouTube link → choose an available resolution or Best
available → Import → automatic background download/merge/inspection → continue
into the same local timestamp, AI-discovery and editing flow. No manual video
download, external downloader, browser Save as, manual merge or re-upload is
required. The owner explicitly clarified this desired behavior on 2026-10-22;
only research and ticket edits are authorized today.

Best available defaults to the highest accessible source resolution. A numeric
selection must keep that resolution; missing/inaccessible quality is a visible
failure or explicit new owner choice. An owner-master file may be offered as a
fallback but cannot satisfy this ticket's normal YouTube-link acceptance by
itself. Source/method clearance and real availability remain CL-022 gates.

## Scope and ownership

Frontend local link/quality/import progress; backend local acquisition use case
and URL validation; renderer-owned media inspection/normalization; owner
contract for source provenance and quality metadata. Share validated media
through local DTOs, never app-to-app source imports. Method-specific code exists
only after the CL-022 choice. No deployed intake, YouTube account integration,
playlist/channel batch, livestream archive, auto-publishing or general
remote-URL fetcher.

See the [research](../research/LOCAL_OWNER_WORKFLOW_2026-10-22.md). Prefer a
stable local copy for render/re-edit. Keep acquired high-quality media distinct
from small AI/preview proxies. Report actual width/height, frame rate, codec,
audio availability and known/estimated size before processing. Best available
means highest accessible source resolution under a documented tie-break policy;
do not silently substitute Best compatible, promise the creator original or
upscale absent detail to meet a requested tier.

For a new acquisition, enumerate offered formats before the owner chooses.
Present actual tiers such as 720p, 1080p, 1440p and 2160p/4K only when present,
with real dimensions/frame rate and support/size status. Use shorter-edge labels
for portrait sources. Unsupported codec/capacity choices carry a reason. Numeric
choices are exact tiers, not upper bounds; the request binds the selected tier
and inspected format identity, then validates actual downloaded dimensions and
audio. Availability changes or an unsupported tier must stop safely instead of
silently downgrading. Any optional lower tier requires an explicit choice.

If best available uses an unsupported codec/container or HDR, explicitly offer a
documented compatible conversion/quality choice or stop. Reusing inspected
source decoder boundaries and maintained tools is mandatory; importing AV1, HDR
or a new container is not automatically approved. A high-resolution source does
not change final 1080×1920 SDR output. Original-master preservation and
conversion scratch follow the chosen workspace retention/size policy.

## Contracts, state and safety

State: link-entered → validating → local-lookup. A saved match follows
saved-variants → local-validation → source-ready. The new-acquisition branch is
online-metadata-ready → format-selected → importing → inspected → source-ready,
with canceled/failed terminal paths. An explicit availability refresh updates
metadata only; it does not start importing. Rights/access acknowledgement and an
explicit Import action precede acquisition. Link inspection itself may use
network, so it is separately admitted and never triggered on each keystroke.
Bind approved provenance privately to the resulting source fingerprint/clock;
trimmed sections carry original-source offset. Subsequent CL-018 controls
operate on the inspected local media, not approximate remote playback
timestamps.

Within importing, report downloading video/audio → merging → inspecting as
separate stages; use byte progress where known and honest indeterminate totals
otherwise. The background task belongs to the local application lifetime, not a
new always-running daemon. Merge streams without lossy re-encoding when
possible; any necessary supported conversion is separate from the acquired
master and its declared selected quality. Native tool readiness includes a
reviewed downloader, FFmpeg and the supported JS runtime/matching EJS
components. No runtime downloads or self-updates. Format-access restrictions
fail safely within the cleared method; no automatic account/session extraction
or restriction bypass.

## Saved source location and reuse — owner clarification 2026-10-22

Successful downloads are saved owner inputs, not temporary workspace artifacts.
Default to the OS-resolved Downloads folder with a `ClipBuilder/Sources`
subfolder, outside the repository and all build/public assets. Resolve the
actual Windows known folder so a redirected Downloads location works. The owner
may choose Desktop or another explicit local destination. Do not create or
access these destinations as part of planning.

Store neutral source-ID filenames and minimal private adjacent metadata for
canonical source identity, selected resolution/format, size and content digest.
No transcript, provider response, account credential or extracted stream URL is
needed for source reuse. Keep this metadata local beside the source, outside Git
and normal logs. Use atomic completion markers: partial/failed downloads are not
eligible for reuse. Metadata paths are confined to the admitted library root,
including symlink/junction checks; do not trust an arbitrary sidecar path.

On repeated links, canonicalize equivalent YouTube URL forms and ignore
tracking/ playback-time fields when identifying the full source. Look for saved
copies before acquisition. An intact copy at the selected resolution goes
directly to local inspection/workspace import with zero media download calls,
including after app restart, a new clipping session, or creating several clips.
Recheck existence, size, digest and supported stream properties; do not trust a
stale index alone. Show saved local qualities and default to reuse. Previously
saved Best available means best at that acquisition time, not proof of the
current online maximum. Checking for new online qualities is an explicit refresh
action and never redownloads an intact matching source automatically.

If the file was moved/deleted/damaged, offer locate-and-validate or an explicit
download action. A new requested resolution may require a new saved variant;
reuse an already saved matching variant first. Keep the existing source when
another variant fails. Duplicate imports share one acquisition and cannot
overwrite a completed source. No automatic redownload on reload, edit, render,
workspace clear or expiry.

Closing/canceling a processing workspace, session expiry and repository cleanup
remove only owned partial files and derived scratch. Completed saved sources and
their reuse metadata survive until an explicit owner action targets that source
for deletion. Imported browser bytes/proxies are disposable copies/references;
this local source library is not cloud storage, a database, project history or
permission to persist AI analysis/editor drafts. Later fresh AI processing still
has its own budget and owner-only paid gate.

Offer a simple Use saved video entrypoint backed by the same local sidecars, so
the owner can open an intact saved variant without pasting the URL again. This
is a saved-source chooser, not project/history management. Both the chooser and
a repeated link check local files before any platform request and work while the
internet/provider/paid/cloud features are unavailable. Preserve local caller and
source validation. A complete source, not only a previously selected excerpt,
must be available for later different ranges. Do not silently use time-section
downloads to bypass byte/duration limits or claim a partial file is the source.

Publishing a validated acquired file into the saved library is separate from
later AI/assembly/export success. Those processing failures never delete or
invalidate the intact saved source or trigger another download. If editor drafts
are session-only, say that a new AI run may be needed; source reuse must not be
presented as cached AI-result reuse.

## Acquisition safety

Accept only the exact URL forms/hosts selected in CL-022. Strip tracking fields;
never pass a page URL directly to FFmpeg. Validate redirects and DNS targets,
deny private/reserved addresses and unsupported schemes, and enforce source,
response, time, disk and rate limits across the whole redirect/transfer chain.
If a vetted downloader owns platform CDN retrieval, document and test that
boundary rather than claiming page-host validation alone prevents SSRF.

Use a fixed executable/argument vector and neutral output names under the exact
private root. No shell evaluation, user postprocessors, plugins, browser cookie
extraction, account secrets, runtime tool downloads or arbitrary tool config.
Missing access/format fails safely; no access-control bypass or automatic retry.
Preflight free disk, enforce measured progress/unknown totals honestly, cancel
the complete downloader/FFmpeg tree and remove partial files. Keep link/stream
URLs, identifiers, titles, filenames, stderr and media out of ordinary logs.

## Acceptance and verification

- [ ] Cleared method is implemented exactly; unavailable/private/unsupported
      sources return an actionable safe result without false quality claims.
- [ ] Paste a link, choose one actual offered resolution and reach source-ready
      with automatic download/merge/inspection and no manual file
      download/upload step. The same source then supports manual ranges and
      independent discovery.
- [ ] Best available selects the highest accessible resolution; exact 720p,
      1080p and 2160p choices are covered with synthetic format lists, along
      with portrait dimensions, missing tiers and format changes after
      inspection. No case silently downgrades, upscales or drops audio.
- [ ] Default successful source placement is the actual Downloads known folder,
      outside Git, including a redirected-folder test; an explicit Desktop
      destination also works. No source bytes/sidecars appear in build
      artifacts.
- [ ] Repeat the same link/resolution after closing/restarting: validate and
      reuse the saved source with exactly zero media download calls. Alias URLs,
      a stale Best available record and explicit online refresh cannot trigger
      redownload of an intact matching variant.
- [ ] With the platform unavailable and all provider/paid/cloud features off,
      both Use saved video and a repeated matching link reach source-ready with
      zero external metadata, downloader or provider calls. Reopening another
      range and a later AI/export failure still preserve the complete saved
      input.
- [ ] Cover a missing/damaged/moved file, changed resolution, duplicate import,
      partial transfer and variant failure. Workspace close/clear/expiry
      preserves completed sources; explicit targeted deletion removes only the
      chosen file and its owned sidecar after active readers drain.
- [ ] Synthetic metadata/byte fixtures prove quality selection, separate-stream
      handling, offsets, codec/HDR rejection, partial transfer and bounded disk
      use.
- [ ] Validate malicious URLs, redirect/DNS changes, shell characters,
      tool-config injection, oversized output and cancellation/orphan cleanup
      without real sites.
- [ ] Imported source reaches the same manual-range/discovery/multi-clip
      workflow as a local file; proxy creation never replaces the export-quality
      master.
- [ ] Unit/integration tests use fake/paid-off, intercepted network and exact
      zero provider/cloud calls. Run root five gates and public artifact
      exclusion proof.
- [ ] Only after separate owner authorization, verify one cleared real source's
      acquisition/quality/timing and record content-free evidence. Real Gemini
      continuation stays an independent owner-only manual paid check.

## Documentation and gates

Update the local source guide, cleared-method/tooling ADR, privacy/cleanup
notes, source of truth and index. Current `FAKE_MODE=true`/no-key operation is
synthetic and has no link import. Future authorized downloading/encoding may
need no AI API key but still needs network, ready tools and source/method
permission. Actual automatic analysis needs real keys, enabled flags and
rights/data/spend approval; no local AI model/weights/runtime is supplied.
CL-022 clearance, capacity, tool readiness, real source quality and owner
acceptance are unchecked. No Git, paid call, installation, app launch, cloud
update or deployment authorization.
