# CL-043 — Preview saved video in intake

Status: implemented and verified. Dependency: implemented CL-042.

Owner request 2026-10-23: show a preview when the resolution picker reuses a
saved video. Reuse the existing media-preview row and stable card/footer design.
Load a still frame from the selected local master, including after a restart and
without YouTube metadata, thumbnail requests, AI, keys or cloud calls. Do not
create a workspace, copy/export a source or start native processing for preview.
Keep older saved records compatible; show “Saved video” when no ephemeral title
is available rather than inventing or fetching a title. No new durable content.

Use the existing protected same-origin proxy, exact destination/variant identity
and library confinement/integrity checks. Serve bounded byte ranges only from
ready saved masters. Reject invalid/missing/damaged/linked sources, preserve all
masters/drafts/exports and abort/drain streams on disconnect/shutdown. Browser
preview must not autoplay or expose sound; release its media request on change
or unmount and keep a stable icon fallback on decode/read failure. Selection,
explicit Use video, online preview, quality filters and anchored CTAs stay intact.

Add meaningful synthetic library/API/browser coverage: offline saved frame
decode, no provider/native/workspace dispatch, protected ranges, invalid-source
rejection, stable responsive geometry, fallback and cleanup. Use generated media
only, fake/paid-off guards, focused types/lint/format and final read-only validate.
Keep normal/unrelated services intact; no env read, real YouTube/AI/cloud request,
deployment or Git mutation. Real Gemini remains owner-manual with normal keys,
live flags and approvals; this preview works with fake AI and no API keys.

## Implementation and evidence

The selected saved variant now occupies the existing landscape preview row.
Its protected same-origin video loads metadata, seeks to one second (or halfway
for a shorter source) and stays muted/paused. Loading uses the existing spinner;
failure leaves the stable film icon and does not block Use video. Media setup
and cleanup survive development effect restarts and selection/unmount. Online
thumbnail/title behavior is preserved. Older saved records need no migration,
new persistent title, online lookup or placeholder gap.

Library admission checks exact destination/variant, supported descriptors,
confined paths, regular single-link files and verified fingerprint/size. It
returns an internal path only to the server; no path/token reaches the browser.
The existing stream/proxy serves Range responses capped at 512 KiB with no-store
and drains disconnected responses. No workspace, source copy, native job or
provider dispatch occurs. Existing source/draft/export formats are unchanged.

- **25 focused tests passed in three files**: source library/coordinator and
  acquisition API. Preview works after restart without a provider port; missing,
  damaged, linked and malformed identities reject. Unauthorized clients,
  absent/multiple/out-of-bounds ranges and wrong destination/unknown variant fail;
  successive bounded ranges return the expected synthetic bytes. Scratch stays
  empty and exact provider/native/AI counts do not increase for preview.
- Final generated-video browser proof passes in **29.04 seconds**: actual 320×180 frame decoding at one
  second, paused/muted/no autoplay, no online thumbnail/metadata request and no
  source open until explicit Use video. Card bounds/footers stay stable at
  1440×900, 390×844 and 320×568. Read failure restores the icon with Use video
  enabled. Existing online thumbnail/title, transfer/retry/cancel/startup/motion
  checks also pass. Synthetic desktop and phone captures were inspected.
- Frontend, local implementation and root-test TypeScript plus focused ESLint
  pass. An obsolete branch narrowed to never was removed during type checking.
  Final formatting/diff and read-only validation also pass after edits settle.
- **Normal local app check passed with the existing saved real source**:
  1280×720 frame decoded at one second, paused and muted, one local lookup,
  zero attempted metadata/import/open/analysis/render calls, synthetic-ai and
  cloud false. Workspace remains empty. No screenshot, title, source URL, real
  filename or frame was captured; content-free evidence stays outside Git.
  No new YouTube download, retained-media mutation, service launch/stop or
  unrelated process operation occurred. Browser/request resources were closed.

Owner physical-device/aesthetic acceptance and other codecs/platforms remain
unchecked. Real Gemini and paid/cloud flows are untouched and untested. These
checks establish local preview behavior, not live AI quality or readiness.

## Validate — read-only final pass

TL;DR: saved choices now show an offline frame in the existing card. Bounded
protected reads preserve source integrity and do not dispatch processing.
**Verdict: Meets ticket. No actionable findings.**

Scope: the CL-043 unstaged source-library/coordinator/route, preview component,
selection branch, small CSS extension, focused tests/proof and owning docs/new
packet. The index is empty; CL-028–042 work is preserved and excluded. Reviewed
the complete packet, scoped changes and neighboring proxy/stream/cleanup paths.

Coverage: **Covered** — older saved-file compatibility and fallback label; local
decoded still with no autoplay/audio; spinner/fallback; stable row/card/footer
geometry and explicit Use video; protected exact identity, bounded byte ranges,
integrity and invalid-source rejection; no workspace/copy/native/provider/AI
dispatch; disconnect/unmount/shutdown cleanup; no new retained content or secret
read; generated fixtures and real normal-app local decode evidence. The effect
setup restores src after cleanup, including development effect restarts.

Checks: 25 focused tests, final synthetic browser proof/capture inspection,
frontend/local/root-test types, focused lint, format and diff checks. No duplicate
schema, cross-app import, unsafe cast, arbitrary path/URL, debug content or new
environment/mode setting introduced. Full suite/production build, physical
devices/other browsers and paid/live AI are **Unverified**, not claimed passed.
