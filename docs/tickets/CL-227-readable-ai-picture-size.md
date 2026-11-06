# CL-227 — Keep AI-added pictures large and readable

Status: Complete locally; owner fresh acceptance pending, 2026-11-06.
Dependencies: CL-154 initial picture placement
and CL-224 editor are implemented. Preserve all unstaged CL-225 and planning
CL-226 work. Execute only this dependency-ready packet; no staging/commits.

## Owner feedback and cause

The owner rejects an automatically placed thumbnail-like picture and prefers
the larger example in the supplied comparison. AI must not produce that tiny
placement. Record this as a new placement requirement; do not copy the real
screenshots/content into Git or change the current saved clip as proof.

`packages/contracts/local/visual-placement.ts` explains a generic cause: after
trying the standard 920x520 picture on a logical 1080x1920 portrait, it tries
widths 0.70, 0.56 and 0.44 with proportionally reduced heights to avoid protected
people. A small clear slot can win over the readable default. This code path is
confirmed; the exact saved geometry in the owner's screenshot was not read.
The AI planning response itself does not supply picture coordinates: fresh
`OwnerClipBatch.storeVisual` chooses them using this deterministic helper.

## Owner decision and scope

For fresh AI-planned pictures, keep the standard width 920/1080 (about 85%) and
height 520/1920 (about 27%) at every automatic placement. Search positions at
that readable size; never shrink to escape detected people. Prefer a clear
large slot. If the portrait has no clear large slot, retain usable output in
the least-overlapping standard-size slot; do not reject paid work, hide the
picture or make another provider call. This supersedes CL-154's smaller-size
alternatives, while retaining its stable full-cue protection and fallback.

This is a bound on initial automatic box geometry, not an instruction to crop
an image's contents or change contain/cover behavior. Asset aspect ratios can
still produce letterboxing. Saved/manual coordinates, uploaded picture sizing,
Hook copies and existing sources/edits/exports remain authoritative and untouched.
The common fresh placement covers Codex and Gemini, including Find visuals
where it uses the existing batch placement path. Never fake a fix with a prompt
alone or by enlarging the owner's saved cue.

## File allocation and acceptance

- Owning shared placement helper and its focused tests; fresh batch regression
  in `apps/backend/local/clip-batch.test.ts`; a focused generated native/transport
  proof as needed; owning guide/source of truth and this ticket/index.
- First reproduce the shrinking defect with generated crowded/face-region
  geometry. Cover a clear large slot, only smaller clear slots, fully occupied
  frames, multiple observations/camera cuts, absent focus and aspect ratios.
  Initial dimensions never fall below the standard; all boxes stay bounded,
  deterministic and stable over the cue. Inputs are unchanged.
- Fresh batch test proves the large box actually enters prepared base/initial
  edits, with exact fake planning/image counts. Existing manual smaller edits
  survive Apply, restore and export without a new plan/image call.
- Generated real worker HTTP/native output and Codex-browser preview inspect
  the same large placement. Native proof compiles its current-source overlay.
  Inspect desktop/phone fit and footer when checking the editor; no owner clip
  or provider request. Record honest limits of fixture/visual acceptance.
- Run focused units, relevant contracts/local/test types, scoped format/lint,
  and justified native/browser gates. Read-only validate/fix to no actionable
  findings. Rebuild/reload only the owned normal backend/internal worker after
  shared placement changes, preserving frontend, configuration and owner state.

All verification uses generated synthetic/fake/no-key/paid-off data with no
ignored env reads or non-loopback provider access. Manual placement needs no
keys. Fresh real local planning still needs configured Codex sign-in/allowance
and installed local speech tools; Gemini needs its key/live flags/approvals.
No real inference, acquisition, saved-clip patch, cloud action, deployment or
Git mutation. Owner fresh regeneration remains real-provider acceptance.

## Evidence

The placement helper now searches twelve positions at the original 920x520
dimensions. Smaller candidates are removed. It still projects every observed
person through intersecting crops, picks a clear slot first, then a stable
least-overlap fallback. No provider prompt, schema, call budget, saved edit,
rendering primitive or contain/cover behavior changed.

Actual file allocation: `packages/contracts/local/visual-placement.ts` and its
test; `apps/backend/local/clip-batch.test.ts`; new
`test/local-picture-size.proof.ts`; optional picture-size/configuration support
in the existing `test/owner-hook-browser-fixture.ts`; local workflow guide,
source of truth and this ticket/index. Fixture defaults remain unchanged.

- Red before the implementation: two meaningful crowded-layout regressions
  fail with width 0.44 instead of 920/1080, in both the pure placement and actual
  fresh batch path. The clear-layout contrast already passes.
- Green: all 68 focused cases in placement and clip-batch suites pass (13.22s).
  Coverage includes only-small clear gaps, full occupancy, source aspect ratios,
  camera/observation projection, stable bounds and unmutated input. Clear slots
  still win when available. Both batch layouts retain manually resized 40%-width
  cues through edit, restore and export, with exactly one fake plan/image call.
- Settled generated native proof passes (11.19s). A fresh OwnerClipBatch stores
  the large initial box, prepares through the real worker HTTP server, then
  exports that same box over actual HTTP. A decoded frame of the six-second
  synthetic portrait contains a green picture spanning >82% of output width
  and >25% of height, with position within 2% of the planned box. Counts: one
  injected plan, one synthetic image, one injected transcription, two native
  jobs, zero unexpected provider calls. Current-source overlay compiled into
  owned scratch; no old `.local-build/overlay` used as proof. The generated
  decoded image remains ignored as cl227-large-native.png.
- Codex-browser actual generated editor: selected Hook and body pictures both
  measure ~85.185% of preview width and 27.083% height. Loaded-picture geometry,
  footer visibility and no horizontal overflow pass at 1440x900, 390x844 and
  320x568; no browser errors. Desktop preview and native image inspected.
  Phone checks establish geometry/footer fit, not physical-device acceptance.
  Desktop/phone screenshots remain outside Git as cl227-large-picture-*.jpg.
- Local/no-Node contracts, test and local-runtime TypeScript checks pass;
  scoped ESLint/Prettier and whitespace pass. Initial proof setup/type/cleanup
  errors were corrected before the settled proof; none required app changes.
- Browser fixture closes with zero fake edits and zero unexpected requests;
  its owned process tree, listener and scratch are absent. Viewport override
  reset and temporary tab closed. Native worker/files/bundle use scoped cleanup.
- Normal backend-only reload: ten verified owned processes stopped, no survivors,
  4000/4200 released and stabilized; frontend PID 3496 preserved. Current worker
  rebuilt by normal startup. New supervisor 17276, backend 17204 on 4000 and
  worker 17924 on 4200. Health, /start and config return 200. Exposed provider
  remains Codex/ready with cloud false; no ignored configuration read or change.
  Content-safe stdout/stderr are backend-cl227.*.log in the existing local
  runtime, outside Git.
- The normal workspace restores one validated-revision clip, its saved edit and
  both its existing small and large base picture boxes. No owner edit/provider
  request was submitted. The broad serialized pre/post snapshot hashes differ;
  that non-canonical aggregate does not establish byte-for-byte state identity.
  No exact whole-state identity claim is made. Existing small boxes remaining
  in the saved base and the manual-size restore/export regression distinguish
  fresh placement from silently patching the owner's example.

## Settled validation and handoff

Read-only review of the entire CL-227 diff against this packet: **Meets ticket
locally; no actionable code findings.** CL-225 implementation and CL-226 planning
remain separate and unstaged. Reviewed fresh creation/Find visuals storeVisual
integration, all candidate/fallback branches, bounds/ratio/determinism, legacy
manual reuse, exact fake counts, real HTTP/native output, dependency direction,
privacy and cleanup. There are no new schemas, unsafe production casts, provider
retries, logging of source content, cross-app imports or new production resources.

No feature scope deviation; the explicit aggregate preservation-check limit
above remains. Real-provider/source, physical-device and owner creative acceptance
are unperformed. Ask the owner to prepare a fresh clip to assess the new AI
placement; do not resize the existing saved example or regenerate for them.
Existing normal local Codex/speech prerequisites still apply to that owner action.
All produced automated/native/browser evidence is generated/fake/no-key/paid-off,
not real AI quality. No acquisition, inference, cloud action, deployment or Git
mutation. Changes remain unstaged/uncommitted.
