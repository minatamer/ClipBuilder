# CL-244 — Diagnose fresh speaker detection on the designated range

Status: Complete locally, 2026-11-07. Follows CL-243 and supersedes CL-240's
insufficient real-model acceptance. Broader-corpus, physical-device and hosted
acceptance remain separate.

The owner reports fresh captions still showing only Speaker 0 despite two voices.
The owner confirms the actual voice changes at the opening reply, around 0:03;
the baseline model instead merges the opening through roughly 0:13. Speaker
count alone is insufficient acceptance. The owner explicitly requires a generic
Codex correction, never source-specific rules or a forced two-speaker count.
Fix the source pipeline, never patch the owner's clip. The owner now expressly
authorizes continued bounded testing after meaningful fixes using the previously
designated public YouTube source, range 1:04–1:45, to establish actual detection.
Keep source references, media/transcripts and detailed model output outside Git
and normal logs; retain only aggregate evidence in repository documentation.
Use a separate diagnostic copy and bounded free official tools/models as needed
for the authorized root-cause benchmark. No unrelated provider retries,
paid image/title calls, configuration changes, Git mutation, cloud or deployment.

## Scope and acceptance

- Trace local model turns, transcript word assignment, preparation persistence,
  clip/caption compilation and frontend labels, including normal fresh transport.
- Establish why CL-240's diagnostic did not cover the reported normal result.
- Implement a generic correction supported by evidence; retain automatic speaker
  counts, neutral unknowns, existing word IDs/clocks, provider isolation and colors.
- Run focused synthetic/no-key regression gates before bounded real local model
  acceptance on a separate copy of the designated range. Repeat only after a
  meaningful correction or to resolve a specific measured uncertainty.
- Record model timings, turn/word/caption speaker counts, transport evidence and
  cleanup. Reload the normal internal worker only if changed runtime code requires
  it, using verified ownership and preserving rolling recovery and current work.

## Owner follow-up: caption presentation

The owner also requests restoring the established TikTok/Word pop default with
speaker-colored active-word backgrounds and the normal readable foreground.
CL-245 retains the request and acceptance record; implementation and the shared
native reload are consolidated into this active packet so detection-to-caption
verification is cohesive. Explicit styles/palettes and saved clips remain intact.

## Capability and gates

Synthetic checks need no API keys and cannot prove real speaker quality. The
authorized diagnostic uses real API-free local AI with prepared, checksum-pinned
official models and native runtime; its output remains private. Normal unrelated provider processing retains its
configuration/approval gates. Physical-device/live AI title quality is separate.

## Root cause and correction

Read-only inspection showed that attribution survived transport: the old result
had 131 words, with 40/88 assigned to two speakers and 3 unknown. The actual
opening voice change was nevertheless merged until roughly 13 seconds. CL-240's
two-label count therefore did not establish correct turns; its purported isolated
controls had not independently established single-voice ground truth.

Whole segmentation-window embedding pooling submerged the short opening voice.
Changing only the clustering threshold, adding context/padding or using denser
segmentation either retained the merge or invented additional speakers. These
rejected private diagnostics are not acceptance evidence.

The owned native Node child now uses pinned Sherpa-ONNX 2.0.1 and English
WeSpeaker VoxCeleb ResNet34 on overlapping 1.5-second windows, stepped by 0.75s.
Normalized average-link cosine clustering uses one fixed 0.35 distance and needs
two supporting windows per speaker; a single-window input remains supported.
Singleton transition/noise groups remain unknown. Counts are automatic, bounded
to 16, with no requested/forced count or source/text/timestamp rule. Cell centers
form bounded turns without bridging gaps. A boundary may move at most half a
step to an 80ms measured quiet gap only when its energy is below 10% of the
surrounding baseline. Existing word IDs, text and clocks remain unchanged.

Source/manual ASR defers diarization to each new selected clip's shared
preparation boundary. Older prepared analysis caches also defer when the current
adapter declares range preparation necessary; no transcription or saved clip is
rewritten to simulate a fix. The Node dependency is root-local development
tooling, outside the renderer production dependency set. Setup is explicit and
checksum-pinned; no runtime downloads, Python pipeline or old-tool fallback.

## Verification and timings

- 150 synthetic/no-key/paid-off tests pass across eight suites, covering automatic
  one/two/three voices, returning/permuted voices, magnitude normalization,
  singleton unknowns, gaps, invalid/bounded vectors, acoustic refinement,
  original word identity/clocks, cached-analysis deferral, native task arguments,
  caption palettes and composition. The separate CL-243 feedback gate has 26
  passing cases. Local/frontend types, scoped ESLint and contracts build pass.
- Three generated current-source native/browser workflow cases pass in two proof
  files. Native MP4 checks establish normal foreground plus distinct speaker word
  backgrounds in body and Hook, and retained caption/Hook transport. These fake
  proofs establish integration, not real speaker or title quality.
- The authorized fresh real check copied the designated public source into owned
  temporary scratch and exercised worker HTTP, confined file receipts/digests,
  manual ASR, clip preparation and canonical caption compilation. It made one
  speech job with diarization deferred and one speaker job: 131 words, opening
  voice 12, reply voice 118, unknown 1; 33 caption groups and two known speakers.
  Strict opening/reply checks pass, with every word ID/text/clock preserved.
  No provider inference, title or image calls occurred. Original owner clip was
  not regenerated, edited or used as scratch.
- That run took 12.260s for the speech RPC (11.649s ASR) and 4.138s for the
  speaker RPC (3.649s speaker stage). Native controls retained one voice for the
  isolated opening, early reply, later reply and joined same-voice reply, and two
  voices when the opening/reply order was changed. Embedding/extraction timings
  were respectively 131/695/908/1286/1791ms; full-range extraction was 2966ms.
  This sample supports the reported correction, not arbitrary-corpus accuracy.
- Codex-browser generated checks at 1280×720, 1280×900, 1024×768, 768×1024,
  390×844 and 320×700 retain 44px aligned controls, shared scrollbars, readable
  palettes and no horizontal page overflow. Whole/selected/mixed title styles,
  invalid/corrected numeric fields and related editor tabs remain usable.
- Fresh contracts/native worker builds and a frozen dependency installation pass.
  The normal backend/worker were reloaded through verified graceful ownership;
  prior descendants/listeners were absent before replacement. Backend health,
  frontend start and exposed configuration return 200; frontend was preserved.
  New diagnostics are durably populated. Source/base/edit/assets/audio assets/
  outputs/calls/revision hashes match before/after, with current rolling recovery
  established before shutdown.

## Validation and cleanup

The settled read-only validate pass reviewed packet coverage, generic clustering
and bounds, cache/word transport, provider isolation, dependency direction,
production dependency exclusion, explicit palette precedence, shared control
selectors and process/resource ownership. No actionable finding remains in this
scope. No paid/live-provider inference, configuration edit, cloud/deployment or
Git mutation occurred. Normal local provider selection remains Codex.

Generated fixture servers closed with edits 0 and unexpected requests 0; browser
tabs closed and viewport reset. The full temporary source copy was deleted after
the real check. Task-owned diagnostic audio/transcripts/vectors/experiments and
helper files were removed; aggregate evidence and normal private service logs
remain outside Git. Prepared pinned local model/runtime and legacy owner assets
remain available. Fresh clips use the correction; existing acknowledged edits
are preserved. Broader voices/noise/overlap, physical devices, assistive technology
and hosted execution were not established by these local checks.
