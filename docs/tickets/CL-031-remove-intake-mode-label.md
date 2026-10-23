# CL-031 — Remove the intake mode label

Status: implemented and verified. Dependency: implemented CL-030.
Owner direction 2026-10-23.

Remove the pictured “Simulated AI · Real local media” row and icon from the
upload/YouTube intake. Preserve the editing-footer provenance, processing settings
and two-choice design. Remove its unused intake style and update the existing
synthetic browser check to confirm the row is absent across viewport sizes.

This presentation change needs no API keys and keeps AI fake. Real AI still
requires its normal keys, enabled flags and approvals; no live processing,
configuration edits, restart, deployment or Git action is part of this task.

Evidence: the existing synthetic intake browser proof passes in **9.90 seconds**
at six phone/tablet/desktop/short-window sizes, confirming the mode row is absent,
the navbar retains clearance, actions retain their focus/target treatment and no
horizontal overflow or processing mutation occurs. The phone capture was inspected.
Synthetic evidence is ignored under `.local-build/evidence/cl031-*`; all proof
listeners/browser processes drain. Focused Prettier and `git diff --check` pass.
No full unit/build rerun is needed for deleting this presentation-only row.

Read-only review: **Meets ticket — No actionable findings**. The edit removes
the intake row and its unused scoped CSS; footer provenance and AI configuration
remain unchanged. Related CL-028–030 work is outside this narrow review.
Owner aesthetic acceptance remains open; no real media/provider checks occurred.
