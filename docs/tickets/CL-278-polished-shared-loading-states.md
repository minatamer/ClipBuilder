# CL-278 — Polished shared loading states

Status: app-wide implementation and local validation complete, 2026-11-11.
Owner visual review remains open; no Git mutation is authorized.
Dependencies: CL-273 workspace and shared ProcessingState/BrandedSpinner exist.
The worktree/index were clean after CL-277's authorized local commit.

## Owner request

The resolution lookup appears as a bland small spinner and plain text. Improve
its visual design and audit similar loading states so temporary work matches the
navy/blue typography, motion and polish of the redesigned ClipBuilder workflow.
The attached screenshot is a visual reference, not an additional instruction.

## Implementation and acceptance

Owner follow-up: apply the rule to the entire application, audit thoroughly and
prevent new bare loading placeholders. The original main-workflow pass was not
a complete app-wide audit. Include landing lazy/media states, local and hosted
workflow, legacy processing/result restoration, every editor/sub-editor, dialogs,
button actions, progress displays, thumbnails and reconnection. Record each
surface's shared primitive and exceptions; do not equate source audit or fake
fixtures with exercising every real paid/network failure. Centralize small
activity indicators and enforce their imports with lint while preserving existing
dependency/security rules. Promote the continuing design rule into repository
authority. No new functionality, requests, delays or provider actions.

- Extend the existing shared ProcessingState with a compact layout instead of
  introducing an unrelated spinner system. Reuse the safely separated logo/ring
  from BrandedSpinner, a restrained themed surface and decorative animated
  placeholders. Never invent a percentage, available quality, result or ETA.
- Replace bare resolution, restored-moments, image-dialog, player-opening and
  return-home loading placeholders with that shared compact treatment. The narrow
  editor preview uses the same component's centered branded panel with compact
  indicator, bounded to its existing canvas. Keep small buttons,
  thumbnails, navbar save/connection feedback and already designed full panels
  proportionate to their roles. Audit and record intentional exceptions.
- Preserve real loading/ready/error transitions, cancellation, form state,
  controls, accessible status announcements, keyboard/focus behavior and all
  source/hosted/security boundaries. No artificial delay or new data request.
- Check actual held pending and settled states in Codex at desktop/tablet/phone
  widths. Keep the spinner clear of the logo, wrap naturally, avoid page overflow,
  and preserve action/footer visibility. Verify shared player loading does not
  change preview geometry. Retain normal animation under all motion preferences
  and support OS forced-colors styling.
- Use focused existing checks, frontend types, changed-file lint/format and a
  read-only validate pass. Do not add tests that merely mirror decorative markup.
  Document real evidence, limitations and cleanup.

No API keys are needed for these UI changes or generated/fake-response checks
with FAKE_MODE=true. Real processing still needs its existing provider/runtime,
live flags and applicable approvals. No paid/provider/download action, owner clip
edit, external browser, fullscreen, configuration change, Voyagenda work, Git
staging/commit, push or deployment is authorized for this packet.

## Implementation and consistency audit

- Added one `compact` layout to ProcessingState, keeping the default panel and
  shared BrandedSpinner geometry. The layout owns its surface, typography,
  responsive grid and two aria-hidden animated placeholder lines. No timer,
  request, state machine, guessed percentage or extra user-facing prose was added.
- Resolution lookup, restored moments, image dialogs, source-video playback and
  return-home recovery now use the compact layout. Editor preview opening uses
  the existing centered branded panel with its compact indicator and zero minimum
  panel height, bounded to the existing canvas. Its accessible loading status
  stays outside the inert editor; the decorative overlay remains aria-hidden.
- The initial pass retained small bespoke spinner CSS and the older result's
  Progress-only placeholder. The owner's follow-up broadened that limited audit:
  all raw spinner uses now share ActivityIndicator, old spinner CSS is removed,
  and both result/hosted prepared-clip opening states use ProcessingState. Existing
  full upload/analysis/generation/workspace panels already used ProcessingState.
  Button/URL-field/thumbnail/nav save/connection indicators remain intentionally
  small and now share the same primitive. Hook title retains its structured
  message and reachable Cancel action.
- Image dialogs retain close/Escape, image error text, protected image paths and
  focus return. Source playback retains its metadata/readiness gates. Local and
  hosted callers share the same UI; local-only acquisition exposure is unchanged.

## Initial workflow/editor verification and limits

- Current production intake components with injected fake HTTP: one lookup and
  two metadata requests (deliberate failure, then explicit retry) only. Held
  resolution loading, error and ready transitions worked; the loader was removed
  when actual fixture choices became available. Desktop card and footer rectangles
  matched between pending and ready. No real lookup, download or provider call.
- At 1440/768/390/320 widths, resolution loading stayed inside its card with one
  accessible status, no percentage/progressbar, no page overflow and its actual
  YouTube card footer visible. An initial geometry query matched the hidden Upload
  footer; it was corrected to the active card and all four measurements repeated.
- Held generated image: pending/error/reopen/ready all worked. Loader and Close
  stayed inside the dialog at all four widths; Escape returned focus to View.
  Ready image decoding removed the loader. Generated silent source playback went
  from pending to a usable 2s duration; preview width/height stayed 512x288 at the
  inspected desktop viewport, with no playback initiated. Component-page moments
  and full-panel samples were inspected; no live moment-restoration operation or
  real session cleanup was initiated solely to produce a loading state.
- Separate generated silent editor with held preview: its branded loader stayed
  inside the canvas at all four widths. Releasing the media removed it, with exact
  before/after preview rectangles unchanged at every width. Fake fixture recorded
  zero edits and zero unexpected requests. Both fixtures ended with no held
  requests, tabs closed and viewport overrides reset; normal review was preserved.
- Nine existing shared workflow/source-preview checks passed, plus thirteen
  existing recovery/runtime-capability checks. Frontend typecheck, changed-file
  ESLint, Prettier and diff whitespace checks passed. No decorative markup tests
  were added. Forced-colors behavior and inherited normal motion were reviewed in
  CSS; OS/browser preferences were not changed.
- Initial typecheck exposed optional CSS-module class names; the shared optional
  className prop now explicitly accepts undefined. The first temporary fixture
  passed the wrong runner signal shape and stopped before opening a test server;
  its generated scratch was removed and the corrected fixture was used above.
  These were corrected setup/type failures, not claimed passing application checks.
- Read-only validate reviewed the full CL-278 diff against this ticket: shared
  integration, existing readiness/transport/security boundaries, no stale spinner
  references, status semantics, responsiveness and cleanup. No actionable findings.
  Screenshots are private synthetic design evidence, not landing/portfolio assets.
  Real-provider quality, hosted deployment and native export were not tested.
- No owner clip/media/configuration changes, paid work, external browser,
  fullscreen, Voyagenda changes or Git mutation. Owner aesthetic acceptance remains
  separate from these generated/fake/no-key checks.

## Complete source inventory and app-wide revision

This pass searched all frontend application routes, production TSX/TS media and
async components, and loading/animation CSS, excluding test prose and marketing
scripts that do not represent live work. Each authored surface below was traced
to its loading primitive; source coverage is distinct from executing every real
provider, expiry or vendor failure. This closes omissions in the initial pass,
rather than treating its earlier limited clean review as an app-wide audit.

| Surface and owning modules | Presentation / disposition |
| --- | --- |
| Landing `product-film-hero`, `product-film-player` | Persistent designed poster during lazy/player loading; no blank hero. Static marketing upload art is illustrative, not live progress. |
| App `/start`, `experience`, startup/recovery | Existing branded ProcessingState for connecting, opening, upload and workspace restoration. |
| `acquisition-panel`, URL startup, quality lookup | Compact ProcessingState plus shared field/button activity; transfer keeps its genuine Progress and cancel/retry. Local-only exposure unchanged. |
| `selection-panel`, restored and analyzed moments | Compact/full ProcessingState; no new timing or analysis call. |
| `clip-batch-panel`, queued/preparing/rendering | Existing branded panel and preparation stages; reconnection uses shared small activity and existing recovery actions. |
| `codex-preparation-steps` | Shared activity for running steps; pending/done/failed/canceled retain their actual icons/status. |
| `clip-editor`, `portrait-player`, source/export playback | Branded preview/video loading within existing geometry; remotion paths use their existing canonical outer readiness UI, not a second invented workflow. |
| `cloud-clip.review`, `result-preview` | Replaced bare prepared-clip text and Progress-only restoration with compact ProcessingState. |
| `processing-status` | Branded active symbol, existing elapsed clock and real/fake measured/indeterminate Progress semantics preserved. Inactive work keeps a static symbol. |
| Captions / `caption-text-editor`, `text-inspector`, filters | Synchronous controls create no artificial waits. Generation uses existing full state and shared busy command presentation. |
| Media / pictures, videos, audio libraries and dialogs | Shared thumbnail loading, compact image opening and existing import panels. Native source video now gets a bounded media-loading overlay. |
| `video-thumbnail`, `candidate.review`, clip rail / selected-video previews | Shared activity and themed animated pending thumbnails. Bounded unavailable state remains, without automatic retries. |
| `camera-motion-editor`, `focus-editor`, `head-selection-view` | Source-frame observer overlay for original-video zoom/pan, speaker positions and tracking selection; no blank initial source canvas. |
| `media-camera-controls` | Same observer for both uploaded pictures and videos; existing source-error feedback remains canonical. |
| `media-face-tracking`, `head-motion-editor`, bulk tracking | Existing measured Progress now shares activity cue; cancel and local tracker/word clocks unchanged. |
| `editor-save-tools`, rename dialog, upload/generate commands | ActivityIndicator / Button busy; navbar, dialog, form and disabling guards preserved. |
| `hook-title-progress`, `youtube-audio-intake` | Shared activity or existing branded import panel; cancel, title acknowledgement and autosave behavior unchanged. |
| `cloud-result`, download/restore/recovery | Shared playback readiness and branded return-home/result opening. Download request feedback remains honest; native download progress is browser-owned. |
| Editor tour and layer ordering | Tour waits on existing settled/readiness UI; drag/status announcements are not fake loading states. |
| Errors, privacy, not-found, security verification | Ordinary immediate/error content is not loading. Vendor interactive challenge and OS/browser dialogs retain their own trusted UI. No challenge was triggered. |

### Prevention and implementation boundaries

- Added shared ActivityIndicator and migrated every raw LoaderCircle call across
  buttons, stage lists, navbar, title progress and thumbnails. Button busy and
  Progress now supply it centrally. Removed old acquisition, candidate and stage
  spinner CSS/keyframes. Narrow action rules explicitly retain activity graphics.
- Added MediaLoadingOverlay to all five raw source-canvas implementations. It
  subscribes to existing DOM load/readiness/error events using an external-store
  reader, cleans up listeners and handles cached/replaced sources. It never
  fetches, seeks, plays, retries or changes capture/tracking readiness. Small-height
  frames use container sizing and retain screen-reader status when visual text
  cannot fit. Owners with existing error feedback opt out of duplicate alerts.
- AGENTS.md and the source of truth require the shared system for future work.
  The existing frontend ESLint import boundary rule additionally rejects raw
  LoaderCircle/Loader/Loader2, including aliases. Existing import restrictions
  remain intact. Four negative/positive guard cases extend the boundary suite.

### App-wide verification

- 62 focused frontend cases passed across workflow primitives, source playback,
  candidate review, fixed/hosted review, processing semantics and runtime capability
  surfaces. All 31 root boundary cases passed, including the four new loading
  guard cases and existing security/dependency checks. Full frontend ESLint,
  frontend typecheck, changed-code Prettier and whitespace checks passed.
  The final primitive review added one busy-icon regression: one activity icon,
  retained accessible name and no implicit change to the caller's disabled state.
  Full frontend lint passed before that small primitive correction; its changed
  component/test then passed scoped lint. Old unused sample-loading CSS was removed.
- Current-source Codex component fixture covered compact prepared-clip opening,
  legacy processing, navbar saving, busy buttons, title cancellation, tracking
  progress, pending thumbnails, image/video loading and small source canvases.
  At 1440/768/390/320 widths there was no page overflow; all source overlays stayed
  inside their frames, including a 150x84 surface. Normal motion was retained.
- Held generated video/image sources displayed loading; releasing their actual
  bytes removed every source status. Both videos were paused, muted and decoded
  to readyState 4; image width was 640. A long-held thumbnail reached its existing
  bounded unavailable state as intended; fresh opening with immediate bytes
  reached ready. No timeout or automatic retry policy was weakened.
- Replacing a ready video with a held new URL showed exactly its own loader;
  ready image/small preview stayed clear. Releasing that request as 404 removed
  loading and showed concise contextual failure. Counts stayed at seven expected
  synthetic media reads through further inspection, with zero pending requests,
  unexpected requests or editor edits. Title Cancel updated the fixture state.
- A separate real editor surface backed by generated/fake transport opened the
  original-video Camera canvas (readyState 4, loader removed), then an added
  picture target (decoded, loader removed). No edits were saved. Initial resolution,
  image dialog, main preview and error/ready geometry evidence above still applies.
- The first full lint pass caught React Compiler dependency inference in the new
  observer's manual callbacks. Moving the read-only subscription into an explicit
  media store resolved it; full lint passed afterwards, without disabling rules.
- Owned fixtures, generated media, temporary source/cache, tabs and viewport
  overrides were cleaned up. No real-provider, live acquisition/download, hosted
  deployment, native export or vendor challenge was exercised. No owner media,
  configuration, Voyagenda or Git state was mutated beyond these source/docs edits.
  App-wide source review and representative fake UI checks are complete; this is
  not a claim of exercising every real-network/paid state or guaranteeing that
  future contributors can never bypass review. Final validate: meets ticket,
  no actionable findings in the scoped implementation.

## Owner local commit authorization — 2026-11-11

The owner now authorizes the file-level plan, staging and local ticket-prefixed
commits for the pending work. This supersedes earlier no-Git limits for this
batch only. Whole-file allocation, final checks and receipts are recorded in the
[commit plan](../operations/CL-278-283-FILE-COMMIT-PLAN.md). Final validation is
clean: 184 focused fake/paid-off cases, applicable types, scoped lint/format,
CLI syntax, dependency guards and whitespace checks. Prior visual evidence and
owner-only aesthetic/editorial/real-provider acceptance remain distinct. No
push, provider action, configuration change, Voyagenda work or deployment.
