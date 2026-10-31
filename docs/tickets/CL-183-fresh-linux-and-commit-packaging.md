# CL-183 — fresh Linux verification and current-work commits

Owner instruction, 2026-10-31: file a whole-file commit plan, then stage/commit
all current work in several ticket-prefixed commits; run fresh Linux builds
and packaged fake-mode checks with no paid calls. Do not deploy.

Depends on the settled CL-180/181/182 changes and their recorded fake validation.
The [whole-file plan](../operations/CL180_183_COMMIT_PLAN.md) owns exact allocation.
This packet owns packaging/evidence only, not new application behavior. Preserve
normal app/session/media/logs/configuration and current branch. Git staging and
local commits are now expressly authorized; push/deployment/cloud are not.

## Acceptance and allocation

- [x] Exhaustive whole-file plan filed first, index initially empty; no unallocated
      or duplicate path, hunk splitting or ignored/private artifacts.
- [x] Fresh frontend/backend Linux production images build from closed contexts
      using anonymous Docker configuration, no credentials or environment files.
- [x] Packaged non-root offline runtime probes and synthetic shared upload/editor/
      native export/cancel/retry/quota/cleanup checks pass, including 500-MiB upload.
      Record resource settings, immutable artifacts, exact counts and limits.
- [x] Read-only validation, scoped final source checks and container cleanup pass;
      running normal app and owner state remain available.
- [x] Planned source groups staged/committed with ticket-prefixed subjects; this
      packet is carried by the final evidence group. The commit wrapper verifies
      exact final allocation and clean index/worktree after creation. No push
      or deployment; final HEAD is reported in the execution handoff.

Owning files: this packet, `docs/operations/CL180_183_COMMIT_PLAN.md`, existing
CL-180/181/182 ticket evidence as appropriate, `docs/tickets/README.md` and
`docs/operations/HOSTED_EDITOR_RELEASE_PREPARATION.md`. The source of truth and
backend guide retain their pending changes in the final documentation group.
Generated Docker contexts, anonymous config, bundles, synthetic media and logs
stay in owned OS-temporary/ignored scratch. Existing scripts are reused; allocate
and reproduce any necessary source fix before editing. No such fix is planned.

Agent verification forces fake/paid-off and blocks external app networking.
Real Gemini uses configured keys/live approvals and owner action, not this task.
No ignored environment read/edit, paid/provider call, retained-media cleanup,
cloud command, registry submission, push or deployment is authorized.

## Evidence

Fresh current-source images and all three offline packaged probes pass. Artifact
IDs and exact resource/capacity limits are recorded in the
[release handoff](../operations/HOSTED_EDITOR_RELEASE_PREPARATION.md#fresh-linux-verification-and-commit-packaging--cl-183-2026-10-31).
Builds use pinned Dockerfiles/dependencies and allow only public dependency
fetches. Both contexts contain 267 approved inputs, all 534 compare byte-for-byte
with current source after the proof. Ignored config, owner media, tests and private
logs are excluded. Anonymous Docker config has empty auths and only the verified
installed CLI-plugin directory. Two preliminary launcher attempts failed before
building because Buildx was not located; correcting that temporary path resolved
it. No application fix, dependency install or provider request was needed.

- Backend image build 61.49s; packaged actual entrypoint 2.53s.
- Frontend image build 52.06s; packaged runtime/assets/routes 1.90s.
- Full 500-MiB synthetic upload/editor/native export walkthrough 54.37s,
  including captions, picture position/motion, timed text, decoded filter,
  cancellation, retry reuse, quota, source binding, cleanup and bounded ENOSPC.
  External attempts 0; generated-image calls 0. Native encoding is real local
  processing, provider responses are injected fiction; no API keys are required.
- OOMKilled false, all memory-event counters zero. Peak sampled container RAM
  2,493,820,928 bytes. Scratch 1,052,398,352 bytes,
  reservation 3,074,499,193 bytes under the documented 5376-MiB volume.
  Three owned containers removed. Short low-resolution synthetic media does not
  establish maximum-duration 4K, full history/batch stress or hosted latency/cost.
- Retain CL-181's settled 859 local fake checks and CL-182's 209 focused/local/
  protocol cases plus types/lint/format. No application source changed after
  those checks; production images freshly compile backend/contracts/composition/
  worker/frontend. This packet refreshes packaging rather than rerunning unchanged
  unit suites. Final scoped formatting and whitespace checks are recorded below.

Evidence is content-free or synthetic and stays outside Git:
`C:/Users/minat/AppData/Local/Temp/clipbuilder-cl183-linux-ahK9rG/`
contains build logs, probe logs/metadata, fresh synthetic UI/probe bundles and
anonymous Docker configuration. Ignored `.local-build/cl183-image-record.json`
records artifact/input hashes; `.local-build/cl183-handoff.json` records safe
normal-app GET/listener/state checks. Owner configuration, session, private logs
and media were neither read as fixtures nor modified.

Read-only validate: **Meets packaging/verification scope; no actionable findings.**
Reviewed the 40-path allocation against baseline `fe6dd74`, the complete current
CL-180/181/182 change set and owning evidence, current image/input hashes, actual
packaged results, synthetic/paid-off and privacy boundaries, resource limits,
process/container cleanup and remaining release gates. All requirements are
covered except the final local commit operation, performed after this review.
No additional application change or test weakening was needed. Scoped Prettier
for all existing allocated files and `git diff --check` pass; index is empty
before staging each group. Prior source-unit checks are explicitly reused.

Normal health, `/start` and `/api/sample/config` return 200. Frontend 4968/3000,
API 9260/4000 and internal worker 2560/4200 remain running. Both clips remain idle
validated revisions with 14 and 5 assets; the new Gemini clip retains its three
retrieved visuals. Planning and Find visuals remain available. No normal app
restart, processing action, configuration change or owner-media mutation occurred.

No provider/cloud call, registry submission, push or deployment.


## Local commit series

All 40 allocated paths are packaged in five dependent review commits. The plan
was committed alone first; the native fix, provider parity and Search correction
follow. This packet and the owning guides are the fifth evidence commit.

- `190ef3e39800dbb6a8e10a993c22b7760104f180` — CL-183: plan file-level commit packaging (1 allocated paths).
- `f9024ea48885d1c58ed039fdcfe0aa6140b7519a` — CL-180: fix packaged FFmpeg overlay compatibility (3 allocated paths).
- `b4dc8a7405aedb4e68f1f45d21e162cdd06765a0` — CL-181: align Gemini transcription visual plans and focus policy (15 allocated paths).
- `b1212ec89619fd0506733150cec87263e7b640c6` — CL-182: verify Gemini search execution and image retrieval (16 allocated paths).
- Final evidence commit: `CL-180-183: record fresh Linux checks and release handoff`
  (five documentation paths, including this packet).

Git recognizes the shared visual decoder/test as two renames. Allocation and
commit verification use `--no-renames` so both deleted and added paths are counted
exactly once; no hunk splitting or reset is used. The initial guard stopped on
rename presentation before the provider commit; correcting ignored bookkeeping
allowed the exact already-staged group to continue. No source change was needed.

After creating the fifth commit, compare each commit against its allocation, all
40 baseline-to-final paths, five exact prefixed subjects, clean index/worktree and
unchanged branch. The execution handoff reports the final HEAD; the ignored
`.local-build/cl183-final-verification.json` records the post-commit result without
a self-referential commit hash inside this document.

Remaining owner-only gates: explicit image/editorial/framing/physical-device
acceptance and actual hosted identity/challenge/resources/mount/lifecycle/capacity/
cost/release verification. The observed Gemini Search run proves that path only.
This packet authorizes neither live reprocessing nor release. Deviations: no
application changes; anonymous Buildx path and rename bookkeeping only. No paid
call, ignored configuration edit/read, cloud action, push or deployment.
