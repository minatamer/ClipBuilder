# CL-172 — Local Find all moments

Status: Implemented and validated locally; real-provider owner acceptance remains open. Depends on implemented CL-085, CL-158 and CL-169–171.

## Owner request and decision

On 2026-10-31 the owner requests a local-only way to let AI find as many
worthwhile moments as it can without choosing a count. Add a Find all choice
beside the existing count field; the existing single footer action becomes
Find all moments. Keep duration controls, manual exclusions, review/removal and
explicit processing. This applies to either locally configured AI provider.
Hosted, including owner-exempt hosted sessions, must not expose or accept it.

## Scope and acceptance

- Preserve numeric requests/defaults and existing saved analyses. Represent all
  explicitly in the shared local contract, persist and restore that choice.
- Ask for every distinct strong grounded passage across the whole transcript,
  without a target quota or padding to a count. Use one selection request and
  existing verified full-source transcript reuse; no pagination, automatic
  retry, retranscription merely for a count change, or automatic processing.
- Remove the old ten-result/twenty-proposal ceilings for this mode throughout
  Codex/Gemini normalization, schemas, analysis and recovery. Retain a fixed
  resource ceiling of 360 moments (one-hour source / ten-second minimum), plus
  ten manual proposal slots. This is a safety ceiling, never a requested quota.
  Numeric mode retains its existing bounds; public defaults remain unchanged.
- Keep all returned usable results within that resource ceiling reviewable.
  Existing ten-clip preparation capacity remains explicit in review; owners
  remove extras before Process clips. No editorial quality veto or new retry.
- Local-only UI and server gate, including forged hosted requests before any
  transcription/selection dispatch. Shared styled controls and one footer CTA;
  keyboard, narrow layout, loading/cancel/error and restored choice stay usable.

## Verification and gates

Use synthetic/fake/paid-off/network-blocked checks with no ignored environment
reads, credentials, real media or provider requests. Cover >20 proposals/results,
both injected provider adapters, numeric compatibility, empty output, transcript
reuse, cancellation, serialization/recovery and hosted rejection with zero AI
calls. Exercise actual browser controls at desktop/phone, review capacity,
keyboard and restoration using the synthetic fixture. Run scoped types, lint,
format and relevant tests, then a read-only validate pass. Refresh the normal
internal worker after contract changes using verified ownership; preserve the
owner session/media/configuration and leave normal apps healthy.

Fake mode works without keys and produces fictional fixture moments; it cannot
prove real selection completeness or quality. Real Codex needs installed CLI,
sign-in and local speech prerequisites; real Gemini needs its API key and
existing live approvals. Owner real-provider acceptance remains unchecked.
No paid/provider/download/cloud/configuration/deployment/Git action is authorized.

## Evidence

Implemented the local AI-icon Find all checkbox beside Clips. It disables the
numeric field and changes the single footer CTA to Find all moments, retaining
the duration controls. Completed analyses restore the choice. No count-shortfall
message is shown for all mode. Local capability gates the UI; `options.hosted`
rejects `aiCount: "all"` before the demo limiter or any AI call, including hosted
owner exemptions. Numeric/default requests and hosted allowances are preserved.

Both local provider adapters pass exhaustive instructions with no numeric
target. The larger resource ceiling is carried through Codex response schema,
shared normalization/diagnostic bounds, analysis and retained documents. The
analysis response keeps at most 360 suggestions; proposal normalization permits
ten additional manual slots. Public callers retain their existing default.
This is one bounded inference, not a guarantee that every conceivable passage
will be found; model output/token/deadline limits and editorial judgment remain.
No provider model, output-token policy or retry count changed.

Verification (hardcoded fake/paid-off/no-key/network-blocked setup before imports;
no ignored environment reads or real media/provider/cloud requests):

- **142 scoped cases pass** across local analysis, Codex/Gemini adapters, hosted
  workflow, recovery/server recovery, demo usage and Codex contracts. A fictional
  fifteen-minute transcript yields 30 moments, including the final section.
  Switching from numeric to all reuses the transcript with one new selection;
  both provider-shaped doubles retain 30 proposals in one call. Empty output,
  pre-dispatch cancellation, numeric bounds, 360-result bounds, serialization,
  filesystem recovery and zero-call hosted rejection/exemption pass.
- **151 existing source-analysis cases pass**, preserving public numeric/default
  selection, normalization and transcribed-analysis behavior.
- **Current-source synthetic Chrome proof passes**: native keyboard Space toggles
  Find all; actual request body uses all; 32 fixture cards remain reviewable and
  disable processing over ten; no automatic processing. Choice survives reload,
  loading disables fields, explicit cancel returns control, failure permits
  explicit retry, and hosted owner-exempt UI omits Find all. Existing source jump,
  removal, empty review and explicit processing checks also pass. Generated native
  source bytes are synthetic. Browser/server/process/scratch cleanup completes.
- Captures at **1440, 390 and 320px** were inspected. Controls wrap at 320px;
  no horizontal overflow, single visible footer CTA and shared blue design.
  Evidence: `.local-build/evidence/cl172-find-all-{1440,390,320}.png` (ignored).
- Contract/local/backend/frontend/root-test TypeScript, scoped ESLint/Prettier,
  contracts build and whitespace checks pass. Corepack initially missed its
  cached home; the pinned 11.19.0 cache was selected without installation. The
  sandbox module cache prevented the first Vitest import; supported escalation
  ran the same isolated test setup. One old normalizer-bound assertion was
  updated from 21 to 371; the first browser proof needed to await the existing
  parent footer update. Both settled reruns pass.

Read-only validate: **Meets ticket locally; no actionable findings.** Reviewed
the CL-172 changes through contract/request, both adapter prompts/normalization,
hosted gate, result/recovery, review/processing, UI and exact call/resource bounds.
Checked dependency direction, dead code/flags, private-content logging and
request/timer/process/temp cleanup. Earlier CL-168–171 work is preserved and
excluded from the new implementation claim. Scope deviations: none.

Normal runtime refresh: the verified nine-process backend tree was stopped and
its ports/identities checked absent before replacement. Normal startup rebuilt
contracts and the internal worker/overlay without configuration changes.
Frontend **4968/3000** is preserved; new supervisor **20024**, API **2584/4000**,
worker **12204/4200** are ownership-verified. Health, `/start` and
`/api/sample/config` return 200. One completed owner clip recovered; no job is
active and no processing endpoint was invoked. App: `http://localhost:3000/start`.
Content-free ownership record and logs:

- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl172-app-58d0839237564f288a1824d49d2836a9\backend.runtime.json`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl172-app-58d0839237564f288a1824d49d2836a9\backend.stdout.log`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl172-app-58d0839237564f288a1824d49d2836a9\backend.stderr.log`

Changed surfaces: `packages/contracts/local/{policy,selection,hosted-editing,codex}.ts`;
backend `local/{analysis,fake-analysis,selection-policy,codex-ai,provider-ai,server}.ts`
and `src/analysis/{analysis.prompt,analysis.provider-shape}.ts`; frontend
`selection-panel.tsx`; focused tests in `analysis`, `codex-ai`, `provider-ai`,
`hosted-workflow`, `session-recovery` and `test/local-moment-cards.proof.ts`;
this packet, ticket index and source-of-truth decision.

Owner real Codex/Gemini selection quality/completeness, personal visual acceptance
and actual hosted/release checks remain unchecked. Fake results prove mechanics
only; real prerequisite/approval boundaries above remain. No paid AI, real
downloads, configuration edits, cloud actions or deployment occurred. Changes
remain unstaged/uncommitted alongside the preserved earlier tickets; no Git
mutation was authorized or performed.
