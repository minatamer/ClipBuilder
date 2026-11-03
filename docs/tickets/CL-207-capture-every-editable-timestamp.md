# CL-207 — Capture beside every editable preview timestamp

Status: Locally implemented and verified, 2026-11-03. Owner visual/device and
release acceptance remain separate.

## Owner request and authority

Every editable Start/End timestamp with a nearby usable preview must have a
Capture action. Audit and fix omissions, retain this as a standing product rule,
and execute/validate using fake/no-key and synthetic media only. Preserve all
CL-197–206 work, saved clips/media/exports and normal Codex configuration. No
real AI, downloads, cloud, deployment or Git mutation. This is a frontend-only
change; no backend/worker restart is needed.

Dependencies: existing source capture (CL-047), shared picture/text/audio/Hook
timing (CL-077/086/129/133), camera boundary capture and Zoom/Motion
(CL-192/203). Follow the source of truth's per-field Capture clocks/readiness,
anchored footers, responsive controls and Apply/Discard rules.

## Audit

| Surface                           | Editable endpoint                        | Finding                                                 |
| --------------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| Source selection                  | Manual clips Start/End                   | Existing Capture; retain                                |
| Source selection                  | Analysis range Start/End                 | Add Capture for both                                    |
| Camera                            | Start/End boundaries                     | Existing Capture; retain locked outer boundaries        |
| Zoom                              | Start                                    | Add Capture                                             |
| Zoom                              | End                                      | Derived display, not an input; no new control           |
| Motion                            | End                                      | Add Capture                                             |
| Motion                            | Start                                    | Captured at Add at playhead, read-only display          |
| Hook, Text, Pictures, timed Audio | Start/End                                | Existing shared Capture; retain                         |
| Captions                          | Word timings                             | Read-only; no timestamp inputs                          |
| Acquisition                       | Download range Start/End                 | Metadata/thumbnail only; no playable preview to capture |
| Other numeric controls            | Durations, offsets, zoom/position values | Not Start/End preview timestamps                        |

## Acceptance and checks

- Add a concise Clock/Capture button beside each missing input, with distinct
  accessible names and existing shared Button/range-time styling. Preserve
  desktop/320px/390px layout and existing contextual footer actions.
- Analysis capture reads the same source playhead as manual clips, with original
  source offset exactly once. Change only the requested endpoint, preserve the
  other endpoint's precision, validate the complete analysis window against
  available source bounds/minimum length, and invalidate stale analysis only on
  success. Disabled/busy/seeking/failed/null capture leaves fields unchanged.
- Zoom Start uses the current settled presentation frame mapped to the selected
  effect's Hook/body clock; reject the other occurrence, out-of-bounds or
  overlapping Zoom/Motion placement. Preserve duration/target and all other
  effects; capture changes the draft only, never starts playback or processing.
- Motion End includes the current frame in its exclusive endpoint. Respect its
  original occurrence, minimum six frames/thirty-second range and clip/Hook
  bounds, changing no seed/start/person or other draft data. Invalid/null
  capture leaves the endpoint unchanged with concise actionable feedback. The
  main preview may pause for frame alignment, matching existing editor capture.
- Add the durable rule to AGENTS/source of truth. Audit every editable Start/End
  input, with the exceptions above explicit. No new editable timestamp controls,
  automatic provider/render/Apply action or change to manual typing semantics.
- Exercise actual browser Capture actions for source analysis and editor Zoom/
  Motion, correct source/presentation offsets, readiness/failure/busy, invalid
  order/cross-occurrence/overlap, precision, no unintended preview seek and
  responsive keyboard/footer states. Run the focused existing clock/edit tests,
  scoped types/lint/format and a read-only validate/fix pass until no actionable
  findings. Tests use synthetic/injected media and zero real providers.

## Evidence and remaining gates

- Four missing actions added: Analysis Start/End, Zoom Start, Motion End.
  `selection-panel.tsx` owns source capture; `camera-motion-editor.tsx` and
  `head-motion-editor.tsx` own presentation-frame capture.
  `focus-preview-controls.tsx` passes existing Motion paths to Zoom's shared
  placement validator. No new contracts, dependency or backend changes.
- Source browser proof: `test/local-timestamp-exchange.proof.ts` passed, using
  an injected source playhead and actual selection UI. Desktop, iPhone-sized,
  Android-labelled and hosted fixtures verify offset exactly once, preserved
  fractional other endpoint, invalid order/out-of-source/null rejection,
  disabled readiness, inline placement and no horizontal overflow. The existing
  JSON export/import regression also passed; zero processing POSTs.
- Editor browser proof: `test/local-camera-motion-editor.proof.ts` passed (30.65
  seconds final run). Real encoded synthetic video, Player seekbar and Capture
  UI at 1440×900, 390×844 and 320×568 verify body clock with a sixty-frame Hook,
  exclusive Motion End, cross-occurrence/minimum/end-bound rejection, Zoom/Zoom
  and Motion/Zoom overlap rejection, seeking-disabled state and native Enter
  activation. Target/duration/seed/start remain intact. Existing mouse, touch,
  keyboard, Apply/Discard/reopen checks remain passing. Exactly six fake edit
  saves; Capture drafts add no save, tracking, plan, image or render calls.
- Thirty-two existing cases passed across `manual-time.test.ts`,
  `source-window.test.ts` and `camera-motion.test.ts` under
  `scripts/local-test.config.ts`. Windows sandbox module-cache ENOENT prevented
  the first unit invocation; the same isolated suite passed outside that
  sandbox.
- Frontend and test TypeScript checks passed. Scoped ESLint, code Prettier and
  `git diff --check` passed. Final proof adjustments corrected Chrome's required
  Enter text event and counted the Zoom select's disabled placeholder; no
  production behavior was weakened to satisfy the tests. The new packet also
  passes explicit Markdown formatting. Forcing Prettier over normally ignored
  shared Markdown reports existing wrapping differences in all four documents
  (also present at HEAD); broad reformatting is out of scope.
- Synthetic screenshots inspected at desktop and 320px (390px geometry also
  asserted), including inline field placement, ≥44px Capture targets and visible
  context footer. Evidence stays ignored under `.local-build/evidence/cl207-*`.
- Final read-only validate: meets ticket, no actionable findings. Reviewed the
  four production integration points, both proof changes, endpoint audit and
  durable documentation against this ticket; excluded pre-existing CL-197–206
  work from the claim. No deviation. Nothing staged or committed.

Capture works with prepared synthetic/fake media and no API keys or models; new
real Codex/Gemini preparation still needs its existing setup/live approvals.
Owner personal visual/device and hosted/release acceptance remain separate.
Hosted-labelled source UI was checked; no hosted deployment or owner-media/live
AI run was performed. No owner media is an automated fixture. Normal backend,
worker, operating configuration and saved media were not changed or restarted.
