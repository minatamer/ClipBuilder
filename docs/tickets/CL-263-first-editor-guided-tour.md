# CL-263 — First fully loaded editor tour

Status: backlog for 2026-11-08 discussion; implementation not started.

The owner wants an editor tour matching the tour style in their other
repositories, beginning when the first clip editor has fully loaded. Inspect
the relevant existing tour patterns before choosing the implementation; do not
invent an unrelated style or start the tour during loading/buffering/restoration.

Acceptance for later implementation: reuse the app's shared design and existing
cross-repository pattern, wait for the first usable editor, keep steps anchored
to available controls on desktop/tablet/phone, preserve editing/focus/scrolling,
offer clear skip/close and avoid repeating on every edit or refresh. Define
first-visit/replay behavior in the source of truth before code. Keep errors and
footer geometry stable. Do not add provider calls to tour startup.

Tour mechanics can be developed with generated FAKE_MODE=true/no-key fixtures;
live AI is unnecessary. This reminder request only records the work: no tour
implementation, configuration changes, paid requests or deployment now.

Linked work: CL-261 reminder and CL-262 owner acceptance.
