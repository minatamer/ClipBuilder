# CL-273 — Responsive workspace migration, autosave and action history

Status: complete — implemented and locally validated, 2026-11-10. The
inner-editor revision is included in the full CL-273 migration. Owner visual,
live-provider quality and release acceptance remain distinct.

## Owner review revision — inner editors and toolbar, 2026-11-10

The owner approves the larger workspace but finds Captions, Text, Filters,
Media, Camera, Hook and their sub-tabs too close to the old forms. Generate
additional built-in image references, then improve their hierarchy, density and
use of the available space while preserving every F01–F32/S01–S15 requirement.
Remove the File button/menu presentation and improve the bland save indicator.
Session reset/recovery/privacy/exit capabilities must remain reachable through
compact, clearly named actions; removing File cannot remove those functions.

Implementation guidelines for this revision:

- Use one coherent inner-editor family: a compact context header, a purposeful
  collection/navigation pane and a larger active work area. Give typography,
  crop picking, word editing and layer timing enough room. Avoid repeated nested
  rounded fieldsets, giant pill sub-tabs and unexplained empty gaps.
- Retain the exact existing sections/sub-tabs and all conditional controls,
  callbacks, keyboard behavior, source/display/Hook clock rules and validation.
  Group related controls with readable small section headings/dividers. A new
  presentation must replace its old equivalent, never duplicate its parameter.
- Keep deliberate touch targets and stable contextual feedback. Do not obtain
  density by shrinking inputs below usable targets, hiding errors or removing
  advanced functionality. Collapse panes deliberately on tablet/phone.
- Save status becomes a compact designed status badge with meaningful icon,
  tint and gentle transition: acknowledged, saving, check edits, failed/conflict.
  Preserve exact honest state, explicit Retry/Reload and unchanged toolbar/
  preview geometry. No fake success timer or new provider work.
- Image references are design aids outside Git; generated text/layout cannot
  silently redefine a function. Preserve the approved full-window outer shell,
  clip rail, large left preview, brand palette and no-bottom-bar rule.

Git authorization: the owner explicitly requests staging and committing **all
CL-273 changes at whole-file level once validation is clean**. This includes the
existing unstaged shell migration plus this review revision. Inspect the final
allocation, exclude unrelated/private/generated scratch, stage explicit whole
paths, make a local CL-273 commit and never push. No paid test, deployment,
configuration change, owner session/media edit or Voyagenda operation is added.

### Inner-editor implementation and verification

Three built-in image-generation boards were generated before implementing this
revision: Captions/Text, Filters/Media and Camera/Hook. Images and exact prompts
remain outside Git in the Codex visualization directory as cl273-inner-1.png,
cl273-inner-2.png, cl273-inner-3.png and CL-273-inner-editor-prompts.md. They
retain the approved shell/identity. Invented image controls (extra looks/fonts,
caption search and new camera modes) were deliberately excluded from code.

- The six inner sections share compact scope headings, purposeful collections,
  wide canonical properties, flatter grouped controls and lighter sub-tabs.
  Captions/Text retain all style, word, speaker, placement and timing controls.
  One shared keyboard radio grid replaces the existing preset dropdowns:
  exactly nine typography presets and five timed looks. Filter samples use the
  shared thumbnail cache and the actual look layer; no duplicate decoder or
  parameter is introduced. Native colour pickers gain readable hex swatches.
- Media retains acquisition, timing, fit, placement, source trims and audio;
  order actions use labelled shared icon buttons. Camera retains its visual
  crop/endpoint picker, target selector, Zoom/Pan/Face tracking/Transitions and
  Capture. Hook groups its independent range and explicit optional title/audio
  controls. All domain callbacks and availability/validation guards remain.
- File is removed. The far-right Session options ellipsis retains reset,
  recovery, privacy and applicable Exit, including Escape/focus handling. The
  save badge uses a real state icon/tint and fixed geometry for acknowledged,
  pending, invalid, failed and conflicting edits, with explicit Retry/Reload.
- The full frontend suite passes **750/750 tests in 97 files**. A legacy
  typography-feedback fixture previously spread an absent optional caption
  style; it now starts from the canonical Clean preset before injecting only
  the invalid number under test. Validation assertions are unchanged.
- Generated HTTP autosave proof passes all prior race/conflict/invalid/history
  checks plus nine-preset availability, preset save/Undo without geometry loss,
  and a Warm look saved through the real edit route. Plan/image/render counts
  remain zero. Responsive layout and Hook-options proofs pass after the main
  revision. Final responsive layout and integrated film proofs also pass after
  the final swatch/text-toolbar and measured action-coordinate changes.
- Codex browser inspected Captions, Text, Filters, Media, Camera and Hook,
  picture selection/crop controls, keyboard preset switching, Undo and genuine
  saving/saved states. Phone presets retain all choices in a horizontally
  scrolling grid; End moves focus/selection to the last preset. Session options
  remains reachable on phone and Escape closes it. Tablet uses pane switching.
  Screenshots cl273-inner-desktop.png, cl273-inner-phone.png and
  cl273-inner-tablet.png remain outside Git. The fixture/tab are closed and the
  viewport override reset; the owner session was not used.
- Recaptured all ten controlled product-film images from current synthetic UI,
  refreshed their integrity hashes and measured action coordinates. No provider
  request, owner media, normal app mutation or download click was used.
- Current-source production Next/Turbopack build and strict release-artifact
  verification pass in a closed temporary context: 1,825 files, zero external
  package links, self-contained artifact. The existing local-discovery tracing
  warning remains, with no weakened guard or ignored configuration included.

Final revision gate: repository lint, repository formatting, frontend and test
TypeScript checks, the 750-test frontend suite, extended HTTP autosave proof,
responsive layout proof, Hook-options proof and integrated product-film proof
pass. Earlier current-source native B-roll, hosted-security/boundary and tour
evidence remains applicable because their transports/contracts/composition and
tour targets were retained. No historical optional proof or real-provider
quality is implied. Final scoped validate against baseline e046579 and the
combined CL-273 worktree finds **no actionable findings**: all F01–F32/S01–S15
requirements are covered with the explicit owner-only boundaries below.

The old source/editor footer, Apply/Discard, duplicate layer/preset controls and
File menu presentation are removed from runtime source. Existing domain modules
remain where they own real functionality; no alternate legacy UI is retained.
New code uses existing shared primitives/tokens, bounded cached thumbnails and
explicit lifecycle cleanup. No ignored configuration, private media, keys,
provider resources or new dependencies are included. Only the ten original
fictional product-film stills are tracked bitmap updates. Temporary build/UI
helpers are removed after their owned fixture/context cleanup. Normal ClipBuilder
services remain running; Voyagenda was not touched. Whole-file allocation below
is the authorized local commit scope; the handoff reports its resulting hash.

The owner requests completion of the entire responsive migration with focused
execute/validate/fix loops, exhaustive feature/security parity and removal of
the superseded UI. Responsive/intake/selection references were generated
before implementation and are retained outside Git. Earlier design-only
holds in historical sections are superseded by this explicit instruction.
Depends on the implemented shared
workflow and CL-271/CL-272 functionality at commit e046579.

## Current execution contract — approved AFK migration, 2026-11-10

The owner approves the design direction and explicitly authorizes implementation
to completion without questions. First generate/source the additional reference
pictures, then document the full packet, implement and validate in bounded loops.
Every existing feature, including small/conditional operations, and every
security/spend/privacy guard must survive. A similar screenshot is insufficient.
New features must be documented, implemented and verified before claiming them.
No speculative product expansion is necessary beyond Home, responsive workspace,
validated autosave and bounded Undo/Redo already requested. Initial design-only
holds below are historical and superseded. Local whole-file Git authorization
is recorded above; deployment/paid-provider actions remain outside this
authorization. Preserve owner media, sessions and Voyagenda.

### References completed before implementation

Four additional built-in image-generation references are generated/inspected and
saved outside Git alongside the approved three-screen family:
cl273-intake-reference.png, cl273-moments-reference.png,
cl273-tablet-reference.png, cl273-phone-reference.png. Their exact prompts are in
CL-273-responsive-workflow-prompts.md in the Codex visualization directory.
These are inspiration, not executable specs. Do not implement the selection
image's idle spinner, apparent combined analysis/process action or extraneous
text. Preserve the real two-stage explicit analysis/processing contract. The
phone image is a scroll composition, not proof that all controls fit one screen.

### Non-redundancy and UX rules

1. One canonical editing location for each parameter. Home/timeline/cards select
   and navigate to it; they do not instantiate competing editors for that field.
2. Source trim chooses admitted source frames. Display timing places a cue on
   the clip clock. Camera-effect timing bounds an effect inside that cue. Hook
   selects an independent lead-in. Acquisition Range limits downloaded source.
   Preserve all five semantics with clear scope; do not merge them or repeat
   identical Start/End controls in collection, timeline and inspector.
3. One selected clip/layer/occurrence/clock drives preview, Home and inspector.
   Navigating or selecting never edits, generates, applies or exports by itself.
4. Use the existing six semantic sections plus Home. Media owns acquisition,
   placement, trim and gain; Camera owns crop/Zoom/Pan/marked-head tracking and
   transitions. Preserve existing sub-tabs and target availability.
5. One useful action area in the compact top bar. No bottom editor navbar,
   Step 3 enclosing frame, manual Apply/Discard cycle, redundant success prose,
   fake progress, decorative project title or duplicated primary submission.
   Intake cards may retain local coherent actions without a second page footer.
6. Keep exact current brand mark, tokens, neutral inset keyboard focus, timestamp
   Capture, fixed contextual feedback space and normal motion. Do not add a new
   framework/design dependency or a second local/hosted editor implementation.
7. Desktop uses remaining viewport height with independent purposeful panes;
   phone uses natural document scroll and horizontal tabs/clip strip. Tablet and
   compact laptops collapse the inspector/layout deliberately, never scale text
   down to make four unusable columns. All controls remain reachable.

### Feature inventory and required parity evidence

The prior map below remains binding. Before removing a legacy surface, migrate
every callback/validation state reachable from it, not just its happy-path label.
Inspect the owning source/fixtures and record produced evidence in the ledger.

| ID | Current behavior to preserve | Owning boundary / migration check |
| --- | --- | --- |
| F01 | Local MP4/file/drop and saved-reference open, same picker acceptance/reset, busy/error/cancel/readiness | experience/open-local-file; generated upload and reopen |
| F02 | Hosted bounded chunk upload, actual acknowledged progress, Turnstile/session admission | hosted-upload/analysis-challenge; no bypass or extra provider dispatch |
| F03 | Local YouTube link validation/metadata/offer images, quality choice, saved variants, open/download/range, cancellation/retry/status restore | acquisition-panel/source-acquisition; hosted exclusion |
| F04 | Retained source playback, available-window constraints, correctly shaped thumbnails, load/error/seeking state | source preview/manual-time |
| F05 | Manual Add clips with single-endpoint Capture, valid duration/bounds, manual disables Suggest clips with explicit opt-back-in | selection-panel/selection-bounds |
| F06 | AI analysis range/count/duration/all gates, explicit challenge/action, cancellation/retry and preserved results | analysis request/progress transport |
| F07 | Timestamp import/export, roundtrip, Jump to source, all retained manual/AI results, removal/empty/count bounds | timestamp exchange/selection results |
| F08 | Local-only tracked/fit choice, tracked default, hosted API normalization, all saved legacy defaults | runtime-capabilities/server |
| F09 | Clip paging/keyboard tabs/rename/remove, state labels and preview readiness, Add more clips and return | clip-batch/clip-name-controls |
| F10 | Native source preview with real controls/clocks/fullscreen, exact frame sampling, gesture scale and safe bounds | Review/player/composition unchanged |
| F11 | Caption preset/font/color/outline/background/layout/animation/position, speakers/palettes and actual word corrections | caption-controls/text/style and saved edit schema |
| F12 | Caption generation confirmed paid/local path, fake generation local-only, attempts/empty/error/retry | existing explicit generation transport; autosave never calls it |
| F13 | Multiple manual/opening/Hook texts, selection/content/style/emphasis/range, Capture, drag/resize/delete | text-controls/edit and preview sessions |
| F14 | Full-clip and timed filters/looks, source-only effects and Hook independence | filter controls/timeline |
| F15 | Picture upload/find/replace/delete, source preview, local/hosted availability and shared thumbnail loading/failure | visual discovery/admitted assets |
| F16 | Added video upload/normalization/source trim/display bounds, muted default, optional gain/mixing, exact clocks | video assets/cue edit/worker unchanged |
| F17 | Shared picture/video order, separate timing/geometry, fit/contain/cover/full-frame/inset and overlapping decoder bounds | existing visual-order and contracts |
| F18 | Original camera positions/people/custom/reset/Capture, visual crop picker and named target | focus preview/control modules |
| F19 | Original/picture/video Zoom and Pan, target-specific transitions, endpoint selection, inspection-to-playback return | camera inspector/media-camera modules |
| F20 | Marked-head Face tracking original/added video, seed/follow window/progress/lost/cancel/reset and path binding | browser tracker/saved path unchanged |
| F21 | Original speech volume, real curated cue/music/uploaded audio, audition/stop/import, timing/source trim/gain/loop/anchors/delete | audio controls/preview/import/mixer |
| F22 | Suggested/manual Hook, incomplete End guard, title/audio independent off-by-default opt-ins, title preview/failure/retry/limits | Hook controls/requests/independent Hook edits |
| F23 | Hook/body captions/text/visual/audio/camera/filter independence and one offset mapping, selective errors/selection | occurrence adapters/timeline |
| F24 | Invalid transient input retains last valid paint; contextual stable errors, capture guards, pending/stale revision protection | editor form and validation |
| F25 | Local named drafts/output references/source retention and two-hour rolling recovery; hosted temporary isolation | existing draft/recovery/session stores |
| F26 | Export coherent revision, queue/preparing/exporting/cancel/retry state, MP4 naming/download, exact preview/render parity | clip-batch/render routes/worker/composition |
| F27 | Explicit Start over/clear confirmation, session recovery retry, lost/disconnected state and privacy dialog | session-controls/connection |
| F28 | Tour first-ready welcome/skip/replay/Escape/focus return and seen reset on explicit Start over | editor-tour retargeted to new shell |
| F29 | All relevant controls on large/small laptop, tablet landscape/portrait, phone portrait/landscape with touch/keyboard | generated browser matrix and Codex inspection |
| F30 | Home combined layer/camera/effect/audio overview, Hook mapping, row selection opens canonical inspector | new presentation over existing immutable timings |
| F31 | Validated autosave, acknowledgement/failure/retry/flush, navigation/export/recovery coherence without AI/render spend | new state coordinator over existing edit HTTP |
| F32 | Multi-action Undo/Redo, meaningful gesture/typing grouping, per-clip scope and bounded memory; no duplicated generation | new history domain tests + real edit transport |

### Security and integrity invariants

| ID | Must remain enforced |
| --- | --- |
| S01 | Same-origin frontend bridges, protected local token binding, hosted cookie/CSRF/origin/session ownership; no new unauthenticated media/save route. |
| S02 | Hosted session/IP/abuse/challenge/usage/attempt/resource bounds and expiry; no durable hosted library or hidden YouTube route. |
| S03 | No ignored env/credential reads/changes, no browser provider/backend secrets, no private paths/transcripts/media in Git/errors/normal logs. |
| S04 | Fake/paid-off before test imports, envDir false, injected transport and external network blocking; zero real provider/YouTube/cloud requests. |
| S05 | Explicit user generation only, no automatic provider retries/fallbacks; saved inference reused and never repeated by autosave/Undo/Redo/tour. |
| S06 | Schema validation, immutable asset IDs/hashes, revision/base/source/occurrence binding and idempotent operation receipts preserved. |
| S07 | Video/image/audio format/pixel/byte/duration/overlap limits and normalized assets; no arbitrary path/command/composition or remote asset entry. |
| S08 | Hook/cue/effect source/display timing bounds, incomplete range guards, single settled Capture clock and decoder limits remain. |
| S09 | Saved owner media/exports/masters/private diagnostics never deleted as cleanup; history stores edit values, not source-byte copies. |
| S10 | No accidental clearing on unmount/refresh/history; pending save cannot overwrite later typing or a newer acknowledged revision. |
| S11 | Request/listener/timer/RAF/decoder/object-URL/worker cleanup and bounded history; no duplicate polling or hidden old mounted workflow. |
| S12 | Frontend/contracts/composition/backend/renderer dependency directions; contract schemas stay shared and browser-safe. |
| S13 | Plain text stays escaped; no untrusted HTML or executable rendered values, no transcript in browser URLs/storage keys/log output. |
| S14 | Readiness gates preserve queued/exporting controls and existing explicit cancel/retry. Export is disabled during invalid/unacknowledged state. |
| S15 | Native/current-source parity and fake provider call counts; no obsolete build overlay used as evidence for changed composition. |

### Autosave/history implementation decisions

- Keep current saved edit format and protected edit endpoint. Autosave is a
  debounced valid edit request, not a native render or provider action. Do not
  permit invalid/incomplete form state to cross that transport.
- Serialize saves; acknowledge the submitted snapshot and rebase later local
  edits to its new revision instead of overwriting them. No loop/retry on failure;
  show a stable explicit Retry near save status. Stale-server conflicts preserve
  input and require deliberate recovery rather than forced overwrite.
- Export, clip switching, source navigation and explicit external actions must
  not race an unsaved edit. Keep a short pending flush/guard and beforeunload
  protection; show truthful Saving/Saved/Needs attention states.
- Record bounded immutable edit snapshots per clip; group continuous gestures
  and rapid field typing, clear Redo only after a new user edit, ignore duplicate
  states and navigation. History revision fields rebase on acknowledgement.
- Native input Undo remains available while typing; editor history shortcuts
  avoid hijacking text caret/input editing. Toolbar Undo/Redo is explicit.
- Incomplete Hook range input also belongs to in-memory action history. Undo/
  Redo must restore its exact null endpoint without popping an unrelated edit,
  inventing an End or sending incomplete state through autosave. History owns a
  transient snapshot envelope; the saved edit contract remains unchanged.
- Responsive review found the built-in portrait player's transport wraps at
  phone/short landscape sizes. Compact layouts use one full-width transport
  beside the scaled canvas, preserving play/pause, mute/volume, seek and
  fullscreen. Fullscreen retains the normal player controls. Clock updates stay
  within the transport; they must not rerender the whole editor on every frame.
- Preserve history across section navigation and clip changes in the current
  workspace. Persist acknowledged edit values through existing recovery; history
  itself may be session-memory bounded, documented rather than promising reload
  history. No private edit copy in general localStorage.
- Uploaded/generated asset additions and provider results are retained through
  existing stores; undo changes placement/edit values without deleting bytes or
  rerunning requests. Non-edit workflow actions remain explicit.

### Migration phases and verification budget

| Phase | Deliverable | Gate / status |
| --- | --- | --- |
| A | Approved desktop + additional intake/selection/tablet/phone references; inventory and current decisions | Complete; images are static inspiration only. |
| B | Shared full-window shell/top actions, responsive layout; migrate source/selection; remove Step 3 form/frame usage | Complete; generated responsive regression and Codex inspection passed. |
| C | Editor canonical panes/Home overview/selection; retain every existing control handler and ownership | Complete; inventory review, navigation and real crop/placement gestures passed. |
| D | Validated autosave + bounded history; coherent export/navigation/recovery | Complete; serial/failure/race/conflict/two-clip/partial-Hook transport checks passed. |
| E | Tour and product-demo/landing alignment to actual finished workspace; no stale visible Apply/Discard workflow | Complete locally; tour, integrated film and motion checks passed; fictional delivery stills updated. |
| F | Cleanup/migration ledger, focused regressions/types/lint/build, generated HTTP/native representative flows and responsive/Codex review | Complete locally; coverage ledger below records evidence and limits. |

Work sequentially in this packet; no delegation is implied. Run focused checks
after meaningful slices, never after every cosmetic edit. Reuse passing native/
provider/security evidence where its boundary is unchanged. New autosave/history
needs actual HTTP and revision/failure/race checks; pixel/control/range changes
need current-source generated browser/native evidence. Final checks include
lint/type/build and the smallest relevant unit groups, not endless repeated
full suites or paid acceptance. Record failures and fix their causes.

Responsive acceptance dimensions: 1920x1080 and 1440x900, compact 1280x720 and
1366x600, tablet 1024x768 and 768x1024, phone 390x844 and 320x568 plus landscape.
Use representative settled valid/error/corrected/pending states and real pointer
or touch gestures. Check no horizontal document overflow, readable previews,
reachable primary/cancel actions, keyboard tabs/focus and stable feedback.
Observe playback/seek/drag/timeline responsiveness and absence of duplicate
requests/update loops; do not invent a universal FPS claim from static captures.

### Removal, code quality and completion ledger

No parallel legacy/new editor, compatibility toggle, hidden old footer, duplicate
form or dead CSS fallback may remain at completion. Reuse domain/controller code
where sound, rewrite presentation at its owner and extract named responsibilities
where needed. Delete superseded modules/selectors once their consumers migrate,
within the same slice; preserve unrelated reusable security/domain modules.
Update selector-dependent tests and demo/tour consumers instead of retaining
dead UI for them. Search for imports, selectors, visible old action strings and
obsolete workflows; delete only verified orphaned code, never real saved data.

Every F/S row must finish Covered with actual evidence or an explicit owner-only
external quality/release boundary. A missing local capability is a failure to
finish, not a deferred nice-to-have. Final validate covers feature preservation,
redundant controls, responsiveness, autosave/history races, security/privacy,
dependency direction, render clocks, cleanup and dead legacy code. Personal
visual preference and live-provider quality remain owner-only; no paid test is
necessary for this migration. Record final changed files/checks/limits/Git status
here. Never claim completion merely because images or documentation are done.

### Execution evidence — shell/history and inspector slices

The shared Workspace/WorkflowFrame now use compact full-window chrome with File,
history/save status, context actions and tour replay. The old outer frame/footer
rendering and its editor layout rules are replaced, not hidden beside a second
workflow. Clip navigation owns Add. Home derives existing text/caption/visual/
camera/effect/filter/audio intervals, including independent Hook/body mapping;
playhead paint subscribes directly without rerendering all controls per frame.

Added bounded workspace-owned edit history (50 states per clip, 8 MiB aggregate)
and debounced edit-only autosave. Saves serialize, preserve newer in-flight
typing, retain uncertain-operation receipts for explicit retry and gate export/
navigation. No generation or native render is dispatched by a save. Native input
Undo is preserved while typing; toolbar/history shortcuts address editor actions.
These mechanics still require failure/race/gesture/recovery acceptance; they are
not marked complete from a positive check alone.

Frontend TypeScript and contracts build passed at this slice. A generated Codex
browser check confirmed Home/top actions, caption edit 64→70, acknowledged Undo
70→64, section navigation and Redo 64→70; exactly three HTTP edit requests and
zero unexpected fixture requests. The current preview and controls stayed loaded.
No owner clip was used. Screenshot cl273-shell-first-pass.jpg is outside Git.
The fixture/tab/server/scratch were closed. The first real browser bundle caught
a .ts/.tsx basename ambiguity; its import now explicitly selects the timeline
model. Review also found the remaining Media collection/properties stack too
crowded; separating canonical panes is the next slice. No clean final validation
or overall completion is claimed yet.

The next slice moved Text, Captions, Filters, Media/Audio and Hook properties
into shared canonical inspector slots. Wide screens show collection + inspector;
narrow workbenches switch Layers/Properties rather than burying a second full
form below the list. Camera retains its dedicated source-frame/inspector pairing.
The duplicate Media layer selector was removed; the visual list remains the
selector, with front/back controls and a read-only stack position. Pictures and
Videos filter their own lists. Clip-strip previews remain visible on tablets.
Home includes shared-helper thumbnails and effect/target/tab navigation. Source
intake uses one Upload/YouTube path at a time; no remote player was invented.

The generated HTTP autosave regression passes delayed-save serialization,
later typing, section navigation + grouped Undo/Redo, response-lost idempotent
retry, invalid-input suppression, Undo during a save, conflict/no-auto-retry and
explicit reload. It caught/fixed polling blocking an uncertain receipt retry,
and conflict reset at unchanged revision. Provider plan/image/render counts stay
zero, with zero unexpected requests and no pending edit responses on cleanup.
Frontend types passed after the shared inspector changes. A Codex browser review
at 1280×720, 768×1024 and 390×844 identified the buried tablet properties and an
unpositioned hidden file input extending document bounds; both were corrected
in source and still await a rebuilt visual pass. No owner media/session, normal
service configuration, paid service or Voyagenda was changed.

Further evidence: `local-workspace-layout.proof.ts` passes all seven sections at
1920×1080, 1440×900, 1280×720, 1366×600, 1024×768, 768×1024, 390×844,
320×568 and 844×390. It checks preview/panel/header bounds, field width, document
overflow and absence of legacy Apply/Discard/footer UI, with zero edit/unexpected
requests. Narrow layouts keep playback visible above an independently scrolling
inspector, or beside it in landscape; header height follows actual wrapping.

`local-editor-tour.proof.ts` passes readiness, initial welcome, replay, every
section including Home and Audio, resize, skip/back/done, animation continuity,
focus trapping/return, dirty guard/Undo, reset/rearm and missing-target recovery
with zero work requests. Its edge spotlight was corrected for the full-width
toolbar. `local-broll.proof.ts` passes a fresh generated HTTP/native pipeline:
multiple videos/transparent pictures, full-frame/inset, zoom/pan/tracking paths,
independent audio levels/default mute, native export checks and hashed draft
reopen without new AI. The current-source overlay is built into owned scratch.

The old normal-app/sample capture script was replaced with an isolated fake-only
authoring command. Ten current-workspace stills use original fictional artwork;
settled native source playback avoids idle loading captures. They replace the
ten controlled delivery PNGs with corresponding delivery hashes; the capture
index and authoring folder remain excluded. This is local provisional review,
not deployment or personal release approval. The film's cursor/card/preview
bounds now describe Jump to and top-toolbar actions; motion units pass all
eleven continuity/coverage/choreography checks. Initial abrupt corner panning
was fixed by easing between bounded camera endpoints and fading an offscreen
travelling pointer rather than snapping the camera. The old workspace-only
styles were removed from the shared sample stylesheet, and migrated action-slot
props/classes no longer carry footer ownership names.

## Owner revision: one coherent workspace, autosave and Undo — 2026-11-10

### Final migration review and evidence — 2026-11-10

All existing editor/source callbacks and domain guards were retained while their
presentation moved to the shared workspace. The following coverage is local
implementation/mechanics evidence, not a claim about real-provider output
quality or personal design acceptance.

| Inventory | Result and produced evidence |
| --- | --- |
| F01–F04 | Covered: source tabs use the existing upload/drop/open/acquisition controllers, native source preview and shared thumbnails. File acceptance, hosted admission, quality/range/cancel/retry and saved-reference paths remain. Generated intake/selection were inspected in Codex; the isolated film captures the actual current source states. No real YouTube download was run. |
| F05–F08 | Covered: manual/AI selection remains two explicit stages with retained Add clips / Your clips, Capture, exchange, Jump to, bounds/count and local-only framing controls. Existing form handlers and contracts are unchanged; top actions replace only their mounting location. Hosted workflow tests pass, including forced tracked framing and local-path exclusion. |
| F09–F10 | Covered: clip rail, rename/paging/keyboard/readiness/Add and native Player retained. Responsive rail orientation matches its CSS breakpoint. Codex exercised scaled picture/crop dragging, ordinary playback, seek/mute and fullscreen entry/return; the generated browser proof verifies the settled native fullscreen transport and preserved clock. |
| F11–F14 | Covered: captions/style/position/text/speakers, all text/style/emphasis/timing controls and filters retain their owning modules and callbacks. Canonical collection/inspector portals replace duplicate pickers. Full frontend suite now passes 750/750 after the inner-editor revision; Home/timeline/history/workflow/Hook and shared-thumbnail checks are included. |
| F15–F17 | Covered: picture/video/audio upload, discovery, delete, shared loading thumbnails, source/display ranges, fit/presentation, layer order and per-video audio retain their existing transports and schemas. Fresh generated HTTP/native B-roll proof passes multiple videos plus transparent pictures, inset/full-frame, zoom/pan/tracking paths, default mute and independent mix. No owner media was edited. |
| F18–F20 | Covered: original and added-media Camera keep their source picker, matching selection/clock/crop, Zoom/Pan/Face tracking/Transitions and all existing local tracker controls. Home effect rows target the correct occurrence/media/effect. Units check partial tracking windows and source offsets. Codex exercised picture Zoom and crop dragging; current-source native B-roll verifies saved numeric paths/export. Real-head tracking quality remains owner review. |
| F21–F23 | Covered: audio library/import/audition/mixing and independent Hook/body domains are retained. Updated Hook-options HTTP proof passes explicit independent title/audio choices, cancellation, range guards, custom volume 47, Undo restoration and reload. Exactly four fake title requests and three cancellations; no real inference. |
| F24 | Covered: last valid paint remains during invalid input; contextual errors and Capture guards stay intact. Export/download stays mounted but disabled during unacknowledged/invalid edits. Save-failure Retry and conflict recovery are anchored outside toolbar sizing. HTTP proof compares unchanged toolbar/preview/panel rectangles across saved/failed/conflict states at 1440, 768, 390 and 320 widths. Codex inspected empty/corrected font input on phone. |
| F25–F26 | Covered: protected revision-bound edit route and existing local draft/recovery stores remain authoritative; hosted remains temporary. Generated native B-roll saves/reopens a hashed draft without new AI and checks actual exported pixels/audio. Export still requires a coherent acknowledged edit and remains explicit. No recovery/draft/output format migration was added. |
| F27–F28 | Covered: Session options retains privacy/reset/recovery after removal of File; a new client guard prevents reset racing unacknowledged edits, with zero DELETE on the pending-save regression. Updated tour passes ready/loading/held media, welcome/replay, all sections, keyboard/focus, resize, skip/back/done, dirty Undo, Start over/rearm and missing-target cases. |
| F29 | Covered: seven sections pass at 1920×1080, 1440×900, 1280×720, 1366×600, 1024×768, 768×1024, 390×844, 320×568 and 844×390. No document overflow or legacy footer; preview, controls, toolbar and input bounds remain reachable. Compact transport avoids wrapped portrait controls, with one play/mute/seek/volume/fullscreen surface. Fullscreen checks use the root layout viewport, accounting for the shared stable scrollbar gutter. |
| F30 | Covered: Home projects existing text/caption/visual/camera/effect/filter/audio intervals; it introduces no competing range editor. Player clock paints the playhead directly. Row selection navigates the existing inspector; source/display/Hook offsets remain mapped once. |
| F31–F32 | Covered: generated two-clip HTTP proof passes serialized delayed saves, later typing, uncertain receipt retry with identical operation/body, invalid suppression, Undo during a save, conflict/no-auto-retry, explicit reload, cross-section/cross-clip Undo/Redo and incomplete Hook endpoints. History units cover grouping, bounds, changed base, removed clips and immutable snapshots. Provider plan/image/render counts remain zero. |

Security review:

| Invariants | Result |
| --- | --- |
| S01–S02 | Covered: no new route/admission/authentication mechanism. Twenty existing hosted workflow tests pass for admission, exact origin, isolated assets, export, expiry, capacity and local YouTube/library/agent exclusion. |
| S03–S04 | Covered: no ignored configuration/credential/media reads or changes. All tests install deterministic fake/paid-off configuration before imports, with no env loading. Closed app-image tests exclude secrets, tests and authoring inputs. New capture authoring blocks non-loopback browser requests and uses original fictional artwork. |
| S05–S06 | Covered: autosave/history contain edit values and use existing validated revision/base/idempotency contracts only. Provider work remains explicit; no automatic retry/fallback/render. Fake title and edit counts are asserted. |
| S07–S08 | Covered: existing normalization, asset IDs/hashes, media/resource/overlap bounds, source/display/Hook clocks, incomplete range guards and single-endpoint Capture are retained. Native B-roll and timeline/Hook regression checks pass. |
| S09–S11 | Covered: owner sources, drafts, exports, masters and diagnostics preserved; no normal service was restarted. History is bounded and memory-only. New subscriptions/timers/controllers have cleanup; fixture scratch and closed build context use validated owned paths. Pending reset cannot clear client edits. |
| S12–S13 | Covered: executable boundary/release checks pass (40 cases), lint passes, contracts remain browser-safe. Only Home was added to the diagnostic section enum. No untrusted HTML/remote composition/path/command or browser secret is introduced. |
| S14–S15 | Covered: queued/exporting/invalid/stale/pending gates remain. Native proof compiles the current overlay into its own scratch and checks actual preview/export/draft results. Composition/worker production code is unchanged, so no normal worker reload was needed. |

Cleanup and verification record:

- Edited the existing shell/source/editor files in place; removed old bounded
  workspace/footer and corresponding layout CSS, the obsolete capture command,
  duplicate Media selector and obsolete compact clip-width rule. No legacy
  editor toggle, hidden footer or second mounted workflow remains. Runtime
  source search finds no Apply changes/Discard changes/Step N of 3 action UI.
- Preserved existing control/domain modules; extracted named inspector slots,
  Home projection, autosave coordinator, bounded history and compact playback
  responsibilities. No new dependency or configuration switch was added.
- Updated the tour, current proof consumers, shared workflow tests and product
  film. Historical opt-in proofs tied to earlier tickets were not all rerun;
  they are not claimed as new acceptance. New canonical browser proofs cover
  the changed shell/save/history contracts without restoring obsolete UI.
- Full repository lint passed after resolving the new inspector effect warning;
  focused lint passed after the final playback/save changes. Frontend/backend/
  renderer/shared/test/local type checks passed. Formatting and diff whitespace
  checks pass. Full frontend suite initially passed 746/748; corrected thumbnail
  assertions and the isolated request timeout test pass on focused reruns.
- Production Next/Turbopack build and strict self-contained release-artifact
  verification pass in a closed temporary context, with zero external package
  links. Existing local-discovery dynamic tracing warning remains; the closed
  image contains no ignored secrets/tests/media and artifact checks pass.
- The first build-verifier attempt hit its 30-second tool timeout under load;
  a bounded 120-second verification completed. No source/configuration bypass
  or weakened artifact rule was used. Global pnpm mismatch was avoided by the
  pinned Corepack toolchain, without changing owner settings.
- Additional gate repairs are test-only: contract text-range fixtures now stay
  inside their allowed boundary; hosted export mock jobs parse the shared schema;
  the native video error callback carries its explicit React event type.
- Final Codex screenshots are outside Git beside the references:
  cl273-final-desktop.png, cl273-final-camera.png and
  cl273-final-phone-validation.png. They use generated fixture media. Ten actual
  current-workspace film screenshots use original fictional conversation art.
- Final responsive review also removed the obsolete compact clip-width rule so
  names remain readable, and replaced heading-to-top scrolling with an explicit
  stage reset to the document top. The Moments heading remains below the sticky
  toolbar; Add/Back preserves inputs and pauses hidden source playback. The
  generated phone navigation regression passes. Final review fixtures report
  zero unexpected requests and are closed; the Codex viewport is reset and its
  temporary tab is closed. Additional intake/Moments/tablet/phone screenshots
  are retained beside the three principal views.

Final validate disposition: the combined unstaged CL-273 worktree was reviewed
against F01–F32/S01–S15 and the owner revisions. Identified autosave receipt,
conflict reset, partial-Hook Undo, click grouping, compact transport, stable
export/error geometry and stage-heading issues were corrected and rechecked.
No remaining actionable implementation finding was identified in this scoped
pass. This does not certify every historical optional UI proof or live-provider
quality. No deployment is included; the later owner revision authorizes the
whole-file local commit after clean validation.

No paid clip run, real AI/YouTube/cloud request, deployment, model install or
Voyagenda operation was performed. API-free manual editing and these synthetic
checks do not establish live AI quality. Fresh real processing still requires
the normal provider/runtime/assets, enabled live flags and applicable approvals.
Personal visual/live-provider/hosted release acceptance remains owner-only.
This earlier pass preceded the inner-editor revision and its Git authorization;
the final whole-file disposition below owns the current completion state.

The owner likes the large left preview, far-left clip list, existing category
tabs and additional right inspector. They reject the bottom action/navigation
bar, the fictional project-title text in the header, and inconsistent layouts
between the first three mockups. The requested replacement is three states of
ONE shared layout: Home, Media and Camera. This supersedes the earlier four-image
set and its Apply/Discard footer proposal. The ungenerated workflow board is
deferred; the initial three generated images remain historical explorations.

- Keep one compact top app bar: existing logo/ClipBuilder name, File and View,
  history Undo/Redo controls, a quiet truthful autosave state, Export and Help
  that reopens the tour. Avoid invented project/source titles, slogans, redundant
  menus and low-value buttons. Put Add clips in the clip rail, not a footer.
- Keep the far-left clip rail, large left 9:16 playback and seven category tabs
  in fixed positions: Home, Captions, Text, Filters, Media, Camera, Hook.
  Preserve the added right inspector. Only the selected work area/inspector
  content changes between pictures. Use the SAME fictional media, source,
  preview timestamp, selected clip, type, spacing and column widths throughout.
- Home presents the combined bounded layer timeline and layer overview for
  this clip and is the initial fully ready editor view: original footage,
  camera positions/cuts, Zoom/Pan/tracking spans,
  captions, titles, pictures/videos and audio. Existing camera intervals can be
  represented without offering arbitrary source cutting or montage editing.
  Selecting a layer/effect must connect its row, preview selection, timestamp
  and corresponding tab/inspector. Hook/body timing remains mapped once.
- Replace explicit normal Apply/Discard and repeated Save with automatically
  saved valid edits and reversible action history in the future implementation.
  Reuse the existing edit validation, revision/admission and persistence paths;
  rolling recovery alone is not this new autosave/history feature. Invalid or
  incomplete typed values stay local, preserve the last valid saved preview and
  show contextual feedback. Saving/failure/retry states stay beside save status,
  without stealing column width or creating a bottom bar. Export must use a
  coherent acknowledged revision and block contextually when not ready.
- Undo walks back successive user edits; Redo restores undone edits. Coalesce
  a continuous drag/resize or typing gesture into a meaningful action. Scope
  history per clip, preserve it during tab switches, and bound its memory;
  decide reload persistence in the implementation packet. Preview navigation
  is not a media edit. Undo must not repeat/refund a paid generation, delete
  retained source/output media or silently rerun processing. Restoring a retained
  result/state should reuse it. No new inference/export is triggered by autosave.
- Respect local/hosted retention: local safe recovery/draft compatibility stays;
  hosted autosave is temporary session state, not a durable account/library.
  Keep all pre-existing AI/manual controls and local-only framing/YouTube gates.

The owner also explicitly requires later updates to the tour, product motion
graphics/demo film and landing so they depict the selected editor and revised
workflow truthfully. Record these as dependent follow-up work once the layout
and autosave/history behavior are approved; do not implement or regenerate the
landing/film now. This revises the earlier blanket landing exclusion for planning
purposes only. A later packet must define desktop/tablet/phone behavior, keyboard
history shortcuts/focus, save failures, cancellation and provider boundaries.

Acceptance for this round: exactly three generated coherent Home/Media/Camera
screens; no bottom action/navigation bar, Apply, Discard or mandatory Save draft;
no project-title/slogan in the top bar; all seven tabs and the same inspector
geometry; Home combined layer/camera/audio timing; useful top actions and quiet
autosave/Undo. Mockups illustrate intended new behavior and do not claim that
autosave/history or the new shell already works. No application/provider calls,
paid clip run, source mutation, Voyagenda change or Git mutation.

## Owner request

The owner is satisfied with the current AI/manual functionality but rejects the
editor's constrained Step 3 card/template. Explore a dedicated editor that uses
the application window, keeps a large playback preview on the left, and makes
better use of the remaining space. Preserve ClipBuilder's design identity and
every current capability. Intake, moment selection and export may be refined to
support this transition; the landing page is outside scope.

Start by generating several high-fidelity pictures with Codex's built-in image
generation. Take inspiration from known approachable editors and competitors.
Use their interaction/layout principles rather than reproducing their branding
or expanding ClipBuilder into a general editing suite. The owner reviews images
before any implementation ticket or source-of-truth layout replacement.

## Existing identity and proposed direction

Source: apps/frontend/src/styles/tokens.css. Keep the system-ui / Segoe UI sans
stack, Consolas-style timecodes, navy #07142f and raised navy #0b2459, restrained
blue #3157d5 / #78afff, white text, subtle translucent surfaces and thin borders.
Use flatter workspace divisions and quieter gradients within this identity;
improve hierarchy, alignment and density rather than introducing a new theme.
Keep neutral inset keyboard focus, normal motion, stable contextual feedback,
readable labels and current shared primitives as future implementation guards.

The editor is a dedicated workspace, separate from the Step 1/2 form shell. A
compact app header, left clip navigation, large left playback, contextual work
area/inspector and a bounded layer-timing view should use the available window.
Camera retains a visual source crop picker and the exact composed playback.
Controls remain grouped consistently; not every control must be simultaneously
visible. The latest owner revision moves editor actions to the top bar and
replaces the original footer/Apply/Discard proposal with autosave and history.

## Competitor research, checked 2026-11-10

- [Descript layout controls](https://help.descript.com/hc/en-us/articles/37508206076429-Manage-the-editor-layout-with-the-View-menu):
  panel visibility, scene-editor placement and an expandable/collapsible timeline.
  Adapt progressive disclosure and usable preview area; do not add text-to-cut.
- [CapCut desktop workflow](https://www.capcut.com/resource/how-to-use-capcut-on-pc):
  clear media, preview, contextual editing and export stages. Adapt selection-to-
  inspector continuity and familiar layer timing; do not import its extra tools.
- [Adobe Express layer timing](https://www.adobe.com/learn/express/web/adjust-video-timing):
  selecting a layer reveals its timing and properties. Adapt the direct link
  between preview selection, layer row, clock and active inspector.

These are original design proposals informed by those sources, not copied
screens, a benchmark, or a claim that visual mockups prove usability.

## Capability preservation map

| Area | Required access and invariants in any later redesign |
| --- | --- |
| Intake | Upload/drop, local YouTube quality/range/download, source previews and thumbnails, local source/draft recovery, progress/cancel/retry; hosted stays upload-only and temporary. |
| Choose moments | Source playback, manual Start/End with Capture, Add clip, Suggest clips opt-in/count/duration and existing bounds, timestamp import/export, Add clips / Your clips, retained cards, rename/remove and Jump to source; explicit processing only. |
| Framing | Local-only Vertical framing (9:16) / No tracking · Fit original; tracked default and enforced hosted tracked processing. |
| AI-first editing | Prepared camera/captions/visuals/Hook/title remain the starting point. Existing explicit generation/discovery, availability and retry gates remain; no chat or automatic new inference. |
| Captions | Style/presets, placement, animation, word text corrections and speaker colors/assignment; independent Hook/body ownership and existing caption generation gates. |
| Text | Opening/Hook titles and manual text layers, style/emphasis, timing, positioning/resizing and deletion. |
| Filters | Existing timed look/filter controls with selected target and Hook/body scope. |
| Media | Pictures/Videos/Audio upload/delete, real thumbnail/loading/failure states, layer ordering/visibility intervals, position/size, contain/cover/full-frame/inset, independent source/display trims and Capture, picture audio and per-video mute/volume. |
| Camera | Explicit original/picture/video target, matching named selection and clock in every preview; visual crop/endpoint picking; original camera/people, Zoom, Pan, Face tracking and transitions with existing applicable target rules. Motion/effects stay here, not in Media. |
| Audio | Original volume, uploaded/cue/music options, timing, trim, gain/mute/loop where supported, actual audition and its existing availability rules. |
| Hook | Suggested/manual range and Capture, incomplete-range guards, independent lead-in/body edits, explicit title/audio opt-ins, title preview/failure/retry without automatic Hook application. |
| Preview and persistence | Playback/seek/fullscreen, actual scaled gestures, selected layer/crop inspection and timestamp synchronization, local drafts/rolling recovery and reopen, preserved sources/edits/exports; preview/export match. The new owner direction replaces explicit Apply/Discard with validated autosave and action-history Undo/Redo. |
| Export and workflow | Prepared/queued/exporting readiness, honest indeterminate vs measured progress, cancel/explicit retry, MP4/download and existing output naming, Add more clips, session menu/Start over and tour/help. |

The timing view represents existing bounded layers/effects within one selected
clip. It must not imply arbitrary source cutting/reordering, merging clips,
multi-video montages, new aspect-ratio outputs, direct publishing, cloud storage,
collaboration/accounts, arbitrary keyframes or unsupported export settings.
Manual Pan and marked-head Face tracking remain distinct.

## Initial requested image set (superseded by the owner revision above)

1. **Studio / Media:** recommended full-window workspace, large left composed
   playback, clip navigation, Pictures/Videos/Audio, selected-layer properties and
   bounded timing. Show independent picture/video layers and mute/volume.
2. **Review / Captions:** alternative, calmer layout with large left playback,
   readable word corrections/transcript and contextual caption styling; retain
   access to the same six main sections and timing without a complex NLE toolbar.
3. **Camera detail:** show the recommended workspace with Video 1 selected,
   source crop picker, separate Zoom / Pan / Face tracking / Transitions access,
   corresponding big-preview crop/clock and Apply/Discard action state.
4. **Workflow continuity:** supporting concept board for source intake, moment
   selection and an export state. Keep AI-first/manual paths discoverable and
   editor mode visually distinct from intake. Export uses supported MP4 behavior.

Use fictional conversation text/media and synthetic sample thumbnails only.
Generate with the built-in tool, without API keys, application provider calls or
paid clip processing. These are static mockups: no functionality, responsiveness,
AI output quality or preview/export parity is proven by image generation.

Keep images outside Git in the owner's Codex visualization directory and show
them inline. Record final prompts, source inspiration, coverage/tradeoffs and
actual output paths here. Review the images for left-preview placement, identity,
hierarchy, readable controls, missing functions and unsupported affordances.
If generated text or controls are imperfect, identify that instead of treating
them as an implementation specification. Existing fake/no-key mechanics and
real processing's provider/runtime/live-approval requirements remain unchanged.

## Round 2 outputs and review — 2026-11-10

Generated exactly three final Home/Media/Camera images with the built-in Codex
image-generation tool. Home is the master screenshot; Media was generated as an
edit of Home and Camera as an edit of Media, locking the common shell. The top
bar, far-left clip list/Add, large left playback, fictional footage/mug/title/
caption, 18s clock, seven tab positions and right inspector boundaries match
across the set. All three omit the bottom action/navigation bar, project-title
header, Apply/Discard and manual Save draft. The Home image shows bounded camera
positions/effects, visual layers and audio timing; Media retains separate layout/
volume/trim controls; Camera retains distinct Pan and Face tracking with crop
pickers and matching selected-media timing. This is a static visual review only.

Final files and exact prompt set are retained outside Git in the Codex
visualization directory; absolute links are delivered in chat:

- cl273-r2-home.png
- cl273-r2-media.png
- cl273-r2-camera.png
- CL-273-round-2-prompts.md

Generated details are illustrative: reuse the actual existing brand mark in
implementation; row labels, footage, sample timing and icon shapes are not a
new data contract. The original-video foundation remains fixed/read-only even
where the Media image draws generic reorder arrows. Do not implement those
arrows for the original source. Crop diagrams are not mathematical evidence of
preview/export agreement. Saved/Undo buttons depict requested future behavior,
not working autosave/history. Tour, product motion/demo film and landing revision
are explicitly recorded as dependent future work. Intake/selection/export and
responsive, loading/error/keyboard states still need a later approved design pass.

Only documentation and external mockup artifacts changed. No app/code/config,
owner media, running service, provider processing, paid clip run, model install,
deployment or Voyagenda work. Documentation formatting/diff checks are the
applicable verification; runtime tests would not validate these static proposals.
No staging/commit is included. Owner direction/implementation approval remains
open; all current AI/manual capability preservation requirements stay binding.

## Scope boundaries

No app code/configuration or running service changes, no owner clip/media edits,
no new paid processing, model/runtime installation, deployment, push or Git
mutation is part of this request. Preserve the running app and Voyagenda. A later
owner-selected direction needs explicit implementation work, responsive and
keyboard/feedback states, component reuse and regression acceptance against the
capability map before replacing the current authoritative layout.

## Final whole-file commit allocation

Every path below belongs to CL-273; no hunk staging or unrelated work is included.
The removed capture script is included as a whole-file deletion. No push.

```text
apps/backend/local/hosted-workflow.test.ts
apps/frontend/README.md
apps/frontend/package.json
apps/frontend/public/product-film/analysis.png
apps/frontend/public/product-film/build.png
apps/frontend/public/product-film/candidates.png
apps/frontend/public/product-film/intake.png
apps/frontend/public/product-film/preparation.png
apps/frontend/public/product-film/render.png
apps/frontend/public/product-film/result.png
apps/frontend/public/product-film/review.png
apps/frontend/public/product-film/selected.png
apps/frontend/public/product-film/source.png
apps/frontend/scripts/capture-product-film.mjs
apps/frontend/scripts/capture-workspace-film.mjs
apps/frontend/scripts/delivery-assets.json
apps/frontend/src/features/local-editing/README.md
apps/frontend/src/features/local-editing/acquisition-panel.tsx
apps/frontend/src/features/local-editing/audio-inspector.tsx
apps/frontend/src/features/local-editing/bulk-head-motion-editor.tsx
apps/frontend/src/features/local-editing/camera-motion-editor.tsx
apps/frontend/src/features/local-editing/camera-preview-video.tsx
apps/frontend/src/features/local-editing/caption-text-editor.tsx
apps/frontend/src/features/local-editing/clip-batch-panel.tsx
apps/frontend/src/features/local-editing/clip-editor.tsx
apps/frontend/src/features/local-editing/compact-editor-playback.tsx
apps/frontend/src/features/local-editing/contextual-feedback.test.tsx
apps/frontend/src/features/local-editing/edit-history.test.ts
apps/frontend/src/features/local-editing/edit-history.ts
apps/frontend/src/features/local-editing/editor-camera-request.ts
apps/frontend/src/features/local-editing/editor-choice-grid.tsx
apps/frontend/src/features/local-editing/editor-color-control.tsx
apps/frontend/src/features/local-editing/editor-controls.css
apps/frontend/src/features/local-editing/editor-inspector-layout.tsx
apps/frontend/src/features/local-editing/editor-overview.tsx
apps/frontend/src/features/local-editing/editor-preview-form.ts
apps/frontend/src/features/local-editing/editor-save-tools.tsx
apps/frontend/src/features/local-editing/editor-sections.ts
apps/frontend/src/features/local-editing/editor-timeline.test.tsx
apps/frontend/src/features/local-editing/editor-timeline.ts
apps/frontend/src/features/local-editing/editor-tour-layout.ts
apps/frontend/src/features/local-editing/editor-tour-preference.ts
apps/frontend/src/features/local-editing/editor-tour.tsx
apps/frontend/src/features/local-editing/editor-workspace.css
apps/frontend/src/features/local-editing/experience.tsx
apps/frontend/src/features/local-editing/filter-inspector.tsx
apps/frontend/src/features/local-editing/focus-editor.tsx
apps/frontend/src/features/local-editing/focus-preview-controls.tsx
apps/frontend/src/features/local-editing/head-motion-editor.tsx
apps/frontend/src/features/local-editing/hook-controls.test.tsx
apps/frontend/src/features/local-editing/hook-controls.tsx
apps/frontend/src/features/local-editing/hook-title-progress.tsx
apps/frontend/src/features/local-editing/media-camera-controls.tsx
apps/frontend/src/features/local-editing/media-face-tracking.tsx
apps/frontend/src/features/local-editing/selection-panel.tsx
apps/frontend/src/features/local-editing/style.css
apps/frontend/src/features/local-editing/text-inspector.tsx
apps/frontend/src/features/local-editing/typography-fields.tsx
apps/frontend/src/features/local-editing/typography-preset-picker.tsx
apps/frontend/src/features/local-editing/use-editor-autosave.ts
apps/frontend/src/features/local-editing/visual-media-controls.tsx
apps/frontend/src/features/local-editing/workflow-actions.tsx
apps/frontend/src/features/product-film/film-camera.test.ts
apps/frontend/src/features/product-film/film-camera.ts
apps/frontend/src/features/product-film/film-choreography.ts
apps/frontend/src/features/product-film/film-timeline.ts
apps/frontend/src/features/product-film/film-workspace.ts
apps/frontend/src/features/product-film/product-film.tsx
apps/frontend/src/features/sample/sample.module.css
apps/frontend/src/features/sample/sample.test.tsx
apps/frontend/src/shared/ui/workflow-frame.tsx
apps/frontend/src/shared/ui/workflow.module.css
apps/frontend/src/shared/ui/workflow.test.tsx
apps/frontend/src/shared/ui/workspace.module.css
apps/frontend/src/shared/ui/workspace.tsx
docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
docs/tickets/CL-273-full-window-editor-design-exploration.md
docs/tickets/README.md
packages/contracts/local/text-ranges.test.ts
packages/contracts/src/browser-diagnostic.schema.ts
test/app-image.test.ts
test/local-camera-motion-editor.proof.ts
test/local-editor-autosave.proof.ts
test/local-editor-tour.proof.ts
test/local-focus-editor.proof.ts
test/local-head-motion-editor.proof.ts
test/local-hook-options.proof.ts
test/local-timestamp-exchange.proof.ts
test/local-workspace-layout.proof.ts
test/owner-broll-browser-fixture.ts
test/owner-controls-browser.ts
test/owner-feedback-browser-fixture.ts
test/owner-hook-browser-fixture.ts
test/owner-media-camera-acceptance.ts
```
