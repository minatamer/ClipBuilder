# Local Codex provider — CL-135

## Caption speaker preparation — CL-240, 2026-11-06

The selected-clip diarizer keeps automatic cluster counts (`num-clusters=-1`)
with distance threshold 0.4. The authorized separate-copy public diagnostic
found one merged speaker at 0.5/0.45, two at 0.4 and three at 0.35; two short
isolated-turn controls each retained one. This is bounded sample evidence, not
a general accuracy claim. Models, two CPU threads and neutral overlap handling
stay unchanged; no forced count, inference retry or saved-clip migration.
Later caption creation reuses canonical labeled words, or performs speaker-only
enrichment of existing unlabeled words. IDs/text/clocks are checked unchanged.
Hook caption refresh preserves its independently authored title and settings.
Fake/no-key transport/native checks verify mechanics separately from this
API-free local model diagnostic and broader owner quality acceptance.

## Complete, non-overlapping Find all — CL-211, 2026-11-04

For new local Find all analyses, deterministic speech-boundary completion and
reconciliation replace CL-210's retain-overlapping-alternatives behavior.
Find all exposes observed sentence/pause units, keeps nearby question/answer and
one dependent utterance together where admissible, and retains original whole
proposals as alternatives when added context would conflict. Overlapping shared
speech can merge within the requested duration; incompatible alternatives use
interval scheduling, prioritizing original selected coverage before added
context, then fewer clips and fuller context. Results are chronological and
non-overlapping; adjacent independent ideas remain separate. No timing-only
semantic guarantee or automatic truncation/retry follows from this policy.

Lookback now includes up to the requested maximum duration, with a fifteen-second
minimum; following context still uses that maximum. Normal two-minute reviews
carry at most four minutes of words with a sixty-second clip maximum. The same
four planned reviews per eight-minute window reuse existing ASR. Compact input
includes request-local speech-unit references; canonical saved words/clocks and
Parakeet compatibility stay unchanged. `regional-complete-v2` selection receipts
also retain optional internal original-coverage anchors for consistent
copy/recovery/retry; legacy selection receipts remain readable.

Existing completed results are never migrated or automatically reprocessed.
Numeric/manual/Gemini/hosted paths remain unchanged. Fake/no-key checks verify
mechanics; another real owner-started run and subjective listening remain
separate acceptance. The packet records private offline aggregate comparison,
not a claim that new real model output has already been accepted.

## Regional Find all — CL-210, 2026-11-04

Local Codex Find all separates two-minute selection cores from the existing
Parakeet speech cores. Fifteen seconds of preceding context and up to the maximum
clip duration of following context retain boundary-spanning ideas. An eight-minute
window plans four serial reviews, reusing one acknowledged ASR unit where covered.
Compact request-local word references and punctuated speech remove duplicated
text/null metadata and long canonical hashes from the model input; decoded
references/evidence map back to unchanged saved IDs and source clocks. Each review
asks for independent chronological coverage before ranking, with no clip quota.
A core with no eligible spoken word skips inference even if neighboring context
has speech. Duplicate canonical word spans reconcile once across padded contexts;
distinct overlapping passages remain available.

The fixed plan may issue more Codex requests than the prior global shortlist;
actual allowance/time/quality cannot be inferred from mock results or JSON size.
There are no automatic retries or model/reasoning/provider changes. Selection
receipts have a separate regional policy/core key; ASR compatibility stays intact.
Completed old analyses remain readable and are never automatically reprocessed.
Failure/cancel checkpoints keep successful regions for explicit retry. Progress
completion describes reviewed regions, not guaranteed semantic completeness.
Numeric/manual-only and Gemini/hosted paths stay unchanged. The packet records
actual fake/native checks and outstanding real owner recall acceptance.

## Supported language — CL-209, 2026-11-04

The supported demo input is English only, locally and when deployed. This latest
owner decision supersedes earlier multilingual-preservation requirements below.
An English-specialist local ASR candidate still needs measured accuracy and word
timing acceptance; model size or advertised streaming latency alone is not a
performance verdict. Hosted remains Gemini; no provider/API call is part of the
local optimization benchmark. CL-209 owns actual results and implementation.

## Stable within-clip participants — CL-205

The existing single camera planning request now establishes one anonymous roster
across temporal panels, movement and shot changes. Observations of another pose
reuse the person ID; one confirmed speech speaker uses one canonical target.
Fresh automatic compilation reconciles compatible speech-linked aliases and
strong same-shot head-box continuity, retaining the earliest established ID/
baseline and real-cut geometry. Separate co-visible heads and conflicting voices
are preserved; ambiguous associations hold rather than invent another target.
No position-only match across cuts, biometric recognition, extra inference or
automatic retry. Manual Motion follows the existing person and saved focus/
tracks are never migrated. Aggregate diagnostics contain merge/conflict counts
only. Fake tests need no keys; actual identity/framing quality still requires
owner acceptance with installed Codex/login/local speech and live approvals.

## Collection scaling — CL-190

Local Codex count readiness is enabled: no 360-moment/ten-clip total quota.
Finite planned discovery, bounded response pages, serial preparation, immutable
paged saves/recovery and actual disk/heap guards apply. There is no automatic
retry, extra fill-to-count loop or model/reasoning switch. Gemini/hosted budgets
remain independent. See the [capacity inventory](../operations/LOCAL_CODEX_CAPACITY.md)
and [packet evidence](../tickets/CL-190-codex-unrestricted-moment-batches.md).

## Long-source pass — CL-189

The local Codex capacity now enables long sources. Eight-minute source-aligned ASR cores with two seconds of context and sixty-second discovery overlap replace whole-source WAV/prompt processing. Individually bounded compatible receipts copy incrementally into saved drafts and single rolling recovery. Explicit retry resumes missing units, with partial/canceled coverage retained. Disk reserve, per-operation native/inference limits and safe codecs remain; Gemini/hosted budgets do not change. The existing model/reasoning is preserved; no real throughput/quality claim is made. CL-190 owns aggregate moment/batch scaling.

## Capacity composition — CL-185

The actual local Codex composition selects the capacity profile; browser fields,
worker job JSON, restored drafts and hosted owner exemptions cannot select it.
Source admission and measured disk checks are independent of provider dispatch.
The content-free capability tells the picker the effective source limit. The
private startup descriptor carries the same profile to native inspection. Common
save/recovery/source/batch paths retain a real disk reserve and preserve owner
files. Gemini and hosted keep their existing independent budgets.

Long-source/count readiness remains disabled until CL-189/190 prove complete
incremental pipelines. The foundation does not establish two-hour transcription
or count-free processing. See the
[capacity path inventory](../operations/LOCAL_CODEX_CAPACITY.md) for remaining
schema, clock, downloader, ASR, prompt and persistence owners. No new config,
provider call, model change or fallback is introduced.

CL-171 replaces mandatory Commons with broad provider web discovery. A separate
Codex request receives only generic briefs/alternatives and enables live hosted
web search; media/transcript planning keeps all tools disabled.

CL-176 corrects the installed CLI's Code Mode requirement. Its default model
advertises `tools.web__run` inside `functions.exec`; disabling the Code Mode host
left that advertised function unusable. Enable Code Mode and its installed host
only for the separate search request. Exclude the `functions`, `image_gen`,
`clock` and `collaboration` namespaces from its executor, disable agents/plugins,
and retain shell/apps/MCP/browser/file-tool isolation. The search prompt names
the actual callable function. No model/catalog/auth/configuration change or
experimental standalone feature is required. Completed searches still arrive
as the existing CLI `web_search` events. A started-only search is diagnosed as
`search_incomplete`; no invocation is `search_missing`. Both remain nonfatal
discovery failures and cannot be counted as successful retrieval.

The installed-CLI proof inspects the actual nested tool definition, invokes it
through the real local host and fake loopback search service, and retrieves an
injected raster. It fails with the old disabled host. Synthetic auth/queries,
outbound-denying proxy and isolated profiles keep this paid-off; successful
authenticated service availability and actual image quality remain owner-only.

Each visual uses one discovery request asking for 2–3 distinct same-subject
queries, up to 12 candidate URLs, four pages and 12 retrieval attempts. Provider
search has a 90s deadline; retrieval has 25s total and 10s per public request.
Actual query counts are managed by the provider; diagnostic `requests` counts
app discovery requests, not billable searches. Extract page images, follow up to
three checked redirects, pin public DNS to sockets, decode/re-encode within the
existing 4 MiB/16M-pixel/96 KiB raster budgets. No minimum dimensions, license
filter or brittle keyword rejection. Supported animated rasters use frame one.
Fixed reasons/counts cover misses, blocked addresses, downloads and decoding.
No queries, URLs, private values or raw CLI/provider output enter diagnostics.

CL-177 fixes the native pinned lookup callback for Node's address-family
selection: `all: true` receives the complete validated address list; a single
lookup receives its selected address/family. Node can choose among those checked
IPv4/IPv6 peers without another DNS query. Returning a single string to an
all-address lookup previously failed every download with
`ERR_INVALID_IP_ADDRESS` before headers/body. The fixed identifier is recognized
in content-free DNS diagnostics. Native HTTP loopback proofs exercise both modes,
image decoding and mid-body cancellation; test-only peer mapping never weakens
production public-address or redirect validation.

Fresh search hits win; a miss/failure uses CL-170's same-call planned local PNG
illustration, with no additional generation inference and no Gemini fallback.
Search itself is now a separate provider request. Existing usable-plan repairs
and field/rule diagnostics remain. Optional art never fails the clip or retries
inference automatically. Gemini uses Google Search grounding followed by its
existing image generator only on a miss, under the existing key/live approvals.

Media/Pictures exposes an AI-icon Find visuals action for the prepared clip.
Transcript-only planning and retrieval use current provider ports; no repeated
speech, diarization, video upload or native preview rebuild. Fresh AI art replaces
the prior AI set only after success, preserving uploaded pictures, other edits,
old assets and exports. Miss/failure retains existing art. Revision/operation and
five-attempt bounds survive save/recovery; no automatic retry or resume. Both
Codex and Gemini use provider-ai mode, so switching between them preserves the
completed session. Fake/real mode isolation is retained. Owner acceptance tests
Codex first, then an explicitly requested Gemini switch; agents stay fake/offline.

CL-169 makes full-source Codex transcription ASR-only (`diarize=false`) for moment
discovery. Native speech jobs retain combined ASR/diarization as their legacy
default; fresh bounded manual cuts still use it. Explicit readiness on analyses,
transcript caches and moments distinguishes unknown labels from deferred work.
Absent legacy metadata means completed. Full-source words remain reusable after
selection failure/policy changes and save/recovery; CL-168 partial coverage is
still enforced. No persistent cross-session/global transcript cache is added.

Only an explicitly chosen moment with deferred labels uses the optional clip
word-preparation port. Its new closed `speakers` job admits a bounded source cut
and clip-relative words, extracts that cut's WAV and runs only the existing
anonymous diarizer. It cannot rerun ASR or Codex. The backend verifies all word
fields except speakerId are unchanged; the existing partial preparation stores
the enriched moment before planning. Retry/restore reuses it. Transition sampling,
camera planning, picture evidence and caption/base words share that moment.
Empty word lists require no diarizer. Legacy plans/saved clips remain usable.

The observed speakers phase precedes frame/planning work; the same-clip transient
progress run retains completed speaker ticks. Native timeout/byte/fingerprint/
path/process/cleanup guards apply to the new job, with no new worker/provider
concurrency, model download, quality tradeoff or automatic retry. Full-source
ASR remains the first-discovery cost; real speed/selection quality requires the
owner's manual run. The existing pinned CPU runtime has no verified accelerated
implementation in this packet. A faster model/GPU path needs separate work and
quality acceptance, rather than silently changing the installed model.

CL-168 scopes manual-only speech work to the smallest continuous selected window
within the existing five-minute native cut bound; widely separated ranges and
AI moment discovery retain full-source transcription. Cut words are shifted to
the source clock exactly once, then normal moment cue clipping stays local.
`transcriptCut` records partial coverage in analysis/drafts/recovery; transcript
reuse requires the requested window to be covered, and full-source discovery
never reuses partial words. Existing full-source saved analyses remain compatible.

After one WAV extraction, ASR (four CPU threads) and anonymous diarization (two)
overlap only when at least six CPU threads are available. Constrained machines
remain sequential. One admitted worker job owns both processes and waits for
both to settle after failure/cancellation before removing scratch. Models,
frame/image allowances, timeouts and provider call counts are unchanged.

The authenticated worker progress channel carries a bounded Codex stage snapshot;
the final receipt carries completed stage durations so a short phase cannot be
lost between polls. The local backend exposes only fixed stages/states/durations
and a transient run/clip correlation. UI polling aborts on unmount, stays serial
and cannot start/retry media or AI. `codex_inspect`, `codex_audio`,
`codex_transcription`, `codex_speakers`, `codex_frames`, `codex_selection`,
`codex_planning` and `codex_pictures` measure their real boundaries. Existing
`clip-preview`/`clip` records measure native preparation/export. No private native
stdout/stderr, words, paths, prompts or credential values enter these records.
The checklist appears only for local Codex; Gemini keeps existing presentation.
Real before/after speed requires owner-run inference, not injected test timings.

Owner AFK request, 2026-10-29: use the existing Codex subscription from normal
local ClipBuilder controls instead of Gemini; keep deployed Gemini unchanged.
Choose recommendations, plan/document/commit the plan, then execute/validate.
All preceding Media/audio and caption work is committed through `472479e`
under the plan committed first at `85563c8`; implementation starts clean.

## Supported integration and limits

CL-157 makes optional AI text one source-grounded opening title at frame zero.
The shared prompt/decoder uses the slower of 3 words/s or 15 non-space characters/s
plus 0.75 s, capped to 2–8 s and clip length. The decoder tolerates the prior
three-candidate input but emits only the first usable title. No separate title
field/inference, repeated captions or later AI emphasis. Manual/saved text
positions and times remain editable and bypass initial planning normalization.

CL-156 gives Gemini/Codex one shared initial-picture policy: at most five seconds
per picture and at least two clear seconds between pictures. Request distinct,
useful related alternatives for long-running ideas within the same three-picture
allowance and single planning call. The shared batch normalizes fresh plans
before image dispatch/storage, never regenerating split/duplicate art. Later
cues may move only inside their original relevance window; a cue that cannot fit
is omitted before spend rather than failing the clip. Existing partial/base
retries and manual/saved timing bypass this initial-plan normalization. The
provider's existing resume binding admits the stored normalized plan for images.

CL-154 retains grounded visual-only opening evidence even when the opening audio
words have no diarization label. Only shot-start decisions at confidence >=0.95
with at least one second of intersecting unassigned speech, evidence beginning
within 0.5 seconds of the cut, continuous person visibility and no conflicting
known speech may initialize that crop. It does not invent audio speaker labels
or authorize later visual-only switches. Ordinary audio-backed switches and
uncertain holds retain their existing gates. The same single planning request
explicitly asks for this opening evidence and tight face/head boxes including
chin/hair, excluding torso; image and byte budgets do not change.

Initial planned pictures project the compiled person observations through the
shared integer portrait camera crop for every intersecting shot/observation.
Protect the full supplied rectangle plus a margin; choose a stable readable
clear slot across the cue, trying smaller alternatives if needed. A bounded
least-overlap fallback keeps fully occupied portraits editable without another
call or quality rejection. This runs only when creating a new planned picture;
retained/saved/manual positions and Hook copies keep their stored coordinates.
It works with injected fake plans without keys; actual visual/mouth association
quality remains unverified by synthetic checks.

CL-153 adapts only the output-schema wire copy before invoking the CLI. Shared
picture briefs use JavaScript Unicode-property regexes requiring a `u` flag,
which the provider rejects as JSON Schema regex syntax. Omit those property
patterns in the wire copy, retaining ordinary ID patterns, structure/bounds and
the original multilingual/runtime validation. No prompt/quality gate, automatic
retry or provider fallback is added. An isolated installed-CLI fake-provider
proof must reject the old schema and accept the adapted schema with images.

CL-244 supersedes CL-150's whole-segmentation-window speaker pooling and CL-240's
threshold-only correction. The owned Node child uses pinned Sherpa-ONNX 2.0.1 and
English WeSpeaker VoxCeleb ResNet34 embeddings on 1.5-second windows, stepped by
0.75 seconds. Fixed average-link cosine distance 0.35 discovers the count; at
least two windows support a speaker, apart from a one-window input. Isolated
transition/noise windows remain neutral. Overlapping centers divide clocks once;
a measured 80ms quiet gap may refine a contiguous speaker boundary within half a
step, only with a tenfold energy reduction. Gaps are never bridged. Work follows
the existing clip duration bound, with at most sixteen supported speakers.
The same task handles new selected clips and caption enrichment. Codex discovery,
including manual-cut transcription, defers voices; even older reused words get
new selected-clip speaker work without changing retained clip/base/edits. Normal
ASR remains Parakeet. Python and experimental model/window variants are not
application dependencies or fallbacks. Only anonymous within-source turns are
retained; embeddings stay in the owned child and are never saved or sent.
Align word overlap conservatively, keeping overlap/unknown neutral. The separate
authorized diagnostic used private temporary data and retained aggregate evidence.
Codex receives the timed labels and up to sixty JPEGs. CL-218 now uses four
two-by-two temporal panels (0/0.5/1/1.5 seconds), retaining old triptych decoding.
CL-152 retains the existing per-duration
image count and reserves at most half its slots for known speaker changes,
anchoring bursts 0.5 seconds before selected transitions. At least half retain
uniform coverage, including the opening. Excess changes are spread across the
clip; duplicate anchors are refilled from the uniform grid. Unknown/overlapping
word labels break transition inference; no-hint jobs keep uniform sampling.
Only bounded, sorted, clip-relative numeric hints cross the media job boundary;
no new speech/model/provider call or image/byte allowance is added.
This is sampled evidence, not continuous native video/audio perception. Keep
speaker associations when supported, refusing invented labels. Existing focus
compiler owns sustained switching, holds, confidence and shot resets.

Prepare speaker assets explicitly with `corepack pnpm local:prepare:speakers`
in addition to speech preparation. Startup validates hashes without inference;
real Codex readiness requires both installations. No GPU, provider API key,
cloud upload or runtime download is used for diarization. Model quality and
speaker-to-face association remain owner-tested. Original exports are untouched;
analysis JPEGs alone are resized/compressed within their existing byte bound.

This is a local provider bridge. MCP exposes tools to an assistant; it is not
necessary just to request Codex inference. The official
[app server](https://learn.chatgpt.com/docs/app-server) supports custom clients,
and [noninteractive CLI](https://learn.chatgpt.com/docs/non-interactive-mode)
supports structured output and saved CLI sign-in. Use `codex exec` here: each
bounded job can ignore user config, disable tools/hooks and persist no thread,
without another browser port or a long-lived general assistant. It is a separate
Codex run, not this development chat being embedded or continued.

[ChatGPT sign-in](https://learn.chatgpt.com/docs/auth) uses subscription access;
API-key authentication uses API billing. Require ChatGPT login, clear inherited
provider/API-key overrides, never read/copy auth files or tokens, and never fall
back to API keys or Gemini. It consumes the owner's Codex allowance and can hit
plan limits; it is not unlimited/free/offline inference. No real inference is
authorized for agent verification; tests inject transports and process results.

The documented [input limitations](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations)
exclude raw audio/video and the transcription/image-generation APIs on this
subscription route. Pair Codex with local CPU transcription (CL-209 Parakeet) and bounded
JPEG frames. The app automatically extracts these inputs; the owner does not
need to show the video in chat or copy moments back. No whole original video or
audio goes to Codex. Transcript and sampled frames are sent only by an explicit
local processing action. Existing exports still use original source quality.

CL-209 selects the official b5454 native Parakeet/BLAS binary and Parakeet TDT
0.6B v3 Q8 model. This replaces the earlier Whisper small default after measured
accuracy/timestamp and performance comparison. Four threads, sixty-second cores
and two seconds of context bound the native encoder's memory. Native 10-ms token
clocks are grouped into words, retained once by midpoint ownership and returned
through bounded private files. The model is CC BY 4.0 with NVIDIA attribution;
native code is MIT and OpenBLAS has its retained BSD notice. Digests and an
explicit preparation command admit assets outside startup. Nothing is downloaded
during processing and no alternative engine/provider is retried automatically.
See [the measured comparison](../research/LOCAL_ASR_PERFORMANCE_2026-11-04.md).

Parakeet supplies words/timing; CL-150's separate local diarizer supplies anonymous
audio speaker labels. Codex associates these with temporal images, retaining
uncertainty and held focus when the evidence cannot establish a visible speaker.
Manual caption-level assignment remains available. Real diarization, camera/
editorial and ASR accuracy remain owner-only acceptance. Image generation is not
supported through this transport. CL-159 replaces CL-151's forced structured
diagram output for new plans with contextual image briefs; CL-171 uses broad web
retrieval. Real photos/illustrations can be used without a fixed card/diagram
template. CL-170 adds a same-call illustration plan used only after search
miss/failure, preserving old saved assets and partial plans. Optional visual
failure does not fail/retry a clip. No hidden Gemini generation
or fabricated fixture art. Hosted Gemini also searches before its existing generated fallback.

## Composition and flow

CL-149 aligns Codex's selection schema with the shared reference-only prompt.
The existing bounded Gemini normalizer resolves title/hook word references into
spoken text; internal word IDs are never used as the title copy.

Keep the backend's single fake/real mode. Fake always uses existing fictional
providers and cannot launch Codex/local-ASR inference. Normal local real mode uses
the chosen provider: CL-137 defaults to `AI_PROVIDER=gemini`, and local
`AI_PROVIDER=codex` opts into this bridge; hosted real mode continues using Gemini
and rejects explicit Codex selection. No second app,
frontend mode toggle, accounts, chatbot, new credential or ignored-env migration.
The existing paid-master off switch also disables local real AI. The owner must
enable normal real mode/master explicitly; the bridge never enables flags.
The local capability response names the provider and setup availability; normal
selection/caption/editor controls use the existing authenticated routes.

### Activate locally

CL-148 distinguishes the CLI's non-fatal completed error items (configuration
warnings) from fatal error/turn.failed events. A warning cannot replace turn
completion or the bounded safe result file. Tool and malformed-item events stay
rejected, including item.updated. Installed-CLI validation against an isolated
loopback fake Responses endpoint reproduces the old rejection and passes with
the fix; it uses no saved credentials or real inference. See the
[protocol packet](../tickets/CL-148-codex-result-protocol.md).

CL-147 uses a private CLI provider ID, clipbuilder_subscription, because the
installed CLI reserves builtin IDs such as openai. The private configuration
retains saved ChatGPT authentication, response output, zero request/stream retries
and no provider fallback. The backend AI_PROVIDER setting remains codex; this
private CLI ID is not another user setting. Generic process failures no longer
claim that sign-in or allowance is the cause without evidence.

CL-146 fixes startup registration for the optional prepared speech metadata.
Discovery validates its exact keys and bounded absolute paths without exposing
them in the public runtime pointer or running speech/AI inference.

The CLI command is installed on this workstation, and the speech tools/model
were prepared and verified during CL-135. From a normal local terminal, run
`codex login status`. If it reports ChatGPT authentication, the bridge reuses
that saved login. Otherwise run `codex login` and complete ChatGPT sign-in;
an API-key login is rejected by this bridge. See the official
[authentication instructions](https://learn.chatgpt.com/docs/auth).

In the owner's ignored `apps/backend/.env.local`, manually set these existing
entries; leave other values untouched:

```dotenv
AI_PROVIDER=codex
FAKE_MODE=false
PAID_DEMO_ENABLED=true
```

The processing master is also required for local Codex. With Codex selected,
all Gemini/cloud composition stays blocked even when that master is on. No
Gemini or OpenAI API key is needed for the subscription bridge. Restart the
normal backend, then use Find moments / Process clips as usual. Those explicit
actions consume Codex plan allowance; actual inference/ASR quality remains owner
acceptance. FAKE_MODE=true continues to return simulated AI without inference.
Gemini remains the default when AI_PROVIDER is absent or set to gemini.

On another Windows workstation, explicitly run `corepack pnpm local:prepare:speech`
and `corepack pnpm local:prepare:speakers` before restarting. Startup never
downloads tools, signs in or processes media. The preparation commands change
no private configuration and do not inspect credentials.

An explicit local analysis prepares 16-kHz mono speech in the private worker and
runs pinned Parakeet in bounded serial chunks, returning words with stable IDs. CL-169 defers
diarization for full-source discovery to chosen clips; bounded manual cuts retain
their combined speech preparation. Codex receives
the admitted transcript and existing selection policy and returns structured
moment evidence. Selected-clip planning uses at most sixty bounded temporal JPEG
panels, upright source geometry and clipped speaker-tagged words; returns bounded
camera decisions, optional authored opening title text and generic contextual
image briefs. CL-167 makes those briefs explain the precise spoken idea, with
literal depictions first and attention from a meaningful focal detail/reveal/
contrast. Analogies need source support; no random props or generic technical
filler. The policy is shared with Gemini planning/image generation and preserves
free choice of art style. Time the image to the cited key words. Commons searches
the full validated generic scene phrase, admits up to eight metadata candidates
and downloads at most one raster
per lookup. CL-164 supplies per-thirty-second visual windows/minimums to both
planners (one/two for current <=60s intake, existing three-image maximum).
Codex includes up to two alternate depictions of the SAME subject in that call;
runtime scopes them to the primary scene/essential terms, broadens a drifting
query back to those terms and deduplicates actual phrases. CL-170 repairs fresh
decoded fields and retains the bounded usable plan without logging raw values;
no extra inference or editorial rejection is introduced. Then
try at most three distinct public lookups within CL-170's twenty-second total deadline,
keeping one normalized asset and no extra inference. Per-lookup bounds are
512 KiB metadata, 4 MiB
download and a normalized JPEG at most 96 KiB / 920×520, with allowlisted hosts,
redirect rejection; CL-170 removes the local license filter and retains source metadata. No transcript,
media or authentication is sent to lookup. Admitted assets are digest-verified
and marked retrieved. Fixed content-free diagnostic reasons distinguish missing
plan coverage, no match, lookup failure and final coverage shortfall. Failed
external retrieval uses the same-call local illustration fallback or omits art
without rejecting/retrying the clip; cancellation still cancels. The existing
closed illustration renderer is a fallback, never a forced replacement for
successful search. No additional AI request or Gemini
fallback. Both planners request varied source-faithful art; fresh manual/AI pictures
use None → Fade without changing saved/manual choices. No model-authored
commands, paths, URLs or SVG/HTML are executed. Existing
CL-165 supplies nine creative title-hook approaches and source-word evidence in
the same planning response, selecting one source-grounded headline rather than
requiring verbatim transcript copy. New wire copy is bounded to 80 characters;
legacy reference-only results remain decodable. Titles start at zero and retain
word/character-based reading time; evidence quality remains advisory. No extra
inference or guarantee of viral performance. Existing
focus compilation, caption grouping, revisions, Apply/Discard, retries, drafts
and native rendering remain authoritative. Explicit local caption generation
uses the same local speech path without a Gemini transfer. Fake caption and the
earlier explicitly labelled local Gemini caption exception remain in fake mode
only when Gemini is selected. Codex selection blocks every Gemini path and never
falls back, including when Codex prerequisites are unavailable.

Windows x64 setup: `corepack pnpm local:prepare:speech` and
`corepack pnpm local:prepare:speakers`, installed Codex CLI with
ChatGPT `codex login`, then normal backend restart. Prepare command checks pinned
binary/DLL/model hashes and preserves license files under ignored local tooling;
startup never downloads or signs in. Other operating systems need an explicitly
reviewed speech build, rather than accepting arbitrary paths. This workstation's
free tools are prepared and hash-verified. The owner confirmed basic real Codex
flow after CL-148; new ASR/diarization/camera/editorial/visual quality and a clean-
machine setup remain owner acceptance, not inferred from mocks.

Each Codex call has a private owned temporary cwd, fixed JSON schema, content on
stdin and fixed absolute admitted images. Use saved ChatGPT login with a status
check; no login/logout or account modification. No shell execution, browser,
MCP/apps, skills/hooks, subagents or file editing tools. Web search is enabled
only for the separate generic-brief discovery request described above. Read-only
sandbox, isolated environment, bounded stdout/result/stderr, deadline/abort and
tree-aware cleanup. Keep prompts/media/raw provider output out of normal logs
and Git. No automatic retry or provider fallback. Failures keep completed media
and permit explicit retry through normal controls. Readiness never infers.

## Verification

Fake/paid-off/no-key tests must cover provider selection (local vs hosted),
ChatGPT-only auth, safe process flags/environment, closed input/schema, response
size, cancellation/timeouts and cleanup. Exercise real authenticated browser
actions with injected Codex/Parakeet results and actual synthetic native media,
including moments, captions, focus, export, restore and error recovery. Count
fake invocations and prove zero Gemini/image-generation calls in Codex mode.
Run focused types/lint/format, source/diff validate, then refresh normal worker
with verified lifecycle ownership. Do not run owner's real clip, real Codex
inference, Gemini or a hosted deployment to claim readiness. Document actual
prerequisites, checks and remaining listening/visual/ASR/live/device/rights gates.
## Source-cut timing follow-up — CL-213

The local frame-preparation job now runs one bounded FFmpeg scdet pass at
160×90 on the prepared preview's 30-fps source clock. A one-second preroll plus
absolute timestamps avoids decoding preceding hours while preserving cut phase,
VFR and nonzero container starts. Metadata stays bounded to 2 MiB/180 seconds;
up to 600 numeric candidates are transient artifact data, never new saved media
or a frame-by-frame face model. Suppress adjacent high-difference flash evidence.
Low-contrast/fade correctness and real speaker associations remain uncertain.

The same planning request receives those numeric source cuts and exact-boundary
instructions. Contact sheets share their existing targeted slots between scene
and speaker transitions, retaining the original image allowance and at least
half uniform coverage. The automatic refinement matches unambiguous resets
within thirty logical frames, moves equal observation/decision endpoints, and
preserves geometry/IDs/evidence. It skips manual plans, ordinary speech switches,
colliding candidates or any intervening clock. Legacy artifacts without cuts
keep their previous behavior. Gemini/hosted and Parakeet are unchanged.

No automatic existing-plan migration or new inference/retry occurs. The reported
Clip 1 boundary was repaired through the existing validate/edit API after the
owner confirmed no unsaved draft; all other clip/panel/media state was retained.
Fake/no-key tests establish plumbing and generated cut clocks, not real AI face
accuracy. See [CL-213](../tickets/CL-213-source-cut-accurate-codex-cameras.md).

## Real speaker/reframe correction — CL-218

Temporal planning now supplies four panels in a two-by-two reading-order grid
at 0/0.5/1/1.5 seconds, with clone padding bounded by the selected clip. Numeric
sampleFrames remain the coordinate authority; legacy three-panel/single-frame
artifacts remain readable. Targeted source/speaker changes occupy the second
panel without increasing image or inference counts. The wider temporal context
and square sheet preserve more useful face detail than the previous triptych.

Local audio clusters can collapse short turns by different people. Strong
visual-only evidence at a shot opening may cite already labeled words while
leaving the decision's speakerId null. It never changes transcript labels or
merges people through that null association. Confidence, sustained speech,
intersecting words, visibility and cross-talk checks remain. An uncertain opening
with multiple visible people does not select the first roster entry; an
established still-visible person or a sole visible person can remain the fallback.

A late tracking loss no longer discards previously verified Motion in that
camera family. Retain an escaping verified prefix with the existing lost outcome,
end on its last measured sample and skip dependent chunks. No invented coordinates,
extrapolation, automatic retry or tracking on restore/export. Current-source native
and fake integration proofs precede the explicitly requested bounded real test;
see CL-218 for measured evidence and remaining acceptance.

## Conditional native speaker follow — CL-216

Fresh provider preparation piggybacks focus evidence on its existing protected
clip-preview operation. The native worker reuses the prepared source and the
shared region-seeded pixel tracker, storing complete numeric camera families
only if the chosen head escapes the fixed crop. A bounded unique recent-pixel
match can recover a layout translation; missing/ambiguous heads retain the
usable baseline. This adds no model, ASR work, provider call or retry. Local
Codex/hosted Gemini selection and existing plan/image counts remain unchanged.

Body paths attach only to the initial edit and cache against exact source/cut/
focus. Existing clips, restore, reopen and export never start tracking. New
paths use an editable Follow window (default 30%) to hold small movements still;
legacy paths retain their stored behavior until edited. Numeric framing and
interval policy lives in contracts; the pure pixel algorithm lives in composition
for browser/native reuse. Hook/body cuts, manual Zoom conflicts and final export
resolution/cadence keep their existing contracts.

At most twenty thirty-second intervals sample every two logical frames, with
512px maximum analysis size, a sixty-second pixel deadline and bounded frame
buffers. Adaptive resolution bounds gray scratch to 192 MiB and the remaining
existing clip reservation. Compact interval expressions avoid command-size and
short-clip cutoffs. Tests cover full five-minute resource planning and a native
72-second late shift. Normal fake preparation skips the pass; generated fake/
no-key native and injected API proofs establish mechanics, not real AI/head
quality or hosted release acceptance. CL-216 owns actual timing/evidence.
