# Synthetic browser-media feasibility

This retains local intake/audio/clock evidence. Its manual portrait-export
actions are historical experiments, superseded by the owner's
[private Cloud Run Node renderer plan](../../../../docs/architecture/GEMINI_REMOTION_MIGRATION.md).
They do not define the product's final exporter. Further migration work is
paused for documentation approval; exclude this harness from deployment.

CL-005/006's manual, synthetic-only spike is separate from `/start`. It accepts no
visitor file, uploads nothing and calls no provider. It generates media in one
owned OPFS folder on a dedicated loopback origin; media never enters Git. This
is not the production media owner, recovery journal, compositor or download.

## Run

From the repository root, after the authorized frozen install:

```text
corepack pnpm --filter @clipbuilder/frontend test:media
```

Open `http://127.0.0.1:4185/`. Stop if this port is already occupied. Keep the
same host/port throughout a run: browser storage belongs to the origin. The
server exposes only thirteen fixed GET assets, no media/body endpoint, and binds
only to loopback. Importing its module does not listen or read files.
COOP/COEP are harness-only memory-measurement headers, not a product decision.

1. Probe and encode the small sample; Play preview verifies actual playback.
2. Generate the full-bound source. Allow at least 1.3 GB of estimated free
   origin space. This synthetic fixture is 20 minutes of moving noise, a
   timestamp panel and synchronized flash/tone pulses, not realistic speech.
3. Preview the immutable source range (600-660 seconds); Play preview and Seek
   to range end verify actual playback and end clamping. Reload and reopen the
   retained small sample; the full source remains available to other actions.
4. Extract all audio, export the 60-second portrait, then Bound the AAC
   presentation duration. The latter preserves encoded bytes/selection and
   bounds final packet presentation timing; plain Conversion's AAC padding
   otherwise extends the container slightly past 60 seconds.
5. Play the bounded output and Validate output flash and tone sync. Decode
   actual markers at 1, 30 and 59 seconds; sample chunk timestamps alone are
   not A/V drift measurements.
6. Copy/reopen/delete the full source copy; inject a mid-write failure. Start
   an export and Cancel current work to exercise partial conversion cleanup.
7. Open a second tab on this origin. Hold workspace lock in the first, request
   a copy in the second, verify it waits, then release the first lock. Close
   the second tab before cleanup to release any preview consumer.
8. Delete spike artifacts. This releases the player URL and removes only
   `clipbuilder-cl005-feasibility`, then confirms that folder is absent. A
   reopen after deletion must fail; delete the empty folder it creates again.
   Stop the server and close test tabs.

No storage-persistence permission is requested. Failed/interrupted generation
or remux may leave unready spike artifacts until explicit cleanup; this harness
does not claim the production pending/ready journal or expiry sweep. Failed
copies and conversions delete their temporary artifact. Test exact public byte
and duration boundaries through the existing contracts tests, not altered
fixture lengths or duplicated product limits.

## Production audio checks (CL-006)

The three CL-006 buttons execute the current production audio extraction module
in the harness worker. Fixed GET modules are transpiled from the repository's
TypeScript using the already-installed compiler; only published public contract
limits and safe error messages are exposed. No source media is sent to the
server, and no provider adapter is connected.

With FAKE_MODE=true and no keys, this harness performs real local audio
processing; AI workflow results remain fixtures. The [current migration contract](../../../../docs/architecture/GEMINI_REMOTION_MIGRATION.md)
replaces LR-ASD/YuNet with Google plans and private Remotion Node/Docker rendering.
Retired model probes are not executable requirements. Live Google analysis needs
server-only credentials, enabled flags and approved media transfer/rights/spend.

After generating the full-bound source, run **CL-006 worker Opus extraction**
and **CL-006 worker PCM reference**. Both consume actual decoded source samples
incrementally, downmix/resample to mono 16 kHz, validate the resulting bytes by
reopening and decoding them, copy only the bounded audio into a returned Blob,
then delete scratch before resolving. Compare source/presentation/decoded
clocks and the synthetic tone onsets near the beginning, middle and end.
Both profiles preserve initial offsets and internal gaps through bounded
awaited silence samples; decoded output begins at zero while source-onset
metadata retains the actual source clock.
PCM WAV is an uncompressed browser comparison profile; it is not the protected
upload format or an approved offline model reference. Opus decodes at 48 kHz in
the measured browser even when its encoder input is 16 kHz.

Start Opus extraction and immediately **Cancel current work**, then run it
again to verify the source remains usable. **CL-006 partial audio write
failure** writes 4,096 bytes through the actual OPFS handle before injecting
quota denial. Check the safe storage-failure flag, partial deletion and source
retention, then retry successfully. The 20-second fixture is useful for quick
iteration; it does not replace the 20-minute check. Cleanup remains the explicit
**Delete spike artifacts** action above.

The candidate WebM/Opus profile uses 64 kbps with a hard 16-MiB artifact cap.
The PCM comparison cap is the shared maximum source duration at 16-kHz signed
16-bit mono plus a bounded WAV header allowance. A 120-ms codec-padding tolerance,
20-second no-progress stall limit and five-minute deadline are operational
failure bounds, not owner-approved speech-quality or performance thresholds.
Synthetic tone/timestamp agreement does not prove speech quality, model MFCC
parity, received-body validation or deployed hosting transport.

## Retired model reference

The former MFCC/model-only probe was removed by the 2026-10-02 Google/Remotion owner decision. Historical numerical evidence remains in the CL-006 packet; do not run that abandoned model acceptance. Native media/audio/offset/cleanup checks remain useful.

## Measurements and limits

Results contain numeric metadata/configuration only. The harness uses a bounded
own-key sessionStorage measurement record (32 KB), not media or production
recovery. Cleanup removes this record. Worker output writes are chunked at
1 MiB; source conversion caches are capped at 4 MiB; sample/packet sinks are
consumed incrementally and awaited. The source-copy File stream's observed read
chunks reached 2 MiB. Close decoded samples and inputs; cancel/close worker
output before deleting files. Page exit terminates workers and releases timers,
observers, frame callbacks and player URLs.

Sample elapsed time with `performance.now()`, main-thread 50-ms heartbeat gaps,
Long Task entries, and optional `measureUserAgentSpecificMemory` at idle and
while running. The last API requires suitable browser/header support, is not
GPU/native peak accounting, and may return slowly. Independently sampling
aggregate browser/Codex process PrivateMemorySize64/WorkingSet64 every 250 ms
provides context, not isolated attribution when other processes are active.
Record actual OS/device/browser, scopes and unmeasured cases with results.
Tab hiding is not OS freezing, and responsive emulation is not phone proof.

The 16-MiB Opus audio and 64-MiB portrait caps are **spike profiles**, not a
reduction of the product's 500-MiB source or 200-MiB output limits. No speech
quality, protected audio endpoint, actual hosting transport, model, caption,
face tracking or final product export is proved by this harness. Quota failure
is injected after committed writes; actual private-mode denial, browser
eviction and OS suspension remain separate tests.

## Versions and notices

Installed `mediabunny@1.61.0` is MPL-2.0. Source/license inspected at
[`0f91fe768e7ee42703f15e2b8845551b0f1028b3`](https://github.com/Vanilagy/mediabunny/tree/0f91fe768e7ee42703f15e2b8845551b0f1028b3),
including its [license](https://github.com/Vanilagy/mediabunny/blob/0f91fe768e7ee42703f15e2b8845551b0f1028b3/LICENSE).
No third-party source is modified/copied here. Preserve required notices/source
availability at distribution; the package's license is not every codec's terms.
Transitive type packages `@types/dom-webcodecs@0.1.13` and
`@types/dom-mediacapture-transform@0.1.12` declare MIT. Native Windows AAC was
available in the original media spike, so no AAC WASM or FFmpeg was installed.
CL-006's later approved private checkpoint/toolchain work is recorded in its
packet and the speaker reference guide; this server still serves no model.
Any later fallback/download requires its own approval and exact-build review.

The actual evidence and unresolved go/owner/runtime gates belong in
[CL-005](../../../../docs/tickets/CL-005-implement-secure-upload-and-storage.md)
and [CL-006](../../../../docs/tickets/CL-006-build-media-job-and-speaker-feasibility.md).
