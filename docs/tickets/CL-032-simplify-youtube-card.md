# CL-032 — Make the YouTube card a two-state flow

Status: implemented and synthetically verified; real transfer acceptance failed
and remains open in CL-025. Dependency: implemented CL-031. Owner direction 2026-10-23.

Replace the growing YouTube form with URL entry → resolution selection in the
same card. Continue performs local lookup and, when no ready saved copy exists,
fetches qualities as one deliberate action. Download remains a separate action.
Replace URL fields with resolution controls; provide Change link. Remove the
save-location selector and save automatically to Downloads/ClipBuilder. Use short
labels, progress and errors; remove technical explanations and library management.

Saved copies stay available in the resolution picker without online requests.
An optional More resolutions action can request new qualities when saved copies
exist. Preserve exact variant binding, unsupported-choice blocking, cancellation,
single-workspace guards, retention and mode provenance. No hidden download or
retry, source deletion, new provider processing or configuration change.

Verify component transitions, submitted choice/default destination, saved/offline
reuse, retry/change-link behavior and desktop/phone layout using synthetic browser
routes; run relevant frontend tests, types/lint/format and validate. Fake AI needs
no keys; synthetic acquisition is identified separately. Real Gemini still needs
normal keys/flags/approvals and remains untested. No Git action or deployment.

## Implementation and evidence

The card now replaces link entry with resolution selection. Continue performs the
local lookup and, if needed, metadata request; no intermediate quality button or
automatic download remains. Storage defaults to Downloads, and saved copies use
the same picker offline. Change link replaces the controls rather than appending
another form. Short progress/error labels replace the earlier technical prose;
old cancellation messages disappear when changing links.

The real trial exposed hundreds of raw stream/audio combinations. The frontend
now groups supported encodings by exact dimensions, frame rate and audio track/
language/role. It preserves the server's video ranking and prefers admitted audio
then bitrate within that video/track. Each displayed resolution still submits its
original exact choice ID as an explicit variant. A blocked Best option requires
an explicit resolution choice; it never silently selects a lower fallback.

- Frontend unit suite: **488 tests in 58 files**, including three meaningful
  resolution-grouping regressions. The earlier pre-grouping suite also passed
  485 tests. All unit verification forces fake/paid-off, removes credentials and
  blocks ignored-env reads/network through the existing pinned runner.
- Final existing synthetic browser proof: **passed in 10.24 seconds**. It checks
  six intake viewport sizes and three resolution layouts, replacing URL fields,
  no save selector, unavailable Best blocking, explicit exact-resolution/default-
  Downloads import, cancellation, stale-status removal, Change link and successful
  offline saved-source opening. Exact mocked counts: two lookups, two metadata
  requests (first fails, explicit retry succeeds), one import, one cancellation
  and one saved open. Empty intake makes zero mutations; there is no auto download.
  All browser/listener resources drain with zero owned process survivors.
- Frontend and root-test TypeScript, focused ESLint/Prettier and diff checks pass.
  A final lint finding about reading a ref during render was corrected to React
  state, then lint/types and the browser regression passed. No full root/native/
  production build rerun was needed for this frontend change.
- Synthetic captures/metrics remain ignored under `.local-build/evidence/cl032-*`.
  Desktop and phone resolution captures were inspected. The normal running app
  visibly reaches the same compact resolution state with real metadata; one
  real offer's 548 repeated rows reduce to nine resolution choices.

The owner separately authorized an actual YouTube-flow trial. One initial video's
quality request failed. Other public videos returned real qualities. A 720p source
began transfer and was deliberately canceled because it was slow; a short 240p
source then failed during transfer, before any processing workspace opened. No
real download/manual-cut/edit/export success is claimed. See CL-025's dated
partial record. The app stays synthetic-AI/cloud-off; zero owned downloader/Deno/
FFmpeg/ffprobe children remain after failure. Existing apps and saved media are
preserved. No API key, Gemini call, configuration edit, restart or Git action ran.

## Validate — final read-only pass

Scope: CL-032's card, resolution projection/tests, progress CSS, capability-test
copy, browser-proof extension and owning documentation, against this packet.
Related uncommitted CL-028–031 work stays outside this narrow verdict; index empty.

Verdict: **Meets ticket — No actionable findings**. The compact two-state design,
explicit download, automatic Downloads destination, offline reuse, exact choice
binding, unsupported blocking, cancellation, error/retry and responsive behavior
are covered. The raw-option-list and ref-render findings are resolved. No further
suite was run during this read-only review; only evidence docs changed afterward.

Actual transfer failure is an existing acquisition-path acceptance issue, not
passing UI evidence. Owner aesthetic/physical-device and real-media/AI editorial
acceptance remain unchecked. Real Gemini still needs normal keys/flags/approvals;
no offline AI runtime/weights were installed. Nothing was staged or committed.
