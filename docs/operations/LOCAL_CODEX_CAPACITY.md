# Local Codex capacity ownership — CL-185–190

## Collection readiness delivered — CL-190

Both local Codex readiness flags are enabled. Total moments/clips are
quota-free; server-owned policy still bounds Gemini/hosted operations. Wire
reads page fifty items with a byte target, review mounts fifty cards and the
rail twenty tabs. The existing worker is serial; disk/heap availability gates
actual active work. Saved records/receipts page arrays into immutable
digest-bound trees, with legacy reads and explicit retry.
Per-item/media/response bounds and two-hour inactivity handling remain. This
does not remove Codex subscription/model limits or prove real large-video/AI
quality. Earlier foundation-state paragraphs are historical.

## Long-source readiness delivered — CL-189

The local Codex source readiness flag is now enabled. Source duration/byte
quotas are null only for this server-owned profile. Downloader, native
remux/inspection, upload, saved source and draft paths honor it. Disk reserve,
safe arithmetic and decoding stay enforced. Audio/discovery work is chunked and
acknowledged; each receipt and operation remains bounded. Count/batch readiness
remains off until CL-190. Earlier foundation-state paragraphs are historical.

The server resolves capacity from explicit local/hosted composition and the
selected provider. Requests, browser state, saved drafts and hosted exemptions
cannot select a privileged profile. Gemini/hosted limits stay independent.
`packages/contracts/local/capacity.ts` owns the policy and finite arithmetic;
`null` means no product quota, not infinite allocation or omitted validation.

## Foundation delivered by CL-185

- The normal local host advertises its effective content-free capacity. The
  browser file picker consumes its source-byte limit while retaining a separate
  bounded draft-document limit. Older capability responses remain compatible.
- Upload and acquisition admission use the composed policy. Native tools receive
  the same profile only in the private startup descriptor, never job JSON. The
  source parser retains codec/geometry/clock checks and safe integer bounds.
- Local Codex scratch checks use actual available space and the existing 10-GiB
  reserve. Drafts, rolling recovery, sources, batch work and manual exports use
  the same disk port. Secondary saved-source/component quota checks preserve
  Gemini's bounds and do not impose them on Codex. No automatic media deletion.
- Local low-disk intake fails with fixed `disk_unavailable`/HTTP 507, with an
  actionable free-space message and no automatic inference/retry. No path, disk
  identifier, environment value or private error body is exposed.
- At this foundation commit, long-source and larger-batch readiness are false.
  Actual admission still exposes one hour/10 GiB and ten processing clips for
  Codex. These intermediate gates prevent partly implemented large-source work;
  CL-189/190 enable or remove them only after downstream proofs pass. This is
  not completed two-hour support and not a replacement higher duration quota.

## Audited path allocation

| Path/boundary         | Current constraints and owner                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local upload/picker   | `experience.tsx`, `open-local-file.ts`, normal local bridge and host `receiveSource`/`inspectWorkspace`: stream the File/body and bind measured bytes. CL-185 centralizes effective policy; CL-189 enables long sources. Hosted upload has separate existing admission and transport.                                                                                                                |
| Source contracts      | `index.ts` source/workspace/job/result schemas and `acquisition-profile.ts`: legacy/default parsers remain bounded. CL-185 adds explicit profile-aware structural source parsing; CL-188/189 propagate interval/long-source decoding without weakening Gemini.                                                                                                                                       |
| Source clocks/ranges  | `policy.ts` short cuts and `selection.ts` manual timestamps/parser/coverage: CL-186 introduces a distinct analysis window; CL-189 removes local Codex absolute source-clock ceilings. Existing short output-clip duration policy is separate.                                                                                                                                                        |
| Quality/offers        | `resolution-choices.ts`, `youtube-formats.ts`, native acquisition descriptor and export profile: CL-187 owns supported highest-quality offers and master/derivative parity. Codec/HDR/cadence checks remain actual capability boundaries.                                                                                                                                                            |
| Download/merge        | `source-acquisition.ts`, `yt-dlp-acquisition.ts`, `acquisition-egress.ts`, native `acquisition-media.ts`, acquisition progress schemas: byte/component/progress limits, unknown-size reservation, transfer/idle deadlines and exact format binding. CL-188 owns partial acquisition and CL-189 final long-source admission; do not silently fetch entire sources or bypass network controls.         |
| Native inspection     | `media.ts` source policy comes from trusted tools. Packet-probe output remains bounded; CL-189 must avoid an ever-growing all-packet response for very long inputs. Safe decoders, file confinement and fingerprint checks remain.                                                                                                                                                                   |
| Speech                | `codex-media.ts`, `codex.ts`, provider-media preparation and `workspace-files.ts`: 120-MiB WAV, speech/artifact/word-count/timeout limits and partial coverage. CL-189 owns complete chunked speech, seam reconciliation and reusable acknowledged coverage. No silent truncation or model downgrade.                                                                                                |
| Discovery             | `analysis.ts`, `selection-policy.ts`, `codex-ai.ts`, `codex-exec.ts`, shared candidate schemas: whole-transcript input/output/word/result bounds and one-call assumption. CL-189 owns planned bounded coverage requests; CL-190 owns total result/count handling. Gemini call budgets remain unchanged.                                                                                              |
| Review/processing     | `selection-panel.tsx`, `clip-batch-panel.tsx`, `clip-batch.ts`, `clips.ts`, `selection.ts` and `agent.ts`: ten retained/prepared clips and 360 Find-all results. CL-190 owns incremental review/batches with bounded active workers and server provider guards. No automatic submission.                                                                                                             |
| Save/recovery/library | `draft-store.ts`, `source-library.ts`, `drafts.ts`, `session-recovery.ts`: source/file bounds, aggregate clip/assets/raw/output counts and bounded JSON documents. CL-189 handles source coverage/size; CL-190 handles incremental count/persistence. Read old records, preserve saved/retained files, keep two-hour expiry and explicit retry. A restored record cannot grant provider permissions. |
| Exports               | `media.ts`, `clip-render.ts`, `export-profile.ts`, output schemas: original-source pixels, source cadence, short-clip clocks and bounded output/executable work. CL-187 audits quality; CL-190 handles many separate exports. Per-operation decoder/output protections cannot silently become a total-session quota.                                                                                 |
| Protocol/resources    | `request-body.ts`, `worker-transport.ts`, worker/agent JSON parsing, image/frame limits: keep bounded messages and native concurrency. CL-189/190 split large logical work rather than remove per-message safeguards. Disk reserve/actual hardware and Codex context/output/allowance still apply.                                                                                                   |

## Verification interpretation

Synthetic metadata and mocked native probes can prove admission beyond old
bounds without allocating multi-GiB media. They do not prove transcription
completeness, real face quality or two-hour throughput. Current-source
native/browser proofs verify the normal small-source composition and
export/recovery path. Later packets must prove their complete paths before
changing readiness. Development uses
fake/no-key/paid-off/no-env-file/network-blocked composition. Real local Codex
requires prepared speech tools/models, saved ChatGPT sign-in and allowance; it
is API-key-free for that path, not AI-free or wholly offline. Gemini needs its
key/live approvals and is excluded from the current owner's test run.

## Acquisition liveness follow-up — CL-194

Trusted local Codex transfer removes the residual two-hour outer deadline and
aggregate ten-GiB broker budget. Native acquisition removes the ten-minute worker
and eleven-minute RPC deadlines; the production FFmpeg path still stream-copies
and fully decodes the selected source. Active progress instead governs liveness:
30 seconds without advancing validated bytes/external media time during transfer,
120 seconds without native frame/media/byte counters or output writes, and
120 seconds without hash reads. Faststart output rewrites count as disk work.
Metadata/probes remain bounded at 90 seconds. Record/output memory, actual disk
reserve, arithmetic, DNS/host/auth/TLS/rate/socket/concurrency guards and explicit
cancel/reaping are retained. Gemini/hosted policy is unchanged. Stall/timeout
failures use fixed actionable messages; no automatic retry or fallback.
