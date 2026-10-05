# CL-009 — Fixed contextual composition assembly

Current owner-requested follow-up (2026-10-05):
[assembly request and diagnostic coverage](CL-009-assembly-request-and-diagnostics.md).
The selected proxy upload succeeded, but generation returned HTTP 400 before
plan compilation or preview. This follow-up adopts JSON-only generation with
schema prompt guidance and expands stage diagnostics. Local verification and
the owner's paid acceptance are recorded separately in that packet.

## Owner local assembly-stage enablement — 2026-10-05

Status: **approved, enabled and local restart/readiness verified; owner paid UI
acceptance pending**.
The owner explicitly approved enabling assembly after CL-007 diagnosed disabled
Proceed. Source analysis, selected assembly and CL-010 preview integration are
already implemented; the matching private renderer image is already deployed.
This dependency-ready packet enables that existing local path, with no pipeline
or model change, new deployment, renderer setting change or Git action.

1. Validate the existing ignored runtime settings internally and change only
   `paidValidationStage` from `analysis` to `assembly`. Preserve all existing
   private metadata, approvals, credentials, operating switches and diagnostics.
   Do not read or modify environment files. Rendering stays disabled.
2. Restart only the backend with its normal entrypoint. Capture and verify the
   old supervisor, watcher, descendants/orphans and creation identities; stop
   them fully, check stabilization and launch the new hidden owned tree.
   Preserve the healthy frontend and existing logs/captures.
3. Verify non-metered health, /start and public configuration: live analysis and
   assembly available, render unavailable, challenge configured. Confirm private
   output capture is armed and safe backend diagnostics remain ready. Report
   content-free process/log evidence and no stale backend listener.
4. Record the session consequence: a new backend boot epoch invalidates previous
   signed analysis/admission. The owner starts over and runs Find moments again
   before testing Proceed; do not weaken session provenance to reuse old output.

This is approval for the local assembly stage and its manual owner test. Agents
do not run a paid processing request. Real assembly quality and preview remain
unchecked until that test. Final render/export is a separate stage. Existing
fake/no-key tests prove bounded orchestration/layout/cleanup, not live quality;
no local AI model or weights are used. The settled five root gates immediately
preceding this configuration-only packet pass with 983 tests in 84 files.

### Verified handoff

Only the ignored `apps/backend/runtime.local.json` stage changed: `analysis`
to `assembly`. Schema validation and deep comparison prove all other fields
were preserved. No environment file was read/changed, approval invented,
render capability enabled, provider/cloud dispatch or Git mutation performed.

Verified shutdown captured eight owned processes under supervisor 20672,
including the watcher and current API child, and confirmed their absence and
released port 4000 through stabilization. One initial replacement was cleaned
after its final readiness check failed; its eight identities also remain absent.
The final normal hidden launch is supervisor **11188**, API listener **18720**
on `127.0.0.1:4000`; frontend **20712** remains the same verified instance on
`127.0.0.1:3000`. Health, /start and /api/sample/config return **200**. Public
config confirms live analysis/assembly true, render false and challenge present.
Analysis, renderer, reconciliation and candidate-decoding diagnostics are ready;
complete private Gemini response capture remains armed under the existing permit.

Content-free process/shutdown/verification records and separate stdout/stderr
logs remain in the ignored OS-temp `clipbuilder-runtime` area; the final launch
directory is `restart-backend-assembly-20261005-180915`. Earlier logs and capture
files are preserved. No processing POST was sent; agent paid dispatch count is
zero. Config-only validation: **Meets this local enablement packet**; no code,
dependency/schema/model change requires repeating the already settled root gates.
The owner must start over, run fresh Find moments and then test Proceed because
the backend boot epoch changed. Real framing/cards/captions/preview quality,
actual provider success and final render/export acceptance remain unchecked.

## Current cloud-render packet — approved local execution, 2026-10-02

Status: local implementation/verification complete; validation pass 2 has no actionable local findings. External evidence remains deferred.

Authority: [Google/Cloud Run migration plan](../architecture/GEMINI_REMOTION_MIGRATION.md); [file inventory](../architecture/MIGRATION_FILE_INVENTORY.md); [later setup guide](../operations/CLOUD_RUN_RENDERER_SETUP.md).

Freeze versioned source/manifest/object-generation data with word-grounded fixed captions and contextual templates. Zero raster calls initially; any Google image model requires later measured need and caps.

Dependencies follow the numbered migration sequence. After documentation approval, implement one dependency-ready packet at a time and run focused checks plus the required settled five root gates. Fake/live AI and local/cloud compute are independent; cloud render can incur cost with fake AI. Ordinary tests remain synthetic, credential-free, fake/off and zero-network through injected cloud/provider ports. No cloud provisioning, login, credential use, private upload, paid call, Git action, usage polling or new independent review is authorized now.

- [x] Owner explicitly approved documentation and local corrections on 2026-10-02.
- [x] Implement and verify the locally buildable current packet after approval.
- [x] Record exact synthetic checks, cleanup and all remaining external gates.

## Local execution record — 2026-10-03

The owner authorized sequential execute/validate/fix loops through CL-014 and
locally buildable CL-015 work, file-level plans and immediate ticket-prefixed
commits. This later instruction authorizes local validation and Git actions;
provider keys, paid calls, cloud execution and deployment remain excluded.

One selected-range audiovisual call now supplies both CL-008 speaker focus and
contextual cards. The strict planner returns word spans and fixed statement,
two-column comparison or numbered steps templates. Exact quotes/numbers/
equations remain escaped literal text. There is no free-form visible model
prose, raster brief, image call, external asset, MathJax/SVG/code input,
transcription rerun or candidate reranking.

`fixed-composition-v1` retains `clean-emphasis`: at most seven display words,
normally two lines of 32 characters, punctuation/speaker/pause boundaries and
3.5-second grouping cap. Short groups and exceptional long words remain literal;
unrepresentable simultaneous display groups fail before media/AI dispatch.
Provider words/clocks remain unchanged. Cards follow a 2-second opening beat,
last 1.5–4.5 seconds, have at least one second of separation, number at most
three and cover at most 45 percent. Ordered disjoint title/line spans must be
spoken during the cue. Zero cards is valid. Full-frame templates preserve audio
and keep captions above them in a separate safe area; no face overlay is added.

Manifest v2/result freeze source fingerprint/revision/object generation,
analysis revision, candidate/range, selected words/evidence, fixed output,
SHA-256 manifest hash and signed completed-action receipt. Protected
`POST /v1/analysis/assemble` validates CSRF before its bounded larger body:
4 MiB signed-context transport, at most 2,000 selected words/256 KiB. It reserves
one `visual-plan`, one physical proxy preparation and one planner call, with
zero repair/retry/image/source-AI calls. Verified proxy release precedes
publication; failure terminally cancels media. Source/selected calls share
Google Files cleanup. No durable server transcript/manifest/provider store.

Same-origin API, preparation flow and atomic browser journal validate source/
range/hash. Refresh/replay/uncertainty cannot plan again; Clear fences queued
publication and retains the existing remote cleanup obligation. CL-010 owns
Proceed, Player hydration, review state/notes; CL-011 owns MP4 delivery. The
live assembly UI flag remains false until review integration. This explicit
ticket boundary cannot become a fixture success fallback in real mode.

Validation pass 1 reviewed the combined unstaged implementation against the
current packet. Verdict: does not yet meet the local packet. Two Medium findings
were independently confirmed and corrected:

- Cancellation during an awaited journal commit lacked publication signal
  checks; the first version checked only around the flow call. A regression
  aborts while the actual journal write is blocked. Checks before/after hashing
  and after commit now lead to persisted uncertainty, with no second plan.
- Caption sizing used total text length despite fixed line width/height.
  Long wide-glyph lines could overflow. Sizing now uses the longest line and
  bounded 24/30/36/52-pixel choices. Static markup/safe-area regressions cover
  extremes; actual human readability/font/device approval remains unverified.

Execution also checks display tokens within a provider word and preflights
captions before either metered boundary. A synthetic fixture mutation initially
contaminated later tests; per-case cloned sources correct that test issue.
Focused backend assembly: 61 passed. Focused frontend assembly/workspace: 34
passed including the cancellation regression. Earlier five root gates passed
525 tests before corrections. Settled commands all passed: `corepack pnpm
format:check`, `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm
test:unit`, `corepack pnpm build`, and `git diff --check`. The final unit total
is 528 in 54 files: root 20, contracts 44, composition 3, backend 179, renderer
27, frontend 255. No external sockets/keys were used.

Validation pass 2 reviewed the settled combined unstaged scope over `5a45cd9`,
including new files and ticket evidence; index empty, unrelated changes none.
Verdict: meets the locally buildable current packet, no actionable findings.
Both pass-1 findings are resolved with the actual journal cancellation and
caption extreme/safe-area regressions. Covered: one-call grounding/word mapping,
fixed policy/coverage, generation/hash/receipt binding, protected HTTP, shared
Files/proxy cleanup, atomic journal/replay/abort and narrow docs. Static markup
does not prove pixel/audio/human/device quality. Five settled gates are execution
evidence; no full suite was repeated during this read-only validation pass.

Remaining gates: real Gemini/model/privacy/paid-project/data terms and source
rights; numeric AI/cloud allowance; approved full fixture FFmpeg native timing/
audio/rotation/VFR/max-envelope proof; renderer rollout/private cloud execution/
cleanup; human speaker/visual/caption quality; font/codec/telemetry/notices and
public sample rights; real device/accessibility and preview/final MP4 parity.
No local AI model/weights are used. `FAKE_MODE=true`/no keys supports injected
synthetic plans and the existing labelled sample flow without external calls;
that does not prove live gates. No service, resource, provider request or
persistent test artifact was created; timers/readers/listeners drain, and Clear
deletes new journal fields through the existing source cleanup path.

Deviation: none from the current cloud packet. Historical raster/MathJax/
browser-final-export mechanisms are superseded. File-level plan:
[CL-009-COMMIT_PLAN.md](CL-009-COMMIT_PLAN.md).

<details>
<summary>Earlier packet and evidence, retained as history where superseded</summary>


Status: Planned; browser-owned execution revision, external gates pending<br>
Milestone: M4 - automatic assembly<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-004A, CL-007 and CL-008 browser focus proof<br>
Suggested commit: `CL-009: validate browser-owned contextual assembly`<br>
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

Complete one immutable browser-owned assembly manifest for the chosen range:
proved speaker focus, fixed captions and sparse transcript-grounded visuals.
Protected backend requests may plan visuals and generate bounded stills; they
do not store a source, transcript, assembly bundle or asset bucket.

Keep 1-3 planned visual beats when supported by source evidence, with existing
image-call ceiling 0-3; do not force generation when deterministic cards suffice.
No stock/web scraping, user remote URL resolver, likeness/logo imitation,
generative video, editor controls or arbitrary renderer input.

## Current implementation checklist

- [ ] Validate submitted selected context and server provenance receipts,
      session/range/revisions, input/output/token bounds and process-local
      action admission before one foreground visual-plan call (SDK retry=0).
- [ ] Reconcile word/time evidence; reject unsupported claims, fabricated trend/
      view predictions and out-of-range cues. Internal filler cuts remain
      deferred until the ordered-segment contract is approved.
- [ ] Generate only approved bounded stills, at most three, with exact image
      size/quality/token/call policy. Reserve each action; uncertain outcomes
      are consumed, no hidden retry. Provider consent/retention gates remain.
- [ ] Return bounded validated image bytes/content receipts, not arbitrary
      signed provider URLs. Validate image type/pixels/dimensions and write
      browser OPFS artifacts; no server result bucket/durable payload.
- [ ] Render deterministic restricted MathJax/information cards locally using
      approved fonts/packages, sanitized SVG/raster output and fixed limits.
      No model-generated HTML/SVG/executable code.
- [ ] Compile fixed caption groups/emphasis, focus track and visual timing into
      a strict immutable manifest; browser journal publication follows complete
      asset writes. Bind hashes/revisions/range and validate all references.
- [ ] Reuse build progress UI and left-hand final-review Agentic Notes. Explain
      only actual edits/captions/visuals/focus with clickable grounded timestamps;
      never claim cuts or successful generation that did not occur.
- [ ] Clear/cancel/replace fences late outputs and deletes partial cards/assets;
      quotas, lost responses and orphan files cannot publish incomplete success.

## Tests, acceptance and handoff

Own protected visual/image adapters/use cases/routes plus browser card/asset
assembly and strict shared schemas, not final encode. Fake transports verify
exact visual-plan/image counts, zero rejected-case calls, all input/token/pixel
caps, malformed provider/receipt/asset failures and replay/race/restart handling.
Unit/browser tests cover caption grouping, emphasis, legal fonts, crop/visual
bounds, asset timing, immutable source mapping, quota and worker cleanup.
Run focused checks and all five root gates.

- [ ] Completed browser assembly contains validated focus/captions/assets and
      only source-grounded notes; preview/export semantics are shared downstream.
- [ ] Backend stores no durable content and original video/output stay local.
- [ ] Real provider/model/image cost/privacy/rights and visual-quality checks
      remain explicitly gated until specifically authorized and performed.
- [ ] Update provider/software/cost docs and exact assembly/asset ownership.
      Record changed files, tests, deviations and every unchecked device/owner
      item. No GCS/cloud assembly gate is transferred to CL-015.

## Historical packet

<details>
<summary>Superseded server-media plan, retained only for decision history</summary>

The following text is not an execution checklist, setup instruction or evidence
of completion under the browser-owned architecture. It must not be used to
reintroduce cloud content storage, jobs or unsupported guarantees.

# CL-009 — Build contextual visuals and complete first-cut assembly

Status: Planned<br>
Milestone: M4 — automatic AI first cut and review<br>
Last synchronized: 2026-10-01<br>
Depends on: CL-004A, CL-007, and CL-008<br>
Blocks: CL-010 and CL-012<br>
Suggested commit: `CL-009: build contextual visual assembly`<br>
Parent plan: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

Owner setup ordering (2026-10-01): reuse CL-004A's
[provider walkthrough](../operations/PROVIDER_SETUP.md),
[cost worksheet](../operations/COST_MODEL.md) and
[software inventory](../operations/THIRD_PARTY_SOFTWARE.md), updating exact
visual/image/card configuration and observed evidence rather than creating a
second setup guide. Local/fake adapters and tests need no GCloud resources.
Any local paid provider check still needs explicit rights/privacy/call/cost
approval; the deployed cloud journey remains final CL-015 only.

Latest owner clarification (2026-10-01): CL-004 owns the complete development-
only frontend preview and its reusable screens. This packet replaces the fake
adapter with its real implementation and proves integration, media, recovery,
privacy/rights/spend/readiness gates; it does not recreate the workflow UI.
Earlier restrictions on synthetic progress apply to real/public mode, not the
explicitly labelled local preview. Fake completion is not evidence for this
packet's unchecked acceptance. See the parent development-preview clarification.

Owner UI revision (2026-10-01): continue CL-004's single dynamic workspace and
shared progress/footer through automatic assembly. Show speaker/visual/caption
messages only when the corresponding job evidence exists. The rejected equation
demo UI is not the sample default; do not inject its subjects into the new
general conversation fixture. Generic grounded equation rendering remains in
scope. Parent section 0.6 supersedes older screen-layout directions; gates stay.

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

- [Historical contextual visuals policy](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#75-contextual-visual-beats)
- [Visual-plan and assembly contracts](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#108-speaker-focus-and-visual-plan-contracts)
- [Planner, image, and card providers](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#129-visual-planner-port)
- [Assembly and visual pipeline](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#135-assembly-job-stages)
- [Visual evaluation matrix](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#208-active-speaker-and-contextual-visual-evaluations)

## Completion handoff

Report plan/asset/card contracts and config revisions, sample/unrelated-fixture
results, exact provider call counts, assembly/UI states, cleanup, live usage and
cost if authorized, changed files, checks, and every remaining visual/provider/
rights/spend blocker.

</details>

</details>
