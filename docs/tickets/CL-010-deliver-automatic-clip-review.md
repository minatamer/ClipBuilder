# CL-010 — Deliver automatic clip review and render confirmation

Status: Planned<br>
Milestone: M4 — automatic AI first cut and review<br>
Last synchronized: 2026-09-29<br>
Depends on: CL-002 owner-approved direction, CL-004, and CL-009<br>
Blocks: CL-011 and CL-012<br>
Suggested commit: `CL-010: deliver automatic clip review`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Deliver the complete post-assembly visitor experience: a responsive read-only
9:16 preview of the automatic clip, a concise factual summary, explicit
one-render confirmation, refresh recovery, and the shared preview/render parity
boundary.

This ticket does not build an editor. The visitor cannot alter the selected
range, transcript/captions, caption style, speaker framing, contextual visuals,
headline, audio, or automatic composition manifest.

## Portfolio value

Prove that ClipBuilder can turn one chosen grounded moment into a finished,
understandable automatic clip without hiding behind a fake editor or asking the
visitor to repair model output. The human decision is intentionally narrow:
choose one candidate, review the complete result, and confirm one render.

## Locked interaction model

- Analysis returns zero to four grounded candidates and targets three strong
  alternatives without padding.
- The visitor chooses exactly one candidate before assembly.
- Assembly produces one immutable server-validated `CompositionManifestV1`.
- Captions always use the source-controlled `clean-emphasis` profile.
- The public flow exposes no editor, chatbot, assistant prompt, manual trim or
  range path, caption correction/style/density choice, headline control,
  speaker-focus or visual control, timeline, proposal/diff/apply action, undo,
  or redo.
- Preview playback makes no provider or media-analysis call.
- The only forward action is `Render this clip`; clear and evidence-based
  recovery remain available where their owning state permits them.

## Dependency evidence required

- CL-002 must record explicit owner approval of the visual tokens and
  desktop/phone direction.
- CL-004 must provide accessible candidate/source-preview/evidence primitives
  and the canonical one-candidate selection handoff.
- CL-009 must provide a schema-valid `AssemblyBundleV1`, immutable automatic
  manifest/hash, preview capabilities, focus/visual assets, fixed caption
  inputs, and refresh/cleanup evidence.

If any dependency exposes editable state or lacks a proven assembly revision,
stop at the owning ticket rather than inventing a local workaround.

## Files and areas owned

- Frontend automatic-review screen, vertical preview, clip-facts summary,
  render-confirmation UI, restore behavior, and focused tests.
- Shared deterministic preview layout/caption grouping inputs used by CL-011.
- Narrow API/contract adjustments required to confirm the server-proven
  manifest ID/hash without accepting browser-authored composition data.
- Golden automatic-manifest and preview-layout fixtures.

## Scope boundaries

### In scope

- Desktop/laptop two-column preview + facts composition.
- Tablet/phone video-first vertical composition with full-width confirmation.
- Play/pause, mute, seek, elapsed/duration, captions, and accessible transcript
  alternative for the chosen range.
- Facts: chosen candidate title/range, duration, fixed captions, active-speaker
  status, visual count/layout summary, 1080 × 1920 H.264/AAC target, one-render
  limit, temporary-data deadline, and rights reminder.
- Read-only manifest/hash reconciliation and expired preview-capability refresh.
- Explicit render confirmation plus back-to-review before a render starts.
- Short-height, safe-area, reduced-motion, forced-colors, keyboard, screen-reader,
  200% zoom, and cleanup behavior.

### Out of scope

- Every editing or customization control named in the locked interaction model.
- A second assembly, alternate version, A/B comparison, candidate batch render,
  or automatic paid retry.
- FFmpeg execution, output validation, download authorization, or result UI;
  those belong to CL-011.
- Live provider/cloud execution without the named owner gates.

## Implementation checklist

### 1. Immutable automatic review model

- [ ] Read the manifest from the validated CL-009 assembly bundle; never create
  a browser-owned copy that can become authoritative.
- [ ] Bind review to session, analysis revision, assembly revision, selected
  candidate ID, and manifest hash.
- [ ] Derive duration, visual coverage, caption groups, and display facts rather
  than persisting parallel truth.
- [ ] Reject stale/missing/replaced manifest or asset references safely.

### 2. Responsive review experience

- [ ] Desktop/laptop: 9:16 preview remains the visual hero beside a compact facts
  and confirmation panel.
- [ ] Tablet/phone: video first, facts and rights reminder next, then a full-width
  `Render this clip` action respecting safe-area insets.
- [ ] Short height uses natural scroll; sticky preview is allowed only when it
  cannot cover facts or actions.
- [ ] The DOM, accessibility tree, labels, and tests contain none of the excluded
  editor/assistant controls.

### 3. Preview/render parity boundary

- [ ] Reuse exact word-to-time resolution, fixed `clean-emphasis` caption
  grouping/profile, focus/crop math, safe zones, visual timing/layout/assets,
  motion/transitions, card tokens, and fallback decisions.
- [ ] Record acceptable browser/FFmpeg raster differences only; semantic
  differences fail golden parity tests.
- [ ] Preview repetition and seeking make zero provider/job calls.

### 4. Render confirmation and lifecycle

- [ ] Confirmation lists output facts, one-render limit, temporary-data deadline,
  and rights reminder; primary copy includes the clip duration.
- [ ] Send only analysis ID, assembly ID, server-proven manifest hash, and the
  action-bound abuse token—never a browser-authored manifest.
- [ ] Back before render returns to the same read-only preview without mutation
  or allowance use.
- [ ] Clean media listeners, object/asset URLs, timers, requests, focus/dialog
  state, and playback on clear, expiry, failure, unmount, or supersession.

## State transitions

- `assembling -> clip-review` only after a validated assembly result matches the
  active analysis revision and selected candidate.
- `clip-review -> render-confirmation` only with a valid immutable manifest/hash.
- `render-confirmation -> clip-review` consumes no allowance.
- `render-confirmation -> rendering` atomically consumes the permitted render
  attempt after server validation.
- No public event can mutate the manifest or create edit history.

## Privacy, provider, and cost constraints

- Preview capabilities remain short-lived and memory-only.
- No transcript, caption text, visual prompt/asset, filename, URL, capability,
  or manifest body enters logs, errors, analytics, URLs, or server HTML.
- Review and confirmation make zero OpenAI, Deepgram, image-generation,
  active-speaker, or assembly calls.
- Default/test composition remains fake, paid-disabled, and network-denied.

## Acceptance criteria

- [ ] Desktop and phone visitors can understand and play the complete automatic
  clip, inspect its facts, and intentionally confirm one render.
- [ ] The visitor cannot trim, correct/style captions, change framing/visuals,
  enter an instruction, inspect an editable timeline, or undo/redo.
- [ ] The fixed caption profile and automatic manifest remain immutable across
  playback, refresh, confirmation, and back-to-review.
- [ ] Preview/render semantic inputs pass golden parity checks.
- [ ] Keyboard, focus, screen-reader structure, reduced motion, forced colors,
  200% zoom, phone/tablet/laptop/desktop, and short-height behavior are usable.
- [ ] Playback/review/refresh produces exact zero provider/job calls and cleans
  every browser-owned effect.

## Focused verification

- [ ] Run immutable-manifest, stale/hash mismatch, restore, and serialization
  tests.
- [ ] Run caption grouping, preview layout, focus/visual safe-zone, and golden
  parity tests.
- [ ] Run component/flow tests for playback, facts, confirmation, back, expiry,
  clear, capability refresh, absent edit controls, and cleanup.
- [ ] Manually verify representative phone/tablet/laptop/desktop/short-height,
  keyboard, 200% zoom, reduced motion, and forced colors.
- [ ] Run affected lint/typecheck/build, `git diff --check`, and status review.

## Documentation updates

- Update frontend/backend READMEs for automatic review and immutable manifest
  ownership.
- Record the fixed caption profile, preview parity revision, responsive evidence,
  and every still-unchecked owner/provider/cloud item.
- Synchronize CL-011 and the parent if render-confirmation or parity semantics
  change.

## Owner gates and external blockers

- CL-002 visual approval and CL-009 approved art direction are required for the
  final production composition.
- Real sample playback requires recorded rights approval.
- No live provider, image, job, render, or cloud evidence is authorized here.

## Commit boundary

Keep the complete read-only automatic review and confirmation experience in
`CL-010: deliver automatic clip review`. Do not add editing, customization,
assistant, final-render, download, or unrelated hardening work. No Git/provider/
cloud action is authorized by this packet.

## Precision references

- [Automatic clip review](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#67-automatic-clip-review)
- [Automatic composition and parity](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#7-automatic-composition-and-preview-parity)
- [Render API](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#1115-post-v1renders)
- [Frontend verification](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2012-frontend-component-and-flow-tests)

## Completion handoff

Report responsive compositions, immutable manifest/hash behavior, fixed-caption
evidence, preview/render parity, zero-call assertions, excluded-control tests,
cleanup, changed files, exact checks, and every remaining visual/rights/cloud
blocker.
