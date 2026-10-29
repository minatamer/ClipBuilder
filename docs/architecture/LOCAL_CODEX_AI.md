# Local Codex provider — CL-135

Owner AFK request, 2026-10-29: use the existing Codex subscription from normal
local ClipBuilder controls instead of Gemini; keep deployed Gemini unchanged.
Choose recommendations, plan/document/commit the plan, then execute/validate.
All preceding Media/audio and caption work is committed through `472479e`
under the plan committed first at `85563c8`; implementation starts clean.

## Supported integration and limits

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

Use [whisper.cpp](https://github.com/ggml-org/whisper.cpp/tree/v1.9.5) v1.9.5 and
the multilingual small model (roughly 466 MiB), preserving source language,
with bounded word timestamps. Both projects provide MIT-licensed components;
retain exact licenses with ignored tooling. Pin official binary/model digests,
reject links/changed files, and provide explicit preparation outside startup.
The AFK request authorizes preparing these free local prerequisites from official
sources; no provider calls, cloud resources or owner-media inference are included.
If preparation cannot be verified, expose unavailable setup and record it.

Whisper does not provide reliable anonymous speaker diarization here. Leave
unproven labels neutral; manual caption-level assignment remains available.
Codex can select moments and plan camera positions from transcript/frames, but
sampled stills do not establish audible-speaker association. Use conservative
uncertainty/held focus and allow normal manual correction. Real diarization,
camera/editorial and ASR accuracy remain owner-only acceptance. Image generation
is not supported through this route: keep contextual pictures manual in local
Codex mode, with no hidden Gemini generation or fabricated fixture art. Hosted
Gemini keeps its existing generated-picture behavior.

## Composition and flow

Keep the backend's single fake/real mode. Fake always uses existing fictional
providers and cannot launch Codex/Whisper inference. Normal local real mode uses
the Codex provider; hosted real mode continues using Gemini. No second app,
frontend mode toggle, accounts, chatbot, new credential or ignored-env migration.
The local capability response names the provider and setup availability; normal
selection/caption/editor controls use the existing authenticated routes.

An explicit local analysis prepares 16-kHz mono speech in the private worker,
runs pinned Whisper and returns bounded words with stable IDs. Codex receives
the admitted transcript and existing selection policy and returns structured
moment evidence. Selected-clip planning uses at most sixty bounded JPEG frames
sampled uniformly (at most one per second), upright source geometry and clipped
words; return bounded camera decisions, never commands/paths/URLs. Existing
focus compilation, caption grouping, revisions, Apply/Discard, retries, drafts
and native rendering remain authoritative. Explicit local caption generation
uses the same local speech path without a Gemini transfer. Fake caption and the
earlier explicitly labelled local Gemini caption exception remain in fake mode.

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
