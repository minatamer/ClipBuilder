# CL-010 - Validate browser compositor review parity

Status: Planned; browser-owned execution revision, external gates pending<br>
Milestone: M4 - automatic review<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-002 design foundation, CL-004 screens and CL-009 browser assembly<br>
Suggested commit: `CL-010: validate browser compositor review parity`<br>
Parent: [source of truth section 0.9](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#09-browser-owned-media-architecture-revision-2026-10-01)<br>
Technical contract: [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md)<br>
Index: [README.md](README.md)

**Execution authority:** this current packet and the linked browser contract
supersede the server-media mechanics retained below as history. No GCS,
generation/capability/lease, native media job or cloud-render acceptance item
survives by being left unchecked in that history. Preserve unchanged product,
grounding/quality, rights, secret handling, fake/off test and dependency rules.
No Git, provider, paid, install or cloud action is authorized by this document.

## Objective and boundaries

Connect the existing read-only review to the shared deterministic browser
compositor, locally owned source/assets and immutable manifest. Prioritize the
central portrait video, edit notes left and transcript right, with responsive
short-height rails and inline glass playback controls. No server playback
capability or separate Continue to export/confirmation screen.

CL-004 already owns these screens and animations. Improve integration/parity,
not reconstruct UI. No editor, trim, style/visual controls, undo or chatbot.
Confirm export directly is the only final creative approval; mount/restore/
preview never starts rendering or another paid action.

## Current checklist and acceptance

- [ ] Hydrate local artifact references plus validated transcript/assembly/
      manifest revisions; reject unavailable, wrong-source, expired or stale
      assets before review or Confirm export.
- [ ] Use one manifest sampling/composition implementation for captions/font
      metrics, focus crop, overlays/cards, visual safe areas, source timestamps
      and output frames. Separate preview/export renderers cannot invent
      independent layout/timing semantics.
- [ ] Keep player range-relative controls and timestamp jump mapping; notes
      describe only validated edits and transcript evidence, never trend data.
- [ ] Validate finite playback, source audio offsets, caption readability,
      visual coverage, no unapproved content and actual frame samples.
- [ ] Smooth candidate/review layout motion survives locally decoded media and
      dynamic phone/tablet/laptop dimensions; no app motion-suppression flag.
- [ ] Fake review remains synthetic and cannot become a valid download or
      successful real processing fallback.
- [ ] Playback/restore/notes seeking make zero new provider calls; local missing
      content triggers truthful recovery, not backend fetch of OPFS.
- [ ] Test local hydration, tampered/stale revisions, absent assets, clear during
      playback, worker/GPU failure, seek/sync and pixel/parity fixtures.
- [ ] Run focused contracts/compositor/session/component/browser tests and all
      five root gates. Record runtime/font/media/visual/accessibility gates
      separately from mock or viewport-emulation evidence.

Own compositor preview integration, source-to-output mapping, player lifecycle,
review facts/notes and proof fixtures. CL-011 owns full export/validation using
the same compositor contract. Update the narrow docs and report exact checks,
changed files, deviations and every pending owner/provider/rights/device item.

## Historical packet

<details>
<summary>Superseded server-media plan, retained only for decision history</summary>

The following text is not an execution checklist, setup instruction or evidence
of completion under the browser-owned architecture. It must not be used to
reintroduce cloud content storage, jobs or unsupported guarantees.

# CL-010 — Deliver automatic clip review and render confirmation

Status: Planned<br>
Milestone: M4 — automatic AI first cut and review<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-002 owner-approved direction, CL-004, and CL-009<br>
Blocks: CL-011 and CL-012<br>
Suggested commit: `CL-010: deliver automatic clip review`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Latest owner clarification (2026-10-01): CL-004 owns the complete development-
only frontend preview and its reusable screens. This packet replaces the fake
adapter with its real implementation and proves integration, media, recovery,
privacy/rights/spend/readiness gates; it does not recreate the workflow UI.
Earlier restrictions on synthetic progress apply to real/public mode, not the
explicitly labelled local preview. Fake completion is not evidence for this
packet's unchecked acceptance. See the parent development-preview clarification.

Owner UI revision (2026-10-01): reuse CL-004's shared single-workspace frame,
tokens/buttons and stable footer for the completed read-only video/confirmation.
Size the real preview against both device width and available height; retain
natural scrolling for short-height/zoom/evidence. This supersedes older mandatory
two-column/facts-panel composition, not the required facts/parity/accessibility
or media-rights gates. See parent section 0.6.

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

</details>
