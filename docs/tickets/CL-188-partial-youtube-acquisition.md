# CL-188 — Download only the requested YouTube section

Status: Implemented and locally validated, 2026-11-02. Owner AFK authorization
lifts the previous execution hold; use execute/validate/fix loops and local
ticket-prefixed commits without push. Depends on CL-185–187 and the existing
local downloader.

## Owner request

Allow a YouTube URL plus start/end timestamps so an owner can acquire and
analyze only the relevant part of a long video. This must reduce acquisition
scope when the offered media supports it, rather than download everything and
merely hide the rest. Entire video remains available. No hosted YouTube intake
is added.

## Proposed implementation packet

- Reuse CL-186's one-window fields in the existing resolution/download stage.
  Bind the admitted source identity, chosen formats/audio, offered revision and
  original start/end to the explicit Download action. Changing any of them
  invalidates stale offers/operations rather than downloading the wrong section.
- Investigate the pinned installed yt-dlp/FFmpeg partial-download path and prove
  it fits current egress controls. Upstream yt-dlp documents
  `--download-sections` with `*start-end` and requires FFmpeg; this establishes
  feasibility, not proof that our pinned downloader or network policy already
  supports it.
- Construct allowlisted native argument arrays from validated values. Any FFmpeg
  HTTP access must retain the existing isolated downloader boundary, checked
  hosts/DNS/redirects and cancellation; do not open arbitrary worker network
  access or pass shell/user-supplied downloader arguments.
- Preserve the highest selected master quality without an unnecessary lossy
  re-encode. Stream-copy cuts can start at earlier keyframes; retain only needed
  padding and record the measured original offset/usable interval. Analysis,
  playback and export honor the requested exact window. If accurate independent
  section files require re-encoding, document that tradeoff explicitly rather
  than silently trading source quality for exact cuts.
- Do not promise byte-perfect network savings: formats/fragments and keyframe
  alignment can require nearby bytes. If section acquisition is unsupported,
  show an actionable failure/explicit whole-video alternative; never silently
  fetch the full two-hour source. Retries remain explicit.
- Bind saved-source/catalog identities to video, formats, quality, original
  interval and measured offset. A verified full master can satisfy a section
  offline without another download; disjoint/partial masters cannot pretend to
  cover it. Preserve old full-source records and all retained owner files.
- Display truthful measured transfer/preparation states and keep cancel/footer
  geometry. Cleanup removes only owned interrupted temporary downloads, never an
  existing saved master, recovery asset or export.

## File allocation and verification plan

Contracts: acquisition/import/catalog interval metadata. Backend: existing
YouTube offer/identity/acquisition orchestration and egress/process adapters.
Native: section inspection/remux and original clock mapping. Frontend: existing
acquisition card and offline reuse. Docs: downloader guide, source of truth,
packet and index. Keep upload analysis-window behavior owned by CL-186.

Fake/paid-off/offline tests cover a twenty-minute section of two-hour metadata,
argument construction, exact fake request counts, keyframe padding, measured
offsets, stale offers, unsupported section transport, saved full/partial reuse,
cancel/failure/retry and orphan cleanup. A loopback synthetic media server plus
current-source binaries must demonstrate actual range/section requests and a
decodable synchronized result; route all test traffic to loopback. Verify the
export uses only the requested interval and hosted rejects every forged path
before download dispatch. Browser phone/desktop states, types/lint and validate.

## Research and capability boundary

[yt-dlp section options](https://github.com/yt-dlp/yt-dlp/blob/master/README.md)
document partial downloads; its
[cutting FAQ](https://github.com/yt-dlp/yt-dlp/wiki/FAQ#downloading-clips-and-cutting-out-sponsor-sections-is-inaccurate)
explains re-encoding/accuracy costs. The chosen padded-master approach is a
proposed engineering solution requiring the synthetic native proof. Fake mode
needs no provider keys and cannot prove real YouTube availability. Actual
acquisition uses prepared local tools/network and an accessible permitted
source, independently of AI credentials. Subsequent Codex needs local speech
assets/login/allowance; Gemini requires its key/live approvals. No real URL,
download, rights acceptance, inference, installation, restart, config, cloud,
deployment or Git action is authorized by this planning packet.

## Implementation and evidence

The current AFK authorization supersedes the historical planning hold. No real
YouTube/AI call, configuration/model change, installation, cloud action, push or
deployment occurred. Fake/synthetic verification uses no credentials or models.

- Acquisition/import/open contracts carry a distinct original-time window.
  Section identities retain measured origin/usable coverage; existing full
  records remain readable. Native timestamps are remuxed to zero without
  re-encoding, so captions/Hook/camera/cuts keep their existing local clock.
- Pinned yt-dlp 2026.10.21 / FFmpeg 9.0.2 use fixed section arguments, a
  combined selected video/audio download, two seconds of requested padding and
  retained earlier keyframe data. Excessive padding (>30 seconds before the
  requested decode margin), missing end coverage or unsupported media fail
  safely. No forced keyframes, lossy cut, format substitution or whole-source
  fallback.
- Native network work stays inside the downloader's checked authenticated TLS
  broker; the private renderer receives no remote URL. FFmpeg's initial CONNECT
  gets a Basic challenge with zero DNS/upstream work, then must authenticate.
  Every redirected tunnel retains the existing host/public-DNS checks. For muxed
  input, a short native header probe corrects the video/container origin
  difference. Signed URLs are transient adapter/native arguments, never browser
  responses, saved records, ordinary diagnostics or committed fixtures.
- Per protected download: separate streams use one metadata validation and one
  combined section process; muxed streams additionally use one URL projection
  and one header probe. These are planned local acquisition operations, with no
  AI/provider call or retry. Tests assert exact counts. Native preparation is
  indeterminate until measured progress is available; no fabricated percentage
  or byte-saving guarantee. Whole-video operation keeps its existing path.
- Full saved masters serve covered sections offline. Partial masters cannot
  satisfy whole/disjoint requests or Highest for a whole source. Their picker
  label says Saved section. Invalid saved scopes fail before copy/native work;
  scoped open failures clean only the newly owned workspace. Source preview and
  processing/export admission exclude padding. Origin/coverage survive recovery
  with no new AI/native call.
- Quality/Range share the existing intake header/content slot and footer. Range
  edits invalidate a chosen download; the explicit action freezes format/audio,
  offered revision and interval. Phone fields remain readable; keyboard Tab,
  failure/explicit retry/Entire video and hosted exclusions are checked.

Final evidence: 212 focused fake cases across twelve files pass. A
current-source TLS loopback proof executes production-generated flags, requires
the authenticated broker/temporary test CA, observes actual byte-range traffic
below the complete generated source size, verifies B-frames and zero/nonzero
stream offsets, imports measured origins and compares every exported video frame
against the same cut from the full master (two cases). The responsive intake
proof passes at 1440/390/320, including original range submission, failure
feedback and mock-only hosted upload. Screenshots inspected. Existing real
decoder/frame/format checks remain; real YouTube availability, two-hour speed
and editorial/face quality are unverified. Full long-source admission remains
disabled until CL-189.

Owning files: acquisition-section/window/import/source contracts; existing
backend acquisition/format/library/worker composition and new `section-clock`;
native acquisition/worker dispatch; existing frontend acquisition/preview/style
and new `source-playback`; their scoped tests, recovery fixture, section/intake
proofs; source of truth, local workflow/backend guide, index/ledger and this
packet. No unrelated files or retained owner media touched.

The native compatibility investigation used the installed help and pinned
primary sources:
[yt-dlp external downloader](https://github.com/yt-dlp/yt-dlp/blob/2026.10.21/yt_dlp/downloader/external.py),
[FFmpeg HTTP/CONNECT](https://github.com/FFmpeg/FFmpeg/blob/n9.0.2/libavformat/http.c)
and
[TLS transport](https://github.com/FFmpeg/FFmpeg/blob/n9.0.2/libavformat/tls.c).
No external content is part of app/test inputs.

Validation found and resolved native proxy challenge compatibility, MP4
timestamp normalization, muxed audio/video origin bias, field overflow,
partial-master Highest ambiguity and an invalid-scope workspace cleanup gap.
Final scoped static/build/regression and settled read-only verdict follow below.

Final settled validate: **Meets ticket; no actionable findings.** Scope covers
range/identity contracts, strict admission, checked native transport, exact
original/local clocks, saved full/partial reuse, padding exclusion, restore,
hosted zero-dispatch rejection and owned cleanup. The pinned clock-URL
projection also executes against synthetic metadata. All exported video frames
match, and nonrepeating synthetic audio has its unique correlation peak at zero
samples of lag (16 kHz), with distant offsets below half that peak.
AAC/re-sampling can change decoded samples; audio byte identity is not claimed.

Local/test/frontend/contracts TypeScript, contracts build, scoped ESLint/
Prettier/whitespace and current worker/overlay build pass. Native proofs compile
current sources and use only loopback, a temporary test CA and installed Git
OpenSSL for that CA; the app requires no OpenSSL installation. No normal app was
running to reload. Installed lockfile-pinned binaries were used directly because
of the Corepack bootstrap limitation recorded in CL-185; no dependencies
changed. No substantive scope deviation. Actual platform availability, full
long-source throughput, real ASR/face/editorial quality and owner release
acceptance remain unchecked. These do not waive CL-189/190 gates or authorize
Gemini/cloud/push.
