# CL-148 — diagnose Codex result protocol failure

Status: implemented and offline/fake validated; owner fresh real-flow acceptance
pending. Plan recorded before implementation. Dependency-ready after CL-147.

The owner's next real Find moments attempt completed local transcription, then
failed about 25 seconds later with codex_response_invalid. Current diagnostics
do not distinguish a failed CLI turn, unexpected item, malformed event or
unsafe/missing output. Do not infer sign-in/quota trouble or request a blind retry.

Use installed CLI metadata, official protocol sources and synthetic transports
only. A temporary loopback fake Responses endpoint may exercise the actual CLI
with an empty isolated CODEX_HOME, no credentials, no external provider and a
synthetic schema/prompt/result. Record only synthetic data and static event/tool
types. Never inspect owner prompts/transcripts/auth files/raw provider bodies.
Do not trigger inference, automatic retry, real-media processing or deployment.

Initial whole-file allocation: backend local/codex-exec.ts and its tests for
confirmed protocol compatibility and closed content-free failure classification;
contracts local/diagnostics.ts and diagnostic tests only if safe phase reasons
are necessary; frontend codex-errors.ts and its tests only for actionable closed
errors; architecture/LOCAL_CODEX_AI.md and tickets/README.md for evidence. Add a
focused synthetic installed-CLI proof only if it establishes a reproducible bug;
extend this allocation before adding another implementation owner.

Keep the running backend untouched while investigating so its completed cached
transcription remains available. Owner previously declined a draft checkpoint;
create none. Before changing watched modules, account for reload/cache loss and
use the normal verified lifecycle. Preserve all saved/retained media and CL-146/147
changes. No staging, commit, push, credential/configuration change or cloud call.

Validate regressions with exact synthetic process calls, unsafe tool/file refusal,
deadline/cancel/cleanup and closed diagnostic privacy. Run focused tests and
scoped types/lint/format plus read-only review. Mocks and loopback CLI execution
do not prove subscription entitlement, real AI quality or owner acceptance.

Confirmed reproduction before code: installed CLI, exact app defaults and disabled
tools, an isolated empty home, blocked external proxy and one loopback fake
Responses request return item.completed/error for the disabled Code Mode host,
then an agent_message and turn.completed with valid synthetic JSON. No tools
were advertised, authentication header was absent. Current adapter rejects that
non-fatal warning as an unauthorized item. Official exec protocol source labels
ErrorItem non-fatal and emits configuration warnings this way; fatal error and
turn.failed are separate events. Accept only completed warning items alongside
normal completion and safe bounded output; continue refusing tools at every
item lifecycle phase. No diagnostics contract or UI changes are needed.

The temporary loopback proof stays outside Git and will be removed after the
fixed run. Regression tests reproduce this static event shape with synthetic
messages; never retain owner output. Owner's stated preference remains a fresh
real flow without a checkpoint. A normal backend refresh after the fix may clear
the current in-memory session/cache; do not trigger the owner's next attempt.

## Evidence — 2026-10-29

The exact-default installed-CLI loopback proof failed before the parser change
with codex_response_invalid and passes afterward. One synthetic POST /responses,
no Authorization header, no advertised tools, structured output enabled. Its
event sequence is thread.started, completed non-fatal error item, turn.started,
completed agent message and turn.completed. The warning concerns the deliberately
disabled Code Mode host. This is not evidence of a failed model turn. The owner's
prior raw response was already cleaned up; no claim that it was inspected or
recovered. See official [non-fatal item definition](https://github.com/openai/codex/blob/main/codex-rs/exec/src/exec_events.rs)
and [warning mapping](https://github.com/openai/codex/blob/main/codex-rs/exec/src/event_processor_with_jsonl_output.rs).

Changed implementation files: backend local/codex-exec.ts and its test. Only
completed error items are admitted as warnings; top-level error/turn.failed
remain fatal. Every started/updated/completed item must have a string type and
be a response/reasoning item or the completed warning. Unknown/tool/malformed
items fail, even with an otherwise valid result. Turn completion, bounded regular
single-link result, cancellation and private scratch cleanup remain required.
No schema/UI/configuration/provider retry changes. Documentation updated in this
packet, ticket index and architecture/LOCAL_CODEX_AI.md. CL-146/147 are preserved.

New regressions first produced four expected failures (warning rejection plus
missed updated/malformed-item guards). Final three focused files / sixteen tests
pass: codex-exec.test.ts, codex-artifact.test.ts and codex-composition.test.ts.
They cover ChatGPT-only preflight, no inherited keys/fallback, safe result cleanup,
fatal/tool/malformed-event refusal, warning without completion and native child
output/cancellation cleanup. Local TypeScript, scoped ESLint, Prettier and
git diff --check pass. The temporary synthetic CLI script and all its isolated
homes were removed; no proof listeners or child processes are retained.

Read-only validation verdict: Meets ticket for the reproduced protocol bug;
no actionable findings. Reviewed event distinctions, privacy, fixed auth/tool/
retry boundaries, bounded output and cleanup. No new dependencies or cross-app
imports, raw-content logging, automatic retry, debugger/session extraction or
checkpoint. Prior standalone transcript remains in memory only until reload;
owner's fresh-flow/no-checkpoint preference is preserved.

Normal backend/worker refreshed after verified shutdown of eleven owned process
identities; frontend 5152 / 3000 preserved. Supervisor 7824, backend 20152 / 4000,
worker 23544 / 4200. Health, /start and /api/sample/config returned 200. Final
capability GET reports provider-ai / codex / ready after discovery succeeded.
Runtime record plus separate backend.stdout.log/backend.stderr.log are in
C:/Users/minat/AppData/Local/Temp/clipbuilder-codex-result-fix-20261029-cl148/.
The temporary session/cache cleared on reload; saved/retained media preserved.

Agent verification used only fake/paid-off synthetic calls and a loopback fake
provider, with no keys or actual ASR/model inference. Normal owner real mode
requires prepared local speech, saved ChatGPT login and explicit owner UI actions;
the app continues to reuse that login. Real subscription/output/ASR/editorial
quality and fresh owner acceptance remain unverified. No Gemini/provider/cloud
call, staging, commit, push or deployment was performed.
