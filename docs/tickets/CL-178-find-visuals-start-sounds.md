# CL-178 — Find visuals start sounds

Status: Implemented and fake-validated; current clip repaired and recovered.
Owner listening acceptance remains open. Depends on CL-138, CL-166 and CL-171–177.

## Owner request

Find visuals must set up the same recorded Pop accent used by initial automatic
visuals. The latest real run fetched two images successfully, but its active edit
has zero audio cues. Fix this CTA path and preserve the current session. No real
AI/search/download/render/paid call, configuration, cloud, deployment or Git action.

## Acceptance

- Reuse one existing recorded Pop default (35% volume, visual-start anchoring)
  in initial preparation and successful Find visuals. Add only missing accents
  for freshly obtained AI visuals, whether retrieved or generated. Preserve
  existing sources/volumes, nonvisual audio and owner pictures; resolve removed
  visual anchors and never duplicate cues on replacement, replay or restore.
- Respect the existing audio cue capacity without failing successful visuals or
  discarding existing manual audio. Miss/cancel leaves the prior edit unchanged.
  No extra AI/native/render calls or new sound assets/dependencies/UI controls.
- Add focused fake regression coverage for initially silent results, matching
  initial defaults, existing/manual cue preservation, replay/restore, capacity,
  and move/remove synchronization. Run relevant types/lint/format and read-only
  validate. Refresh the normal backend/worker with verified ownership/readiness.
- Repair the two already-fetched visuals' missing Pops through the existing
  acknowledged edit operation only after proving it makes no inference or render
  call. Preserve all other edits/assets/exports, base data and five attempts;
  do not require refetching or Start over. No real media processing is authorized.

Fake tests need no keys. Actual sound perception is owner acceptance; the sound
recording already exists locally. Real future Find visuals retains current
provider prerequisites/live gates. The current edit repair itself uses no keys
or processing and must not invoke Find visuals again.

## Evidence

### Implementation — 2026-10-31

`apps/backend/local/clip-batch.ts` now uses one `visualStartSound` builder for
initial preparation and Find visuals: existing recorded Pop, 35% volume, offset
zero and a visual anchor at the image start. Successful CTA results resolve old
anchors, retain existing audio edits, then add only missing cues for fresh AI
visuals within available capacity. A full audio track keeps its manual cues and
usable images. Miss/cancel still leaves the prior edit untouched. No additional
AI, native job, render, sound asset, dependency or UI control was added.

The source-of-truth visual-accent section records this CTA parity. Existing
preview/export compilation continues to derive the actual audible onset from
visual visibility, including Hook/body timing; this packet does not replace it.

### Fake verification

- `corepack pnpm local:test apps/backend/local/clip-batch.test.ts packages/contracts/local/audio.test.ts`:
  **51 passed**. Four new cases cover a previously silent clip gaining default
  Pops; replay/restore without duplication; an existing muted accent and manual
  cue retained while a second visual gets a new Pop; full-capacity success; and
  acknowledged audio repair without new processing. Existing cases also cover
  owner picture/edit/export preservation, miss/cancel, movement/removal and
  initial recorded-Pop defaults. Fake dispatch counts are asserted.
- `corepack pnpm local:typecheck`, scoped ESLint, Prettier and
  `git diff --check`: **passed**.
- Tests use synthetic fixtures, fake/paid-off setup before imports, `envDir:
  false`, blocked external network and owned-temp cleanup. No key, ignored env,
  real search/download/provider/native media processing or paid call was used.

### Current clip repair and runtime

After the fake proof, one existing acknowledged `audio` edit added **two** missing
Pops to the two already-fetched visuals at 35%. The comparison confirmed all
non-audio edit/base/asset/export/attempt state unchanged. Original volume was
preserved. Processing stayed inactive and counters remained plan **6**, image
**14**, render **0**. This action was edit-only: no Find visuals request, inference,
image transfer, native preview rebuild or export occurred.

Normal backend/worker rebuilt and refreshed with unchanged configuration and
verified old-tree shutdown. Supervisor **20364**, API **3964** on **4000**, worker
**8948** on **4200**. Frontend **4968** on **3000** preserved. Health, `/start`
and `/api/sample/config` returned **200** at `http://localhost:3000/start`.

Recovery confirmed the same inactive `validated-revision` clip, **14 retained
assets**, **five visual attempts**, two visuals and **two** matching visual-start
Pop cues. Counters stayed unchanged. No Start over or another AI action is
needed; refresh the editor to load the repaired edit and audition the clip.

Content-safe runtime record and separate `backend.stdout.log` /
`backend.stderr.log`:
`C:/Users/minat/AppData/Local/Temp/clipbuilder-cl178-app-ffe8b81157f04870aec2585d0e21e947/`.

### Read-only validate pass

TL;DR: Find visuals now shares the initial sound default, and the current images
have their missing Pops without reprocessing. **Verdict: Meets ticket. No
actionable findings.**

- **Covered:** shared defaults, cue anchoring/synchronization, preservation of
  manual/muted audio and uploaded pictures, missing-only additions, capacity,
  replay/restore, miss/cancel, exact fake calls, processing-free real edit repair,
  type/lint/format checks, documentation and recovered healthy runtime.
- **Unverified:** physical-device listening and a future owner Find visuals run.
  The existing sound file is available; no new API/model asset is required to
  play the repaired preview. Future real discovery still requires the selected
  provider's existing sign-in/key, live gates and owner action.
- **Scope/deviations:** reviewed the two changed backend files, relevant audio
  contracts/compiler and source/ticket/index changes. Earlier CL-168–177 work
  remains preserved; no unrelated audit was claimed. No deviation, configuration
  change, cloud/deployment action, staging or commit. The index remains empty.
