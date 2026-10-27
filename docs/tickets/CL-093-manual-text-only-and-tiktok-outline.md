# CL-093 — manual text only and TikTok outline 12

Owner decision (2026-10-27): reverse CL-087's automatic top title. Never insert
independent Text by default in fake, real local or hosted composition. Owners
add Text explicitly. TikTok typography should default to outline width 12 for
both manual Text and captions; retain the existing adjustable 0–12 control.

Depends on CL-086/087 and locally validated CL-092. Preserve the pending CL-091
and CL-092 work. This ticket authorizes implementation/verification only, with
no staging/commit, configuration inspection/change, real media, provider calls,
cloud/deployment or removal of owner-saved data.

## Plan and file allocation

- `packages/contracts/local/text-style.ts`: set the shared TikTok preset to 12
  and expose one effective-outline helper for renderer and inspector fallback.
  `packages/composition/local/text-paint.ts` and frontend `typography-fields.tsx`
  consume it; preserve explicit saved/custom values and other presets.
- Backend `local/clip-batch.ts`: remove unconditional title layer creation and
  title preparation/fallback. New bases have no Text layers in either AI mode;
  retained completed bases/edits stay unchanged. Do not change captions, camera,
  pictures/fades, loading stages, preview/export/retry or paid boundaries.
- Backend `local/provider-ai.ts`, `fake-clips.ts`, `server.ts`: retire the title
  prompt/schema/cache/accessor and adapter port. Remove the exclusively used
  `clip-title.ts` and its tests. Ignore unsolicited title data without rejecting
  usable picture/focus output. Keep the bounded optional preparation title field
  in contracts solely to decode legacy saved partial work; never synthesize a
  layer from it. Manual Text schemas/defaults and saved text remain supported.
- Update focused batch/provider/typography regressions and the hosted proof's
  obsolete title expectation. Verify new fake/provider-shaped clips, interrupted
  legacy-title retry, exact injected call counts and explicit/saved text behavior.
- Update the source of truth/index and mark CL-087's title portion superseded.

## Checks and handoff

Use hardcoded fake/paid-off, env-file/network-guarded synthetic checks only.
Run affected local cases, the settled local suite, appropriate contracts/local/
frontend/test types and affected lint/format. Current-source synthetic Text
browser/native proof verifies manual Add text, preset defaults, saved styles,
preview/export parity and old/new backgrounds; the shared batch tests cover
both composition modes and legacy retry without a new AI attempt.
Use execute/read-only validate/fix until no actionable issue remains. Build
contracts and refresh the normal backend/internal worker with verified process
ownership, preserving frontend/configuration/media. Confirm GET readiness and
fake/cloud-off capabilities. No live processing or personal acceptance claim.

Text styling/editing/native processing need no provider key in fake mode.
Real Gemini analysis/planning/captions/pictures still require configured keys,
live flags, approvals and owner action. Removing automatic titles adds no call.

## Status

Implemented and locally validated, 2026-10-27. Removed the title port, prompt
field/instructions, cache accessor, fake return, normalizer/fallback module and
unconditional base-layer construction. All new base overlays have `texts: []`.
Optional legacy preparation titles remain decodable but are never used to build
Text. Existing completed bases/edits and explicit Add text stay supported.

Shared TikTok default is 12; one browser-safe effective-outline helper supplies
the same fallback to inspector and shared preview/native paint. Explicit saved
widths (including 0 and 5), other typography presets and the 0–12 control remain.

Evidence:

- Focused batch/provider/typography checks: 67 cases passed. Synthetic and
  provider-shaped preparation/retry both produce no Text, even with a legacy
  title in retained preparation. Exactly one injected plan, zero images and two
  previews across the initial/retained-plan retry; no added AI call. Existing
  caption/fade/stage/preview-retry coverage passes. Unsolicited valid/malformed
  title output is ignored while usable pictures/focus survive one injected
  request. Outline inspector/caption/Text agree for implicit 12 and explicit
  0/5/12 widths.
- Settled local suite: 63 files, 614 cases passed, with fake/paid-off/environment
  and external-network guards. Removing the retired title-only test accounts
  for the file-count decrease; replacement cases cover the changed behavior.
- `pnpm build:contracts`, `pnpm local:typecheck`, frontend and test TypeScript
  checks passed. Affected ESLint/Prettier and `git diff --check` passed.
- Current-source synthetic browser/native: `test/local-text.proof.ts` (three
  cases) and `test/owner-hosted-editor.proof.ts` (one case) all passed. Manual Add
  text shows TikTok/outline 12; existing save/reopen, Apply/Discard, gestures,
  timing, phone/laptop controls, native backgrounds, sliding animation and exact
  frame boundaries remain covered. Hosted-shaped upload/preparation asserts no
  automatic Text and retains editing/native re-export without paid calls.
  Inspected `.local-build/evidence/cl086-native-tiktok.png` from this run.
  Proof scratch/process/browser/server cleanup completed.
- Read-only validate reviewed the CL-093 diff, removed title modules, remaining
  legacy-reader field, shared outline fallback, tests and direct callers.
  No actionable findings. CL-091/092 changes remain separate in scope and intact.
  No extra schema, dead title port/reference, default title fallback, unsafe
  cast, dependency-direction change, content log or paid dispatch was introduced.

Normal runtime: captured ten backend-owned identities and verified shutdown,
released 4000/4200 through two stabilization checks; normal hidden
`pnpm dev:backend` rebuilt/reloaded the current native worker/overlay. Backend
PID 18024/4000, worker 21348/4200, supervisor 10016; frontend PID 14564/3000 was
preserved. GET health, /start, config and capabilities return 200. Mode is fake /
synthetic-ai, cloud false, live analysis/assembly/render all false. No ignored
configuration read/edit or normal media/provider request was used to verify it.

App: `http://localhost:3000/start`. Ownership record:
`C:\Users\minat\AppData\Local\Temp\clipbuilder-run-20261026\runtime.json`.
Backend logs:
`C:\Users\minat\AppData\Local\Temp\clipbuilder-run-20261026\backend-20261027-114342.stdout.log`
and
`C:\Users\minat\AppData\Local\Temp\clipbuilder-run-20261026\backend-20261027-114342.stderr.log`.

No deviations. Personal visual, real-provider/real-media and hosted deployment
acceptance remain owner-only and unclaimed. All evidence is synthetic; no paid,
cloud, deployment, configuration or Git mutation. Changes remain unstaged and
uncommitted with prior CL-091/092 work preserved.

## Subsequent local commit approval — 2026-10-27

The owner approved a file-level plan and local staging/commit of the pending
CL-091–094 follow-ups. [Whole-file allocation](../operations/CL091_094_COMMIT_PLAN.md)
owns the 36-file combined commit. Prior unstaged/no-commit notes above describe
the original implementation handoff and are superseded only for this approved
local Git action. Verification and all remaining owner-only gates are unchanged;
no push, deployment, provider/cloud or configuration action is authorized.
