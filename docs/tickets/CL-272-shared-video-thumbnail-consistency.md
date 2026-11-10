# CL-272 — Shared video thumbnail consistency

Status: implemented and generated checks passed. Owner-requested
2026-11-10. Depends on completed CL-271. Owner real-source/codec and hosted
release acceptance remain manual.

## Whole-file commit authorization and validation — 2026-11-10

The owner now explicitly requests staging and committing all fixes at file level
if validation is clean. This supersedes earlier no-Git scope for these follow-ups.
The combined CL-271/CL-272/CL-062 review has no actionable findings. Thirty-nine
focused frontend tests pass on the settled code; every changed file passes
Prettier, changed scripts pass ESLint, and the diff is clean. Existing recorded
backend, types, generated transport/native and Codex visual evidence remains
applicable; no new paid/provider or broad legacy proof run was needed.

One local commit owns all 50 paths below, including complete new/deleted files.
Shared clip-editor/style/README/source-of-truth/index changes span the three
owner-requested follow-ups and stay intact rather than being split by hunks.
Backend/planning and visual placement belong to CL-271; shared thumbnails and
migrated adapters/proofs belong to CL-272; compact loader clearance and progress
proof belong to CL-062. No ignored configuration, owner media, private artifacts,
Voyagenda work, deployment or push belongs to this allocation. Owner real-source/
codec, live-provider quality and personal visual/release acceptance remain manual.

```text
apps/backend/README.md
apps/backend/local/clip-batch.test.ts
apps/backend/local/clip-batch.ts
apps/backend/local/codex-ai.test.ts
apps/backend/local/codex-ai.ts
apps/backend/local/hosted-workflow.test.ts
apps/backend/local/provider-ai.test.ts
apps/backend/local/provider-ai.ts
apps/backend/local/server.ts
apps/backend/local/visual-discovery.ts
apps/frontend/README.md
apps/frontend/src/features/local-editing/clip-batch-panel.tsx
apps/frontend/src/features/local-editing/clip-editor.tsx
apps/frontend/src/features/local-editing/clip-rail-preview.tsx
apps/frontend/src/features/local-editing/experience.tsx
apps/frontend/src/features/local-editing/runtime-capabilities.test.tsx
apps/frontend/src/features/local-editing/style.css
apps/frontend/src/features/local-editing/thumbnail-framing.test.ts
apps/frontend/src/features/local-editing/thumbnail-framing.ts
apps/frontend/src/features/local-editing/video-timeline-thumbnail.tsx
apps/frontend/src/features/local-editing/youtube-preview.tsx
apps/frontend/src/features/sample/candidate.review.test.tsx
apps/frontend/src/features/sample/candidate.review.tsx
apps/frontend/src/features/sample/moment-thumbnail.test.ts
apps/frontend/src/features/sample/moment-thumbnail.ts
apps/frontend/src/features/sample/portrait-player.tsx
apps/frontend/src/features/sample/source-preview.tsx
apps/frontend/src/features/sample/use-moment-thumbnails.ts
docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
docs/tickets/CL-062-designed-loading-states.md
docs/tickets/CL-271-muted-video-b-roll-with-continuous-captions.md
docs/tickets/README.md
packages/contracts/local/visual-placement.test.ts
packages/contracts/local/visual-placement.ts
test/local-codex-progress.proof.ts
test/local-design.proof.ts
test/local-intake-preview.proof.ts
test/local-video-thumbnails.proof.ts
test/owner-broll-browser-fixture.ts
apps/frontend/src/features/local-editing/media-timeline-thumbnail.tsx
apps/frontend/src/features/media/thumbnail-framing.test.ts
apps/frontend/src/features/media/thumbnail-framing.ts
apps/frontend/src/features/media/use-video-thumbnail.ts
apps/frontend/src/features/media/video-thumbnail.test.ts
apps/frontend/src/features/media/video-thumbnail.ts
apps/frontend/src/shared/ui/video-thumbnail.module.css
apps/frontend/src/shared/ui/video-thumbnail.tsx
docs/tickets/CL-272-shared-video-thumbnail-consistency.md
test/local-shared-thumbnails.proof.ts
test/owner-thumbnail-browser-fixture.ts
```

## Owner loading-indicator follow-up — 2026-11-10

Status: implemented and locally verified after the CL-271 Hook correction. The owner saw empty picture tiles
during the tour and requires an animated loading spinner for both picture and
video thumbnails. Reuse the shared thumbnail service and presentation; preserve
fixed tile geometry, source/trim identity and stable failed-media fallback.
Pending/queued reads and image presentation must not look like an empty tile.
Verify delayed picture/video reads, settled pixels, failure, source replacement,
normal motion and responsive geometry in an isolated generated editor/tour view.
No provider/API keys, processing run, owner media mutation or Voyagenda action.

Both picture and video timeline rows now use MediaTimelineThumbnail and the
shared thumbnail service/presentation. The common presentation keeps a rotating
spinner through queued fetch/decode and the actual image element's load event;
successful pixels replace it, while a failed source/presentation shows a stable
icon. This removes the picture row's unobservable CSS-background request and
the video's misleading static loading icon. Tile dimensions and trim/Hook clocks
are unchanged, matching source/frame/size entries still share work, and source
changes cannot display a prior source's ready state.

Generated browser verification passes at 1440 and 390px with all eight actual
editor tiles held loading (two pictures, six videos), advancing spinner animation,
then release to real decoded pixels. Existing repeated-frame, Hook/body clocks,
one-decoder, reload, geometry and resource-release assertions remain. Failed
picture and video reads settle to icons with no retry: one shared picture read
and four unique video-frame reads. The shared upload/saved/YouTube/candidate/
portrait/native-fallback proof passes too. Eighteen focused shared thumbnail/
framing/workflow unit checks, frontend/local/test TypeScript and scoped ESLint
pass; formatting and diff checks are clean.

Codex inspection replayed the actual editor tour through Media with responses
held: two picture and six video spinners were present. Closing the tour and
selecting a picture kept its spinner visible; releasing responses replaced all
eight with decoded images and no horizontal overflow. Loading/tour/ready
screenshots remain outside Git in the Codex visualization folder. Only an
isolated generated fixture was used; no owner clip was edited or processed.

Final read-only validation: meets this follow-up, no actionable findings.
Pending CL-062/271/272 work remains unstaged; no commit, deploy, paid test or
provider/configuration/model change. Temporary fixture tab/server/scratch and
viewport were closed/reset. Broad legacy design/intake runs were not repeated;
the changed shared presentation and real Media transport are covered above.

The owner reports an empty saved-video tile and requires working, consistent
thumbnails everywhere: uploads, YouTube offers and saved variants, moment cards,
media timelines and clip cards. Find the shared cause and consolidate decoding,
readiness, framing, cancellation and lifetime handling instead of another local fix.

The initial audit found independent implementations: a metadata-preloaded saved
video with sticky failure state and 15s timeout, a separate protected YouTube image,
moment-specific native video decoding, and CL-271's separate WebCodecs timeline
decoder/cache. Clip cards additionally show the actual edited composition. These
different lifecycles and incomplete surface coverage make one local fix inadequate.
Do not claim a specific owner-file decode/network failure without evidence.

Implement one browser-safe media helper and shared hook/presentation adapter.
Retain authenticated same-origin routes, admitted Blob sources and existing
hosted source URLs. Preserve genuine missing/unsupported-media failure, bounded
serial decoding, shared source/frame cache, exact trim/Hook clocks, source identity
replacement, and cleanup of requests, listeners, canvases, timers and blob URLs.
Keep compact geometry, current focus/feedback design, silent stills, live players,
clip-card hover/composed previews, title animation, controls and saved compatibility.
Static marketing artwork and interactive camera/source players are not replacement
thumbnail pipelines; use shared posters where those players need an opening still.

Acceptance:

- Actual generated thumbnail pixels for uploaded/blob, same-origin source/saved
  video (including capped Range transport), protected YouTube image and Media.
- Exact trim/Hook/candidate time mapping, repeated-frame sharing, source changes,
  StrictMode, slow/failed loading, cancellation, unmount/reopen and reload.
- Preserve composed clip-card and hover behavior and hosted upload isolation.
- Stable desktop/tablet/phone thumbnail and valid/failure geometry, no overflow.
- Focused unit/browser proofs, types/lint/format and final lightweight validation.
- Use only generated fake/paid-off/no-key checks; no provider, real YouTube,
  ignored configuration, deployment or Voyagenda changes. Preserve saved/private
  sources, edits, outputs, diagnostics and the running normal app. Thumbnail work
  requires no API keys/model; new provider work retains its separate approvals.

Record produced evidence and any remaining owner-only checks here. No push or
new provider run is authorized. Git staging/commit is not part of this packet.

## Implementation and root cause

The confirmed defect was fragmented ownership, rather than one missing image tag:
the preceding Media-only fix did not reach saved/source or candidate thumbnails.
Saved preview used a metadata-preloaded native video, its own seek readiness and
15-second failure latch. Other surfaces had separate loading, image/frame copying
and cleanup. A shared browser service now owns video/image decoding, settling,
framing, timeout, subscription cache and cancellation for every audited surface.
The screenshot alone does not identify a particular owner's media/codec failure.

`features/media/video-thumbnail.ts` uses the installed MP4/WebCodecs reader and
falls back to silent native decoding when WebCodecs or its codec is unavailable.
Video reads retain a 4 MiB cache, one in-flight reader and existing protected
ranges. Protected offer images are streamed with a 4 MiB bound. All jobs share
one serial queue and 30-second active-job deadline. Matching source/kind/time/size
requests share stills only while subscribed; the final release aborts and revokes.
Cleanup is idempotent and cannot remove a replacement same-key subscription.

`useVideoThumbnail`, shared `VideoThumbnail` / `ThumbnailVideo`, and thin domain
adapters cover intake saved/YouTube cards, uploaded/local/hosted source posters,
candidate cards, Media video rows and clip-rail loading stills. Real native player
refs/controls/clocks and actual edited clip-card hover playback are preserved.
The old moment decoder and per-Media cache are removed; band framing is moved to
the shared media feature. Existing private URLs stay in browser memory only.

Final review caught and fixed a source-shape regression: candidate cards and
source posters must request their portrait/square dimensions, rather than crop a
landscape still again inside a portrait card. Candidate rotation is accounted for.
Representative source timing and explicit candidate/trim/Hook mapping remain.

## Produced evidence

- Focused frontend unit checks: 23 passing assertions across framing, shared
  subscription cancellation/replacement, candidate review and source preview.
- `local-shared-thumbnails.proof.ts`: real generated upload/blob poster, capped
  Range saved source, protected offer image and candidate pixel reads; portrait
  top/bottom colors survive; source replacement, failed-source recovery,
  cancellation, unmount/reopen, StrictMode and native fallback. No horizontal
  overflow at 1440, 768 or 390px; zero external browser requests.
- `local-video-thumbnails.proof.ts`: generated trim/Hook frame pixels, repeated
  source/frame sharing, one active decoder, resource release/remount, missing
  media without retry, preserved pictures and stable desktop/phone rows.
- `local-intake-preview.proof.ts`: generated current intake through real HTTP,
  capped 512 KiB Range reads, upload/drop controls, slow/decode failure, source
  use, quality/range controls and hosted upload isolation. The card's existing
  vertical body scroll is compared to the previous native-video DOM at the same
  sizes; footer/drop geometry and no horizontal overflow remain enforced.
  Its fake download-state endpoint previously always returned null, racing its
  own just-returned failed import; the fixture now retains actual fake status,
  matching the real polling contract rather than weakening outcome assertions.
  The image assertion also waits for actual decoded image pixels after the blob
  snapshot becomes ready, removing a separate image-element readiness race.
- Existing composed clip-rail initial/reload/hover proof passed during this
  packet. Normal user session/media/configuration are preserved. A separate Codex
  IAB generated gallery showed decoded saved/YouTube/moment images and upload
  poster, then source replacement, with no overflow. Diagnostic screenshot is
  outside Git in the Codex visualization folder; its flat colors are generated
  test frames, not owner media. The fixture tab/server/scratch were closed.

Focused frontend and test TypeScript checks, changed TypeScript ESLint, changed
file Prettier checks and `git diff --check` passed. Generated checks never applied
edits to an owner clip. Final read-only validation covers the combined unstaged
CL-272 worktree, including new files and removed decoders: no actionable findings.
Shared boundary direction, source/rotation/time identity, missing/unsupported
fallbacks, subscription idempotence, bounded resources and teardown were checked.
The clip-card Player's own error event also releases its loading still and shows
the existing failure state; failures cannot leave an invisible Player fallback.

All tests force fake/paid-off before imports and avoid ignored configuration,
real YouTube acquisition, provider calls and owner media. No new model/tool,
backend/worker change, deployment, staging/commit or Voyagenda action is involved.
Full legacy `local-design.proof.ts` was not rerun; its obsolete native-thumbnail
selectors were migrated and typechecked. Real-source arbitrary codec quality,
Gemini/live-AI output and hosted release remain unverified by these generated
checks. Thumbnails and manual editing require no provider keys; new real
provider processing still needs keys, enabled live flags and explicit approvals.
