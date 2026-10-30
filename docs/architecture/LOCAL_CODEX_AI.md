# Local Codex provider — CL-135

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
diagram output for new plans with contextual image briefs and bounded Commons
retrieval. Real photos/illustrations can be used without a fixed card/diagram
template. Old saved assets and partial diagram plans remain usable; missing
optional lookup results do not fail/retry a clip. No hidden Gemini generation
or fabricated fixture art. Hosted Gemini keeps its existing generated pictures.

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

An explicit local analysis prepares 16-kHz mono speech in the private worker,
runs pinned Whisper plus local diarization and returns bounded words with stable
IDs and anonymous speaker labels. Codex receives
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
query back to those terms and deduplicates actual phrases. Raw plans remain
retained; no extra inference or editorial rejection is introduced. Then
try at most three distinct public lookups within one eight-second total deadline,
keeping one normalized asset and no extra inference. Per-lookup bounds are
256 KiB metadata, 4 MiB
download and a normalized JPEG at most 96 KiB / 920×520, with allowlisted hosts,
redirect rejection and existing CC0/public-domain admission. No transcript,
media or authentication is sent to lookup. Admitted assets are digest-verified
and marked retrieved. Fixed content-free diagnostic reasons distinguish missing
plan coverage, no match, lookup failure and final coverage shortfall. Failed
external retrieval omits art without rejecting/retrying the clip; cancellation
still cancels. New plans cannot request the legacy fixed icon/card renderer;
only retained old partial plans use it. No additional AI request or Gemini
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
MCP/apps, skills/hooks, subagents, web search or file editing tools. Read-only
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
