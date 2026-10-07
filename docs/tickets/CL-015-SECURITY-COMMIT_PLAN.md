# CL-015-prefixed security commit plan — 2026-10-07

Owner authorization: after clean local validation, create a file-level plan, stage and commit the security packet. Retain the deployment-ticket prefix on every subject. No push, branch/history rewrite or deployment is authorized. Baseline: `5ef509fd2b027e9f085fb3e78739a7bc245aabd0`. The index was empty.

CL-012 owns implementation. All five root gates pass; 1,240 fake/no-key tests in 106 files pass. Final local validation has no new actionable finding after the independently reproduced late-Exit and image-context fixes. Existing private diagnostics and generic visitor errors remain. Cloud/native/owner-only evidence and paused traffic are not converted into passes by these commits. Current code-input SHA-256 is `0c73b047963fbdf2a39f17320eb831bf5450f98eaf1edb5819d2f5bc769be7d4`.

Stage whole files in this order, compare the exact staged list before each commit, and verify the committed whole-file list afterwards. No ignored env, owner media/captures/replay, tool cache or private logs belongs in any group. Each commit is a logical part of the one approved packet; the final combined source is the validated snapshot.

## 1. CL-015: verify session starts before grant allocation

- `apps/backend/src/admission/processing.admission.test.ts`
- `apps/backend/src/admission/processing.admission.ts`
- `apps/backend/src/admission/turnstile.verifier.test.ts`
- `apps/backend/src/analysis/analysis.test.ts`
- `apps/backend/src/http/routes/admission.route.ts`
- `apps/backend/src/http/routes/analysis.route.ts`
- `apps/frontend/src/features/sample/sample.experience.tsx`
- `apps/frontend/src/features/source-analysis/analysis-challenge.tsx`
- `apps/frontend/src/features/source-analysis/sample-replay.flow.test.ts`
- `apps/frontend/src/features/source-analysis/sample-replay.flow.ts`
- `apps/frontend/src/features/source-analysis/session-start.ts`
- `apps/frontend/src/features/source-analysis/source-analysis.api.ts`
- `apps/frontend/src/features/source-analysis/source-analysis.flow.test.ts`
- `apps/frontend/src/features/source-analysis/source-analysis.flow.ts`
- `packages/contracts/src/admission.schema.ts`

## 2. CL-015: bound media delivery and fence late session revocation

- `apps/backend/src/analysis/analysis.composition.ts`
- `apps/backend/src/assembly/selected-focus.test.ts`
- `apps/backend/src/media/artifact-stream.test.ts`
- `apps/backend/src/media/artifact-stream.ts`
- `apps/backend/src/media/delivery-allowance.test.ts`
- `apps/backend/src/media/delivery-allowance.ts`
- `apps/backend/src/media/output-delivery.ts`
- `apps/backend/src/media/preview-playback.ts`
- `apps/backend/src/render/final-render.usecase.ts`

## 3. CL-015: pin patched browser tooling and compatible security updates

- `apps/frontend/package.json`
- `apps/renderer/package.json`
- `apps/renderer/scripts/browser-tooling.test.ts`
- `apps/renderer/scripts/browser-tooling.ts`
- `apps/renderer/scripts/build-context.test.ts`
- `apps/renderer/scripts/build-context.ts`
- `apps/renderer/scripts/prepare-browser.ts`
- `apps/renderer/scripts/stage-tools.ts`
- `package.json`
- `packages/composition/package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`

## 4. CL-015: document security decisions validation and release gates

- `apps/backend/README.md`
- `apps/frontend/README.md`
- `apps/renderer/README.md`
- `docs/CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`
- `docs/operations/COST_MODEL.md`
- `docs/operations/SECURITY_PRIVACY_CONTROLS.md`
- `docs/operations/STRIDE_SECURITY_AUDIT_2026-10-07.md`
- `docs/operations/STRIDE_SECURITY_EVIDENCE_2026-10-07.json`
- `docs/operations/STRIDE_SECURITY_INPUTS_2026-10-07.json`
- `docs/operations/STRIDE_SECURITY_PLAN_2026-10-07.md`
- `docs/operations/STRIDE_SECURITY_REMEDIATION_2026-10-07.md`
- `docs/operations/STRIDE_SECURITY_REMEDIATION_EVIDENCE_2026-10-07.json`
- `docs/operations/STRIDE_SECURITY_REMEDIATION_INPUTS_2026-10-07.json`
- `docs/operations/STRIDE_SECURITY_REVIEW_2026-10-07.html`
- `docs/tickets/CL-012-harden-security-privacy-abuse-and-spend.md`
- `docs/tickets/CL-015-SECURITY-COMMIT_PLAN.md`
- `docs/tickets/CL-015-deploy-validate-measure-and-rollback.md`
- `docs/tickets/README.md`

## Execution evidence

Implementation commit identities will be recorded below before the final documentation commit. The final documentation commit is identified by its exact subject above; it cannot contain its own hash. Verify the final index is empty and the worktree is clean. The later owner authorization allows read-only authenticated gcloud inspection after the local packet; it does not authorize cloud mutation/build/deploy or paid testing.

Implementation commits (exact inventories checked):

- `4ca9a5d33b38fcffeba9a19e890cc5e0b3187f64` — CL-015: verify session starts before grant allocation (15 files)
- `34f8246db954ca2f0fa5e7d8d1b2ae042a99191b` — CL-015: bound media delivery and fence late session revocation (9 files)
- `06dd2a28fb0b63ae982cc950ab913d9e0a15adb2` — CL-015: pin patched browser tooling and compatible security updates (12 files)

After all local gates passed, the owner-authorized read-only CLI phase verified
the actual app's configured USD 5 monthly Cloud Run spend cap and selected
private renderer IAM/capacity, enabled independent expiry and disposable-bucket
metadata. The final documentation group includes those content-free receipts;
no cloud resource, service invocation or paid flow was changed/run. Traffic stays
paused. Current Gemini key/project correspondence, whole-flow spend and exact
patched image/native/private-rollout acceptance retain their separate gates.
