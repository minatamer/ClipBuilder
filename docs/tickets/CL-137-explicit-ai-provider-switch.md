# CL-137 — explicit AI provider switch

Status: implemented and locally validated. Owner request 2026-10-29. Depends on locally validated
CL-135/136; preserve their uncommitted work. No new Git action authorized.

Implement `AI_PROVIDER=gemini|codex`, default Gemini. Codex is local-only;
hosted omits the setting and stays Gemini, and rejects an explicit Codex value.
Fake mode stays fictional/key-free. In local Codex selection, all Gemini paths,
including legacy sample/analysis and the fake-mode explicit caption exception,
must be unavailable with zero dispatches and no fallback. Local Gemini remains
available through the same normal controls/approvals when deliberately selected.
Codex keeps existing CLI ChatGPT auth/allowance and speech prerequisites.

Owner explicitly authorizes a secret-free edit of only `AI_PROVIDER=codex` in
`apps/backend/.env.local`; preserve every other byte/setting and never display
or inspect credentials/other values. No real inference, provider spend, cloud,
deployment, push or Git staging/commit. Leave fake/master switches unchanged.

File allocation: backend config `env.schema.ts`, `loadConfig.ts` and focused
tests; `.env.example`; local `runtime.ts`, provider/caption readiness/composition
and tests as needed; shared runtime metadata only for accurate provider/setup;
frontend local provider/setup/caption wording only if required. Deterministic
test environment owns a fixed provider value before imports. Narrow AGENTS
exception, SOT, local guides/design/index and this packet record the decision.
Readiness is inert. Validate fake/local-Gemini/local-Codex/hosted/default/invalid
cases with exact zero live dispatches, types/lint/format and scoped review.
Perform the authorized private edit after code checks; verified backend refresh
and safe capability GET confirm selection without inference.

- [x] Explicit default/local/hosted switch and complete Gemini isolation.
- [x] Fake/injected checks, types/lint/format and clean scoped validate.
- [x] Private selection changed safely; app healthy; no paid/live/deploy/Git action.

Evidence: 44 backend config checks and six local provider/readiness/composition
checks passed. Local Codex configurations with fake/master on or off expose no
Gemini credential, live feature, cloud renderer or legacy dispatch allowance;
spies prove zero Gemini/cloud composition calls and legacy analysis is 404.
Caption and normal Gemini readiness guards independently reject Codex even if
given a manually populated Gemini config. Default Gemini and invalid/hosted
Codex checks pass. Local/backend/frontend types and scoped lint/format passed.
Static dispatch review found Gemini credentials read only in parsed config.
Verdict: Meets ticket for local/fake verification; no actionable findings.

Only AI_PROVIDER in the ignored local backend file was set to codex with opaque
targeted editing; no other value was displayed or changed. Backend-only refresh
removed ten verified old identities, preserving frontend 15768. Startup supervisor
6832 / backend 25284 / worker 20716; health/start/config all 200. Safe local GET
confirms synthetic-ai, aiProvider=codex, captionProvider=local-speech and
captionGeneration=false. Runtime/logs: OS temp clipbuilder-provider-20261029-cl137.
No inference or normal-app processing action. Real Gemini/Codex quality, account
allowance, owner listening/devices/hosted/release stay unchecked. No staged diff
or commit. This closes CL-137 before CL-138 code begins.
