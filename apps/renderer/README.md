# Private media renderer

CL-015 public-hosting follow-up (2026-10-07): maintained Debian FFmpeg/FFprobe
`7:5.1.9-0+deb12u1` handles original source inspection, audio, proxy and selection.
The contract-owned H.264/VP8/VP9 and AAC/Opus/Vorbis codec boundary, two streams,
MP4 format and file/pipe protocols are enforced before decoder opening, including
the software aliases for supported codecs. Remotion retains its bundled ABI
libraries and only consumes the server-encoded, metadata-stripped selected copy;
its AAC export uses `libfdk_aac`. This mitigates identified source/encoder exposure
without asserting that vendor `n7.1` is fully patched. Repeated Linux synthetic
proof, scan and image-only private rollout are recorded in the
[deployment guide](../../docs/operations/CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07.md).
The accepted portrait export and existing local upload origin are preserved.
Hosted upload requires an explicit origin/CORS cutover; fake/no-key tests do not
prove real media quality. Only the owner runs paid acceptance.

CL-015 final local paid-test preparation (2026-10-07): the patched Linux image
passed synthetic native and offline runtime checks and is deployed to the
existing private renderer. IAM and all operational settings are preserved;
the previous immutable image remains the rollback target. Health is 403 without
identity and 200 with the configured caller/audience; an empty prepare descriptor
returns 400 before media work. No owner media or AI processing was run by the
agent. The existing normal local configuration remains ready for the owner's
manual live test. See the
[preparation evidence](../../docs/operations/FINAL_LOCAL_PAID_TEST_PREPARATION_2026-10-07.md).

That earlier preparation image's package scan has zero **fixable** high/critical
findings. Its vendor `n7.1` patch/reachability concern led to the maintained source
tools and normalized compositor boundary above. Neither result means every native
component is patched. Keep the complete unfixed-entry ledger and repeat native
compatibility checks when tools change; trusted local quality alone is insufficient.

Native security tooling (CL-012, 2026-10-07): all Remotion workspace packages
are pinned to 4.0.534. Explicit browser preparation/image staging selects stable
Chrome for Testing **155.0.8059.39**, then checks the actual executable version
before returning/staging it. Runtime still uses only its baked explicit binary,
with no browser download or auto-update. Unexpected cached versions fail closed;
prepare a clean tooling cache before a matching image build. The exact Linux
image, scan, synthetic native proof and private rollout remain separate gates.
Fake/no-key unit checks prove pin/rejection behavior, not native media quality.

CL-009 generated fallback (2026-10-06) extends the contextual asset provenance
schema with `google-gemini`, the fixed image model and generation policy. Existing
Commons assets remain valid; both sources use identical bounded inline JPEG
bytes and checksum/dimension verification, with no renderer external URL or
Gemini key. A matching private renderer build/rollout is required before live
final export of generated pictures. Local fake/no-key tests verify parsing and
byte integrity, not cloud deployment or real generated quality; those gates
remain separately approved and owner-tested.

CL-011 export update (2026-10-07): the owner-approved matching v3/picture image is
deployed, Ready with 100% latest traffic; other runtime settings and private IAM
are unchanged. The Linux image proof renders synthetic held/speaker framing,
spoken-word cues and both inline picture provenances, with no AI calls.
Authenticated probes verify a 175 KB descriptor reaches schema validation;
body-limit/malformed-body failures return safe 413/400 `invalid` with
`request_parse`, without body text or media dispatch. Actual owner MP4 quality
and download remain unverified. See the
[verified deployment](../../docs/tickets/CL-011-render-and-deliver-final-clip.md#verified-private-image-deployment--2026-10-07).

Session allowance (CL-007, 2026-10-05): each disposable session has four media
operations, consumed atomically in its existing expiring intent by valid
prepare/select/preview/render claims. Restart preserves consumption; replay or
invalid claims dispatch zero work. Failed claimed work stays consumed; new
sessions have independent allowances on the same instance. Reads, release,
cancel and expiry are unmetered. `RENDERER_MAX_OPERATIONS` is retired and rejected;
remove it from service configuration when deploying this revision. One active
operation and all private admission/resource/cleanup controls remain. Private
failures expose only safe code/sub-stage for backend logging. Fake/no-key tests
use injected ports; live media/AI quality remains the owner's manual test.

The matching private image rollout is verified: Ready/latest traffic, retired
entry removed, other runtime settings/private IAM preserved, Linux synthetic
audio/render/runtime proof and non-metered health/invalid-input checks passed.
See the [current allowance handoff](../../docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md#verified-session-allowance-deployment-and-handoff).

Current local CL-007 migration (2026-10-05): `/internal/prepare` now extracts
source-aligned mono 16 kHz AAC at 64 kbit/s in M4A rather than encoding a full
source video. Its strict response includes `analysisAudio` and the fixed
`audioProfile`; `/internal/analysis-audio` streams only this source artifact.
The separate `/internal/select` and `/internal/analysis-proxy` remain video-only
for the selected clip. The legacy intent artifact field remains deletion
compatible; it is not an old processing fallback. The matching image was separately
approved and deployed: Linux/audio/runtime proof, Ready/latest traffic, unchanged
private settings/IAM and the new audio endpoint passed. See the [handoff](../../docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md#approved-private-deployment-and-final-handoff--2026-10-05).
No paid AI or real media test was run by the agent. Fake/no-key checks use
synthetic ports; real speech/timing quality and Gemini acceptance need the owner
test. Full provider output logging
is owned by the backend's private local capture, never renderer/GCS logs.


The isolated native audio proof is `corepack pnpm --filter @clipbuilder/renderer
test:audio` after contracts/renderer builds, with an existing approved full
`FIXTURE_FFMPEG_PATH` for synthetic creation/decode only. It needs no Chromium,
weights, keys, ADC or cloud; its entry forces fake/paid-off and removes all OS-temp
RGB/tone/MP4/M4A/PCM scratch. Production extraction uses the packaged binaries.
The current Windows proof covers AAC, Opus, Vorbis, leading silence and a
1,199.587-second source within the 24 MiB output bound. It does not prove real
speech accuracy, a full 500 MiB input, cloud Linux behavior or paid API quality.

Current private update (2026-10-04): the image from `4c0f510` passed Linux
synthetic render/decode/cancel and runtime checks, then replaced the existing
private revision with IAM/resource settings preserved. Local control is connected
for owner-only analysis testing; assembly/final export remain disabled at the
approved stage. See the [current handoff](../../docs/operations/GROUNDED_ANALYSIS_CHECK.md#verified-private-rollout-and-local-handoff--2026-10-04).
Fake mode still needs no provider keys and supplies synthetic results; actual
source understanding requires the owner's keys/live setup and browser approvals.
The synthetic native proof does not verify Gemini or real-source quality/cleanup.

CL-012 adds locally tested privacy headers, strict request/stream bounds and
canonical private caller-purpose routes. Browser documents use fresh CSP nonces;
Trusted Types remains report-only pending real compatibility checks. Storage
policy and cleanup controls are code-tested, not proof of saved cloud settings.
See [current safeguard evidence](../../docs/operations/SECURITY_PRIVACY_CONTROLS.md).

CL-011 connects explicit final export, receipt-checked output Range playback and
attachment download. It deletes server source/proxies before publication success;
output expires after ten minutes or at session expiry. Clear drains owned work and
streams. Completed-output restore and download retries dispatch zero new jobs/AI.
See [fixed output profile](../../docs/operations/RENDER_PROFILE.md).
With `FAKE_MODE=true` and no keys, fixture UI cannot download; injected synthetic
ports prove lifecycle and rejection behavior, not a real MP4. Real source/assembly
and final rendering require keys/live flags (including `LIVE_RENDER_ENABLED`),
paid/data/rights gates and independent private cloud/compute approval. Actual
native pixels/audio/performance, devices, rights/licenses and rollout remain
unchecked; no local AI model or weights are used.


CL-010 adds private `/internal/preview`, `/internal/preview-info` and
`/internal/preview-content`. After the consumed Google selected proxy is deleted,
one separate proxy is prepared for the exact source generation/range/hash.
Metadata restore and exact-generation byte streaming perform zero media/AI
dispatches. Streams are bounded to four per session, 64 total, 60 seconds and
session expiry; a canceled seek leaves the intent usable. Clear/shutdown abort
and drain streams. Existing independent expiry deletes the preview and source.
No source/manifest text is stored in the cleanup intent.

This adds one compute operation: source proxy + selected AI proxy + selected
preview = three before export, four including the later confirmed final render.
The fixed session allowance is four operations. Injected
fake/off tests use no keys/ADC/storage/network. The image has not been rebuilt
or deployed; actual proxy audio/clocks, Player/native-output parity and real
device checks require the separately deferred cloud/media/AI/rights gates.

CL-008 adds authenticated `/internal/select`: one source-generation-bound
10–60s range, claimed after the source-analysis proxy is released. It reinspects
the original and physically creates an upright 20fps, 640×640/24-MiB AVC/AAC
proxy. Exact-generation read/release and terminal cleanup reuse the analysis
proxy lifecycle. Synthetic tests pass without keys/ADC/cloud access; the image
has not been rebuilt/deployed and native selected-clock proof remains unchecked.

The saved API-free/AI-free native check is
`corepack pnpm --filter @clipbuilder/renderer exec tsx feasibility/selected-proxy.ts`
after contracts/renderer builds, with an approved `FIXTURE_FFMPEG_PATH` for test
pattern/tone synthesis and PCM decoding. It uses the pinned production binaries
for the actual cut/proxy and removes all scratch in `finally`. The full fixture
tool is unavailable locally; no download/install was performed. Live Google
quality and renderer rollout remain deferred by the owner.

CL-007 adds private `/internal/analysis-proxy` and
`/internal/release-analysis-proxy` routes under the existing control identity.
Only the prepared intent's exact proxy generation can be read; bytes/checksum
are verified and owned scratch removed before return. Release deletes that
generation while preserving the source. Failure fences the session and uses
the existing independent cleanup retry. Inspection now returns codec/container/
fps/rotation evidence for the control comparison. These routes are locally tested
with `FAKE_MODE=true`, no keys and injected storage; the new image is not deployed.
Live AI and rollout need [CL-007 check approval](../../docs/operations/GROUNDED_ANALYSIS_CHECK.md).

Standard Remotion Node SSR, compiled fixed composition, baked Chromium and
Remotion's matching compositor libraries, plus maintained system source tools.
This isolated service has no Gemini key,
arbitrary input URL, public processing route or general job queue. The initial
cloud foundation is wired through gated analysis/assembly/preview; final delivery
is owned by CL-011.

## Verification

CL-009 manifest v3 adds grounded word cues, distinct held framing and compact
contextual picture overlays behind captions. Missing pictures are nonfatal.
The current local composition cuts directly between target crops and supports
word-anchored adjacent pictures, with 2–4.5-second readable holds and no group-ID
spacing requirement. It does not interpret contextual search
briefs or contact Commons; normalized signed JPEGs remain its only image input.
Authenticated `/internal/render` alone accepts a bounded 1 MiB descriptor for
inline images; other descriptors retain 128 KiB. Before Chromium, canonical JPEG
bytes, checksum and advertised dimensions are verified with no remote fetch.
Shared preview/render composition uses prepared clip-zero
media; it applies no second trim. A deployed renderer must have the matching
immutable image before accepting the new final-render contract. This local change
does not authorize a private rollout or a live paid test.

After contracts/composition/renderer builds and `corepack pnpm --filter
@clipbuilder/renderer bundle`, the API-free, AI-free Windows proof is
`corepack pnpm --filter @clipbuilder/renderer exec tsx feasibility/edit-render.ts <generated synthetic-edit-input.mp4> [existing screenshot directory]`.
Use only the fixture generated by the frontend's opt-in playback proof. It needs
the already prepared local Chromium and pinned packaged media binaries, no full
fixture FFmpeg, API key, ADC, model weights, cloud or download. It forces the
shared fake/paid-off environment before imports and verifies a fractional selected
proxy plus the actual 1080x1920 MP4 and decoded caption/visual/tail frames. All
internal media/job/audio/frame scratch is removed. Optional exported PNGs are
synthetic; remove the generated input afterward. Source-frame/audio-marker identity,
VFR/rotation/offset fixtures and real owner-media quality have separate acceptance.

Run from the repository root with the pinned package manager:

```text
corepack pnpm --filter @clipbuilder/renderer test:unit
corepack pnpm build:contracts
corepack pnpm --filter @clipbuilder/composition build
corepack pnpm --filter @clipbuilder/renderer build
corepack pnpm --filter @clipbuilder/renderer bundle
```

Unit tests use synthetic injected ports, fake AI, paid/cloud-disabled composition
and import-time external-network interception. They never use ADC or a bucket.
Vitest disables local environment-file loading. Both native synthetic proofs
install the shared hardcoded fake/paid-off environment before other imports and
remove inherited provider/credential-file variables; they use local binaries and
synthetic media only. Paid-flow verification is performed manually by the owner.

The opt-in synthetic Node proof also needs an explicitly prepared Chromium:
`corepack pnpm --filter @clipbuilder/renderer prepare:browser`. This downloads
the browser at tooling time, never on a service request. Set `FIXTURE_FFMPEG_PATH`
to an approved full FFmpeg executable solely for creating the synthetic RGB/tone
input, decoding proof PCM and extracting the proof image. Remotion's minimal
FFmpeg lacks the synthetic-source decoders. The production inspect/proxy/cut/
render path still uses Remotion's packaged binaries. Then run
`corepack pnpm --filter @clipbuilder/renderer test:media` outside the restricted
sandbox. Source, PCM and output are removed in `finally`; the synthetic PNG in
the ignored `.pnpm-store` is removed after visual inspection. Windows Chromium
defaults to the prepared package cache; Linux proof requires `CHROMIUM_PATH`.

The current local proof is 15-second 320×180 synthetic input and one 10-second
1080×1920 output. The additional Linux image and rights-confirmed 2:45 cloud
proof are recorded below. Full 20-minute/500-MiB stress, live AI/speaker quality,
public throughput and phone playback remain later gates.

## Private routes and lifecycle

`GET /v1/health` returns content-free readiness. Cloud Run IAM still requires
authentication. Every `/internal` route also verifies a Google ID token with
the exact service audience and purpose identity. Control identity can admit
upload, prepare, render and cancel; the separate expiry identity can only sweep.
The typed backend adapter sends the same token in Authorization and
X-Serverless-Authorization so platform verification preserves the application
token. Identity headers, capabilities and raw provider errors are never logged.

Original/proxy/output generations and source revision/fingerprint/manifest hash
are fenced in a bounded encrypted cleanup journal. One media operation occupies
the process; there is no queued work. Source lifetime is two hours; final output
ten minutes, capped by source expiry. Completion deletes source/proxy; cancel,
expiry, failure and an independent authenticated sweep verify deletion. Failed
cleanup blocks intake and records retry obligations. A 15-minute schedule and
one retry yield healthy targets of 2h33m raw /43m output; outages can extend
physical retention. The opaque unfinished-upload capability is encrypted with
a separately mounted 32-byte base64url key, never stored as plaintext.

Upload admission inventories the bounded journal. When a session/output is
expired, cleanup is pending, or the process has a prior cleanup block, admission
runs one existing generation-fenced sweep and re-reads the journal before
allocating an upload. It no longer rejects solely because expiry fell between
scheduled sweeps. Actual deletion failures and deferred retry deadlines still
block intake with zero new allocation. Active sessions and unexpired output are
preserved. Upload admission and scheduled sweep are mutually exclusive;
admission storage work is tied to client disconnect and the 180-second sweep
deadline. Failure compensation has its own bounded cleanup signal.

Production composition emits structured `renderer_cleanup_diagnostic` records
to stderr, correlating admission/sweep/cleanup with a fresh diagnostic ID.
Inventory counts, expired/pending/output classifications, retry delay, fixed
stage messages, elapsed time, storage HTTP/fixed failure codes and cleanup fences
are logged; journal bodies, object/session/account identifiers, media, paths,
credentials and capabilities are omitted. Backend diagnostics and owner-local
Gemini output captures remain separate and unchanged. Injected fake/no-key
tests cover recovery, failure, concurrency and privacy; real cloud cleanup and
paid assembly acceptance require the owner UI retest.

Work has an 840-second deadline and a monitored 2-GiB scratch ceiling; sweep
has a 180-second deadline. Dispatch cap 0–4 is per process lifetime and is not a
global billing quota. Restart does not grant permission for more tests. Every
authorized smoke run needs an explicit total attempt/build budget and teardown.

Scratch removal failure retains the exact owned directory as a cleanup
obligation and returns cleanup_pending. Admission and media processing remain
blocked until deletion succeeds; the independent expiry endpoint retries local
scratch as well as GCS cleanup, and shutdown retries the same obligation.
Local filesystem errors and private paths never escape the safe failure code.
The renderer uses the contracts' shared AAC/Opus/Vorbis and H.264/VP8/VP9
allowlists; the synthetic harness checks actual Vorbis/WebM decode and proxy.

## Image and setup

The Dockerfile pins official Node 22 Bookworm image digest. Build stages install
locked dependencies, compile, bundle, bake matching Linux x64 Chromium/media
tools and write binary hashes plus the resolved Debian package list inside the
image. Only production deployed packages and the bundle reach the runtime;
source tests, private media, feasibility pages and env files are excluded.
Workspace dependencies are injected and synchronized after build; standard
`pnpm deploy --prod` assembles a self-contained production dependency graph.
Before publication, the build runs scripts/verify-linux-media.mjs as node:
Node-generated PNG/PCM fixture, source-aligned audio-only extraction with decoded
tone-onset/profile/byte checks, fixed portrait render, scratch accounting with
special entries, native cancellation and zero surviving owned processes. It uses
packaged system tools and removes fixtures in finally. The Linux
compositor supports PNG/image2/PCM input; BMP/rawvideo fixture paths are unsupported.
Only aggregate proof JSON (including audio duration/bytes/extraction time and
before/after tone onset) reaches the runtime. The new audio stage passed locally
with packaged Windows tools; Linux execution remains the separate image-build gate.
The final image checks production
imports, bundle, tool hashes and executable versions as the unprivileged runtime user.
Both image checks preload `test/deterministic.environment.ts`, forcing fake AI,
paid/live/cloud flags off and removing inherited credentials before application
imports. The final check removes this temporary guard file; normal service
startup uses its independently configured runtime settings.
The media worker receives a minimal environment with hardcoded fake AI and
paid/live/cloud access disabled, with `NODE_ENV=test` during synthetic proofs.
Only the parent private service owns approved cloud compute and credentials.
Debian system packages resolve at build time; the resulting image must be
identified and invoked by immutable digest. Based on
[Remotion's standard Docker guidance](https://www.remotion.dev/docs/docker).

Create the allowlisted context from the renderer directory with
`corepack pnpm exec tsx scripts/build-context.ts`; use only the returned directory
for Docker/Cloud Build and delete it afterward. The script refuses links and
unexpected source file types, excludes test suites and copies only renderer/shared
source, pinned build metadata and the shared deterministic environment guard.
Never submit the repository root.

Docker is unavailable on the current Windows host, so Linux build validation
requires a separately authorized Cloud Build run. The first approved build's
runtime check found workspace links escaping the production export. The local
correction passed a 417-link containment check and production imports. The
separately authorized retry succeeded on 2026-10-02 in 104.45 seconds: Linux x64
production imports, fixed bundle, binary hashes and executable versions passed
as the unprivileged runtime user. Artifact Registry's immutable digest matched
the build result recorded in [CL-006](../../docs/tickets/CL-006-build-media-job-and-speaker-feasibility.md#separately-authorized-corrected-image-retry--2026-10-02).
The private renderer was subsequently deployed in europe-west1 with 4 CPU/8 GiB,
min-zero/max-one service and revision limits, request concurrency two, 900-second
timeout and two-operation cap. Owner confirmed SSR license coverage. Corrected
caller ADC/private health, negative authorization and scheduled empty expiry
invocation passed. The owner subsequently authorized the rights-confirmed 2:45
source and necessary build retries. Linux image/native cleanup and real cloud
upload/proxy/10-second render/output profile/audio timing/partial-upload cancel
and independent accelerated expiry all passed. Source/proxy generations were
deleted on completion; final output and all owned test intents were independently
swept and verified not found. Downloaded test media/build contexts were removed.
Five builds and four cloud media dispatches total are recorded in
[CL-006](../../docs/tickets/CL-006-build-media-job-and-speaker-feasibility.md#completed-private-cloud-foundation--2026-10-02).
The browser/control journey still uses fixtures. Fake plans
need no AI key for cloud processing; live Gemini requires separate key/live/paid/
transfer approval. Resources and the enabled cleanup schedule are retained. Follow the
[bounded cloud setup guide](../../docs/operations/CLOUD_RUN_RENDERER_SETUP.md).
Populate only the matching blank identity/bucket/key-mount entries from this
package's `.env.example` in owner-managed service configuration. Enable
RENDERER_ENABLED, CLOUD_SPEND_APPROVED and REMOTION_LICENSE_CONFIRMED only after
the setup gate. The session operation allowance is fixed in code. No startup reads the
root `.env.local`; attached Cloud Run identity supplies Storage credentials.
