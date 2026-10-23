# CL-023 — Download a YouTube source in the background at the chosen resolution

## Owner follow-up — 2026-10-23

Default-startup revision: the owner requests real downloads as the normal local
capability. `owner:start` and `owner:start:provider` now include the already
verified `--youtube` option; `owner:start:youtube` remains an alias, and
`owner:start:synthetic` names the old simulated-source entry for tests. No runtime
or downloader algorithm changes are needed. AI remains independently gated;
starting makes zero metadata/download/provider calls. This supersedes the opt-in
default recorded below. Validation for this command/documentation-only revision
uses both actual startup commands/capability states, the existing mode tests and
formatting; the prior full-suite/native evidence below covers unchanged code.

Default-startup verification: ordinary `owner:start` actually launches with
`sourceMode=provider-source`, `aiMode=synthetic-ai` and cloud false; the explicit
synthetic entry launches with `synthetic-source` and the same fake AI. Both pass
health/UI/capability reads on 4100/4200 and authenticated shutdown, with zero
captured surviving processes and both ports free. Launcher PIDs were 16580 and
18836. Four existing mode/readiness tests, package formatting and diff checks
pass; read-only validation has no actionable findings for this revision.
No real source, provider or paid request ran. Startup evidence/logs are preserved
under the earlier private verification root in `owner-default-check` (runtime
`clipbuilder-owner-runtime-Laxt4V`) and `synthetic-default-check` (runtime
`clipbuilder-owner-runtime-nfRghK`). Changes remain unstaged/uncommitted. The
only new changes in this revision are package startup defaults and owning docs;
actual online download and real AI/owner acceptance remain unperformed.

The owner requests actual local downloads independently of fake AI and explicitly
removes source-specific permits for this private workflow. The latest source of
truth supersedes the historical source-permit/installation restrictions
below. Connect the real adapter behind an explicit local `--youtube` command,
prepare/verify pinned portable tools, retain fake/paid-off AI and preserve source
reuse, exact formats, process/egress bounds and public exclusion. No real source
has been supplied for acceptance. Verify with synthetic ports plus offline real
binary/runtime checks; do not run a paid provider or arbitrary real media trial.
The owner subsequently explicitly confirms removal of the rights checkbox too,
after the automatic approval reviewer rejected that edit as broader than the
first instruction. Those changes are now accepted and implemented.

Current status: real local acquisition is composed behind `--youtube`, including
with fake AI and paid-off. Tools are prepared/verified; real-source acceptance
is still unperformed. The following status/authorization record describes the
original 2026-10-22 implementation and is superseded where stated above.

### Follow-up changes and verification — 2026-10-23

- `apps/backend/local/entry.ts`, `local-mode.ts` and new
  `acquisition-composition.ts` plus `scripts/owner-run.mjs` connect explicit
  `--youtube` independently of AI mode. The fake host remains credential-free,
  fake AI and paid-off; native children receive no provider credentials. The
  default fake command still generates synthetic sources. Explicit missing or
  changed real tools fail before listening rather than falling back to fake.
- New `apps/backend/local/acquisition-tools.ts` and
  `scripts/prepare-youtube.mjs` centralize pins and tool identity checks,
  prepare official portable yt-dlp/Deno and preserve license notices under
  ignored `.local-build/tools/youtube`. Deno's upstream Windows checksum file
  is itself pinned before its executable digest is used. Actual executable and
  archive hashes plus offline versions pass. The actual yt-dlp binary also
  accepts the adapter's generated options via stdin in an offline help/parser
  check. No source URL was supplied to that process.
- `yt-dlp-acquisition.ts` removes the revoked permit callback while preserving
  canonical identity validation, private stdin, exact format binding, egress
  policy, no credentials/cookies/plugins/remote components/retries and cleanup.
  `apps/frontend/src/features/local-editing/acquisition-panel.tsx` and the owner acquisition
  contracts remove the rights checkbox/field; explicit metadata and Import
  remain separate protected actions. No public request schema changes.
- Regression updates cover mode independence, any entered canonical source
  without a permit, zero AI/native/transfer calls for metadata, forged tool
  receipts and unchanged unauthorized/malformed-request rejection. Files:
  `provider-readiness.test.ts`, `yt-dlp-acquisition.test.ts`, new
  `acquisition-tools.test.ts`, `source-acquisition.test.ts`,
  `youtube-formats.test.ts` and `test/owner-acquisition-api.test.ts`.
  `scripts/local-artifacts.mjs` tracks the new owner-only markers. Host/source
  READMEs, local workflow guide, acquisition ADR, source of truth, CL-025 and
  index record the latest instruction and actual remaining checks.
- Focused initial adapter/coordinator/API tests: **65 pass**. Settled root unit
  scripts: **1,630 tests across 144 files pass**. All five required script
  gates pass: format, lint, typecheck, unit and public build. Owner build passes;
  public exclusion passes **1,490 built files**, Docker context rules and
  compiler roots. This is no cloud/container deployment evidence.
- `owner:proof`: **nine tests across seven files pass**, 158.55 seconds,
  using generated media and intercepted network. Exact native acquisition,
  remux/inspection, saved-source reuse, range/batch/editor/export and provider-
  input mechanics remain covered without real AI or YouTube requests.
- Hidden short-lived startup: health checks on **4100/4200**, UI asset and
  protected capability reads pass. Capabilities report `synthetic-ai` with
  `provider-source`, local media true and cloud false. Supervisor **19884** and
  its captured tree drain after authenticated HTTP204 shutdown; zero captured
  survivors and both ports free. Windows Downloads resolution succeeds without
  creating or reading a source library. No source metadata/transfer action ran.
- Content-free readiness/process record, harness and startup logs remain outside
  Git at
  `C:/Users/minat/AppData/Local/Temp/clipbuilder-cl023-gates-66f037d5b6cf49e393d16d71b5701632`.
  Actual host/worker stdout/stderr logs are in its
  `clipbuilder-owner-runtime-4Le373` subdirectory. Capability state and owned
  workspace scratch are removed; retained masters/captures/private logs and
  saved owner media are untouched.
- Execution environment corrections: recursive scripts initially found the
  host fallback pnpm 11.25.0. The final gates use a private OS-temp shim pointing
  nested invocations to pinned **11.19.0**, a pre-import fake/paid-off environment,
  removed provider credentials and blocked ignored env-file reads (committed
  `.env.example` remains readable). Unit tests use two workers to avoid observed
  resource-related timeouts. No repository engine/config requirement or test
  assertion was weakened. The public build's generated `next-env.d.ts` change
  was restored to its original state.
- Settled read-only execute/validate review: **no actionable findings** in the
  authorized follow-up. Changes remain unstaged/uncommitted; no push.

Remaining unverified: actual YouTube access/challenge/broker compatibility,
transfer/quality/latency, maximum-capacity behavior and owner visual/A/V/manual
acceptance. Real Gemini still needs its key, explicit provider mode and every
applicable approval; no paid/provider/cloud request or real media trial ran.
No offline AI weights/model are supplied. The source-permit/checkbox removal
is an explicit owner revision, not evidence of third-party rights or access.

Original status: implemented and validated in the authorized fake/synthetic lane;
real acquisition remains unavailable. Follow the
[acquisition ADR](../architecture/LOCAL_SOURCE_ACQUISITION.md), including exact
formats, Deno challenge runtime, egress broker, MP4 boundary and offline reuse.
Source-specific rights/method permission and actual tools/network remain
owner-only checkpoints. The
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
the later AFK authorization permits isolated code and synthetic tests, with
real retrieval, tool installation and provider/cloud work excluded for now.

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

Checked items below describe injected acquisition/native synthetic evidence,
not actual YouTube access or source/method clearance. The final real-source
checkpoint remains unchecked and is carried into CL-025.

- [x] The chosen technical method has a dormant, source-permit-gated adapter;
      unavailable/private/unsupported
      sources return an actionable safe result without false quality claims.
- [x] Paste a link, choose one offered synthetic resolution and reach source-ready
      with automatic download/merge/inspection and no manual file
      download/upload step. The same source then supports manual ranges and
      independent discovery.
- [x] Best available selects the highest offered resolution; exact 720p,
      1080p and 2160p choices are covered with synthetic format lists, along
      with portrait dimensions, missing tiers and format changes after
      inspection. No case silently downgrades, upscales or drops audio.
- [x] Default source placement resolves the actual Downloads known folder,
      outside Git, with redirected-folder tests and isolated synthetic
      publication; an explicit Desktop destination also works. Actual owner
      Downloads publication remains a CL-025 check. No source bytes/sidecars appear in build
      artifacts.
- [x] Repeat the same link/resolution after closing/restarting: validate and
      reuse the saved source with exactly zero media download calls. Alias URLs,
      a stale Best available record and explicit online refresh cannot trigger
      redownload of an intact matching variant.
- [x] With the acquisition port absent and all provider/paid/cloud features off,
      both Use saved video and a repeated matching link reach source-ready with
      zero external metadata, downloader or provider calls. Reopening another
      range and a later AI/export failure still preserve the complete saved
      input.
- [x] Cover a missing/damaged/moved file, changed resolution, duplicate import,
      partial transfer and variant failure. Workspace close/clear/expiry
      preserves completed sources; explicit targeted deletion removes only the
      chosen file and its owned sidecar after active readers drain.
- [x] Synthetic metadata/byte fixtures prove quality selection, separate-stream
      handling, offsets, codec/HDR rejection, partial transfer and bounded disk
      use.
- [x] Validate malicious URLs, redirect/DNS changes, shell characters,
      tool-config injection, oversized output and cancellation/orphan cleanup
      without real sites.
- [x] Imported source reaches the same manual-range/discovery/multi-clip
      workflow as a local file; proxy creation never replaces the export-quality
      master.
- [x] Unit/integration tests use fake/paid-off, intercepted network and exact
      zero provider/cloud calls. Run root five gates and public artifact
      exclusion proof.
- [ ] Only after separate owner authorization, verify one cleared real source's
      acquisition/quality/timing and record content-free evidence. Real Gemini
      continuation stays an independent owner-only manual paid check.

## Documentation and gates

The local source guide, acquisition ADR, privacy/cleanup notes, source of truth
and index are updated. Current `FAKE_MODE=true`/no-key operation has synthetic
link import, saved-source reuse and actual local native media processing.
Future authorized downloading/encoding may
need no AI API key but still needs network, ready tools and source/method
permission. Actual automatic analysis needs real keys, enabled flags and
rights/data/spend approval; no local AI model/weights/runtime is supplied.
Source-specific clearance, maximum capacity, real downloader/runtime readiness,
real source quality and owner acceptance remain unchecked. The later AFK
authorization permits synthetic local tests/launches and this ticket's commit;
no push, real retrieval, installation, paid/provider/cloud action or deployment.

## Implementation and validation record — 2026-10-22

- Owner contracts bind canonical source identity, metadata revision, exact
  video/audio format rows, quality/audio choice, full-source offset and explicit
  synthetic/acquired provenance. Best ranks before compatibility; exact tiers
  never use ceilings or fallback selectors. Upstream original/default markers
  are mapped from the pinned extractor; ambiguity requires a concrete choice.
- Local lookup/list/open run without acquisition/provider adapters. Version-1
  bounded adjacent records and streamed SHA256 masters survive app restart and
  workspace cleanup. Atomically published masters match the saved-draft source
  convention. Hash/native validation precedes reuse. Missing/moved files require
  an explicit frozen-digest match; existing damaged masters are not overwritten.
  Source deletion requires an empty workspace, drains readers and protects
  shared variants/draft backups. No automatic completed-source deletion.
- The isolated UI implements lookup before metadata, explicit refresh/rights
  acknowledgement, Best/exact offered variants, Downloads or explicit Desktop,
  background phases, cancel, URL-free saved chooser, locate and delete. Unknown
  totals stay indeterminate; known transfer totals are projected. Refresh
  reconnects to host-owned work without resubmission. Duplicate active requests
  share one action; a later explicit retry is allowed after terminal cleanup.
- Actual native generation at each selected synthetic dimension enters the same
  typed lossless remux/inspection path. Acquisition alone admits supported
  local WebM components; normal upload/public boundaries remain unchanged.
  Codec/dimension/FPS/audio/duration, source digest and complete decode precede
  publication. Protected worker phase samples expose the real inspection
  interval; samples do not start/retry media work.
- The dormant pinned yt-dlp/Deno adapter uses fixed argv/private stdin,
  bounded strict projections, minimal environment, no ambient configs/plugins/
  cookies/remote components/updates/exec/retries and exact selected IDs.
  It rechecks offered descriptors before transfer. An authenticated job-owned
  CONNECT broker checks every target/DNS answer and pins public IPs. Synthetic
  processes verify stdin framing, output limits and owned-child-tree cancel;
  injected network tests cover authentication, prohibited targets and rebinding.
  This is not an OS sandbox or actual tool-compliance/access proof.
- Resource admission reserves phased component/merge/publication bytes, 32MiB
  overhead and the per-volume 10GiB free reserve under 20GiB scratch. Component
  totals are rechecked before merging; near-limit sources can fail capacity
  instead of dropping quality. Fixed runtime/output/rate/catalog limits are in
  the [source guide](../../apps/backend/local/SOURCE_ACQUISITION.md).
- Read-only validation/fix/revalidation resolved metadata admission/shutdown,
  response-header ordering, signal/parser/broker cleanup, upstream codec names,
  Desktop discovery, in-flight cancel acknowledgement, accurate native phases,
  source-delete/draft-save exclusion and explicit terminal retries. Latest
  review has no actionable findings in the authorized implementation scope.
- Verification: owner suite 307 tests before the final retry case; focused final
  coordinator/API regressions 9 pass; the final root unit gate includes all
  current owner files and passes **1,564 tests across 135 files**. All five root
  gates pass: format, lint, typecheck, unit and public build. Final owner build
  passes. Public exclusion passes **1,490 built files**, Docker context rules
  and compiler roots; no container build/deploy claim.
- Native `owner:proof`: **5 tests across 4 files**, 93.72s. New proofs cover
  720p/1080p/2160p/portrait full 16s sources, exact offline reinspection and
  mismatch rejection, VP9/Opus packet hashes preserved into MP4, installed
  Chrome frame decode/seek, combined H.264/AAC remux and observable inspection.
  Existing range/batch/editor/agent proofs remain green. These are generated
  synthetic media mechanics, not real editorial quality or capacity benchmarks.
- Browser trial: Best generated 3840×2160 source; refresh during import;
  two manual 90-frame cuts plus an independent 300-frame fake suggestion;
  three distinct native exports and editor review; clear/alias local lookup;
  full process restart and saved-source open without a URL; exact 1080p explicit
  Desktop publication; late cancel preserves completed source; another active
  native import reaches canceling/canceled while prior masters survive.
- Both hidden launches shut down with HTTP204, zero captured owned survivors
  and zero 4100/4200 listeners. Workspace/capability/discovery files are gone;
  browser tab closed. Only the exact isolated synthetic libraries/test launcher
  were removed. Retained real masters/captures/private logs were untouched.
  Content-safe logs/evidence remain outside Git in
  `C:/Users/minat/AppData/Local/Temp/clipbuilder-cl023-manual-e49e3ffbcac3441f81e9ff34600b0103`,
  `C:/Users/minat/AppData/Local/Temp/clipbuilder-owner-runtime-UQtpQ6` and
  `C:/Users/minat/AppData/Local/Temp/clipbuilder-owner-runtime-ek899W`.

Deviation: acquisition deliberately starts with the narrower proven
H.264/VP9 + AAC/Opus profile; unsupported alternatives remain visible rather
than widening decoders. Source-specific permission/access, actual pinned
binary/runtime/EJS/proxy compliance, real quality/latency, maximum disk/CPU
behavior and owner-only live AI remain unperformed. Real owner AI input/adapters
and activation readiness still require CL-024 reconciliation; keys/flags alone
do not implement that missing composition. No offline AI model is supplied.
