# CL-162 — suggested hooks with owner-selected riser recordings

Status: implemented and locally validated after CL-161. Plan filed before code.
Owner supplied
two MP3 recordings matching the public Riser / Rising tension references and
requests the same fixed recorded-sound catalogue structure. No new download is
needed. Preserve originals and all saved/private media; no Git/deployment.

## Intended behavior

Measure/decode the two supplied files locally as explicit sound curation, not
ordinary app test fixtures. Normalize to existing stereo 48-kHz/16-bit FLAC
catalogue, preserving the full recording and rounding tail silence up to whole
30-fps frames. Publish truthful measured duration/digest and provenance; no
generated substitute. Add both to the picker and preserve all legacy IDs.

Both Gemini and Codex suggest an optional compelling excerpt, preferably at
least 3–4 seconds, fitting the shorter recording when meaningful and at most
the longer recording's measured duration. Prefer natural speech boundaries and
the full sound length when that does not damage the excerpt. Fake suggestions
simulate the same timing. No hook or audio is applied during AI processing.
Use suggestion explicitly applies the hook and one default Hook-only riser:
short recording if it covers the excerpt, otherwise long. No looping or audio
spill into the main clip; maintain independent volume/removal/layering. Repeated
use must not duplicate its default cue or erase user audio. Manual Add hook
does not add sound and is not limited by either recording. Owner explicitly
confirmed retaining the existing manual 10-second app limit. Presentation and
resource limits remain unchanged. Shorter suggested hooks trim the recording's
lead-in so the rise resolves exactly at the cut, without speeding it up.

## Whole-file plan

1. Contracts `hook-sounds.ts`, `audio.ts`, `hook.ts` and relevant tests: fixed catalogue metadata,
   shared AI hook timing policy and suggestion normalization separate from
   manual validation. Reuse existing projection/placement/volume contracts.
2. Composition `sound-recordings.ts` and source tests: fixed normalized bytes,
   digests/sample-clock verification, old saved sounds remain playable. Update
   synthesis exhaustiveness only if new IDs require it; never synthesize risers.
3. Backend hook policy/fake-clips/provider/Codex tests: prompt + tolerant bounded
   suggestion decoding using measured clocks, no extra inference or image call.
4. Frontend Hook controls/editor and narrow pure edit helper/tests if needed:
   distinguish explicit suggestion from manual changes; atomically add one cue,
   preserve other audio, normal Apply/Discard/restore/export. Picker uses the
   existing preview/gain/layering system.
5. Existing audio/editor and speaker-hook synthetic native proofs: suggestion
   versus manual behavior, track choice, short/long clocks, volume, cut boundary,
   repeat/removal/discard/save and no additional provider calls.
   `test/local-audio.proof.ts` checks both actual catalogue FLACs in isolated
   native Hook-only mixes; `hook-edit.ts` / `.test.ts` own the pure UI action.
6. This ticket, index, source of truth and media-audio architecture: measurements,
   provenance, behavior, checks and unverified owner listening/live editorial
   quality. No source filenames/private paths in committed documents.

Validation is fake/no-key/paid-off/network-blocked with synthetic video, never
owner source media. The explicit supplied-sound curation is separate and makes
no network/paid request. Rebuild/reload normal native worker through verified
backend-only lifecycle after contracts/composition change. No ignored env reads
or config changes, cloud, deployment, stage/commit or real inference tests.

## Evidence

- Supplied short recording decodes to 5.294167 seconds; catalogue 159 frames /
  5.3 seconds, 242972-byte FLAC. Long decodes to 7.383958 seconds; catalogue
  222 frames / 7.4 seconds, 613877-byte FLAC. Stereo 48-kHz/16-bit normalization
  preserves all PCM samples exactly on FLAC re-decode; only tail silence pads
  up to a whole video frame. Original files untouched. Digests/public provenance
  are in `MEDIA_AUDIO.md`; no actual download needed or performed.
- Shared contract owns recording clocks/digests and AI preferences/max. Gemini
  and Codex prompts use it, tolerant AI decoder caps at 222 frames, fake advice
  uses 159 frames where possible. Manual schema remains at 300 frames by the
  owner's explicit clarification. No extra provider work or auto-application.
- Pure `hook-edit.ts` acceptance chooses short/long by coverage, aligns the end,
  creates one managed Hook-only cue at 35% with no loop, preserves gain/other
  layers and enforces twelve tracks. Removal clears only its managed default;
  manual Add adds no audio. Manual placement/offset/loop changes detach managed
  ownership. Saved old cues remain compatible and music remains editable.
- Eight focused fake suites / 96 cases pass: hook/audio contracts, fixed
  recording digests/sample clocks and retired compatibility, pure suggestion/
  manual/capacity edits, Gemini/Codex and clip-batch isolation. Command:
  `node node_modules/vitest/vitest.mjs run --config scripts/local-test.config.ts
  --no-file-parallelism packages/contracts/local/hook.test.ts
  packages/contracts/local/audio.test.ts packages/composition/local/audio-sources.test.ts
  packages/composition/local/audio-synthesis.test.ts
  apps/frontend/src/features/local-editing/hook-edit.test.ts
  apps/backend/local/provider-ai.test.ts apps/backend/local/codex-ai.test.ts
  apps/backend/local/clip-batch.test.ts`.
- Current-source `test/local-audio.proof.ts` passes with both actual fixed
  catalogue FLACs in synthetic-video native MP4 mixes: audible Hook, then silent
  body, preserving rate/geometry. `test/local-audio-editor.proof.ts` passes in
  39.73 seconds: manual/no audio, explicit suggested Riser/offset/no-loop,
  Discard, gain 27%, Apply, saved reload and 180-frame exported presentation.
  Keeps overlapping user tracks, hosted rejection, synthetic import failure/
  cancel/retry and CL-161 clean/dirty footer/layout checks. Exact fake totals:
  one plan/one injected picture, zero selection inference, four audio
  normalization jobs, three synthetic YouTube acquisitions (one canceled).
  New driver steps originally clicked disabled tabs before Discard finished;
  fixed waits for request/committed tab/footer readiness. No live processing.
- Contract/local/frontend/root-test TypeScript, scoped ESLint and changed-source
  formatting pass. Read-only validate of CL-162 scope: meets local acceptance,
  no actionable findings; unrelated pending work excluded. No changed image/
  clip limits, rendering quality, provider fallback, arbitrary URLs or secrets.
- Final normal backend/native refresh and readiness details are recorded below.
  No provider spend, real YouTube pipeline test, configuration, cloud, deployment
  or Git mutation. Real AI excerpt taste, personal listening/devices and hosted
  acceptance remain unchecked; fake/native proofs cannot establish them.

### Normal app refresh

Verified recorded backend supervisor PID/creation time, descendants and known
identities, and confirmed no active clip job. Stopped the nine owned processes
and verified no survivors/orphans or listeners on 4000/4200 through stabilization.
Preserved frontend PID 13720 on 3000. Rebuilt contracts and used normal hidden
`dev:backend`, which rebuilt the current worker/overlay (riser catalogue verified
in the bundle). New supervisor 2688, API 19704 on 4000, worker 4004 on 4200.
Health, `/start` and `/api/sample/config` GETs return 200; Codex setup is ready.
No processing or authentication-file/config read. App left running at
`http://localhost:3000/start`.

Content-free runtime record and separate logs outside Git:

- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl162-app-99a91dd247cc456296d295fb92cd9df6\backend.runtime.json`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl162-app-99a91dd247cc456296d295fb92cd9df6\backend.stdout.log`
- `C:\Users\minat\AppData\Local\Temp\clipbuilder-cl162-app-99a91dd247cc456296d295fb92cd9df6\backend.stderr.log`

Deviation: none; the owner clarified the manual ten-second limit. Changes are
unstaged/uncommitted; all prior pending work and private/saved media preserved.
