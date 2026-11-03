# CL-203 — Manually seeded head-follow camera Motion

Status: Locally implemented and verified, 2026-11-03. Final validate: no
actionable findings. Personal real-head/visual and hosted/Linux acceptance open.

## Owner request and authority

Add Motion beside Zoom in Focus. The owner marks a person's head once and
chooses the interval; local pixel tracking moves the camera with the head
without manual frame-by-frame keyframes, face recognition, AI calls or models.
Research, execute and validate until no actionable findings. Preserve CL-197–202
unstaged work, owner media/prepared clips and provider configuration. No Git,
real AI/media acceptance, downloads, cloud or deployment action. Normal batch
was read-only checked idle (five ready/four canceled) before shared/backend
edits.

The existing source of truth's footer, manual Zoom, focus clocks, recovery and
native parity decisions apply. CL-192 supplies existing camera math/zoom/export.

## Research and decision

[OpenCV's optical-flow guide](https://docs.opencv.org/4.x/d4/dee/tutorial_optical_flow.html)
describes tracking image corners with pyramidal Lucas–Kanade, with forward/back
consistency checks in its linked tracker example. It also identifies brightness
and local-motion assumptions, so this cannot promise identity through occlusion
or shot changes.
[CSRT](https://docs.opencv.org/5.0/extra_modules/classcv_1_1TrackerCSRT.html) is
an alternative initialized from a known rectangle, but its optional runtime
would add preparation/dependency weight to the existing app.

Implementation decision (an inference from those mechanisms): use bounded
classical feature/patch tracking over already prepared browser video pixels,
with no new model/runtime/download. Track only the manually seeded rectangle,
reject inconsistent motion/appearance, and stop on loss rather than acquire
another head. The saved result is numeric camera data, not a face embedding.

## Acceptance

- Motion is a fourth keyboard-accessible Focus tab beside Zoom. Choose the
  relevant person/camera position, Add at playhead, mark a head on the uncropped
  source view with mouse/touch and precise keyboard/numeric controls, and choose
  an end. Limit one pass to thirty seconds; up to twenty finite intervals per
  clip, with bounded samples/memory. Tracking runs only after explicit Track
  head in the persistent footer. Cancel is scoped to this local operation.
- Capture exact prepared-video source frames independently of Player playback;
  crop out known contain padding before analysis, never analyze the portrait
  crop which can lose a moving head. Use progressive local tracking, responsive
  cancellation and concise errors; clean up decoding/listeners/timers on stop,
  navigation and unmount. No provider/network endpoint or native job is added.
- Follow horizontal head center and preserve its initial vertical placement/
  baseline zoom while following vertical displacement. Smooth jitter, clamp
  source edges, preserve 9:16/aspect and use the selected person's camera only.
  Keep baseline cuts/other people intact. Stop a lost path with clear coverage;
  partial safe work remains usable and reselecting is explicit, never automatic.
- Hook/body occurrences are independent. Reject overlapping motion intervals or
  Zoom overlap in the same occurrence; Hook changes clear only dependent Hook
  data. Changes to relevant camera geometry invalidate stale tracking safely.
  Provider/generated bases cannot create this manual feature.
- Store only strict finite bounded numeric paths tied to the editor's source/
  base and focus. Preview and native original-source exports evaluate one shared
  path; native projection keeps even-pixel geometry and the existing scaler fix.
  Captions, pictures, audio and overlays keep their independent clocks.
- Completed paths are ordinary draft edits: preview before Apply, Discard
  restores the prior state, and Apply/recovery/save/reopen/retry reuse the path
  without re-tracking or AI. Old documents retain identical behavior. Preserve
  source hashes, prepared assets and existing outputs.
- Validate synthetic translated/scaled/rotated textured head regions,
  distractors, low texture, occlusion/cut/loss, edge bounds, bad input,
  cancellation, clocks, overlap, stale focus, persistence and exact zero
  provider dispatches. Real pointer/keyboard/phone/footer checks and generated
  native pixel parity must cover tracked motion and Hook/body playback at
  representative native cadences. Run scoped types/lint/format plus the relevant
  fake and native/browser gates, then read-only validate/fix. Rebuild/reload the
  idle normal worker with verified ownership and prove owner clips preserved.
  Personal visual/real-head quality, Linux/hosted deployment acceptance remain
  owner-only.

## File allocation and capability

Contracts own manual camera-follow paths, validation and crop evaluation;
frontend owns bounded classical tracking, video sampling, Motion controls, draft
diff and shared footer integration. Backend only validates/persists manual
edits; native focus/export consumes the canonical crop path. Focused generated
browser/native and fake contract/edit tests plus narrow guides own evidence. No
dependency installation, ignored configuration read/change or paid call.

Fake/no-key checks can exercise genuine pixel tracking on generated local video.
The feature itself needs no API key, AI model or sign-in. Existing real clip
preparation still needs prepared local speech/Codex login/allowance and live
gates; exports keep normal render availability. This proves mechanics, not
universal real-head tracking quality or identification through an occlusion.

## Implemented behavior

Focus has Camera / People / Zoom / Motion. Select the camera/person, pause at
the desired start and Add at playhead. Draw around the head in the full source
view (mouse/touch), or refine its left/top/width/height numerically; arrow keys
move the box, Shift+arrows resize and Enter confirms it. Set End in presentation
seconds, then use Track head in the persistent footer. An unmarked seed cannot
start. Track head replaces other proceed actions; Cancel aborts only this local
decoder and preserves existing edits. Reconnect notices retain footer priority.

The implementation is an own bounded pyramidal Lucas–Kanade feature tracker
following the classical mechanism researched above, not an OpenCV runtime or
learned face detector. It tracks up to 32 textured points through three image
levels, checks flow in both directions, rejects inconsistent displacement and
appearance, and refreshes points only inside the current tracked rectangle.
Prepared-video padding is removed before analysis at a maximum 512px dimension.
Only two current grayscale pyramids, a small appearance patch and numeric path
points are held; no head raster/model/embedding is saved or uploaded. Async
decoded-frame seeks yield between bounded tracking steps. A nonadvancing decode
has a ten-second per-seek failure bound and an abortable cleanup path; no
provider retry or whole-video analysis occurs.

One pass covers 0.2–30 seconds and samples every two logical 30fps frames (up to
451 points); at most twenty nonoverlapping intervals fit the clip. Coordinates
are rounded to six decimals before persistence. Lost tracking preserves only the
safe completed interval when at least six frames are usable, with coverage and
reselect guidance. Too little texture/coverage leaves prior data intact. Adjust
starts an explicit replacement attempt; failed/canceled replacements do not
erase the existing path. Completed paths use Preview motion, normal
Apply/Discard, Adjust and Remove motion. No automatic tracking runs on
reopening.

Source/edit binding and an exact numeric signature of the selected person's
camera schedule reject stale paths; changes to other people's positions retain
them. The shared crop evaluator centers the head horizontally while preserving
initial head height through vertical displacement, retains baseline zoom and
hard cuts to other people, and clamps source edges. Three-frame edge easing
joins the normal camera. Hook/body paths are independent and labeled with their
presentation times; Hook changes clear only dependent Hook paths. Motion and
timed Zoom intervals cannot overlap in the same occurrence. Provider/generated
bases cannot supply manual paths. Existing documents keep their old camera path.

## Execute/validate evidence

- Final focused gate: **109 cases / seven files passed**, covering pixel
  translation beyond the original camera, modest gradual scale/rotation,
  distractors, low texture, occlusion/cut, bad dimensions/numeric paths, source
  bounds, another person's cuts, precise focus/Hook binding, overlap, old editor
  behavior, batch calls and persistence. Explicit saves and rolling recovery
  restore Hook/body paths with zero native/AI calls; explicit fake render/retry
  reuses them, unchanged Hooks retain them, and affected camera/Hook changes
  clear only stale paths.
- The final three browser proofs passed: existing responsive editor, existing
  manual Zoom and the new generated-head workflow. The new workflow exercises
  actual encoded moving pixels and real desktop mouse/390px touch/320px
  keyboard/numeric seeding, validation, progress, scoped cancellation, changing
  preview crop, Discard, Apply, reopen/removal and footer geometry. A generated
  mid-interval disappearance returns a usable lost path. An additional final
  Hook capture/label pass passed. Eight explicit fake edit submissions and zero
  provider/render/extra processing calls were asserted. Desktop/phone synthetic
  seed screenshots were visually inspected.
- Current-source native proof passed **90 Hook/body comparisons** at
  24/25/30000÷1001/30/60fps, with maximum mean RGB error **2.04/255** (rounded
  upward) against independently encoded expected crops. Native clocks/frame
  counts, even pixels, source hashes and temporary cleanup pass. Zoom and Motion
  coexist in separate ranges in the same proof. No owner media/model/provider
  was used; Windows FFmpeg execution is established, Linux remains unchecked.
- Strict contracts/local/frontend/test types and scoped ESLint/format/whitespace
  checks pass. Review fixed finite range admission before allocating sample
  arrays, seed/first-point binding, exact playhead test seeds, asynchronous
  media cleanup assertions, footer reconnect priority and clear
  occurrence/coverage labels. Final read-only validation: **Meets ticket; no
  actionable findings**.

The normal idle backend/worker was stopped with verified creation-time/tree
ownership and free 4000/4200 ports, then contracts/current worker/overlay
rebuilt through normal startup. Frontend remained running.
Health/start/configuration/ capabilities return 200 with Codex ready. All nine
owner clips recovered (five review-ready/four canceled); content-free
before/after digests match clip names, applied edits, IDs/states, assets,
revisions, calls and output records. No owner clip was tracked, retried,
rendered, renamed or removed. Runtime/log ownership was refreshed outside Git,
resolving the latest content-safe worker-ready line.

## Changed owners and remaining gates

- Contracts: new `camera-follow.ts`/tests; existing camera-motion, clips, editor
  and edit-overlay modules. Paths stay manual; no provider schema/prompt change.
- Frontend: new pixel tracker/tests, prepared-video sampler and Motion editor;
  Focus/preview-controls, ClipEditor draft/guard integration, editor-state and
  scoped styles. Existing common Button/Progress/footer primitives are reused.
- Backend/native: manual edit validation/invalidation, focus-filter and
  clip-render numeric graph handling; existing fake API/persistence and native
  camera proof extended, plus new head Motion browser proof.
- Narrow feature/renderer/workflow guides, source of truth, ticket/index.

No new dependency/runtime/model, ignored configuration read/change, real
inference, acquisition, owner-media test, Git staging/commit, cloud action or
deployment. Prior CL-197–202 work is preserved. Personal visual taste and
real-head robustness through difficult occlusion/rotation/lighting remain owner
acceptance; the implementation explicitly stops when its local evidence fails.
Hosted/Linux execution/release was not performed. Fake/native evidence proves
the mechanism, not universal face recognition or provider quality. Deviation:
existing native/Zoom/API proofs were extended rather than duplicating their
fixtures; no product-scope deviation.
