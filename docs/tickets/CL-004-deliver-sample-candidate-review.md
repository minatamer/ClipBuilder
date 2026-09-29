# CL-004 — Deliver the sample-to-candidate-review experience

Status: Planned<br>
Milestone: M1 — deterministic sample story<br>
Last synchronized: 2026-09-29<br>
Depends on: CL-002 owner-approved visual direction and CL-003<br>
Blocks: CL-007 and the production editor composition in CL-010<br>
Suggested commit: `CL-004: deliver the sample candidate experience`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Build the complete no-cost visitor path from landing through sample session,
candidate preview, transcript evidence, selection, and the handoff that starts
first-cut assembly. Include the live-upload card as an honest availability and
limits surface, but do not implement upload in this ticket.

## Portfolio value

Produce the first coherent, polished product slice: a visitor understands the
input, AI role, human choice, grounded evidence, speaker/visual promise, and
real export destination within seconds—without credentials or a paid call.

## Standalone implementation context

- The landing promise is one conversation → three grounded moments → one
  speaker-aware, captioned, visually supported vertical MP4.
- Sample is the first primary action and should reach candidate review in under
  15 seconds on a production-like connection.
- Candidate rank is editorial ordering, never a virality score. Evidence links
  resolve to exact transcript word IDs/time and seek/highlight the source.
- The product uses one reducer-owned staged experience. Screen components
  dispatch events and render selectors; they do not invent local workflow.
- The live-upload card always shows recommended and hard bounds plus rights and
  temporary-storage copy. If live upload is disabled, it stays honest and does
  not block sample mode.
- Use the approved CL-002 tokens/composition. Do not reinterpret the visual
  gate or create a second mobile implementation.

## Dependency evidence required

- CL-002 must record explicit owner approval or named approved revisions for
  the visual tokens and desktop/phone concepts.
- CL-003 must expose passing reducer/persistence/fixture tests, three valid
  candidates, a no-candidate fixture, and zero-network deterministic fakes.

If either proof is missing, stop at the boundary instead of recreating its work
inside this UI ticket.

## Files and areas owned

- Frontend global shell and stable primitives first used here.
- Landing/intake and sample-session action.
- Candidate list/cards, source preview/range playback, evidence inspector,
  transcript highlight, source-range rail, no-candidate/manual-range entry.
- Shared API client/error/polling and media object-URL/playback/timecode modules
  only where the sample slice truly uses them.
- Component/flow tests and lightweight fake-mode sample E2E.

## Scope boundaries

### In scope

- Product wordmark, descriptor, stage title, privacy/limits, fake/sample/live
  environment indicator where appropriate, content-safe error region, skip
  link, and Clear when a session exists.
- Responsive landing with sample/upload cards, exact upload-limit copy, rights
  disclosure, and safe claims.
- Immediate sample session creation and runtime-validated fixture fetch/use.
- Candidate review at desktop/laptop/tablet/phone compositions, including
  accessible selection, evidence seek/highlight, caveats, and source ranges.
- Honest no-strong-candidate state and validated manual 10–60 second range path
  leading to the same future assembly event.
- Loading/failure/expired/clear behavior reachable in this slice.

### Out of scope

- Selecting/uploading a real file, resumable upload, media inspection, live
  analysis, active-speaker inference, visual asset creation, editor, assistant,
  render, download, or cloud deployment.
- Pre-rendering three candidate videos, numeric performance scores, trend data,
  arbitrary media URLs, fake processing percentages, or decorative autoplay.
- A broad generic design-system abstraction not justified by components used
  in this ticket.

## Implementation checklist

- [ ] Compose the global shell and landing from approved tokens, semantic
  landmarks, one `h1`, visible focus, and natural short-height scrolling.
- [ ] State the safe public promise and explain “high-potential” as editorial
  reasoning rather than a predicted result.
- [ ] Display exact upload copy: recommended under 10 minutes/250 MiB; maximum
  20 minutes AND 500 MiB; final clip 10–60 seconds.
- [ ] Start the sample deterministically, set/reconcile session evidence, and
  reach candidates without paid/provider work.
- [ ] Render three distinct candidates with title, hook, rationale, signal
  evidence, caveats, derived range/duration, and accessible rank semantics.
- [ ] Seek to the first referenced word and visibly highlight the exact excerpt
  when evidence is activated; hover is never required.
- [ ] Keep candidate selection provider-free; dispatch assembly start only on
  explicit “Build/Edit this clip”.
- [ ] Provide the no-candidate/manual-range path using word-boundary and
  10–60-second rules.
- [ ] Clean up object URLs, media listeners/timers, and pending requests on
  source change, stage change, clear, and unmount.

## Responsive and accessibility contract

- ≥1440 px: candidate list, large preview, evidence inspector, range rail.
- 1024–1439 px: candidate/preview two columns; evidence panel or drawer.
- 600–1023 px: preview first, semantic candidate tabs, then evidence.
- 320–599 px: one candidate, previous/next controls, vertical preview,
  expandable evidence, safe-area-aware primary action.
- No horizontal page scroll; all pointer actions have keyboard equivalents;
  focus follows deliberate stage changes and returns correctly from drawers.
- Video never autoplays with sound and has accessible playback/time controls.

## Privacy, provider, and cost constraints

- Sample analysis and preview use only approved fixtures/private sample
  capability; no provider call, signed URL persistence, or app-service media
  body.
- Local filenames or private object names never appear in this slice.
- Do not claim the sample analysis ran live for the visitor.
- Do not enable live upload or ask the owner for credentials.

## Acceptance criteria

- [ ] A new visitor can explain the input, AI proposal role, human choice,
  speaker/visual behavior, and output from the landing/sample story.
- [ ] Sample reaches candidate review in under 15 seconds without network
  provider work or credentials.
- [ ] Three materially different candidate cards map every signal to existing
  transcript word IDs and derived time ranges.
- [ ] Evidence activation seeks/highlights the correct words; selection itself
  makes no provider call.
- [ ] No-candidate/manual-range behavior is honest and produces a legal future
  assembly selection.
- [ ] Phone, tablet, laptop, desktop, short-height, keyboard, 200% zoom, and
  reduced-motion checks preserve the same capability.
- [ ] Clear/expiry and all local media/request effects clean up correctly.

## Focused verification

- [ ] Run affected component, reducer-integration, media cleanup, and sample
  flow tests.
- [ ] Assert fake/provider/job call counts stay at zero through candidate review
  and selection.
- [ ] Manually verify 320×568, 390×844, 768×1024, 1024×768, 1440×900, and one
  600–700 px short-height viewport plus an intermediate drag resize.
- [ ] Check keyboard, focus, evidence seeking, playback controls, 200% zoom,
  reduced motion, forced colors, and no horizontal overflow.
- [ ] Run affected lint/typecheck/build, `git diff --check`, and inspect status.

## Documentation updates

- Update frontend README for sample flow, commands, and manual checks.
- Update public root README only if implemented behavior changes the portfolio
  story or local-start instructions.
- Record visual approval dependency and sample-rights status honestly in this
  packet/index.

## Owner gates and external blockers

CL-002 visual approval is required before broad styling is complete. Actual
purpose-recorded playback is additionally blocked until the sample rights gate
is satisfied; deterministic/synthetic fixtures may be used meanwhile without
claiming final media approval.

## Commit boundary

Keep the complete landing-to-candidate-review slice in one commit represented
by `CL-004: deliver the sample candidate experience`. Do not split cards,
evidence, responsive behavior, or sample startup into separate tickets. Do not
absorb live upload/analysis or editor work, and do not perform Git actions
without explicit authorization.

## Precision references

- [Product contract and safe claims](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#1-locked-product-contract)
- [Signature journey through candidate review](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#4-end-to-end-signature-journey)
- [Landing and candidate screen behavior](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#6-screen-by-screen-experience)
- [Candidate contract and rubric](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#106-candidate-contract)
- [Frontend component and flow tests](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#2012-frontend-component-and-flow-tests)

## Completion handoff

Report the implemented screens/components, candidate/evidence behavior, state
events, responsive/accessibility results, performance timing, zero-call proof,
cleanup checks, changed files, documentation updates, and any blocked visual or
rights evidence.
