# Local Codex provider — CL-135

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

Latest owner parity revision CL-150 replaces the original unassigned-speaker
limitation below with pinned local CPU Sherpa-ONNX v2.0.1, pyannote segmentation
3.0 and NeMo TitaNet-small speaker embeddings. Only anonymous within-source turns
are retained; voice embeddings stay in the native process and are never saved
or sent. Align word overlap conservatively, keeping overlap/unknown neutral.
Codex receives the timed labels and up to sixty JPEGs, each containing three
5-fps temporal panels (0/0.2/0.4 seconds). CL-152 retains the existing per-duration
image count and reserves at most half its slots for known speaker changes,
anchoring bursts 0.2 seconds before selected transitions. At least half retain
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
subscription route. Pair Codex with local CPU Whisper transcription and bounded
JPEG frames. The app automatically extracts these inputs; the owner does not
need to show the video in chat or copy moments back. No whole original video or
audio goes to Codex. Transcript and sampled frames are sent only by an explicit
local processing action. Existing exports still use original source quality.

Use [whisper.cpp](https://github.com/ggml-org/whisper.cpp/releases/tag/b5454)'s
official b5454 CPU binary (current v1.9.5 line; stable tags have no Windows assets) and
the multilingual small model (roughly 466 MiB), preserving source language,
with bounded word timestamps. Both projects provide MIT-licensed components;
retain exact licenses with ignored tooling. Pin official binary/model digests,
reject links/changed files, and provide explicit preparation outside startup.
The AFK request authorizes preparing these free local prerequisites from official
sources; no provider calls, cloud resources or owner-media inference are included.
If preparation cannot be verified, expose unavailable setup and record it.

Whisper supplies words/timing; CL-150's separate local diarizer supplies anonymous
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
providers and cannot launch Codex/Whisper inference. Normal local real mode uses
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
runs pinned Whisper, returning bounded words with stable IDs. CL-169 defers
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
actions with injected Codex/Whisper results and actual synthetic native media,
including moments, captions, focus, export, restore and error recovery. Count
fake invocations and prove zero Gemini/image-generation calls in Codex mode.
Run focused types/lint/format, source/diff validate, then refresh normal worker
with verified lifecycle ownership. Do not run owner's real clip, real Codex
inference, Gemini or a hosted deployment to claim readiness. Document actual
prerequisites, checks and remaining listening/visual/ASR/live/device/rights gates.
