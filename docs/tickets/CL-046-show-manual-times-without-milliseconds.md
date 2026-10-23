# CL-046 — Show manual times without milliseconds

Status: implemented and verified. Dependency: implemented CL-045.

Owner request 2026-10-23: manual Start/End fields use HH:MM:SS only.
Remove fractional seconds from their displayed/editable values, cap entry at
eight characters and retain valid clock-part constraints. Preserve existing
precise stored values until that individual field is edited; do not rewrite
saved analysis, contracts, frame alignment or backend processing.

This is a small reversible display/input change. Reuse existing synthetic
browser coverage and relevant types/lint/format; no new mirror unit tests.
Review the settled scope. Fake AI needs no keys; provider/cloud/real media and
live AI checks are outside scope. No env read, retained-file mutation, service
operation, deployment or Git mutation.

Both fields now render eight clock characters and restrict entry to HH:MM:SS.
The existing controlled row keeps its precise timestamp until that individual
field changes, including during hot reload. Existing parsing, validation and
saved values are unchanged; no provider/native processing or persistence added.

Evidence: existing synthetic browser proof passes in **36.99 seconds**, including
manual-only input/selection retention and footer behavior. Frontend types,
focused lint, format and diff checks pass. No new tests were created for this
small display change. Fake AI/paid-off and owned browser/listener/scratch cleanup
remain intact; no external calls, real media or secret files were used.

Read-only validation: **Meets ticket; no actionable findings.** Reviewed the two
field changes, surrounding input/parser lifecycle and owning docs. Prior CL-028–045
work is excluded; index empty. Covered: whole-clock display/input and preserving
untouched precision/backend behavior. Owner visual/physical-device acceptance,
full suite/build and live/paid AI remain unverified.
