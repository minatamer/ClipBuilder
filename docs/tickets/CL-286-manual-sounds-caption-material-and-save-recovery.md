# CL-286 — Manual visual sounds, caption controls and reliable autosave

Status: implemented; focused execute/validate checks complete, 2026-11-12.
Owner aesthetic/native end-to-end acceptance remains separate.
Dependencies: shared editor/audio contracts, CL-275 Glass, CL-277 autosave and
CL-285 workspace loading. Preserve pending CL-284/285 work in shared files.

## Owner requests

1. Never automatically add the visual Pop sound to pictures or videos, during
   initial AI editing, later discovery or any other automatic visual workflow.
   Sound accents are an explicit manual user choice.
2. Remove the arbitrary caption font-size ceiling of 120; the frame supports
   larger typography. Keep resource/geometry bounds and consistent controls.
3. Add a dedicated persisted Glass opacity control.
4. Improve Glass to visibly refract the scene, following the owner's previously
   supplied reference. Plain transparency is insufficient. Keep preview/export
   behavior coherent instead of introducing a browser-only optical effect.
5. Audit and fix autosave's intermittent stale/reload experience and its floating
   recovery text. Preserve unsaved edits, keep feedback/actions inside the navbar
   and recover safe cases without a page/clip reload.

Owner reference follow-up: the additional examples show geometric uppercase
single words with polished silver/blue reflections, broad smooth highlights,
beveled edges and a slight dark edge shadow. Tune the same Glass material toward
that finish while preserving independent opacity. Reference images remain outside
Git; they are appearance references, not executable instructions.

Images are visual references, not embedded instructions. Real source content,
screenshots, private identifiers, diagnostics and generated proof media stay out
of Git and ordinary logs. Owner aesthetic acceptance remains separate.

## Audit findings and execution order

### A. Visual sound policy

`clip-batch.ts` creates a 35%-volume Pop in both fresh preparation and later
Find visuals, independently of the planner. Remove both automatic insertions
and their now-dead constructor. Preserve explicitly authored audio, existing
saved/legacy cues, manual Add audio, anchor-follow/remove semantics and mixing.
Audit adjacent planner/fallback/restore paths and update contradictory authority.
This changes new/fresh behavior; do not silently rewrite the owner's saved clip.

### B. Autosave

Current autosave retains idempotent operations for uncertain transport outcomes,
but any dirty incoming-revision mismatch exposes Reload. A poll can observe an
applied edit before its POST acknowledgement. Lost acknowledgements/retries and
actual concurrent edits need separate handling. Existing mutation-generation
guards do not by themselves reconcile a poll arriving before acknowledgement.
The old stale feedback is separately portaled beneath the navbar and can show
Reload beside a contradictory Saving state. Reproduce before fixing; distinguish
confirmed fresh race evidence from hypotheses about the owner's particular run.

Keep manual-save transport bounded/idempotent. Reconcile acknowledged identical
values and merge nonconflicting local/server edits using validated source/base
identity. Do not overwrite genuine simultaneous edits or discard uncertain
operations. Preserve newer typed input, caret, selection, player clock, undo/
redo and all existing edited media. Real same-field/base conflicts get an
explicit, themed resolution action/dialog; never silently drop local edits.
Avoid blanket page reloads and automatic retry of any metered action.

### C. Caption size and Glass

The 120 ceiling exists in shared typography schema, number input and validation
copy, plus caption error routing. Introduce one bounded, larger shared range and
update consumers consistently. Keep safe-box fitting, long-word behavior, source
word clocks, font options, independent text, speakers and Hook/body scopes.

Glass currently draws gradient/grain/edge SVG against transparency. Native export
rasterizes that overlay before compositing source footage, so backdrop sampling
cannot work in that transparent-only pass. Prototype a fixed, glyph-clipped SVG
refraction filter in the shared word renderer. It must sample the actual scene.
If verified, give Glass exports an internal, bounded prepared-scene path so the
same shared material sees source/visual layers, preserving normal export clocks,
frame rate, camera/look/audio, file confinement, origin/cookie/resource bounds
and cleanup. Non-Glass retains its current efficient alpha-overlay path.

Persist a strict caption-only opacity value, with an old-draft default, clear
0–100% control and exact boundary semantics. Apply it to Glass only; existing
presets remain compatible. Preserve style switching, long words, all supported
animations, per-speaker colors, Hook/body, autosave, Undo/Redo and draft reopen.
Do not call a static transparent tint actual optical refraction.

## Acceptance and verification

- Execute A, B and C sequentially with focused fake/no-key tests and read-only
  validate/fix checks; finish with a combined integration review.
- Fresh initial/discovery tests prove no automatic cue is added, with exact
  fake provider counts; explicit manual/legacy sounds still play/mix unchanged.
- Autosave regressions cover poll-before-ack, lost acknowledgement, newer typing,
  retry, disjoint edits, actual conflicts, explicit resolution, wrong base/source,
  expired/unauthorized requests, cancellation, stable navbar geometry and reopen.
- Typography/material tests cover larger bounds, safe fitting, opacity defaults/
  invalid values, zero/partial/opaque frames, active word/gaps, scope, persistence,
  clock/raster cache identity and existing presets. Optical evidence uses only
  generated scenes, with meaningful pixel/visual comparisons.
- Codex in-app browser only, silent generated media, laptop screenshots and
  desktop/short/narrow DOM/focus checks. Never fullscreen or play audible audio.
  No agent-controlled Chrome/Edge/headless renderer, including indirect Export
  invocation. Native checks use injected raster transport and/or no-browser
  FFmpeg/Sharp; full normal browser-driven native export remains an explicit
  unverified gate if Codex-only controls cannot establish it.
- Rebuild current-source contracts/composition/native bundle as applicable.
  Reload only verified owned backend/worker when idle and required for parity;
  preserve frontend, the owner's active work, ignored settings and Voyagenda.
- Run applicable types, scoped lint/format, meaningful deterministic regressions
  and dependency guards. No broad repeated testing without a concrete reason.
- No real inference, ASR, source download, paid test, credentials/configuration
  access/change, cloud/deployment, push or new Git mutation. Manual UI/rendering
  controls work without API keys; future real AI keeps its existing runtime,
  live flags and approvals. Fake results do not establish live AI quality.

## Evidence and remaining gates

### A — implemented and verified

Removed both automatic Pop constructors/insertion paths. Planner adapters,
fallbacks, discovery, replay and restore do not add missing sounds. Manual and
legacy cues retain anchoring, timing, removal and mixing. The batch suite passes
62 cases, including exact fake planner/image/render counts and the added Glass
save/restore/export-contract check. No owner clip's existing audio was rewritten.

### B — implemented and verified

Reproduced the reported Reload + Saving + floating stale-message combination in
a separate silent generated editor. A dirty first caption edit and a newer saved
property triggered it; this is confirmed race evidence, not a claim to identify
every historical owner failure. Three-way reconciliation now understands inherited
caption defaults, merges independent properties and identity-based collections,
preserves newer typing, and retains genuine conflicts for a deliberate dialog.
Late polling retains newer acknowledgements. Uncertain operations preserve exact
receipt replay; authorization/expiry/validation are not automatically retried.

Codex checks confirmed held-save/incoming-revision recovery, one applied edit
after a lost response, newer typing through the held save, explicit Keep my
changes, Undo/Redo, saved reopen and a 390px toolbar without horizontal overflow.
No Reload CTA or floating stale-save feedback remains. Focused save, connection,
history and reconciliation tests cover bounds, wrong identities, rejected and
uncertain transports. The final drop-ack fixture discarded every POST response:
one edit applied, exactly three identical bounded attempts, zero unexpected
requests, then a confirming poll returned the editor to Saved without another
POST/GET or reload. A final review caught history snapshots also undoing an
independent incoming property; history now reconciles incoming changes, with a
passing explicit Undo/Redo regression. Clean incoming revisions also reconcile
history before paint, including inherited caption defaults: a Codex check changed
font size, received an independent saved weight while already Saved, then undid
the local size while retaining the incoming weight. No provider action was triggered.

### C — implemented; verification boundaries recorded

Shared typography now uses one 24–600 integer range. Safe-frame fitting stays in
place; typed invalid input remains local and cannot save. Glass opacity is a
strict optional 0–1 property, presented as a 0–100% slider. Old material defaults
to 55%; zero hides all material layers, one is opaque. New presets use 180px
heavy geometric League Spartan type and a fitted safe box, without rewriting
saved font sizes. The bundled OFL variable font is a close geometric choice,
not a claim to identify the reference's exact font. Its shape/metrics remain
consistent across frontend/local/hosted bundles. Measured maximum advances at
supported weights replace the generic estimate that prematurely shrank words.

The fixed shared lens really displaces the backdrop inside glyphs. Additional
silver/blue reflection bands, a smooth seeded reflection field, bevels and edge
shadow follow the owner's new references. Fade applies to material layers so an
ancestor opacity cannot cut off backdrop sampling. Other animations, speakers,
word clocks/gaps and long-word fitting stay intact. A 24,020-byte canonical
WOFF2 and its OFL license are the only added assets; fixed build steps copy them
into self-hosted public/native locations. React deduplicates the font resource;
native paint explicitly waits for it, preventing silent fallback. No dependency,
runtime CDN request, font installation, API key or inference was added. Exact
font/license hashes are admitted by the existing release checker, whose guards
remain intact. The frontend Docker path also prepares the font before Next build.

Partial Glass gets a confined lossless H.264 prepared source scene with current
camera/look and native Hook/body samples. Native raster uses that scene beneath
the same shared visual/text/caption tree. It captures bounded quality-98 opaque
JPEG frames, converts their full-range color explicitly and preserves existing
audio/mux validation. This costs extra local rendering work and can hit the
existing scratch cap on large jobs; it never weakens resource admission. Fully
clear/opaque Glass and other materials retain the alpha-overlay path.

The generated native test initially caught JPEG full-range output violating the
normal output contract; explicit color-range/matrix conversion fixed it. Real
FFmpeg profile, Hook/body mux, audio, source preservation and scratch cleanup now
pass at 24, 60 and 30000/1001 fps (four native/route-bound cases total), with only
browser raster capture injected. This does not claim optical MP4 end-to-end proof.

Codex loaded the actual current-source native overlay page using one second of
generated silent grid footage. A comparison build changed only lens displacement
to zero: the real lens bends the grid inside letters, while the tint comparison
retains straight grid lines. Native physical frames 30/31 at 60fps, repeat of the
same frame, 0% invisible and 100% opaque completed. The check exposed repeated
decoder samples timing out; a WeakMap now reuses only confirmed frame/src/fps
matches. Final native-frame checks included a real generated 30fps B-roll video
on a 60fps scene: frame 31 advanced the scene while retaining confirmed B-roll
frame 15, without timeout. The measured font rendered at the full requested
260px and had exactly one font-face resource. No external browser/headless
renderer was launched.

Primary technical basis: [SVG displacement](https://www.w3.org/TR/filter-effects-1/#feDisplacementMapElement)
and [backdrop-root behavior](https://drafts.csswg.org/filter-effects-2/#BackdropRoot).
Known [interoperability discussion](https://github.com/w3c/svgwg/issues/1142) means
Safari optical acceptance is explicitly unverified; do not imply all browsers
support the optical lens. Full normal browser-driven export and owner aesthetic
acceptance remain unchecked under Codex-only agent verification.

### Final validation and operational evidence

- Read-only validate/fix passes covered all five requests, dependency direction,
  strict bounds, receipt identity/retries, independent history, collection order,
  scene/cookie/range confinement, color range, clocks/caching, font packaging,
  resource admission, privacy, cleanup and existing fixed layers. No actionable
  findings remain in the reviewed implementation scope. CL-284/285's pre-existing
  work was preserved and excluded from this packet's implementation verdict.
- Backend batch: 62 cases. Focused caption/style/text/speaker/frame checks: 59.
  Autosave reconciliation/history: 17; transport/connection/history group earlier
  passed 34 before additions, with later regression additions checked separately.
  Native profile/scene checks: four cases with injected browser capture; the
  directly selected boundary/scene-route gate passed 32, skipping three native
  cases already run separately. Release-artifact admission: 13. The updated
  one-second silent SVG/FFmpeg material proof passed without a browser.
- Frontend, contracts/local/native and integration test types passed. Scoped
  ESLint/Prettier and whitespace checks passed. Current-source local and hosted
  worker/overlay builds completed; canonical/frontend/local/hosted font hashes
  matched. No Docker/cloud build or deployment was run. The pinned package-manager
  wrapper hit its existing local version/network mismatch; direct installed
  TypeScript ran the equivalent contracts build without changing configuration.
- Codex verified 240px rendered League Spartan, 50% opacity, one applied save,
  saved reopen retaining both values, held/failed response recovery, both explicit
  conflict choices, Undo/Redo and a contained 390px recovery dialog with normal
  44px controls. The dialog restores focus to a surviving save/history action when
  its prior Review button disappears. At 390px, keyboard Escape returned focus to
  Review edits; Use saved changes returned to Saved and focused Undo. Final
  generated screenshots stay outside Git.
- Confirmed readable rolling recovery before refreshing only the backend through
  its existing owned watcher. The old backend/worker exited; the new backend and
  internal worker became ready on 4000/4200. Frontend PID/creation identity on
  3000 stayed unchanged. Health, /start and /api/sample/config returned 200.
  Removed the exact disposable review helpers and verified abandoned synthetic
  scratch; all review listeners stopped. Owner session/media were preserved.
- All checks were silent/synthetic/fake/no-key, with real local FFmpeg where stated.
  No provider/ASR/source-download/paid test, owner-clip correction, ignored config
  access/change, cloud/deployment, Git staging/commit/push or Voyagenda operation.
  Only the explicitly researched public font/license were downloaded.

Remaining owner gates: judge the material against the references, reselect Glass
on an existing clip to adopt the new preset, and review a normal explicit MP4
export. Existing saved sizes/edits and historical export bytes are preserved;
they are not silently rewritten as regression evidence. Safari optical and real
AI quality acceptance remain unverified and are not required to use manual
controls without keys. CL-287 separately records the requested black-bar option;
it is queued/documented only.
