# CL-074 — Permanently remove footer mode/status identity

Status: implemented and locally validated; owner personal acceptance remains
manual.

Remove the footer's Fake AI label and disk icon, including its Connecting,
Gemini, Temporary session and AI unavailable variants. Remove their unused
import/styles. Keep Start over and all workflow actions, backend mode selection,
approvals, processing gates and useful task progress/errors unchanged.

Files: `experience.tsx`, `style.css`, owning source-of-truth/frontend guide and
ticket/index. This supersedes the earlier footer-mode identity design. No new
control, setting, schema, service, backend change, restart or environment edit.

Verification: inspect the removed branches, run affected types/lint/format and
the existing synthetic footer browser proof for desktop/phone/reset parity.
Do not add a test for this simple display removal. Final read-only validation
must have no actionable findings. Preserve all prior pending work and media;
no Git mutation, provider call or cloud change.

Fake mode continues working without API keys and uses synthetic AI data. Real
processing still requires owner keys, live flags and approvals; hiding the badge
does not enable providers. No local AI model is introduced. Owner personal visual
acceptance remains manual.

## Evidence and final validation — 2026-10-25

Removed the entire mode/status paragraph, HardDrive import and unused
`.local-mode-note` style. No alternate footer label remains in the component;
Start over and all action bindings are unchanged. Source of truth records the
permanent owner decision, and the local frontend guide supersedes its earlier
compact-mode-identity instruction. Existing CL-067–073 pending work is preserved.

The existing `test/local-start-over.proof.ts` passes in **22.44 seconds**, with
generated media, synthetic backend replies, fake/paid-off/no-network setup and
no env-file reads. Desktop and phone footer/dirty/reset checks, local/hosted
intake, failure/retry/discard and pending/active guards pass. Exact provider
counts remain 0/0/0 and there are no unexpected mutations. No new test was added
for this display removal. The refreshed 320px screenshot was inspected: badge/
icon absent, Start over and Apply/Discard visible, footer reachable.

Frontend TypeScript, affected ESLint, Prettier and `git diff --check` pass.
Final read-only verdict: **Meets ticket; no actionable findings**. Covered the
removed render branches/import/style, footer integration/responsiveness, owning
documentation, unchanged capability gates and cleanup. No provider/backend/
worker/schema/configuration changes, restart, Git mutation or product-scope
deviation. Tests closed their own browser/server/scratch; the owner's running
workspace and saved media were not reset or used as fixtures. No paid/live or
cloud verification was run.
