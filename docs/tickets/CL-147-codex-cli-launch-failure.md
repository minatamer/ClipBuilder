# CL-147 — diagnose and fix Codex CLI launch failure

Status: implemented and offline/fake validated; owner fresh real-flow check
pending. Plan recorded before code, dependency-ready after CL-146.
Owner's first Find moments run completed local speech/validation, then exited
the Codex process almost immediately with codex_process_failed. The UI maps that
generic exit to sign-in/allowance without evidence. Do not retry AI automatically.

Use only redacted diagnostic events, installed CLI help/local feature validation
and synthetic fake/paid-off transports. Never read owner transcripts, prompts,
auth/config files or raw provider bodies into logs/tests/Git. No login change,
provider inference, spend, real-media rerun or cloud call is authorized.

Initial allocation: backend local/codex-exec.ts and tests for compatible fixed
flags and safe content-free failure classification; frontend codex-errors.ts and
tests if the generic message is misleading. Contracts local/codex.ts only if a
specific safe failure code is required. Before any lifecycle change, inspect
normal completed-transcription retention and use an existing safe local save
path if available. Extend allocation/document it first if retention needs a fix.
Preserve CL-146 changes, the healthy frontend and saved/retained owner media.

Validate with fake/injected process results, offline parser/config checks with
an empty temporary CLI configuration, scoped types/lint/format and read-only
review. Keep no tools, shell, MCP, hooks, automatic retries or Gemini fallback.
Document actual findings and owner-only live verification separately. No Git
action or deployment is part of this fix.

Confirmed offline: the installed CLI rejects the exact configured overrides
because model_providers includes reserved built-in ID openai. It exits during
bootstrap, explaining the immediate codex_process_failed after successful
transcription. The same fixed settings under clipbuilder_subscription are
accepted by a local feature-list probe with an empty config and no credentials.
Use that non-reserved ID for inference, preserving ChatGPT-only auth, isolation,
zero request/stream retries and no fallback. Login status can keep builtin openai.

The completed transcript is cached before selection in the running server's
transcripts map, so another explicit selection attempt can reuse it. Current
draft snapshots contain only completed analysis, not this standalone cache;
reloading watched backend code now would lose the cached transcription. Keep
the backend unchanged while preparing the fix. A durable normal local Save
requires owner opt-in (workspace-drafts.ts) and must use the cache without any
provider/ASR call before reloading. Do not silently repeat six minutes of ASR or
export private transcript content into diagnostics/tests.

Latest owner steering: declines a checkpoint and wants to verify the fresh real
flow. This supersedes the pending checkpoint: create no draft, and permit the
normal backend reload/restart to clear its in-memory session/transcript cache.
The owner will rerun the normal UI flow; agent verification remains offline or
fake/injected, with no provider request or real-media test. No retention code or
new contract reason is needed. Change the misleading process-failure message to
a neutral closed error; keep specific login and allowance messages for their
actual reason codes.

## Evidence — 2026-10-29

Owner-run diagnostics show speech input/validation completed in 377.3 seconds,
then Find moments failed about 0.43 seconds later with codex_process_failed.
No transcript, prompt, auth file or raw provider response was inspected. The
installed CLI's local feature-list command, using a new empty configuration and
no credentials, rejected the old exact configuration with reserved builtin
model-provider ID openai. The same fixed settings under clipbuilder_subscription
were accepted, exit zero. No inference or login was performed by either probe.

Inference now uses the non-reserved ID for its six fixed provider settings;
login-status preflight continues using builtin openai. ChatGPT-only auth, stdin
content, ephemeral/read-only/no-tool composition, cleared key/provider overrides,
zero request/stream retries and no Gemini fallback remain unchanged. The generic
process-failure UI now says the request could not complete; specific login and
allowance reason messages are preserved. No new public schema, mode or UI banner.

New regression assertions failed against the old provider settings and error
copy, then pass after the fix. Final four focused files / eight tests passed:
Codex process/auth/environment/output/cancellation cleanup, artifact and provider
composition, and closed frontend error mapping. Local/frontend TypeScript,
scoped ESLint, Prettier and whitespace checks pass. The three offline CLI probe
directories were strictly path/name/link-checked and removed. No retained media,
normal credentials/configuration or existing user saves were touched.

Owner explicitly declined a draft checkpoint to verify a fresh real flow. No
checkpoint was created. The normal backend reload/restart was allowed to clear
the previous in-memory session/transcription cache, so the next owner run will
transcribe again. Seven current backend identities were verified removed before
replacement; frontend 5152 / 3000 was preserved. New supervisor 16104, backend
25640 / 4000 and worker 26928 / 4200. Health, /start and /api/sample/config all
returned 200. Content-free runtime records and separate backend stdout/stderr
logs are under OS temp clipbuilder-codex-provider-fix-20261029-cl147.

Scoped read-only validation: Meets ticket for the confirmed local configuration
bug; no actionable findings. Reviewed fixed provider identity/auth/retry/tool
boundaries, error privacy, saved-media preservation and process cleanup. CL-146
changes are preserved and excluded from this fix's verdict. No automatic retry,
agent real-media processing, provider/ASR inference, cloud, staging/commit/push or
deployment. Actual live model/entitlement/output quality remains unverified until
the owner's explicit fresh UI attempt. No claim that offline mocks prove it.
