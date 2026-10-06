# CL-010 — Read-only automatic cloud clip preview

## Owner meaningful edit notes — 2026-10-06

After the locally verified CL-009 bounded timing fix, the owner requests a clear
editorial account before the backend restart. Replace the per-focus-state event
list with a concise summary of the actual conversation cut, captions, audio and
camera cuts/held framing. Describe each retained picture using the existing
validated scene brief and grounded phrase; identify fetched versus generated
assets without claiming an uncreated/rejected picture was added. Summarize
interesting beats from the selected candidate's existing evidence, avoiding a
duplicate paraphrase/quote when the note merely repeats the transcript.

Plan: retain bounded picture scene descriptions in the signed control result,
outside the renderer manifest, paired one-to-one with accepted pictures. Keep
older results readable when this optional metadata is absent. Derive camera
cuts from actual crop geometry, not speaker/held state flips. Preserve timestamp
jumps, word highlighting and the shared read-only layout. No extra model call,
new editor, renderer format change, live paid test or Git action is authorized.
Fake/no-key synthetic checks cover grounding, retained-only notes, actual camera
changes and non-repetitive highlights; real quality remains owner-manual with
the existing provider keys/live flags/approvals. No local AI model is used.

Implementation evidence: the signed control result has optional bounded
`pictureNotes`, paired with accepted picture anchors and covered by the existing
receipt. Changed descriptions or mismatched notes are rejected; older results
without notes still parse. The renderer manifest is unchanged. Review notes
count real geometry changes through the shared layout function, summarize the
conversation/caption/audio/camera treatment, describe each accepted visual and
retain timestamp/evidence navigation. Quote-only highlight notes get an editorial
role explanation; meaningful existing model explanations are preserved.

Focused checks pass: 91 backend tests in three assembly files and 35 frontend
tests in three review/flow files. Settled format, lint, typecheck and unit checks
pass; the full unit suite has 1,199 synthetic tests in 95 files. No provider calls,
paid test, browser virtualization, validate workflow, local AI weights or Git
action ran. The settled local build passes; its existing Windows artifact still
has 26 external package links, so strict deployment acceptance remains open.
Frontend development references were restored and scoped typecheck passes.

After the notes fix completed, the requested complete backend restart succeeded:
ten old keeper/launcher/watcher/child identities are absent and port 4000 remained
free through a stabilization check before replacement. The new backend has ten
tracked identities and owns the intended listener. Health, frontend `/start` and
sample configuration return 200; live analysis/assembly are available and final
render stays off. The original frontend identity is unchanged. Original private
captures and logs remain intact, including the prior verified snapshot and fresh
copies of the stopped backend logs. Those copies hash-match the stopped originals;
retained sample and replay remain
available. The earlier approval-review rejection occurred
while the notes fix was pending; restart was approved after it completed. Normal
configuration loaded without inspecting credentials or running a paid flow.
Actual live visual quality and physical-device review remain owner-manual.

Changed surfaces: contracts selected-assembly control schema, backend picture
compiler/use case and assembly tests, frontend fixed-review notes/cloud-review
integration and tests, owning READMEs/source of truth and ticket records. No
renderer manifest/composition, paid call budget or provider prompt for notes was
added. The CL-009 generic prompt contains only its separate timing clarification.

## Current cloud-render packet — approved local execution, 2026-10-02

Status: locally complete; validation pass 2 has no actionable local findings after three independently reproduced/fixed findings. All five settled root gates and 558 synthetic tests in 57 files pass. External gates remain deferred by the owner's 2026-10-03 instruction.

Authority: [Google/Cloud Run migration plan](../architecture/GEMINI_REMOTION_MIGRATION.md); [file inventory](../architecture/MIGRATION_FILE_INVENTORY.md); [later setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md).

Reuse the existing one-card preview over a server-prepared selected proxy and shared fixed React composition. Browser playback/layout only; no final encoder/editor. Compare preview and Node output by sampled layout/audio/caption evidence.

Dependencies follow the numbered migration sequence. After documentation approval, implement one dependency-ready packet at a time and run focused checks plus the required settled five root gates. Fake/live AI and local/cloud compute are independent; cloud render can incur cost with fake AI. Ordinary tests remain synthetic, credential-free, fake/off and zero-network through injected cloud/provider ports. No cloud provisioning, login, credential use, private upload, paid call, Git action, usage polling or new independent review is authorized now.

- [x] Owner explicitly approved documentation and local corrections on 2026-10-02.
- [x] Implement and verify the locally buildable current packet.
- [x] Record exact local tests/manual states, cleanup and all remaining rights/AI/cloud/license/device gates.

## Owner laptop source-review navigation follow-up — 2026-10-06

The owner requests visible arrows when laptop landscape-source selection uses
the Video / Agentic Notes / Transcript carousel. Reuse the shared secondary
button, Lucide chevrons and 44px target token. Place bounded previous/next buttons
beside the carousel, leaving the media and evidence unobstructed, preserving dots,
native scrolling, the selected candidate and one mounted player. Disable the
unavailable direction at each end; expose accessible names/track association
and honor reduced-motion scrolling. Phones keep their swipe/dot layout; the
ordinary desktop edited-review cards receive no arrows.

Verify actual click and keyboard navigation, end states, direct dot navigation,
resizing, containment, reduced motion and phone/card exclusion with synthetic
content. Fake/no-key processing remains the existing labelled fixture journey;
this layout navigation needs no provider keys or local AI runtime and makes no
processing calls. Real analysis/assembly still needs keys, live flags and the
existing rights/cloud/spend approvals. Preserve unrelated editing/replay changes,
all retained media and privacy boundaries. No Git or external action is requested.

Implemented in `clip-review-layout.tsx` and `sample.module.css`. Both arrows use
the existing native horizontal slide track with smooth scrolling, so navigation
moves between the same panels as phone swipes. Reduced-motion preference selects
instant scrolling. No second player, animation runtime or processing request was
introduced.

Verification: the focused frontend checks passed 51 tests across four files;
root format, lint, typecheck and unit checks passed (1,098 tests across 90 files).
An isolated synthetic browser check passed click navigation through all three
panels and back, disabled end states, dot navigation, native Enter/Space activation,
reduced-motion instant scrolling, and containment at 1152×583, 1152×650, 1024×768,
800×650, 600×700 and 390×844. Laptop arrows use 44px targets; phone arrows are
hidden and ordinary desktop review cards contain no arrows. No external/provider
requests were made. Temporary browser/server/profile resources were cleaned up.

The owner stopped further browser simulation because it was taking too long.
Additional frame-by-frame animation sampling was not completed, and the production
build was not rerun for this narrow follow-up. Smooth motion is implemented;
physical-device motion and real media/AI quality remain unverified by this check.
Nothing was staged or committed.

## Local execution evidence — 2026-10-03

CL-009 is committed as `06ab834`. The owner explicitly authorized local
execute/validate/fix/document loops and ticket-prefixed stage/commit plans through
CL-014 and locally buildable CL-015. This supersedes the earlier no-Git/no-review
paragraph for these local actions. No provider/cloud/paid/deployment action is
authorized or performed by this pass.

- Proceed performs one selected assembly; the result is journaled before review.
  Complete refresh restores the frozen result; uncertain refresh fails visibly.
  Existing fake review remains synthetic and download-disabled.
- Google selected proxy deletion precedes a separate physical preview preparation.
  Its bounded expiring intent binds source generation, selected range and manifest
  hash. One preparation; metadata reopening and playback make zero processing/AI
  dispatches. Three proxy operations precede the later CL-011 final render.
- Protected POST access verifies the signed result. GET playback streams exact
  generation byte ranges through private renderer/control/same-origin bridge,
  without full-source buffering, capabilities or content in URLs. Invalid access,
  multiple ranges and byte mismatches fail closed. Only expiring references live
  in backend memory; lost control epochs cannot resume processing.
- The existing portrait/notes/transcript layout uses Remotion Player and the same
  shared fixed React composition as Node rendering: 1080×1920, 30fps manifest,
  clip-relative frames and zero proxy start. Timestamp jumps pause and clamp to
  the selected range. Notes claim only actual validated edits, including source
  speech beneath cards; no normalization/internal cuts/trend claims are invented.
- Player listeners, access expiry timer, request listeners/readers and bounded
  streaming are disposed on unmount/abort. Seek cancellation retains prepared
  media; Clear aborts/drains streams and deletes owned artifacts. Synthetic tests
  assert these states and exact processing counts. No app service was launched.

Checks: focused contracts 14, renderer preview 4, backend assembly/access 17,
frontend review/workspace 30 and bridge 8 passed. Settled `corepack pnpm
format:check`, `lint`, `typecheck`, `test:unit`, `build` and `git diff --check`
passed after the revisions: **558 tests in 57 files** (root 20/3, contracts 58/5, composition 3/1,
backend 182/13, renderer 31/8, frontend 264/27). All use import-time fake/off
network isolation, synthetic bytes and injected ports. No real API key, ADC,
cloud resource, provider request or local AI model/weights were used.

Still unchecked/deferred: actual selected proxy duration/audio offset/VFR/rotation
and maximum-envelope evidence; native full-fixture FFmpeg tooling is unavailable
locally, unchanged from CL-008. Actual browser/Node frame pixels, captions/font
metrics, audio continuity and final MP4 parity are unverified; CL-011 owns final
encode/delivery. Real devices, keyboard/zoom/reduced-motion/forced-color manual
states, AI framing/card quality, rights/public sample, licenses/notices, numeric
spend/privacy/data gates, renderer image rebuild/rollout and all cloud/provider/
public-release evidence remain unchecked. Supplying keys alone does not satisfy
those gates. Missing keys and no deployment do not block the authorized local
sequence. Static markup/frame mapping tests are not pixel/audio proof.

## Cross-ticket audit correction — 2026-10-03

The owner authorized correcting the selection/Proceed race found during the
full-history validation. Four new gated regressions failed before the repair:
the first selection failed before assembly, switching selections dispatched the
previous candidate, a failed save still made access/processing calls, and a stale
UI candidate could reserve an assembly for another selection.

The UI still publishes candidate preview changes immediately. Its existing
pending-action guard disables Proceed and additional selection mutations until
the journal save finishes; failed saves restore the committed selection and show
a content-safe error. Assembly receives the explicit UI candidate ID. The
workspace drains queued writes, checks that ID and atomically reserves the saved
selection before any session/challenge/assembly call. Abort during the wait and
superseded/failed selection commits leave assembly unreserved. Once reserved,
selection remains frozen and uncertain processing is never automatically retried.

Seven workspace/flow regressions cover first and replacement selection,
failed save, stale and later queued selection, concurrent assembly and abort
during commit. Success reaches the canonical reducer's `cloud-review` with the
correct candidate and exactly one injected assembly call. Rejected cases make
zero access/challenge/assembly calls. Concurrent attempts reserve only once.
Focused workspace/assembly/candidate/reducer verification passed **69 tests in
four files**. The combined settled root gate and final read-only validation are
recorded below after all authorized audit corrections.

Changed: frontend experience, workspace, selected-assembly flow and their existing
tests/fixtures; this packet and index. No product controls, schema, dependency,
provider/cloud setting or retained media changed. Nothing was staged or committed.
Synthetic fake/off checks need no keys/network and do not prove real Gemini quality, actual browser
device/media parity or deployment. Those prior external gates remain unchecked.

### Settled cross-ticket verification and revalidation — 2026-10-03

After all three corrections settled, these exact root checks passed:

- `corepack pnpm format:check`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test:unit`
- `corepack pnpm build`
- `git diff --check`

The unit gate passed **665 tests in 66 files**: root 29/4, contracts 58/5,
composition 3/1, backend 215/14, frontend 304/31 and renderer 56/11. This adds
33 regression cases across the actual worker, workspace/flow/reducer and backend
reconciliation paths. Tests keep import-time `FAKE_MODE=true`,
`PROVIDER_MODE=fake`, `PAID_DEMO_ENABLED=false`, all live flags false and network
interception. Provider-labelled reconciliation tests use in-memory synthetic
output, not provider requests. No credentials or real source were used.

The local production build and frontend artifact inventory passed: 1,276 files,
26 links and digest `6c00515272d0b7ac494f3d2a1b2ba3fd4c67b3c282aa1f118d6f25b8079692b4`.
The inventory still reports 26 external package links and `selfContained=false`;
the earlier strict target-platform release gate remains open. This local build
does not certify a deployable artifact.

Final validation was read-only over the tracked correction diff and new worker
test at unchanged Git HEAD `1c6e9bab483ac0d933b6fdfe7b41b32f1032e3cf`.
**Verdict: no actionable findings in the authorized correction scope.** The
three audit findings are resolved: selection commits and candidate binding
precede assembly dispatch; intake retains actual source decoding while removing
the obsolete final-encoding prerequisite; grounding checks complete contiguous
normalized tokens rather than substrings or empty token lists. Reviewed failure,
abort, stale/queued selection, concurrent reservation, response binding and
cleanup paths; no new dependency/schema/configuration boundary, unsafe cast,
debug/content leak or automatic paid retry was introduced.

No interactive browser/device/media or real provider/cloud verification was
performed in this correction pass. The previous physical/manual/native-media,
pixel/audio/font, rights/license, spend, paid-quality and deployment gates remain
unchecked. No local AI runtime or weights were added or verified. Pre-existing
owner documentation changes were preserved; all changes remain unstaged and
uncommitted. This evidence does not extend an earlier release audit to the new
working-tree revision.

Documentation-only follow-up verification parsed eight updated Markdown documents
with the installed Prettier parser and resolved all five new ticket/anchor links.
`git diff --check` passed after the evidence updates; the index remains empty.

## Validation and finding disposition

Pass 1 read the combined tracked/new-file change against CL-009 `06ab834`,
current packet, migration authority and documented evidence. Coverage is locally
implemented; three medium findings require revision:

1. **Clear/stream race:** cancel captured stream ownership before awaiting the
   terminal storage commit. A request arriving during that await could continue
   after Clear. The existing ordinary Clear test did not cover arrival during
   commit. An independently added gated regression failed (`aborted=false`).
   Capture/drain now follows the terminal fence, so subsequent streams cannot
   open prepared media. Shutdown also blocks new intake before draining streams.
2. **POST CSRF:** preview reference deletion reused the GET/restore session path,
   skipping CSRF before mutation. The main media clear still checked CSRF, but
   references could be removed by a rejected request. A regression independently
   failed because invalid-CSRF deletion did not throw. Deletion now requires the
   normal protected session check; GET retains cookie-only playback verification.
3. **Restore integrity:** hash checking existed at assembly publication but was
   absent when reopening the journal. A valid-shape changed focus track could
   display a stale result before remote signed access rejected it. The tampered
   restore regression independently resolved instead of rejecting. One shared
   browser integrity method now runs on write and restore; rejection deletes local
   result/media while preserving the remote cleanup obligation. Backend signature
   verification remains required before Player access.

No earlier finding was ignored: these were gaps in the first execution's race,
mutation-admission and reload coverage. All are local and independently
reproducible without API keys. Provider/cloud/human/pixel/audio gates remain
deferred evidence, not inferred successes or blockers for this sequence.

Pass 2 inspected the complete combined diff/new files, all three dispositions,
restore/cancel/stream ownership, current packet coverage, dependency directions,
strict schemas, dead/debug/unsafe code and documentation claims. Verdict:
**Meets the locally buildable current packet; no actionable local findings.**
The pre-fix regressions failed independently and all now pass; settled five
gates plus diff checks pass. No paid/live/native/device result was inferred.
Whole-file stage/commit handoff: [CL-010 commit plan](CL-010-COMMIT_PLAN.md).

<details>
<summary>Earlier packet and evidence, retained as history where superseded</summary>


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

</details>
