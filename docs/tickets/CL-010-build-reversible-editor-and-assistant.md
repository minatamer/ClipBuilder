# CL-010 — Build the reversible editor and assistant

Status: Planned<br>
Milestone: M4 — AI first cut and reversible editor<br>
Last synchronized: 2026-09-29<br>
Depends on: CL-002 owner-approved direction, CL-004, and CL-009<br>
Blocks: CL-011 and CL-012<br>
Suggested commit: `CL-010: build the reversible ClipBuilder editor`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Build the complete manifest-driven editor and its bounded AI revision flow:
preview, word-boundary trim, immutable transcript with caption corrections,
caption themes/density, headline, inspectable speaker/visual tracks, semantic
manifest reducer, undo/redo, one-instruction proposal, derived diff, explicit
apply/dismiss, stale conflict, and preview/export parity contracts.

This packet intentionally keeps the deterministic editor and edit assistant
together. The assistant has no product value or trustworthy test boundary
without the exact manifest operations, diff, validation, revision history, and
controls it proposes to change.

## Portfolio value

Prove ClipBuilder is a real, steerable editor rather than an opaque AI wrapper:
the first cut is immediately useful, every automatic layer is inspectable, and
model suggestions remain bounded, reviewable, atomic, and reversible.

## Standalone implementation context

- `EditManifestV1` is the only edit authority. Components derive duration,
  timestamps, caption groups, visual coverage, diff text, and render summary;
  they do not own parallel edit state.
- Manual trim snaps to transcript word IDs and remains 10–60 seconds. Caption
  corrections are separate bounded display overrides; the normalized provider
  transcript/evidence/timestamps remain immutable.
- Speaker framing references the validated CL-008 focus/shot track. Visual cues
  reference CL-009 assets and exact word ranges. The user can inspect/retime/
  relayout/remove existing cues but cannot create arbitrary assets.
- Assistant input is one 1–500 character instruction, not a chat. It receives
  the current manifest plus selected transcript and ≤15 seconds context, emits
  1–6 allow-listed operations through strict Structured Outputs, `store: false`,
  one call, no repair/retry.
- Deterministic code validates/reconciles operations, derives the proposed
  manifest and semantic diff, and binds it to `baseRevision`. Nothing changes
  until Apply; stale proposals never rebase silently.
- Preview and final render must share word-time resolution, caption grouping,
  focus/crop math, visual timing/layout/assets, headline/card tokens, and
  fallback decisions.

## Dependency evidence required

- CL-002 must have explicit owner-approved visual tokens/composition.
- CL-004 must provide the accessible source/candidate/evidence/playback
  primitives and canonical selection handoff.
- CL-009 must return a schema-valid `AssemblyBundleV1`, initial manifest,
  preview capabilities, focus/visual assets, and refresh/cleanup evidence.

If the bundle or visual gate is incomplete, do not create an alternate local
editor data shape to keep moving.

## Files and areas owned

- Frontend editor workspace/preview/transcript/range/caption/focus/visual/
  headline/proposal/diff components, manifest reducer, preview layout, and tests.
- Backend edit domain/reconciler/use case/route plus edit planner port/fake/live
  adapter, prompts/schemas, call allowance, and tests.
- Shared deterministic caption grouping and layout primitives used by preview
  and CL-011 render without leaking browser/backend implementation across apps.
- Golden manifest/edit-intent/caption/layout fixtures and provider setup docs.

## Scope boundaries

### In scope

- Desktop/laptop/tablet/phone/short-height editor compositions defined by the
  approved CL-002 reference.
- Playback-range controller, active-speaker crop preview, full-frame/overlay/card
  visual cues, captions, headline, and safe-zone inspection.
- Word-boundary trim by pointer, keyboard, and step controls; one committed
  revision on pointer release.
- Correction normalization/bounds/original evidence, three caption themes, two
  densities, optional bounded headline, and visual-cue summary/retiming/layout.
- Undo/redo capped at 20 committed revisions; new edit after undo clears redo.
- Assistant supported/unsupported/refusal/no-op/invalid/stale/conflict/timeout/
  abort/rate/budget flows; proposal allowance and exact call counts.

### Out of scope

- Freeform layers/keyframes/transitions, arbitrary fonts/colors/coordinates,
  uploadable graphics, new generated subjects/assets, asset picker, manual
  left/right speaker crop, caption timing merge/split, chat history, direct
  publishing, final FFmpeg/render/result (CL-011), or broad hardening (CL-012).
- Assistant caption rewriting, commands, URLs, file paths, CSS/HTML, FFmpeg,
  audio gain, identity, unsupported factual claims, or unbounded context.

## Implementation checklist

### 1. Canonical manifest and manual editing

- [ ] Implement a pure manifest reducer/validator with revision increments,
  immutable snapshots/patches, 20-entry history, and derived selectors.
- [ ] Enforce word-boundary range, order, 10–60 second duration, audible content,
  and one commit per completed drag/keyboard operation.
- [ ] Store caption corrections only against existing word IDs; enforce NFC,
  1–80 characters, no controls/bidi/URL/newline/markup, ≤100 words and ≤4,000
  total characters; expose original provider word.
- [ ] Apply exact source-controlled caption/headline/visual/focus rules and keep
  preview layers/safe zones deterministic.

### 2. Responsive editor experience

- [ ] Desktop: transcript/evidence, 9:16 preview, assistant/diff, and full-width
  tracks; preview remains ≥270 CSS px.
- [ ] Laptop: transcript + preview with persistent/non-resetting right drawer;
  timeline full width.
- [ ] Tablet: preview first, semantic Transcript/Captions/Visuals/Assistant tabs,
  large range control plus word-step buttons.
- [ ] Phone: guided sequence for preview, range, transcript/corrections, visuals,
  style/headline, assistant, and render review—no squeezed desktop timeline.
- [ ] Short height: natural scroll, bounded sticky preview only when safe, and
  scrollable dialogs with visible title/close/action.

### 3. Assistant boundary and reconciliation

- [ ] Build stateless strict one-call adapter/fake with delimited untrusted
  transcript/instruction and the exact allow-listed operation enum.
- [ ] Resolve word/cue IDs, remove exact no-ops/duplicates, reject conflicting
  operations, apply to a copy, validate the result, assign server proposal ID,
  and derive semantic diff/limitations locally.
- [ ] Consume proposal allowance atomically once cost occurs; make no automatic
  repair/retry and preserve current manifest on every failure.
- [ ] Apply only when `baseRevision === manifest.revision`; dismiss leaves no
  edit; stale proposal is discard/regenerate only.

### 4. Preview parity and cleanup

- [ ] Reuse one deterministic caption grouping and word-time resolver in
  preview/render-facing modules.
- [ ] Reuse exact focus/crop, visual timing/layout/motion, headline/card tokens,
  and fallback policy; golden fixtures capture acceptable raster differences.
- [ ] Clean media listeners, range timers, object/asset URLs, drawers/focus,
  request controllers, and proposal state on source/stage/clear/unmount.

## Contracts and state transitions

- Manual edit stays in `editor`, validates, increments revision, and pushes one
  history entry. Proposal request/receipt is nested and leaves manifest unchanged.
- Apply is atomic; Dismiss changes nothing; Undo/Redo use valid history only.
- `RENDER_REVIEW` is legal only with a valid manifest and no active proposal
  request; it freezes no output yet and may return to editor freely.
- Allowed AI operations are set-in/out, caption theme/density, headline,
  existing-cue remove/range/layout, and emphasized-word IDs only.

## Privacy, provider, and cost constraints

- Instructions/proposals are request-memory-only and not server-persisted or
  logged. Browser persistence may retain only the bounded content-free proposal
  diff permitted by CL-003, not chat history or provider payload.
- OpenAI receives no video, image, filename, private object/capability, user
  identity, raw provider response, or unbounded transcript.
- One assistant action equals one OpenAI call maximum; failure consumes the
  allowance if the provider was called. Default/CI remain fake and offline.
- Live validation requires provider/privacy/spend gates and explicit permission.

## Acceptance criteria

- [ ] Desktop and phone users can understand and steer the complete first cut,
  including trim, caption correction, style/density, headline, focus/visual
  inspection, fewer visuals, and existing-cue retime/relayout.
- [ ] Provider transcript/evidence/timing remains immutable while corrections
  change both preview and later export inputs.
- [ ] Manifest stays valid across manual edits, proposal apply, undo/redo, and
  reload; stale/conflicting/invalid proposals cannot mutate it.
- [ ] Supported instructions produce useful legal operations/diff; unsupported,
  injection, caption rewrite, arbitrary asset/style/path/URL/command, refusal,
  timeout, and no-op preserve the current edit.
- [ ] One assistant action makes at most one call and no automatic repair.
- [ ] Preview shares all semantic compiler inputs with CL-011; known differences
  are only documented rendering tolerances.
- [ ] Keyboard, focus, screen-reader structure, reduced motion, 200% zoom, and
  phone/tablet/laptop/desktop/short-height behavior are usable.

## Focused verification

- [ ] Run manifest range/correction/history/revision/serialization tests.
- [ ] Run caption grouping, preview layout, focus/visual/headline safe-zone and
  golden fixture tests.
- [ ] Run edit adapter/reconciliation supported/unsupported/injection/stale/
  no-op/conflict/timeout/abort/call-count evaluations.
- [ ] Run editor component/flow tests for pointer+keyboard trim, corrections,
  tracks, drawer/tabs, proposal/diff/apply/dismiss, undo/redo, restore, and cleanup.
- [ ] Manually verify representative phone/tablet/laptop/desktop/short-height,
  keyboard, 200% zoom, reduced motion, and forced colors.
- [ ] Run live proposal only with explicit owner authorization; otherwise leave
  it unchecked.
- [ ] Run affected lint/typecheck/build, content/secret scans,
  `git diff --check`, and status inspection.

## Documentation updates

- Update frontend/backend READMEs for editor/assistant ownership, config, and
  focused checks.
- Record manifest/caption/layout/edit prompt/config revisions and supported
  operation examples/limits.
- Update parent and CL-011 together if parity semantics, manifest schema, or
  assistant capability changes.

## Owner gates and external blockers

- CL-002 visual approval and CL-009 approved art direction are required for the
  final production composition.
- Live edit-provider evidence requires provider/privacy/spend approval and an
  explicit paid-call authorization.
- Deterministic fake/manual editor work may complete without credentials; live
  evidence remains honestly unchecked.

## Commit boundary

Keep the deterministic editor and its inseparable proposal/diff/apply behavior
together as `CL-010: build the reversible ClipBuilder editor`. Do not split UI,
adapter, or undo/redo into separate tickets, and do not absorb final render or
hardening. No Git/provider/cloud action is authorized by this packet.

## Precision references

- [Editor responsive experience](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#67-editor-workspace)
- [Canonical manifest and manual behavior](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#7-editor-behavior-and-reversible-ai)
- [Edit proposal API](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#1115-post-v1editorproposals)
- [Edit planner and reconciliation](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#1212-edit-planner-port)
- [Edit and frontend verification](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#209-edit-assistant-evaluations)

## Completion handoff

Report editor/manifest operations, responsive compositions, correction and
history invariants, assistant/prompt config, evaluation/call-count evidence,
preview parity, cleanup, live check if authorized, changed files, exact commands,
and every remaining visual/provider/spend blocker.
