# CL-149 — grounded Codex moment titles

Status: implemented, fake/offline validated. Depends on CL-148; owner reports the
real flow now works but moment titles contain word IDs. Preserve all pending
CL-146–148 work; no Git action or paid inference is authorized.

Confirmed cause: ownerSelectionPolicy requests titleWordIds/hookWordIds, while
localCodexCandidatesSchema requests title/hook strings. Codex has no shared
reference-to-text normalization. Make the schema agree with the shared selection
policy and reuse normalizeCandidateSelection, as Gemini does. Never ask for a
paid retry merely to repair a usable reference. Keep existing duration, count,
advisory acceptance, auth/isolation and explicit processing rules.

Whole-file allocation: contracts/local/codex.ts; backend/local/codex-ai.ts;
new backend/local/codex-ai.test.ts; test/local-codex.proof.ts synthetic response;
architecture/LOCAL_CODEX_AI.md and tickets/README.md. No frontend or native change
is needed for selection-copy decoding. Verify schema/prompt agreement, real
transcript text from IDs, unavailable references and exact fake inference counts;
run focused fake/paid-off tests and scoped static/format/review checks.

The same owner request also covers speakers/camera and text/visuals; execute
CL-150 then CL-151 after this packet, without dropping those requirements.
Keep normal app refresh until the sequential source edits settle. No checkpoint,
owner-media inference, new login/configuration change, provider/cloud request,
deployment, staging/commit/push. Real AI quality remains owner acceptance.

Evidence: Codex schema now requests titleWordIds/hookWordIds and reference-only
evidence/caveats matching the shared prompt. Backend reuses Gemini's bounded
normalizer and content-free normalization diagnostics. The synthetic browser
proof response now follows that wire contract. Two focused files / three tests
pass, including missing references falling back to spoken text without another
inference (one fake call, zero media calls). Local TypeScript, scoped ESLint,
Prettier and whitespace pass. Read-only review: Meets ticket, no actionable
findings; schema/prompt agreement and no retry/privacy regressions confirmed.
Old completed owner results are not silently rewritten or reprocessed. Actual
new-model editorial/title quality remains owner-only. Continue with CL-150.
