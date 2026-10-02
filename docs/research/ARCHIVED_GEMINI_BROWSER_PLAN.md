# Archived browser-render migration — superseded 2026-10-02

The later owner decision selected Cloud Run Node/Docker rendering and paused implementation until documentation approval. This earlier plan is history, not execution authority. The current [cloud migration](../architecture/GEMINI_REMOTION_MIGRATION.md) replaces it.

<details><summary>Earlier plan, retained verbatim</summary>

# Gemini and Remotion migration — owner decision, 2026-10-02

This is the current implementation plan. The owner explicitly replaced local
LR-ASD/YuNet with Google Gemini and fixed Remotion browser compositions, asked
for a complete repository inventory before implementation, and authorized local
implementation through the dependency-ready packets. Earlier provider and
local-model documents are historical where they conflict with this decision.
This does not authorize credentials, paid calls, private-media transfer,
deployment, cloud resources or Git mutations. Independent review and usage
polling remain stopped.

## Product and responsibility contract

One owned/licensed 15-second–20-minute source, at most 500 MiB, yields zero to
four grounded candidates (target three). The visitor chooses exactly one
contiguous 10–60-second candidate. The app automatically applies fixed captions,
speaker focus and up to three contextual visuals, shows a read-only preview,
then Confirm export produces one validated portrait MP4 download. Preserve the
existing output contract and session expiry. There is no editor, trim path,
chat/prompt UI, caption or visual controls, account, history, database, general
queue, batch workflow or direct publishing.

| Layer | Responsibility | Explicit boundary |
| --- | --- | --- |
| Browser source workspace | Inspect native codecs, timestamps/rotation, admit source, bounded OPFS copy, proxy encoding, result/manifest/output retention and cleanup | Original and final video remain browser-owned; no full-source base64 or duplicate in IndexedDB |
| Protected Express API | Validate admission, actual body/profile/duration, reserve metered action, Google transport, strict response normalization, provenance receipt | Server-only Google SDK/key; no durable media/transcript store, GCS or renderer |
| Gemini `gemini-3.8-flash` | Grounded word transcript, anonymous speaker turns, candidate ranges; selected-range audible/visible association and visual plan | Returns bounded data, never JSX/code/HTML, arbitrary URLs, executable renderer inputs or sensitive identity inference |
| Fixed Remotion React composition | Crop geometry, cuts, timed captions, deterministic cards/diagrams and animation; same frozen inputs for preview and export | Browser renderer; explicit transforms rather than unsupported object-position |
| Mediabunny/WebCodecs | Native media inspection/decode/proxy encode and MP4 mux/validation; also used underneath Remotion | Software, not another AI provider; no hosted rendering/FFmpeg jobs |

`apps/frontend -> packages/contracts <- apps/backend` remains the only internal
dependency direction. Contracts contain versioned strict domain schemas and
compiled caps; no React, Node, provider raw types, environment reader or SDK.

## Verified sources and pins

Official [model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)
and [video guide](https://ai.google.dev/gemini-api/docs/video-understanding)
identify `gemini-3.8-flash`; the current JavaScript SDK is `@google/genai@2.26.0`.
Use its supported structured response API after checking the installed types.
Default static video sampling is sparse; selected-range sampling must be
explicit and measured. Model support does not establish speaker correctness.

Registry pins verified 2026-10-02: `remotion`, `@remotion/player`,
`@remotion/media`, `@remotion/web-renderer` all **4.0.532**. Existing direct
Mediabunny is **1.61.0**; inspect Remotion's dependency and actual codec behavior
before assuming one compatible copy or upgrading it. No Lambda/Node renderer
or Studio dependency is needed.

[Browser rendering](https://www.remotion.dev/docs/web-renderer/render-media-on-web)
supports a positional `outputWritable` stream. Require a bounded OPFS writable
adapter; never accept an implicit whole-output ArrayBuffer fallback. Inspect
the installed implementation to prove backpressure, abort and file ownership.
[Renderer limitations](https://www.remotion.dev/docs/client-side-rendering/limitations)
include partial CSS emulation, unsupported object-position and no multithreaded
rendering. Preview/export parity must be sampled, not assumed from shared React.

Remotion's [license](https://www.remotion.dev/docs/license/pricing) is free for
qualifying individuals/organizations up to three people and requires a company
license for larger organizations. Eligibility is an owner-only release gate.
[Mandatory browser telemetry](https://www.remotion.dev/docs/telemetry) reports
render status, origin, IP and license data, not video content; retention is
indefinite. Disclose it in product privacy copy, intercept it in ordinary tests,
and do not describe rendering as fully offline/network-free. License eligibility
and any telemetry/privacy conflict must be resolved before public release.

Flash returns structured text; it is not a raster-image generator. Initial
visuals use useful fixed text/cards/diagrams with zero image calls. If measured
product requirements need raster generation, select a Google Nano Banana model
under the same SDK/key in CL-009 with explicit asset/call/cost caps; do not add
it speculatively. A dedicated Google transcription model is similarly a
conditional response to failed caption/diarization evidence, not a default.

## Intentional transfer, lifetime and spend

This owner decision replaces the prohibition on any video/frame transfer with
a narrow intentional transfer for Google audiovisual analysis. Admit and
transcode a bounded analysis proxy locally; send only that proxy through the
protected same-origin API. Do not upload the original, expose a source URL,
persist visitor media in our cloud or route browser credentials to Google.
The initial engineering proxy ceiling is 24 MiB, AVC/AAC MP4, at most 640×640
display pixels, max 20 minutes. This is a provisional implementation ceiling,
not a proven full-bound quality/hosting result. Fail honestly when unavailable;
do not silently shrink quality or bypass admission. Selected-range proxy is at
most 60 seconds and reuses the source clock. Browser encoding must preserve
initial A/V offsets and rotation.

Google [Files API](https://ai.google.dev/gemini-api/docs/files) permits 2 GB per
file and automatically expires files after 48 hours. Prefer Files transport
for reuse/large requests; delete owned provider files on terminal success,
failure and cancel. A failed delete remains a reported cleanup obligation with
bounded retry, not a deletion guarantee. Upload/process polling has a deadline;
no credentials, URI, filename, transcript or provider payload enters logs/URLs.
Any ephemeral server scratch is bounded and removed in finally; it is not a
content store. Verify streaming SDK upload before enabling the endpoint.

Google [paid-service terms](https://ai.google.dev/gemini-api/terms) exclude
training on paid-service prompts/responses but retain limited abuse-processing
logs. Files expiry is not zero retention. Require paid-project data terms,
rights/consent and approved transfer before live testing. Do not use unpaid
quota as a privacy-equivalent fallback. Pricing comes from the
[current official table](https://ai.google.dev/gemini-api/docs/pricing), checked
again at live authorization; SDK token metadata supplies actual metered totals.

Initial budget: one whole-source analysis call, one selected-range plan call,
zero image calls, zero automatic paid retries, one active analysis/assembly and
one final render. Refresh, failed export and render retry reuse validated cached
analysis/frozen manifest/assets and dispatch zero AI calls. Candidate retry,
when allowed by the existing contract, is a distinct explicitly reserved action
with no repeated media analysis; do not conceal it inside transport retries.
No background interaction storage, tools/search grounding or persistent cache
is used by default. Exact token/output/deadline caps live in one server config
and executable contracts. Process-local admission does not prove multi-instance
global quota safety; public live processing stays disabled until CL-012/015.

`FAKE_MODE=true`, paid disabled and every LIVE flag false remain committed/test
defaults. Synthetic fake plans exercise the new orchestration without a key;
exact provider counters and network guards prove zero external calls. Local
media decode/render is real software processing, while fake transcript/focus
is fixture data and proves no AI quality. Live Gemini requires a server-only
key, enabled flags and rights/privacy/spend approvals. This migration supplies
no new live approval and never reads `.env.local`.

## Repository scout and correction map

Inspected tracked/unstaged/untracked state, all source module paths, dependency
manifests, environment example, test network guard, canonical contracts,
configuration/composition, admission, fixture workflow, worker ownership,
architecture/provider/software guides and CL-005–015 packets. No live Deepgram,
OpenAI or renderer adapter exists: the current app is a fixture journey plus
local source/audio foundations. Active old-provider coupling is in configuration,
provenance enums, admission timeout and documentation. Preserve unrelated owner
changes to AGENTS.md and CL-015. Only one canonical CL-007 packet exists;
historical section titles/links must not create a second executable packet.

| Files/modules | Action and reason | Packet/dependency |
| --- | --- | --- |
| Source of truth; `docs/architecture/BROWSER_OWNED_MEDIA.md`; this plan; ticket index | Make new owner decision authoritative; mark old provider/model/server paths historical | CL-006 first |
| `.env.example`; backend `config/env.schema.ts`, `loadConfig.test.ts`; `admission/admission.composition.ts` | Replace OpenAI/Deepgram values with Google model/key, caps and timeout; keep all live gates off | CL-006 |
| Frontend/backend package.json and root pnpm-lock.yaml | Pin Google SDK server-only and matching Remotion browser packages; inspect actual APIs/licensing | CL-006 |
| `packages/contracts/src/{transcript,visual-plan,composition-manifest}.schema.ts`; new provider/edit domain schema and tests | Google provenance, strict versioned plan, anonymous speaker boxes/turns, bounded word/candidate references and timed cards; reject extra/code/URL fields | CL-006/007/008/009 |
| `apps/frontend/feasibility/browser-speaker/**`; `audio.mfcc.*`; browser-media MFCC controls/routes/tests; ESLint obsolete exceptions | Remove superseded uncommitted model-specific tools and coupling after reference audit; retain historical numerical evidence | CL-006 |
| `features/media/{source.*,browser.workspace.*,opfs.*,workspace.*,audio.extraction,audio.samples,audio.profile,audio.protocol}` | Retain bounds, clocks, offset/gap padding, storage journal/lease, abort/clear/recovery; add bounded proxy/output artifacts | CL-005/006/007/011 |
| New fixed frontend `features/render` composition/export modules | Prove real React preview and progressive OPFS MP4 first; synthetic data only; then reuse in visitor flow | CL-006 before assembly rewrite |
| New backend `analysis` port/use case/Google adapter/routes; frontend same-origin API bridge | Validate binary proxy before metered dispatch; strict normalization/provenance, timeout, delete provider file and scratch | CL-007 after foundational gates |
| `features/sample/{sample.api,sample.experience,candidate.review,clip.review,result-preview,portrait-player,processing-status}` and session effects/persistence/reconciliation | Adapt existing single-candidate flow to Google analysis and frozen composition; preserve read-only experience and receipt/revision fencing | CL-007–011 |
| Backend demo fixtures/manifests and frontend tests | Synthetic Google-shaped transcript/turns/cards; honest fake mode, exact call counts, no real content | Each owning packet |
| New focus validation/smoothing modules | Reject ungrounded/out-of-source boxes or words; deterministic switch dwell/shot resets; safe wide fit for offscreen/overlap/low confidence | CL-008 |
| Visual plans/assets schemas and fixed React templates | Cards/diagrams with fixed typography/animation; no arbitrary SVG/HTML/assets; raster model only if evidence requires it | CL-009 |
| Local immutable preview/confirmation/output modules and recovery | Frozen manifest/hash/source binding; no AI call from export; one checked MP4 download, quota/cancel/retry cleanup | CL-010/011 |
| Admission/body/deadline/replay/CSP/privacy/network tests; test/no-network.setup.ts | Preserve fake/off import isolation, test telemetry interception, Google failure/unknown result and exact budgets | CL-012 |
| `README.md`, app READMEs, provider/software/cost/rights guides | Correct public stack/privacy/capability claims and blank owner setup; preserve concise public README | Owning packet |
| CL-005 through CL-015; fixture catalogs; deployment packaging checks | Reconcile acceptance/dependencies; exclude feasibility/debug routes from deployed app; no hosted renderer introduced | All packets |

Obsolete diagnostic process on port 4186 was verified by PID/creation time,
stopped with its owned child and checked absent through three stabilization
checks. No app service was changed. Forced shutdown was necessary for the
detached diagnostic without an interactive console. Approved private model
assets/notices and original media are preserved; no further model proof is run.

## Dependency-ready implementation sequence

1. **CL-006 migration foundation:** reconcile authority/packets and old config;
   remove model-specific product tools; pin SDK/renderer; strict foundational
   schemas; actual synthetic fixed-composition browser preview, OPFS MP4 export,
   cancel/cleanup, codec probe and sampled layout/sync. Quality/live/media/phone
   evidence remains unchecked. Five root gates after settled local foundation.
2. **CL-007 protected analysis:** one bounded media-proxy action plus Google
   upload/process/generate/delete adapter, strict words/turns/candidates and
   provenance; frontend result commit/recovery; fake/injected exact-call/failure
   tests. Credential/paid upload not needed for local implementation.
3. **CL-008 focus:** selected-range Google plan port/normalization; coordinate,
   rotation, cut, anonymous person and audible-turn association validation;
   deterministic safe framing/smoothing. Fake engineering implementation may
   proceed after CL-007; live speaker go requires measured human ground truth.
4. **CL-009 assembly:** freeze versioned source-bound manifest with selected
   word timings, focus segments, fixed captions and contextual templates; zero
   image calls initially. Grounding/coverage/schema/call budget tests.
5. **CL-010 preview:** existing single-card read-only review uses fixed Remotion
   Player, exact same frozen composition, focus/caption/card layout and lifecycle.
6. **CL-011 export:** explicit Confirm export, bounded writable adapter, output
   codec/dimensions/duration/sync validation and one local download; retry uses
   same manifest/assets with zero AI dispatch. Abort/stale-source/quota cleanup.
7. **CL-012 safeguards:** Google data policy, rights/cost gate, metered replay,
   cancellation/uncertain-result, actual-byte checks, CSP/telemetry disclosure;
   preserve public live lock until hosting guarantees exist.
8. **CL-013 quality:** responsive keyboard/accessibility states and real device
   capability checks; sampled preview/export caption/framing sync and latency.
9. **CL-014 audit:** local static/schema/network/fixture tests, content/privacy
   audit and all five root gates; distinguish engineering from live go.
10. **CL-015 deployment preparation:** packaging excludes diagnostics/model
    tools; verify transport/headers/model-free assets and rollout safeguards
    locally. Cloud creation/deployment, license/rights and production go remain
    owner-only. Preserve existing owner edits to this packet.

A packet boundary sequences implementation; it does not require another owner
confirmation. Finish independently possible local/fake work and report precise
unmet external/device/quality gates with concrete tests prepared.

## Evidence and acceptance ledger

The abandoned LR-ASD full browser workload processed 60 source seconds in
374,955.935 ms, with 1,500 frames, two tracks and 294 calls. This is historical
execution evidence, not an approved quality go. Raw baseline changed focus 63
times and had no positive choice on 480 frames. No audible-labelled accuracy
was established. Its own audio-window and cleanup fixes passed focused tests;
it is replaced because the owner rejected the latency. Do not continue proving
it, mark its old quality checklist complete or infer Gemini will be faster.

New acceptance measures phase wall time for admission/proxy/upload/provider/
candidates/selected planning/preview/export/validated download; actual calls,
bytes/tokens/assets and meaningful sampled resource use. No 60–120-second SLA
has been approved. Test synthetic offset/VFR/rotation/cuts, codec failure,
quota, cancel/abandon, stale source/manifest, provider timeout and zero-call
retries before live media. Actual supported phones require device evidence.

For speaking-face correctness, prepare human audible turn labels independently
of predictions, compare visible association and switch delay/jitter, inspect
framing while the person speaks, and cover one/multiple speakers, listeners,
brief turns, overlap, absent faces, cuts and offscreen speech. Bounding boxes,
HTTP success or fake plans alone do not prove it. The owner's private source
may be tested end to end only after explicit Google transfer/call budget and
rights/retention gates; do not expose its content or filename. Repeat whole
source analysis zero times on export/retry.

Current state: architecture/scout documented; local implementation starts next.
No new live AI, renderer, phone, quality or deployment evidence is claimed.

</details>
