# CL-049 — Handle editor preview playback failure

Status: implemented and verified. Dependency: implemented CL-048.

Owner report 2026-10-23: fake-mode clip editing opens a Next.js runtime overlay
with MediaPlaybackError and a generic browser-video error.

Diagnosis: the local Review Html5Video has no onError callback. Installed
Remotion 4.0.534 throws directly from its native error listener in that case;
the generic no-MediaError branch matches the screenshot. Player's render error
boundary cannot catch asynchronous native event exceptions. This proves the
unhandled-event defect; the screenshot alone does not establish why the browser
emitted the event. Do not claim a codec/file/provider cause without evidence.
The dependency also console.error-logs real MediaError events before invoking
onError; installed Next.js 16.3.8 forwards those logs into its developer overlay.
Handle this expected native failure in React's video capture handler before that
dependency listener, with onError as the ordinary callback safeguard. Do not
patch dependency files, global error handling or application console behavior.

Owner-requested read-only app check: fake AI/cloud-off confirmed; two current
clip sources each return HTTP 206, video/mp4, with the requested 4096-byte range.
No identifiers, source content or request secrets were captured or persisted.
This is a narrow diagnosis of the current app, not an automated real-media fixture
or proof of decoding. Existing owner processing was left running.

Additional private, read-only browser diagnosis (separate from synthetic proof):
both existing local clip sources loaded metadata, sought and played successfully
with no MediaError. A bounded hidden browser read the normal same-origin routes,
stored no media/screenshot/content, printed only booleans/error codes and closed
in finally. Fake AI/cloud-off were checked first. No processing or mutation was
requested. This does not establish the original event's trigger or use owner
media as a reusable fixture; it rules out a persistent playback failure in these
two sources at the time of the check.

Acceptance:

- Handle native video failures at Html5Video, pause playback and replace only
  the portrait preview with a concise shared-design error and explicit Retry
  preview. A composition error also has a bounded fallback. No raw source URL,
  browser exception or provider details in product UI or application diagnostics.
- Retry remounts only the player, stays paused at the previous supported frame,
  preserves dirty captions/filter/picture controls and does not reload the clip,
  reprocess, export or call AI. Preserve existing invalid-overlay/reload guards.
  Do not add automatic retry loops or settings/configuration changes.
- Generated-media browser checks reproduce the generic native event and a real
  failed-media request, confirm no escaped error, stopped old media, recoverable
  decode/playback, retained dirty edits/frame, and no added provider/native jobs.
  Inspect portrait fallback and responsive targets; run relevant types/lint/
  format and native editing integration, then read-only validate.

Fake AI and local preview/retry require no API keys. Agent proof uses synthetic
media and fake/paid-off configuration, without env reads or external calls.
Keep all owner media, drafts, exports, private logs and other apps intact. No
app process operation, Git mutation, deployment, cloud or paid/live AI checks.

Implementation: Review handles the native error in capture before the dependency
listener and supplies the normal onError callback. ClipEditor pauses the old
player, stores its frame and replaces only that player with the portrait fallback.
Retry remounts playback at a clamped supported frame without changing the editor
document, selected setting, accepted revision or any processing request. Player
render errors use the same fallback; invalid saved overlay recovery is unchanged.
The shared Retry button stays on one line on phones and retains its descriptive
accessible label. A specific alert selector preserves preview materials instead
of inheriting the general warning stripe/background.

Changed scope: local `clip-editor.tsx`, local CSS, feature README, synthetic
editing-browser helper, source-of-truth note, this packet and index. Prior
CL-028–048 changes are excluded. No dependency, backend or environment changes.

Evidence:

- **10 focused units passed**, using guarded
  `vitest run --silent --config scripts/local-test.config.ts` with frontend
  `editor-state.test.ts` and `runtime-capabilities.test.tsx`.
- **Final synthetic native/browser proof passed in 91.19 seconds**, using
  `vitest run --silent --config scripts/local-proof.config.ts test/owner-batch.proof.ts`.
  The browser injects the screenshot's generic error event while playing and a
  genuinely missing media request. Both produce the local fallback, stop the old
  video, and emit neither escaped window errors nor the dependency media-error
  console log that Next intercepts. Explicit retry decodes a new media element,
  stays paused at the prior frame (within browser timing tolerance), and retains
  dirty filter/caption/picture settings and apply/switch guards.
- Inspected fallback screenshots at 1440, 390 and 320 pixels wide, height 900:
  `.local-build/evidence/cl049-preview-failure-{1440,390,320}.png`. Portrait ratio,
  contained controls and 44px retry targets pass. Each responsive failure is
  followed by successful paused decode/retry. Visual review corrected inherited
  generic alert styling and a wrapping mobile label before the final proof.
- Existing editing/apply/discard/export/reopen checks still pass. Browser recovery
  leaves fake transcription/selection/plan/image counts at **4/4/3/3**, with no
  increase in native jobs. Owned browser/worker/listener/scratch cleanup passes
  with zero surviving resources. All reusable media/fixtures are synthetic.
- Frontend/test TypeScript, focused ESLint, Prettier and diff checks pass.
  The actual app diagnostics above independently confirm current fake/cloud-off
  settings and working bounded decode/seek/play for both existing sources.

Reference: inspected the installed pinned dependency and Next error interception,
plus official [Html5Video error handling](https://www.remotion.dev/docs/html5-video#onerror)
and [Player error boundaries](https://www.remotion.dev/docs/player/player#handling-errors).
No package upgrade or API adoption from a newer release was needed.

Limits: the original browser-event trigger remains unknown; this fix addresses
the verified unhandled-event/logging paths and provides recovery. A bounded
current-source check is not full-file decode proof. Physical-device/owner
acceptance, injected composition-render failure, full suite/build and live/paid
AI/cloud tests remain unverified. No owner file, saved edit, export, configuration,
other app or running service was changed; no Git mutation and index empty.

Read-only validate report:

- Requested: investigate fake-mode video playback opening the developer overlay.
- Achieved: verified the missing native handler and dependency-console paths,
  contained native events, added bounded preview-only retry and retained edits.
- Uncertain: the initial browser-event trigger was not reproduced; both current
  sources passed bounded read-only playback and no corrupt-file cause is claimed.

Verdict: **Meets ticket. No actionable findings.** Scope is this packet's
unstaged/new frontend/test/docs changes, excluding pre-existing CL-028–048 work;
no commit selected, index empty. Reviewed the complete packet, pinned video error
listener and Next console interception, capture/callback/fallback wiring, paused
frame and remount state, retained dirty form and invalid-overlay guards, specific
alert styles, browser regressions and owning docs. No tests or implementation
edits were added during the review; no additional suite was run.

Coverage: **Covered** — generic and genuine failed-media events, no escaped
window/dependency-console error, old-media pause/unmount, explicit paused retry,
bounded frame, preserved dirty settings, unchanged AI/native job counts, three
responsive portraits, materials/targets and cleanup. Composition fallback is
verified by code inspection; **Unverified** — injected composition-render failure,
full suite/build, physical devices/owner acceptance, original event trigger and
provider/paid/cloud processing. Checks: ten focused units, final 91.19-second
synthetic native/browser proof, frontend/test types, focused lint/format/diff,
plus the distinct owner-requested bounded read-only current-source diagnosis.
Dependency boundaries and configuration remain unchanged; no gate was waived.
