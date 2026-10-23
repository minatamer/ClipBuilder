# CL-051 — Caption positioning and social styles

Status: implemented and validated. Dependency: validated CL-050.

Authority: [complete owner audit](CL-050-clean-local-flow-and-editor.md), source
of truth's focused local editor section. Execute only after CL-050 validates.

Acceptance:

- Reproduce pointer movement in the real scaled Player, fix interaction/pause/
  propagation, test mouse and touch-style pointers plus keyboard, resize and
  safe bounds. Position presets Upper half, Center, Lower half center the actual
  text box at frame quarters; saved edits and native export use those positions.
- Keep Captions / Filters / Pictures tabs; caption sub-tabs Style / Position
  prevent all settings being presented simultaneously. Use existing tokens.
- Add typography presets and independent frame-driven highlight, pop, bounce,
  reveal, single-word, fade and static caption choices. Preserve local fonts,
  color/size/alignment, old documents, exact spoken-word timing and two-line fit.
- Preview and native export share the rendering tree and animation-aware cache.
  No CSS animation in video output or external fonts, SDK, transcription/model.
- Test schema compatibility, boundary frames, visible animation changes/cache
  keys, gesture conversion and browser interaction; native parity in CL-053.
- Read-only validate; fix actionable findings before CL-052.

Research checked 2026-10-23: TikTok's [text editing documentation](https://support.tiktok.com/en/using-tiktok/creating-videos/editing-posting-and-deleting)
describes font/color/alignment/highlight and direct dragging. Remotion's
[TikTok template](https://www.remotion.dev/templates/tiktok) and
[caption pages](https://www.remotion.dev/docs/captions/create-tiktok-style-captions)
describe timed word/page grouping; its [caption examples](https://www.remotion.dev/elements/captions/)
include popping words, rounded captions and word highlight. Reimplement these
general patterns within the existing composition rather than copy template code
or claim exact proprietary TikTok fonts/algorithms. Pinned Remotion 4.0.534 stays;
newer Elements style selection is not available in this version. No popularity
ranking or pixel-identical TikTok claim. No live AI/paid/cloud checks authorized.

Implementation: Style/Position inspector tabs, exact quarter/center presets with
vertical alignment, Rounded highlight and Typewriter typography, independent
bounce/reveal/word-by-word additions to existing highlight/pop/fade/static.
Direct manipulation pauses the player; click-to-play, double-click fullscreen
and Player's focus-stealing space shortcut are disabled for the editable canvas.
Ordinary playback controls remain. Legacy styles retain bottom alignment.
Cache identity includes reveal progress through gaps and finite bounce phase.

Evidence: **28 focused caption/editor units pass**, including all animation
cache equivalence across gaps and safe exact centers. Native/browser integration
passes in **73.38 seconds**, with actual CDP mouse and touch gestures moving the
caption box, all three presets at exact portrait centers, prior editing/retry/
dirty/keyboard checks and responsive screenshots. Fake counts remain 4/4/3/3 and
no extra native jobs; owned resources drain. Frontend/test/local/contracts types,
scoped lint and format pass. No dependency upgrade, paid/provider/cloud request,
environment read, Git mutation or app process action.

Read-only validate: **Meets ticket; no actionable findings.** Reviewed shared
schema/style/cache and actual frontend integration, legacy optional fields,
inspector ARIA, event/request cleanup and proof evidence. Two proof assertions
needed updates for nested tab groups and asynchronous parent footer state; these
were test-scope corrections, not weakened interaction requirements. Physical
touch hardware and owner acceptance remain unverified. New native motion/picture
pixel parity and full combined gate follow in CL-053, as planned.
