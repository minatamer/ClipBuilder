# CL-022 — Decide a truthful YouTube-link source workflow

Status: decision complete. Technical go for isolated CL-023 code/synthetic
verification; real acquisition remains unavailable pending explicit owner
source/method clearance, tool preparation and actual compatibility checks.
The acquisition ADR records reviewed tool pins, quality/capacity/reuse policy
and the Node-to-Deno challenge-runtime revision. No actionable findings in
read-only documentation validation. No actual media download is authorized.
Dependencies: CL-017 architecture/retention/capacity decisions before final
design; desk research itself has no implementation dependency and is already
recorded. This gate is independent of finishing the local editor; do not delay
CL-018–021.

## Objective and value

Plan paste a YouTube link → choose an offered resolution or Best available → the
app downloads/merges the source automatically in the background → continue into
the local editing flow. The owner explicitly permits background media download
as the intended future behavior and wants no manual download, external
downloader UI, merge or re-upload step. Default to the highest accessible source
resolution; a numeric choice must be honored without silent downgrading.

The research question is which implementation fits our local runtime and source
access constraints, not whether media must be transferred. This clarification
changes the plan only; it does not authorize running a downloader today.

## Research already produced — 2026-10-22

See the
[dated research and primary links](../research/LOCAL_OWNER_WORKFLOW_2026-10-22.md#youtube-what-a-pasted-link-can-and-cannot-do).

- Gemini documents public YouTube URL analysis. That is discovery/understanding,
  not a documented source-file delivery path for the renderer. Private/unlisted
  URLs are excluded by the current documented feature limitations.
- The YouTube IFrame API is a playback/control interface. It does not document
  delivery of editable media bytes to our native render pipeline.
- Studio downloads for own uploads are documented at 720p/360p. Takeout supports
  original format or H.264/AAC MP4 and can take minutes to days to prepare.
- yt-dlp documents best-video/audio selection, FFmpeg merge and time sections.
  No downloader, stream extraction, real video request or latency/quality test
  was performed. Tool support does not prove an authorized retrieval method.
- MeTube documents paste-link server downloads with per-download quality
  choices; Open Video Downloader documents resolution/frame-rate selection and
  in-app download progress. MeTube's format-adapter source also implements
  quality-based yt-dlp selectors. The research note links all three primary
  references.
- Upstream format enumeration/selection supports offering actual resolutions.
  Its cap/preference sorting can fall back, so exact numeric choices need
  explicit selection and validation. Current runtime/EJS prerequisites and
  format-access limits are recorded; installation and real availability remain
  untested.
- Terms and API policies restrict downloading/automated access. Source rights
  and permitted retrieval method are separate questions. Local-only use does not
  itself settle either.

Recommendation: a thin local yt-dlp/FFmpeg adapter is the leading candidate for
the requested integrated flow. Existing tools establish technical precedent;
they do not prove compatibility, performance or per-video access here. Review
their behavior without installing or copying their complete applications. An
original/creator-supplied file is an optional fallback, not completion of the
link-flow requirement. Gemini URL analysis is not required for background import
and does not replace validated transcript/media clocks. No new paid URL-analysis
call is approved.

## Decision work remaining

Own this packet, the research note and a focused acquisition ADR; no production
code. Assess the local downloader first; retain official owner export,
authorized creator file delivery and direct-stream rendering as comparisons.
Record source accessibility, licensing/terms basis, resolution/frame
rate/codec/audio/HDR, transferred bytes, disk, latency, source duration limits,
repeatability and maintenance burden.

If a downloader is proposed, pin a reviewed version/dependencies and explain
runtime/EJS tooling, expiring URLs, separate audio/video, partial-download
boundary accuracy and platform failures. Do not prescribe browser cookie
extraction, credential harvesting, access-control/DRM bypass or retries to evade
restrictions. No claim of highest quality based only on pixel dimensions;
distinguish best accessible rendition, creator original and final 1080×1920
output.

Specify Best available versus exact offered resolution. List real dimensions,
frame rate, codec/audio availability and known/estimated size. Document portrait
resolution semantics, stable format selection, unsupported codec/HDR handling,
missing tiers, changed format availability and post-download resolution/audio
validation. Background downloading stays inside the local app lifetime with
progress/cancel; it is not a persistent daemon. Source quality and final
portrait output resolution are separate settings. Never reinterpret 1080p as an
unnoticed "at most 1080p" fallback or replace Best available with Best
compatible silently.

The owner also specifies durable local downloads for reuse: default to the
actual OS Downloads folder outside the repo, preserve completed sources across
restarts, and reuse a validated matching file without media download calls.
Specify minimal private sidecar identity/digests, canonical URL aliases,
missing/damaged/moved files, new resolutions and explicit online refresh
behavior. Saved source retention is an owner requirement; editor/transcript
persistence is separate. No new directory, download or runtime data is
authorized during planning.

Local reuse must precede online format enumeration. Specify a branch from a
repeated link to local saved variants, validation and source-ready with no
internet/provider/cloud prerequisite. Only a new acquisition or an explicit
availability refresh consults the platform. A refresh need not reacquire bytes.

Use a complete validated source copy for the initial import/reuse design, so
later discoveries and different manual ranges do not require another download.
Compare time-section acquisition as research only; do not silently substitute a
downloaded excerpt for the full conversation or add partial-source reuse to the
first slice. Define source clock mapping and content binding so a later source
cannot silently differ from URL-derived analysis. Explicitly handle videos over
current byte/duration/codec bounds; a larger local envelope needs capacity
evidence before CL-023 can accept it.

Real acquisition/native/provider experiments need a later explicit instruction
covering the source and external action. Use only the source's cleared retrieval
method. Keep media, video identifiers, channel/account details, extracted stream
URLs, credentials and raw tool output out of Git/logs/docs/screenshots. No cost
or installation is incurred during this planning task.

## Acceptance and verification

- [x] Record a dated primary-source comparison and current technical
      limitations.
- [x] Separate no manual download from no media transfer; distinguish analysis
      access, playback access and renderable source access.
- [x] Record the owner's background-download and selectable-resolution intent,
      documented existing implementations and inspected upstream adapter source.
- [x] Identify format enumeration/selection, merge and runtime prerequisites as
      a plausible implementation path, without claiming a local download proof.
- [x] Record the chosen method and actual rights/access basis, or explicit no-go
      with owner-master/creator-file fallback. Do not invent clearance.
- [x] Resolve quality tie-breaks, source bounds, scratch/saved-source separation
      and version/ tooling needs. Mark every unperformed compatibility/latency
      check honestly.
- [x] Specify Best available, exact offered tiers, explicit unavailable-quality
      behavior and no manual download/re-upload in the normal accepted flow.
- [x] Record Downloads as the default outside-repo destination and intact-source
      reuse across clips/restarts; specify validation and explicit reacquisition
      behavior without approving persistent editor/transcript data.
- [ ] If later authorized, produce bounded source-specific evidence privately
      and record only content-free findings. Provider-paid experiments remain
      owner-only; none is needed to finish desk research.
- [x] Write the ADR and synchronize CL-023 readiness plus index. A no-go may
      complete this decision gate while leaving the importer blocked by design.

## Capabilities, documentation and gates

`FAKE_MODE=true`/paid-off works without keys/ADC for the implemented local
range/editor/agent flow. There is no YouTube importer yet. CL-023 may now
implement the chosen ports/adapter and validate synthetic acquisition/reuse;
that proves no real accessibility or quality. Real acquisition can be AI-key-free
but needs prepared verified tools, source/method permission and a separately
authorized owner action. Real AI additionally needs its uncomposed owner
adapter/input preparation, keys, live flags and rights/transfer/spend approvals;
paid acceptance is owner-only. No offline AI weights/runtime are supplied.
The owner's AFK authorization permits this decision record and ticket commit,
without push, installation, real retrieval, paid/provider/cloud calls or deployment.

## Decision and validation record — 2026-10-22

- [Acquisition ADR](../architecture/LOCAL_SOURCE_ACQUISITION.md): thin official
  yt-dlp 2026.10.21 adapter, bundled EJS 0.8.0, pinned Deno v2.9.8 challenge child,
  existing FFmpeg 9.0.2/FFprobe and separate local source library. Published
  executable/archive digests were rechecked on official release assets; no
  binaries were downloaded/locally hashed. No additional app runtime/SDK.
- Fresh primary-source checks confirm MeTube/Open Video Downloader implement
  the requested interaction but use ceilings/fallbacks. ClipBuilder instead
  binds exact format IDs and validates source dimensions/FPS/audio/codec/HDR.
  Highest offered unsupported quality stops visibly; no Best compatible
  substitution, silent lower tier, AV1/HEVC expansion, lossy conversion or HDR
  tone mapping. Native supported-component MP4 remux still needs proof.
- The earlier Node-only challenge recommendation is explicitly revised:
  Node 22/24's child permissions do not deny network, whereas the reviewed
  Deno runner supplies no runtime network/filesystem grants. Keep a minimal
  environment and owned cache, with no inherited permission-broker settings.
  App Node is unchanged. This is runtime least privilege, not an OS sandbox.
- Narrow canonical URLs, no ambient configs/plugins/cookies/update/exec,
  exact stdin framing, native HTTPS downloading and a DNS/public-IP-pinning
  authenticated loopback broker define the proposed boundary. Upstream
  extractor filtering alone does not constrain redirects or downstream DNS.
  Source review supports the design; actual executable/broker/EJS compliance
  remains unverified until owner-only real testing.
- Source/method clearance is absent, and real acquisition is explicitly no-go
  until it is supplied. The owner has authorized implementation with synthetic
  ports, so this does not prevent the fake-only CL-023 slice. The ADR compares
  official export, creator file, URL analysis/playback and remote-stream paths
  without claiming that content rights imply platform retrieval permission.
- Offline local lookup comes first, even with downloader/provider/network
  unavailable. Full-source immutable masters, versioned private sidecars,
  actual Downloads/explicit Desktop roots, explicit refresh/reacquisition,
  damage/move handling and preservation after later failures are specified.
  Aggregate phased scratch and per-volume free space must include merge and
  atomic publication; source envelope targets are not capacity measurements.
- Read-only validation compares the full packet and ADR with current owner
  source inspection/storage/native code, adopted requirements and primary
  sources. No actionable findings remain. Relative document links and
  `git diff --check` pass. No application code changed, so no unit/build/native
  gate was rerun for this documentation-only decision.

Unperformed owner checks remain open: source permission/access, actual offered
quality and codecs/audio, binary/runtime/merge/browser compatibility, proxy
coverage, bandwidth/latency, transferred bytes, maximal disk/CPU behavior,
real AI and human quality. No installation, source-specific experiment or
raw tool output capture occurred. Deviation: revised challenge runtime on new
primary-source security evidence, recorded in the source of truth and ADR.
