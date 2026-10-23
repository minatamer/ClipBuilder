# Shared local editing overlay

These pure React components are shared by the normal app's local editing feature
and the internal native worker. They contain no Node APIs, environment readers,
application imports or provider SDKs. Fixed caption and picture geometry/timing
is used for both preview and export; video looks use the same contract-defined
RGB matrices in the browser and FFmpeg.

Caption word highlight/pop/bounce/reveal/single-word/fade and picture entry/exit
motion are frame-driven in this shared tree. `overlay-frame.ts` uses matching
motion phases for native raster reuse, including caption gaps and short cues.
Optional style/motion fields preserve old documents; original caption placement
stays bottom-aligned unless the owner chooses a centered preset. No CSS clocks,
remote fonts or animation packages are used for video output.

The normal application build includes the local feature. Hosted runtime gates
keep the local controls/routes unavailable. There is no separate owner UI build.
See the [workflow guide](../../../docs/operations/LOCAL_WORKFLOW.md).

`local:test` covers deterministic editor/overlay behavior. The opt-in
`local:proof` verifies generated synthetic media, browser controls and native
exports after the normal build. Tests use fake AI, paid-off and no keys; real
provider quality remains owner-manual with normal Gemini settings/approvals.
No offline AI model or weights are included.
