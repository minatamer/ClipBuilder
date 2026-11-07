# CL-265 — One Gemini test before a deployment decision

Status: planned owner acceptance; not run, no deployment decision recorded.

The owner wants one Gemini test run before deciding whether to deploy. Plan the
bounded source/range, expected pipeline actions and evidence after CL-264's
comparison. Review the existing fake/no-key gates and current exposed Gemini
capability first. A reminder is not permission to perform the run automatically,
change ignored configuration or deploy. Confirm the concrete real-test scope
when the owner starts this item; preserve normal local Codex isolation.

Acceptance: record one actual requested Gemini run, outcome, content-free timing/
error/quality findings, differences from Codex and remaining release gates. Never
automatically retry, purchase credits or deploy. Preserve all completed media,
edits/exports and private diagnostics. Real Gemini requires the owner's key,
enabled live flags and applicable approvals; fake results are not live evidence.
Deployment remains an explicit later decision under the release packets.

Linked work: CL-261 reminder and CL-264 provider comparison.
