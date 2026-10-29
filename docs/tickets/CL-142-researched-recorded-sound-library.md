# CL-142 — researched recorded short-form sound library

Status: implemented and locally validated after CL-141. Owner request 2026-10-29: remove Snap, Whoosh and
Ding from the picker, replace the inaccurate Pop, research editor communities
and fetch actual recognizable recordings instead of new generic synthesis.
The owner authorizes anonymous public sound-sample downloads for this curation;
that does not enable provider/cloud spend, actual YouTube pipeline tests,
deployment, Git actions or ignored env changes. Preserve private owner media.

Research Reddit/X editor discussions and trace specific named effects to public
preview/download pages. Record source URLs, retrieval date, exact hashes,
duration/normalization and uncertainty about identifying the owner's intended
version. Do not treat a generic guide or an old thread as a current popularity
ranking. Initial research identifies Bubble Pop, Bamboo Hit and Camera Cut in
the editor discussion, and Creepy Tension/Sator in a Shorts identification thread.
Select a small practical set with an actual pop/reveal and a brief suspense
Hook option. Fetch bounded public recordings, not scripts/executables or paid
accounts. No paywall/login bypass. Keep personal listening acceptance open.

Allocate contracts audio catalogue/metadata and tests; composition
audio-synthesis plus a dedicated finite recording-data module and decoding
module if needed; backend clip-batch default visual accent and its tests;
renderer audio-mix and focused proofs if encoding changes. Frontend inspector
and preview consume the same immutable bytes, preserve independent layers and
gains. Keep legacy IDs decodeable for existing drafts, but hide retired sounds
from new selection; never silently erase owner cues. Replace the automatic
visual-start Snap with the selected recorded Pop. Add source packaging/build
checks if necessary. No runtime sample download or provider generation.

Prefer compact lossless encoded samples at the existing 48-kHz stereo/frame
clock, deterministically decoded by browser/native paths; keep video/export
quality and all limits. Public sample data/provenance are distinct from private
uploads, transcripts and provider assets. No staging/commit is requested.
Extend the audio browser/native proofs and catalogue tests, service/feature
guides, MEDIA_AUDIO design, source of truth/index and this packet. Rebuild
contracts/current worker through verified ownership after shared/native edits.

- [x] Specific community evidence and actual bounded recordings fetched/identified.
- [x] Retired generic picker entries gone; real Pop and suspense options available.
- [x] Preview and exports use identical recordings; old drafts/layers remain valid.
- [x] API-free tests, native/browser checks, package/types/lint/format and scoped
      validate pass; healthy app preserved; no deployment or Git action.

Audio editing/recording playback remains API-free in FAKE_MODE=true. Real AI
visual selection requires provider setup/live gates; no agent inference runs.
Owner exact-sound taste, personal listening, real media, physical-device, hosted
and release acceptance remain separate; downloading is not release acceptance.

Concrete allocation: `packages/composition/local/audio-sources.ts` owns a finite
WAV/FLAC binary descriptor, `sound-recordings.ts` holds the compact fixed public
recording bytes; `audio-sources.test.ts` covers that descriptor. `audio-synthesis.ts`
retains only retired legacy waveforms, with its existing test restricted to them.
Native `audio-mix.ts` selects only fixed WAV/PCM or FLAC/FLAC whitelist pairs.
Normalize downloaded MP3 to 48-kHz stereo, peak-bounded and padded to whole
logical frames before lossless FLAC encoding. Catalogue durations: Pop 9 frames,
Bamboo 19, Vine Boom 38, Sator 123. No runtime decoder download or codec input.
`test/app-image.test.ts` confirms both closed app contexts carry the fixed
recording modules and still exclude private media/secrets/tests. Public source
provenance/hashes live in MEDIA_AUDIO; original downloads stay outside Git.

## Evidence — 2026-10-29

Four anonymous public MP3s were fetched from the explicit Myinstants download
links: Pop SFX, Bamboo Hit, Vine Boom and Sator. Original/normalized hashes,
exact source pages and community research are recorded in MEDIA_AUDIO. Their
normalized lossless total is 461,734 bytes; fixed source data is 616,015 bytes.
Pop drops only 40 ms of quiet lead-in. No generated substitute, API key, paid
resource, login, actual YouTube pipeline test or runtime network fetch is used.

New selection exposes only those four recorded entries. Retired Snap/Whoosh/
Ding/Background pulse keep their exact legacy waveforms for saved cues. Pop and
Sator now resolve to real recordings. A recorded nine-frame Pop replaces new
automatic visual-start Snap, preserving the anchor, volume and no-end-sound
behavior with no new AI call. Content digests identify immutable preview URLs
and replace old development Blob cache entries under the same ID.

Verification:

- Four focused files / 39 checks passed: catalogue/segment bounds, exact decoded
  FLAC clock metadata, PCM legacy compatibility, deterministic bytes and matching
  recording hashes, plus existing clip preparation/cancel/retry/draft and visual
  accent behavior. The hash test was then switched to Web Crypto to preserve
  composition's browser-safe boundary and reran successfully; no Node import
  exception was added.
- Two final audio proofs passed together (54.21s), using synthetic video/voice/
  uploads with the actual fixed public catalogue. Browser preview measures
  nonzero Sator output and silence after the Hook, isolated Pop audition,
  twelve simultaneous Vine Boom layers, independent gains, upload/URL cancel/
  retry, seek/mute/pause, Apply/Discard, saved reload and actual MP4 export.
  Exact counts remain one fake plan/image, zero selection, three injected URL
  calls and four expected normalizations. No provider or real download occurs
  in these checks. Native proof decodes the recorded visual-start Pop from an
  exported MP4, proving energy near its start and silence before/after/at the
  visual end. Existing speech/music/effect overlap, dimensions/cadence, missing
  asset rejection and clipping checks remain covered.
- Two closed app-context checks passed, including fixed recording modules and
  continued secret/private-media/test exclusion. Frontend/local/proof and
  contracts-without-Node types, scoped lint, Prettier, contracts build and diff
  checks pass. Initial format and test-only Node-import findings were corrected;
  no production boundary was weakened.
- Desktop/834/390/320 library/track geometry and footers pass. Current phone
  screenshots for the four-entry library and Preview in clip controls were
  inspected under ignored .local-build/evidence/cl133-library-390.png and
  cl133-tracks-390.png. Physical devices/personal listening stay owner-only.

Normal native parity: backend refresh verified nine old owned identities removed
and frontend 15768/3000 preserved. New supervisor 25364, backend 22196/4000 and
worker 384/4200. Health, /start and /api/sample/config all return 200. Runtime and
separate stdout/stderr logs are at
`C:/Users/minat/AppData/Local/Temp/clipbuilder-recorded-sounds-20261029-cl142/`.
Normal configuration remains fake/Codex; no owner-media processing or config read.
Public original/prepared downloads are retained outside Git at
`C:/Users/minat/AppData/Local/Temp/clipbuilder-sound-curation-20261029/`.

Scoped read-only validation at HEAD 04450d6: Meets ticket for local verification;
no actionable findings. Reviewed the finite source/codec boundaries, timing,
cache identity, legacy saved cues, exact byte/clock consistency, native/browser
integration and cleanup. Prior CL-135–141 work remains preserved. No new
dependency, lower limit/quality, staging, commit, push or deployment. Deviations:
none; four specific traced examples replace an unsupported popularity claim.
Owner exact-version preference, personal listening/real-media, actual AI/ASR,
physical-device/Safari, hosted and release acceptance remain unchecked.
