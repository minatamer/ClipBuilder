# Shared local editing overlay

These pure React components are shared by the normal app's local editing feature
and the internal native worker. They contain no Node APIs, environment readers,
application imports or provider SDKs. Fixed caption and picture geometry/timing
is used for both preview and export; video looks use the same contract-defined
RGB matrices in the browser and FFmpeg.

The normal application build includes the local feature. Hosted runtime gates
keep the local controls/routes unavailable. There is no separate owner UI build.
See the [workflow guide](../../../docs/operations/LOCAL_WORKFLOW.md).

`local:test` covers deterministic editor/overlay behavior. The opt-in
`local:proof` verifies generated synthetic media, browser controls and native
exports after the normal build. Tests use fake AI, paid-off and no keys; real
provider quality remains owner-manual with normal Gemini settings/approvals.
No offline AI model or weights are included.
