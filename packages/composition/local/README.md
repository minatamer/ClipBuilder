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

CL-086 adds bounded independent text between pictures and captions. Shared paint
and offline text metrics drive TikTok outlines and solid/translucent backgrounds
for both text and styled captions. Only the background alpha changes opacity;
glyphs retain their selected color/weight. Text wrapping and frame visibility use
the same React tree in Player and native export; active text IDs join raster-cache
identity so invisible gaps cannot reuse a text frame. No remote font is fetched.

The normal application build includes this feature locally and in the CL-061
shared hosted editor. Hosted authentication/resource gates remain; only YouTube
acquisition and local libraries are excluded. There is no separate owner UI build.
See the [workflow guide](../../../docs/operations/LOCAL_WORKFLOW.md).

`local:test` covers deterministic editor/overlay behavior. The opt-in
`local:proof` verifies generated synthetic media, browser controls and native
exports after the normal build. Tests use fake AI, paid-off and no keys; real
provider quality remains owner-manual with normal Gemini settings/approvals.
No offline AI model or weights are included.
## CL-271 visual media

Uploaded-video face tracking uses bounded normalized raw-source points. Shared
visual transform math combines their displacement with authored Zoom/Pan, clamps
framing to the source, and contributes the resulting framing to raster-cache
identity. Original-video Pan retains preceding magnification through the shared
camera sampler. Both paths need no provider keys; temporary crop inspection
belongs only to the frontend and never enters exports.

The fixed shared visual stack includes admitted video layers and pictures in one
saved array order, below captions/titles. Frame-driven crop/zoom math is shared;
both pictures and videos support explicit manual pan with independent zoom controls.
The same composition serves local Codex and hosted Gemini sessions without provider
dependencies; fresh provider processing retains its separate approvals.
the browser supplies clock-owned silent video elements and native rasterization
seeks only verified normalized B-roll on its authenticated same-origin server.
The original interview stays outside Chromium. Video sound is derived into the
existing audio mixer; visual coverage and selection never change its gain/clock.
