# CL-151 — Codex text and contextual visuals

Status: implemented and fake/browser/native validated; owner real quality open.
Depends on CL-150 (fake/native/static validation passed).
Plan recorded before implementation.

Owner requests the same editor outcomes through Codex: meaningful titles, speaker
camera, text and visuals. CL-149 owns moment copy; CL-150 owns audio-backed
speakers/camera. Remove the Codex planner's explicit no-text/no-pictures omission.
Reuse the existing planning call for optional bounded editable timed text and
grounded contextual visual briefs. No extra AI retry or silent Gemini dispatch.

Subscription Responses does not expose image generation. Render Codex's bounded
structured illustration/card plan locally using trusted templates (no arbitrary
SVG/HTML/code/URL execution); this supplies editable timed visual assets, not a
claim of Gemini photorealistic generation. Keep existing uploads/manual edits,
caption style, Pop at visual start, Hook copying, preview/native export/drafts.
Update SOT to record this owner-requested revision and explain the remaining
modality distinction honestly in setup docs, without adding UI banners.

Initial allocation: contracts/local/codex.ts and tests for fixed content plans;
backend/local/codex-ai.ts and tests; new backend/local/codex-visual.ts and tests;
backend/local/clip-batch.ts and tests plus contracts/local/clips.ts for retaining
optional planned text in preparation/retry; test/local-codex.proof.ts for browser/
native/restore coverage. Reuse shared text-layer schemas/presets and raster asset
admission. If Gemini text parity needs change, extend provider-ai.ts and tests
with the same optional port instead of creating another editing pathway.
Documentation: SOT, design, guides and index/ticket evidence.

Verify fake/no-key plans produce human copy, speaker captions, camera changes,
text and visual assets; preview/export and Hook timing agree; manual edits/old
drafts survive; unsafe content is never executable and cleanup is confined.
Run scoped types/lint/format and read-only review, build/reload current worker
with verified normal process ownership once the sequence settles. No paid AI,
real-media test, provider credentials, Git action, cloud or deployment.

Refined allocation before code: new contracts/local/illustration.ts owns the
closed diagram vocabulary shared by Codex output and retained picture plans.
Extend ownerClipPlanSchema with optional structured illustration data, so local
rendering survives preparation retry/restore without an extra inference/cache.
New backend/local/planned-text.ts and tests decode source-reference-only timed
text for either provider; provider-ai.ts/tests add optional text in the existing
Gemini planning call. New visual renderer uses existing backend Sharp and fixed
SVG templates with escaped labels, never model-authored markup or remote assets.
Keep old drafts and providers without text/illustration fields valid.

Schema ownership refinement: contracts/local/text-layers.ts owns the shared
reference-only planned-text schema; backend/planned-text.ts only decodes it into
existing editable layers. Contracts never import backend modules. Add that file
to this allocation before wiring provider schemas.

Host type wiring: add backend/local/server.ts for the existing provider-port Pick
to retain the new optional texts getter. No route, response or runtime behavior
change is needed there; clip-batch already composes those provider ports.

Browser-proof refinement: the old private-host fixture policy blocks inline
audio even though the normal frontend's browserSecurityPolicy allows Player's
fixed audio pool/builtins. The new automatic Pop exposed that mismatch and the
preview's normal error handling. In this root test only, apply the actual frontend
policy to fixture responses and nonce its fixed script. Do not change application
security headers or bypass browser CSP. Native export and asset retrieval already
succeeded; verify live preview content under the normal browser policy as well.

## Delivered evidence — 2026-10-29

Codex's existing single clip plan now returns optional source-reference timed text
and up to three structured contextual illustrations, alongside anonymous camera
decisions and Hook advice. Closed illustration vocabulary/templates render local
920×520 assets with escaped labels, no model-authored markup or remote fetch.
They are actual local generated diagrams, not a claim of photorealistic Gemini
image generation. Labels were enlarged after desktop/phone screenshot inspection.
All original source/export quality, image/clip counts and manual editing remain.

Gemini's existing plan also accepts optional text, decoded by the same source-
reference helper. Text becomes ordinary editable layers; preparation records
retain it before image work, so failed preparation/restore/retry doesn't require
another plan. Structured illustration data stays in the existing picture plan,
allowing local image rendering after a restart without a model/cache dependency.
Old plans/drafts without these optional fields and ignored legacy title metadata
remain valid. Image placement/fades, Pop-at-start, independent audio, Hook copying,
Apply/Discard and native export use their existing paths.

Review also found two Codex parity gates: malformed optional camera data could
reject otherwise usable content, and an overfull proposal pool could later fail
analysis as a whole. Codex now uses the existing advisory camera compiler and
the same requested proposal bound as Gemini. Unknown voice IDs still cannot
control a camera; malformed/excess optional content is critiqued/bounded without
an automatic provider retry. Regression coverage includes these cases.

Focused content/provider/batch/contract gate: six files / 76 fake tests pass;
the final six renderer/text/Codex checks also pass after typography refinement.
Local/frontend types, scoped lint, contracts build and formatting pass. The first
nested contracts build found a newer global pnpm; retry with the already owned
pinned-manager shim passed without changing global tools or configuration.

Final synthetic browser/native proof passes in 40.64 seconds: actual controls
select generated text and picture at their own display windows; native MP4
export succeeds; captions retain two anonymous speakers and camera switching;
timed text, visual and Pop cue survive saved reload with no additional calls.
Exactly four injected Codex attempts (one deliberate failure/explicit retry), two
fake speech/diarization operations and eight bounded native media jobs. Desktop
1440 and phones 390/320 geometry pass; desktop/390 screenshots inspected. The
private progress record reports verified=true and complete cleanup. A previous
proof read decoder time/old clip DOM rather than the selected layer window;
using the editor's actual Text/Media controls and current clip readiness resolves
that harness issue. No application CSP or playback/quality gate was weakened.

Read-only validate verdict: Meets ticket for local implemented outcomes;
no actionable findings. Reviewed shared schema ownership, literal-only rendering,
advisory acceptance, source clocks, no hidden Gemini/retry, saved/manual state and
confined cleanup. Normal app refresh and final readiness are recorded below.
At implementation handoff, all new work remained unstaged/uncommitted. No
provider/API request, real media processing, cloud access, push or deployment.
Basic old real flow is owner-
confirmed; new real ASR/diarization/face association/editorial/visual quality,
listening/device/rights/clean-machine and hosted/release acceptance remain open.

Normal app handoff: verified removal of ten prior backend identities, preserving
frontend 5152 / 3000. Rebuilt current worker/overlay and started normal backend
22928 / 4000, worker 23628 / 4200, supervisor 23508. Health, /start and sample
config return 200; final capability GET reports provider-ai / codex / ready.
No synthetic proof runners remain. Two earlier timeout-created synthetic scratch
roots were removed only after exact creation-time, parent-path/name and link
checks; private owner media, saved projects, credentials and logs were preserved.

Content-free runtime record and separate logs:
C:/Users/minat/AppData/Local/Temp/clipbuilder-codex-parity-20261029-cl151/backend.runtime.json
C:/Users/minat/AppData/Local/Temp/clipbuilder-codex-parity-20261029-cl151/backend.stdout.log
C:/Users/minat/AppData/Local/Temp/clipbuilder-codex-parity-20261029-cl151/backend.stderr.log
Final local types/scoped lint/format and whitespace pass after the last review
fix. The index was empty at that implementation handoff. Refresh /start and run
fresh analysis/preparation to test the new real planner; existing saved results
are retained rather than silently
reprocessed. No draft checkpoint was created, following the owner's preference.

Owner packaging follow-up, 2026-10-29: the owner explicitly requested a filed
plan, staging and multiple ticket-prefixed local commits. The
[whole-file plan](../operations/CL146_151_COMMIT_PLAN.md) allocates all 47 pending
files including the plan; the [ticket index](README.md) records actual preceding
commit IDs. This supersedes the earlier uncommitted status, preserves all
implementation evidence and leaves real-quality/hosted/release gates open.
Packaging makes no feature, configuration, provider/cloud or deployment change.
