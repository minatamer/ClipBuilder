# CL-009 — Build contextual visuals and complete first-cut assembly

Status: Planned<br>
Milestone: M4 — automatic AI first cut and review<br>
Last synchronized: 2026-09-29<br>
Depends on: CL-007 and CL-008<br>
Blocks: CL-010 and CL-012<br>
Suggested commit: `CL-009: build contextual visual assembly`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Complete selected-clip assembly with a transcript-grounded visual planner,
strict reconciliation, bounded still-image generation, deterministic
equation/information-card rendering, validated private assets, canonical
initial manifest, assembly API/result, and truthful first-cut progress UI.

## Portfolio value

Turn speaker-following footage into an already intelligent first cut: sparse,
explainable visuals clarify the conversation, exact equations remain exact,
captions remain primary, and every cue is grounded to real words instead of
decorative model output.

## Standalone implementation context

- Assembly runs only after exactly one grounded 10–60 second candidate is selected.
  It never re-transcribes or re-ranks candidates.
- The visual planner receives bounded selected transcript words/turns, duration,
  cue cap, and `precision-cut-v1`; it may return zero to three grounded cues.
- OpenAI Responses uses strict Structured Outputs, `store: false`, one call, and
  no automatic repair/retry. Deterministic reconciliation resolves word IDs,
  derives time, enforces density/coverage/safe zones, and rejects unsafe or
  ungrounded plans. Zero valid cues is acceptable.
- Generated stills come only from a server-compiled factual brief plus approved
  art direction. Exact equations, numbers, quotes, and labels use local MathJax
  SVG/card rendering rather than generated text.
- The purpose-recorded fixture should demonstrate Earth and Moon full-frame
  beats plus a smaller exact equation card, but generic logic must never inject
  those subjects into unrelated transcripts.
- The assembly result is atomic: no valid clip-review state is exposed until focus
  track, visual plan, every referenced asset, and initial manifest all validate.

## Dependency evidence required

- CL-007 must provide the immutable normalized transcript, selected range,
  analysis revision, grounded-provider boundary, and recovery/call-count proof.
- CL-008 must provide a validated production focus/shot track plus exact sample
  and cleanup evidence on the approved model/profile.

Do not substitute a fixture-only focus result for CL-008 production evidence or
re-run analysis inside assembly.

## Files and areas owned

- Visual planner port/fake/live adapter, prompt/schema, reconciliation, and
  evaluation fixtures.
- Context image generator port/fake/live adapter and validation.
- MathJax TeX subset, SVG sanitization, card template/rasterization, asset
  validator, and visual timeline/safe-zone planning used by preview/render.
- Remaining assemble job stages, assembly use cases/routes/results, preview
  capability mapping, and initial-manifest compiler.
- Frontend assembly progress/storyboard/failure/retry/choose-another experience.
- Provider/image/art-direction/cost operations documentation.

## Scope boundaries

### In scope

- `POST /v1/assemblies`, assembly operation poll/cancel, and
  `GET /v1/assemblies/:assemblyId` with runtime-validated `AssemblyBundleV1`.
- Named stages: planning/reconciling visuals, creating/validating assets,
  compiling preview bundle, writing result, complete.
- Image cue types/layouts/motion/transitions allowed by the source contracts;
  bounded server-owned prompts and strict decoded asset checks.
- Deterministic equation/stat/quote cards with approved typography, contrast,
  safe zones, and exact transcript-supported content.
- Short-lived source/asset preview capabilities mapped to public asset IDs,
  memory-only browser ownership, and renewal on explicit playback/restoration.
- Failure cleanup, bounded retry, choose-another, refresh/replay, and call-count
  evidence.

### Out of scope

- Stock/web search, remote URLs, scraped B-roll, generative video, user-uploaded
  overlays, asset marketplace/picker, arbitrary prompts/styles/layout/coordinates,
  or a general fallback editor.
- Automatic clip review/confirmation (CL-010), final FFmpeg compilation
  (CL-011), or
  public hardening/deployment.
- Model-produced SVG/HTML/FFmpeg strings, real-person likeness, logos, brands,
  copyrighted characters, living-artist style imitation, or unsupported facts.

## Implementation checklist

### 1. Visual planning and reconciliation

- [ ] Build the strict one-call planner prompt and fake/live adapters with
  abort/deadline/zero SDK retry and raw-payload containment.
- [ ] Resolve every subject/range word ID, derive cue times, enforce opening
  human beat, separation, duration band, max three cues, ≤45% coverage, and
  caption/face safe zones.
- [ ] Route generated concepts versus exact card content deterministically;
  reject conflicting/missing prompt/equation/text fields and unused requests.
- [ ] Reject injection, URLs, identity/likeness, logos, unsupported claims,
  sensitive inference, artist/style imitation, unsafe exact text, and fixture
  concepts not grounded in the current transcript.

### 2. Asset creation and validation

- [ ] Compile image prompts only from validated factual brief plus versioned
  art direction; never pass arbitrary user text/URL/reference media.
- [ ] Reserve image-call allowance only after plan reconciliation; cap at the
  duration-based maximum and three absolute calls; no automatic retry.
- [ ] Decode and validate exact file type, dimensions, bytes, alpha/background,
  image count, hash, and layout requirements before private storage.
- [ ] Implement a length-bounded TeX subset, sanitize MathJax SVG, prohibit
  external refs/scripts/foreign objects, and rasterize through a pinned local
  renderer with deterministic tokens.
- [ ] Delete failed/unused/partial assets and never substitute arbitrary stock or
  a fake success in live mode.

### 3. Assembly orchestration and result

- [ ] Enforce selected revision/range, live/paid/image gates, allowance,
  capacity/budget, Turnstile, marker/idempotency, and one job start.
- [ ] Combine CL-008 focus/shot track with the reconciled visual plan/assets,
  immutable selected range, and fixed `clean-emphasis` captions in one valid
  automatic `CompositionManifestV1`.
- [ ] Write result only after every object generation/hash/reference validates;
  result fetch signs short-lived preview capabilities without exposing object
  names, prompts, raw boxes/scores, or provider payloads.
- [ ] Replays/refetch/refresh return the existing operation/bundle and make no
  duplicate visual or image calls.

### 4. First-cut preparation UI

- [ ] Show selected title/range and named stages: Reading moment, Following
  speakers, Planning visuals, Creating visuals, Building preview.
- [ ] Reveal only true aggregate evidence or existing thumbnails; no fake
  percentages, prompts, face boxes, confidence noise, or nonexistent assets.
- [ ] On failure offer only evidence-permitted retry or choose-another; no manual
  crop repair or asset browser.
- [ ] Stack the same stages/storyboard accessibly on phone and clean up preview
  URLs/polling/listeners on stage change, clear, expiry, or unmount.

## Contracts and state transitions

- `candidates -> assembling -> clip-review | assembly-failed`;
  `CHOOSE_ANOTHER` keeps analysis and discards partial
  selected-range artifacts.
- One assembly may make one active-speaker pass (from CL-008), one visual-plan
  call, zero to three image calls, and local card renders. No hidden provider or
  job retry.
- `AssemblyBundleV1` contains valid analysis/assembly revisions, selected word
  range, focus/shot track, visual plan/assets, and initial manifest.
- Visual assets use public IDs/hashes/metadata in contracts; private object
  references remain server/job-only.

## Privacy, provider, and cost constraints

- Planner receives selected transcript context only; image provider receives a
  bounded server factual/art brief only; neither receives video, filename,
  grant, private path, user identity, or signed URL.
- Image prompts/provider output are never shown publicly or logged. Logs record
  config ID, cue/call/byte counts, duration, safe outcome, and cost evidence.
- Live text/image calls require current access/policy/retention/pricing review,
  owner hard limits, explicit call budget, and authorized rights-safe fixture.
- Default/CI use fake plans/assets, deny network, and assert exact call counts.

## Acceptance criteria

- [ ] The sample produces its grounded Earth beat, returns to speaker footage,
  produces the Moon beat, and renders a smaller exact equation card with
  captions readable throughout.
- [ ] Unrelated transcripts never receive fixture subjects unless their own
  words ground them.
- [ ] Cue count/timing/separation/opening beat/coverage/safe zones and asset
  references validate; zero cues remains a valid first cut.
- [ ] Equations/exact text always use sanitized deterministic cards; generated
  files pass type/dimension/byte/alpha/hash checks.
- [ ] One assembly respects 1 visual-plan and 0–3 image calls; refresh/replay/
  retry never duplicates a successful or uncertain provider action.
- [ ] Partial/invalid plans/assets do not open clip review and are cleaned up.
- [ ] Desktop/phone preparation UI reports only true stages/evidence and has
  correct cancel/retry/choose-another/clear behavior.

## Focused verification

- [ ] Run visual-plan adapter/reconciliation/injection/safety/call-count matrix.
- [ ] Run image decode/format/dimension/alpha/byte/timeout/abort/no-retry tests.
- [ ] Run MathJax subset/SVG sanitization/card golden and safe-zone tests.
- [ ] Run assembly API/job tests for success, zero cues, invalid plan, active-
  speaker failure, image failure, replay, cancel, refresh, and cleanup.
- [ ] Run frontend assembly progress/storyboard/recovery/cleanup tests.
- [ ] Run owner-authorized live text/image checks only after gates; otherwise
  leave them unchecked.
- [ ] Run affected lint/typecheck/build, content/secret scans,
  `git diff --check`, and status inspection.

## Documentation updates

- Record visual-plan/image/card config revisions, current provider settings and
  pricing review date, art-direction/prompt template, call caps, and safe live
  procedure.
- Update data inventory/retention and cost model for generated assets.
- Promote any provider/model/art direction/layout/coverage change into the
  parent and CL-010/CL-011 before completion.

## Owner gates and external blockers

- Provider/privacy/spend approval for OpenAI visual planning and image project,
  current exact model/access/data controls, and up to three image calls.
- Owner visual approval of `precision-cut-v1` and sample/asset rights.
- Explicit permission before credentialed or paid validation. Fake assembly can
  complete without live evidence, but release readiness cannot.

## Commit boundary

Keep visual planning, assets/cards, atomic assembly result, and its progress UI
together as `CL-009: build contextual visual assembly`. Active-speaker remains
CL-008; read-only automatic review and final rendering remain CL-010/CL-011. No Git/provider/cloud
action is authorized by this packet alone.

## Precision references

- [Contextual visuals and manifest behavior](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#76-contextual-visual-beats-and-headline)
- [Visual-plan and assembly contracts](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#108-speaker-focus-and-visual-plan-contracts)
- [Planner, image, and card providers](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#129-visual-planner-port)
- [Assembly and visual pipeline](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#135-assembly-job-stages)
- [Visual evaluation matrix](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#208-active-speaker-and-contextual-visual-evaluations)

## Completion handoff

Report plan/asset/card contracts and config revisions, sample/unrelated-fixture
results, exact provider call counts, assembly/UI states, cleanup, live usage and
cost if authorized, changed files, checks, and every remaining visual/provider/
rights/spend blocker.
