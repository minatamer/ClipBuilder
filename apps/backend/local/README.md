# Local editing backend

CL-068 includes anonymous person observations and automatic portrait framing in
the existing selected-clip video planning request. Preparation retains focus
beside completed pictures, and manual focus edits use the existing revision/base
binding and explicit export snapshot. No extra provider call or automatic retry.
Safe focus diagnostics record counts and fallback/hold/switch decisions; the
normalized automatic plan stays in protected clip state/private drafts. See the
[workflow guide](../../../docs/operations/LOCAL_WORKFLOW.md) for controls and log
verification. Fake people are fictional; live Gemini quality is owner-manual.

These modules extend the normal backend at `/v1/local`, mounted only for local
loopback requests. Normal startup owns the native worker and `.env.local`;
there is no separate host executable or owner/provider command.

The [local workflow guide](../../../docs/operations/LOCAL_WORKFLOW.md) owns
setup and operation. [Agent commands](AGENT_COMMANDS.md) use the same validated
use cases with a private per-run capability. Browser requests pass through the
same-origin Next proxy; the token stays server-side. Source masters, drafts and
exports retain their existing compatible formats and external storage paths.

Explicit YouTube metadata may include a bounded title/canonical video identity
for ephemeral local display (CL-040). Titles never enter saved source/draft
formats or logs. `/api/sources/thumbnail/<source-digest>` requires the normal
local capability and an admitted in-memory offer. The provider acquisition port
reads only `https://i.ytimg.com/vi/<validated-id>/mqdefault.jpg`, without redirects,
credentials or cache, with a five-second deadline and 256 KiB JPEG limit. Bytes
pass through the same-origin frontend proxy; the browser/CSP needs no external
image host. Requests abort/drain on disconnect/shutdown; failures return no image.
This does not change the downloader CONNECT allowlist or expose arbitrary URLs.

Saved-video preview (CL-043) uses protected GET
`/api/sources/<downloads|desktop>/<variant-id>/preview` with a byte Range header.
The library verifies its existing confined master and exact saved variant before
serving MP4 bytes. Each response is capped at 512 KiB and uses no-store; absent or
invalid ranges fail. This read-only path works without an acquisition port and
creates no workspace, copy, native job, title record or provider request. The
normal proxy forwards Range and drains cancellation; host shutdown closes owned
responses. Missing/damaged/linked sources fail without modifying stored data.

Acquisition validates measured clocks against the offered format, including the
nominal 24/30/60 fps labels used for their NTSC rates (CL-042). Whole-second
duration hints allow less than one second of rounding; fractional hints retain
the tight frame tolerance. Audio/video clocks must still agree within 100ms or
one frame, whichever is larger. Stored metadata uses the measured clocks, so a
valid 29.97 fps source offered as 30 fps remains reusable offline. Codecs, exact
format IDs, dimensions, limits and lossless remux requirements are unchanged.
Failures expose only a fixed diagnostic-code enum, never provider stderr or raw
worker errors. The normal backend start builds the native worker bundle; after
native code changes, rebuild through the normal backend restart before testing.

The normal file picker uses `/api/open/video` to fingerprint a streamed MP4 and
reopen its latest matching saved draft, including a matching clip/export. A small
validated identity sent to `/api/open/draft` reopens a registered draft directly;
client-supplied paths and snapshot data are ignored. Both paths reuse the existing
validated bundle loader without AI, acquisition or render dispatch. Unknown video
bytes use normal intake; unavailable drafts fail without reprocessing.

Fake AI requires no keys; real downloads/native media are independent. Real AI
uses normal Gemini configuration/approvals and stays owner-manual. Synthetic
checks never call YouTube, Gemini or cloud resources.

Manual timestamps reserve canonical 30fps intervals before discovery (CL-057).
The provider receives the full transcript and structured reserved cuts; both
provider and fake results are fitted within the remaining contiguous windows.
AI suggestions share zero frames with manual clips, including padding, while
adjacent endpoints are allowed. Only eligible suggestions count toward the
requested additional count. Shortfalls never trigger another selection call;
selection is skipped when no remaining window can fit the minimum duration.
Manual cuts and the existing manual-first combined list remain authoritative.

Fake analysis emits fictional dialogue for moment/focus testing. New fake clips
have no caption overlay by default: `fake-content.ts` owns the hardcoded
`FAKE_CAPTIONS_ENABLED=false` switch, with no environment setting. The fake picture
adapter permanently returns no plan and never generates the Earth sample.
Existing saved media/edits stay intact; tests needing art/captions explicitly
inject isolated content fixtures.

CL-078 adds protected, revision-bound clip caption generation. Locally,
Generate fake captions inserts fictional words with no key, spend or paid-attempt
charge. It is absent from hosted UI/routes. Generate captions confirms audio
transfer/Gemini credits, then transcribes only the selected cut's bounded M4A.
The owner authorized this local-only caption port to use the existing configured
Gemini key even with fake mode/paid master off. It changes no global config and
exposes no analysis/selection/image/cloud bypass. Hosted caption generation keeps
normal paid readiness, authentication/CSRF and provider/native session budgets.
Explicit Gemini attempts are bounded to three per clip; repeated operation IDs
never dispatch again and there is no automatic retry. Generation increments the
edit revision and retains framing, pictures, style and old exports. Word corrections
are text-only overrides keyed by existing IDs; the shared compiler preserves all
timestamps for preview, autosave and export. No new environment entries.
PNG/WebP personal pictures with alpha normalize to bounded static PNG, preserving
transparent and half-transparent pixels. Opaque inputs retain the JPEG profile.
Trusted optional format metadata controls fixed storage/draft extensions and
response/render MIME; legacy missing format means JPEG. Editing cannot set that
metadata. Animation and unsafe/over-limit rasters remain rejected. Picture upload
returns the admitted asset ID even for duplicate bytes so the frontend can insert
the chosen picture directly. Manual cues have a separate twenty-cue bound;
automatic planning/image attempt limits remain three. Shared schema/edit/motion
fields round-trip through autosave and native export without new AI calls.
