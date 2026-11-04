# CL-216 — Automatic speaker follow and steady framing

Status: Complete locally, 2026-11-04. Dependency: CL-217 complete locally;
CL-203/208 manual tracking and CL-212/213 camera clocks are implemented.

The owner confirms manual Motion follows a speaker when an embedded graphic
changes the source layout, but reports excessive camera jitter. During future
AI editing, automatically add bounded speaker-follow only where the currently
speaking person's head escapes the intended camera window. The owner accepts
either the full camera-position interval or a separate moving interval with
stable framing before/after. Never follow a different visible person.

Separate the head region used to identify pixels from a larger framing tolerance
window: simply enlarging the pixel seed is not evidence of steadier framing.
Support a larger/easier manual selection view (owned by CL-217), investigate a
dead zone/hysteresis and bounded smoothing, and retain sufficient movement to
follow real translation. Abrupt source reframes must not create a slow pan
through an empty crop. Stop/reseed safely on identity ambiguity, cuts or loss.

The owner explicitly selected implementation of both packets in this pass.
After CL-217's clean gate, execute this single allocated slice:

- Reuse the existing pure pixel tracker across browser/native composition;
  share the existing bounded camera-interval planner through contracts instead
  of duplicating its speaker/clock/overlap decisions. Add no runtime/model.
- Extend the existing protected clip-preview request/result with optional
  source-bound automatic focus/numeric paths. Native tracking uses only the
  freshly prepared clip, fixed low-resolution grayscale samples, a bounded
  serial pass and owned scratch. Cache by exact source/cut/focus binding.
- Fresh provider preparation requests it after the existing AI camera plan;
  attach valid paths only to the initial edit, keeping the immutable base and
  existing AI call counts. Return usable preparation without Motion if pixels
  are ambiguous/untrackable. Cancellation must not acknowledge partial work.
  Restore, reopening, export and existing owner clips never start tracking.
- Retain paths only for selected-speaker intervals whose head would leave the
  fixed crop. New manual and automatic paths support an editable larger follow
  window with a deterministic dead zone that suppresses small movement while
  preserving larger translation. Legacy paths retain their old behavior until
  explicitly edited. Preserve source clamps, other-person cuts, Hook clocks,
  Zoom conflicts and stable joins; do not interpolate a camera back into an
  incorrect crop immediately before its position ends.
- Allocation: pure pixel module in composition and browser imports; shared
  interval/framing contracts and tests; browser Motion tolerance controls;
  native clip-preview tracking/cache and tests/proof; backend fresh-preparation
  integration/tests; current-source browser/native crop proof and docs. Rebuild
  contracts/native bundle and reload only the owned backend/worker after gates,
  preserving frontend, source, acknowledged edits and ignored configuration.

Use existing speaker/position evidence and existing local pixel tooling without
new API calls, models, provider retry or a fallback provider. Keep local Codex
and hosted Gemini isolation; document precisely which preparation compositions
are implemented. Do not add browser background processing on restore/reopen.
Do not migrate or overwrite existing owner camera plans or Motion drafts.

Required verification: generated source with small head noise, smooth movement,
same-person graphic/layout translation, abrupt cuts, two simultaneous people,
speaker changes, occlusion/loss, source edges, Hook/body clocks, manual Zoom/
Motion conflicts, source/plan binding, cancellation, persisted paths and native
crop parity. Record numerical jitter/lag/framing metrics and exact timings.
Default checks stay synthetic/fake/no-key/paid-off and block provider/network
access. Existing assets and real owner media are not ordinary fixtures.

Implemented behavior: manual/bulk Motion works on prepared pixels with no API
keys or additional AI credits, including synthetic/fake sources. Fresh real
provider preparation now opts into conditional native Motion, using the existing
AI focus plan. Real preparation retains its tools/login/key/live/approval gates.
Normal fake preparation skips automatic tracking; injected/generated proofs
exercise the actual native pixel path without inference. Existing clips are not
automatically migrated. No configuration, provider/cloud call, Git mutation or
deployment was performed.

## Implementation and verification — 2026-11-04

Shared implementation: the pure pixel tracker moved from frontend to composition;
the existing interval planner moved to contracts with a browser re-export. Both
browser and native tracking use immediate measured pixel response and bounded
unique-template recovery for abrupt translations. A competitor match, missing
head or incompatible frame stops tracking. No recognition model is introduced.

`camera-follow-window.ts` implements the independent framing dead zone and
linked-family edits. New paths default to 30%; a dashed selection window and
Follow window number field expose it. Existing paths with no field keep their
old crop math until edited. Changing a completed path's window needs no new
tracking. Whole-position paths do not dip back to baseline in their final frames;
same-person resets and other-person cuts remain distinct. Partial manual tracks
retain their existing bounded joins.

The existing clip-preview job optionally carries focus and returns numeric
paths. Native `automatic-camera-follow.ts` decodes admitted prepared video once,
selects exact interval/sample endpoints, uses bounded frame buffers and drops
an entire camera family on loss. It retains only families whose chosen head
escapes the baseline crop. Cache reuse binds the original source/cut/raw digest
and exact focus. Optional failure leaves usable preparation intact; cancellation
propagates and acknowledges no partial result. Backend attaches only valid
body paths to a fresh provider preparation's initial edit. The immutable base,
existing AI calls, restore/reopen and export behavior are preserved.

Final review caught an initial 1,000-sample cutoff that could skip longer manual
clips. `camera-follow-pixels.ts` now uses up to twenty compact interval expressions
and adaptive analysis size instead. Gray scratch is bounded to 192 MiB and the
remaining existing 384 MiB reservation after prepared bytes plus 16 MiB overhead.
The longest analysis side stays at most 512px. Pixels sample every two logical
frames, with exact final endpoints, thirty-second chunks and a sixty-second
pixel-work deadline. This changes analysis size only, preserving video/export
resolution. Five-minute resource/odd-boundary units and a native 72-second late
shift cover the correction; no cutoff was merely raised or hidden elsewhere.

Produced evidence:

- Focused final units: **78 tests / five files, 9.60 s** for clip batching,
  framing/window contracts, legacy crop behavior, shared planner and pixel
  tracking; separate provider/hosted/source compatibility: **30 tests / four
  files, 5.82 s**. New long-clip scratch/selection bounds: **2 tests, 1.24 s**.
  **110 distinct unit cases pass.** Injected provider preparation keeps exactly
  one plan, zero image calls and one preview operation; restore adds zero work,
  and explicit fake export adds exactly one render operation with saved paths.
  Synthetic mode does not request automatic follow; wrong-focus paths cannot
  attach to a usable prepared clip.
- Numerical framing assertions: ±1% source-width head noise produces **zero
  crop drift across all 120 tested frames**, while the legacy crop spans more
  than five logical pixels. A 20% horizontal translation keeps the complete
  head inside every tested crop, including the final frame. Unique abrupt
  recovery is within **one analysis pixel**; a nearby duplicate match and loss
  return no target. These are generated assertions, not measured real-head
  quality. Sampling is two-frame cadence, not continuous face detection.
- Full real-control browser proof passes in **152.09 s**, including desktop,
  1280x600 laptop and 390/320px phones; marking, larger window, modal/native
  Escape, input preservation, progress/footer visibility, preview, cancellation,
  Apply/Discard/reopen, window persistence/editing, partial loss, Hook and linked
  32-second/bulk paths. Exactly fifteen fake edits and zero unexpected/provider
  requests. An earlier long pass lost a track; sharing precise pixel response
  and unique-translation recovery fixed it, without accepting ambiguous targets.
- Final native follow plus current-source native export proof: **two files/two
  proofs, 57.08 s**, with 24/25/29.97/30/60fps Hook/body geometry. A final native
  read/cleanup rerun passes in **10.97 s**. After the long-clip correction, the
  six-case native proof passes in **30.28 s**, including cache/cancel and all
  checked scratch cleanup. Five-minute planning/resource coverage passes; an
  actual five-minute end-to-end run is not claimed.
- Final cold generated-media timings below include preview creation and native
  follow, excluding source-fixture creation. They are not real-video estimates.

| Generated case | Duration | Prepare + follow | Cached reuse | Retained paths |
| --- | ---: | ---: | ---: | ---: |
| Moving selected head | 3 s | 1,500 ms | 3 ms | 1 |
| In-frame small jitter | 3 s | 1,432 ms | 2 ms | 0 |
| Abrupt same-head layout shift | 3 s | 1,466 ms | 2 ms | 1 |
| Occluded/lost head | 3 s | 1,398 ms | 3 ms | 0 |
| Speaker cut with distractor visible | 3 s | 1,402 ms | 2 ms | 1 |
| Late shift across three linked intervals | 72 s | 18,389 ms | 8 ms | 3 |

Ignored generated evidence: `cl216-native-follow.json`, the updated camera
native-pixel comparison JSON and Motion desktop/phone screenshots under
`.local-build/evidence/`. No real source/frames/transcripts were added to Git.

Static gates pass: contracts without Node ambient types, local/native,
frontend and test TypeScript; scoped ESLint/Prettier and `git diff --check`;
required contracts build. Initial native fixture issues (missing synthetic audio
and selecting the inspection wrapper rather than its metadata) were corrected.
Lint prompted extracted checked cleanup functions; partial reads and nested
cleanup are handled. No ignored environment file was read or changed.

Separate settled read-only validation compared the final work against this
packet and the private post-CL-217 source snapshot. Reviewed actual fresh-batch
wiring, immutable base, fake/provider separation, source/clock binding, native
budget/command size, cancellation, ambiguous/lost pixels, camera/Hook/Zoom joins,
legacy paths, browser controls, saved/exported paths and current native bundle.
The longer-clip cutoff finding is resolved. **Meets ticket; no actionable
findings.** CL-209–215 work is preserved and excluded from this verdict.

Runtime: verified owned backend watcher/supervisor/worker shutdown and released
4000/4200 before normal hidden startup, rebuilding current worker and overlay.
The final long-clip correction received a second scoped reload. Frontend stayed
running. Source and the acknowledged saved clip are hash-identical; no active
batch, orphan worker or stale bundle remains. Health, `/start` and sample config
return 200; exposed setup is Codex ready/cloud false. Absolute safe logs and PID
identities remain in the private OS-temporary runtime record, outside Git.

Changed surfaces: shared pixel tracker and interval/window contracts; frontend
Motion controls/imports/styles and focused tests; native pixel-budget/follow and
clip-preview cache; backend fresh-batch integration/tests; three existing/new
browser/native proofs; source of truth, architecture and focused service/package
guides, this packet and index. Nothing staged or committed; no deployment.

Remaining acceptance: owner real-head/Codex/Gemini editorial/visual/device
quality; actual five-minute visual/performance behavior; hosted/Linux image,
cloud and release checks. No live provider call, new real-media processing,
cloud action or owner export was run. Optional untrackable Motion keeps the
baseline and remains manually editable; generated evidence does not prove AI
picked the correct real speaker or guarantee tracking through every reframe.
