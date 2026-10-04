# Private media renderer

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
`RENDERER_MAX_OPERATIONS` remains default zero and maximum four. Injected
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
Remotion's matching FFmpeg/FFprobe. This isolated service has no Gemini key,
arbitrary input URL, public processing route or general job queue. The initial
cloud foundation is wired through gated analysis/assembly/preview; final delivery
is owned by CL-011.

## Verification

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
Node-generated PNG/PCM fixture, fixed portrait render, scratch accounting with
special entries, native cancellation and zero surviving owned processes. It uses
packaged tools, needs no full FFmpeg and removes fixtures in finally. The Linux
compositor supports PNG/image2/PCM input; BMP/rawvideo fixture paths are unsupported.
Only aggregate proof JSON reaches the runtime. The final image checks production
imports, bundle, tool hashes and executable versions as the unprivileged runtime user.
Both image checks preload `test/deterministic.environment.ts`, forcing fake AI,
paid/live/cloud flags off and removing inherited credentials before application
imports. The final check removes this temporary guard file; normal service
startup uses its independently configured runtime settings.
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
RENDERER_ENABLED, CLOUD_SPEND_APPROVED, REMOTION_LICENSE_CONFIRMED and a bounded
RENDERER_MAX_OPERATIONS only after the setup gate. No service startup reads the
root `.env.local`; attached Cloud Run identity supplies Storage credentials.
