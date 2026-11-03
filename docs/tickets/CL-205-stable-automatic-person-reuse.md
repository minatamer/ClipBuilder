# CL-205 — Stable people in automatic camera planning

Status: Locally implemented and verified, 2026-11-03. Final validate: no
actionable findings. Personal real-media identity/framing acceptance remains
open.

## Owner request and authority

Codex sometimes creates more than one numbered person for the same participant.
Reuse the established person and centered initial framing; head movement belongs
to that person's manual Motion path, never a newly numbered speaker. Implement
and validate with synthetic/fake/no-key checks. Preserve CL-197–204, saved owner
clips/edits/outputs, local Codex selection and all configuration. No real AI,
downloads, provider retry, cloud, deployment or Git mutation.

Depends on CL-068/150/154/181 automatic camera/speech associations and CL-203
manual Motion. The source of truth's automatic/manual person focus, sustained
speech evidence, uncertain holds, shot resets, saved edits and native parity
rules apply. This is anonymous within-clip tracking, not biometric recognition.

## Findings and implementation

The shared prompt only promises stable IDs within a shot, and the tolerant
camera compiler admits independent person IDs for one supplied speech speaker.
Read-only content-free inspection confirms an idle nine-clip session with
duplicate speaker-to-person associations. Different observation intervals also
explain why a simultaneous-box-only check cannot solve this.

- Strengthen the existing single planning prompt: establish a clip-wide roster,
  reuse IDs across sampled panels, poses, laughter, movement and shot changes,
  append observations to the same person, and keep one person per confirmed
  speech speaker. A real cut changes geometry, not the participant's identity.
  Preserve earliest established centered framing within a shot; manual Motion
  handles movement. New people require actual distinct visible participants.
- Reconcile freshly compiled automatic plans deterministically. Supported speech
  associations choose an earliest-established canonical person. Merge compatible
  duplicate tracks/observations into it and remap every decision. Also reconcile
  strongly coincident head boxes and short same-shot geometric continuations,
  including unassigned observations. Never merge merely because two unrelated
  people occupy the same screen location across a cut.
- Preserve separate simultaneously distinct people and differently supported
  speakers. Conflicting speech associations stay unassigned/held rather than
  create another target for that speaker. Do not invent voice labels, identify
  people from appearance or relax existing speech evidence gates. This cannot
  guarantee perfect identity when the input is ambiguous or mislabeled.
- Keep opening ID/box priority, real-cut geometry, source/word clocks, bounded
  people/observations/shots and stable same-person camera holds. Existing
  saved/manual focus/Motion is never silently normalized. No new inference,
  model, download, native job, provider retry or render is introduced.

## Verification and completion

Prove late aliases, same-voice cut changes, moving unknown head continuations,
overlapping duplicates, simultaneous distinct people, conflicting voices,
unsupported labels/short evidence, transitive ambiguity, canonical priority,
full coverage/bounds, unchanged inputs and saved/manual behavior. Inject a
duplicate-person Codex planning response and verify one existing inference and
one frame job only, canonical IDs/framing and unchanged transcript. Reuse
relevant camera/Motion and fake batch/provider tests; run scoped types/lint/
format and read-only validate/fix until no actionable finding. If contracts
change, rebuild/reload the idle normal worker with verified ownership and
compare content-free clip hashes. No real-media inference is part of these
checks.

## Produced evidence

- The existing shared `focus-planning-policy.ts` establishes one clip-wide
  participant roster and explicitly separates head movement/manual Motion from
  person identity. No provider-response schema, model, provider choice or extra
  request is added.
  Both existing Codex/Gemini planners reuse it.
- New pure `packages/contracts/local/focus-people.ts` reconciles only newly
  decoded automatic plans. The existing compiler's sustained speech/visibility/
  cross-talk gates admit associations first; compatible same-speaker views and
  strong same-shot head continuations then share the earliest person's ID.
  Observations retain their clocks and earlier-box priority. One supported voice
  has one target; conflicts are unassigned, never redirected to an unseen head.
  Real-cut geometry is preserved. `focus.ts` owns integration; diagnostics add
  only bounded `mergedPeople` and `speakerConflicts` counts.
- 174 fake/no-key/paid-off cases across eight files passed as the settled gate
  in 29.07 seconds: new `focus-people.test.ts`, existing `focus.test.ts`,
  `camera-motion.test.ts`, `camera-follow.test.ts`, backend `codex-ai.test.ts`,
  `provider-ai.test.ts`, `clip-batch.test.ts` and `test/owner-editor.test.ts`.
  The injected Codex alias case verifies that person 5 becomes person 2, its
  initial camera center is retained, transcript data is unchanged, and exactly
  one inference plus one frames job occurs. Geometric, unknown/cut, supported/
  conflicting speech, bounds/immutability and deliberate saved/manual identity
  cases pass alongside existing recovery/edit/Motion checks.
- Review found the first co-visible veto too permissive for adjacent heads. It
  now requires compatible overlapping geometry throughout a group and rejects
  separated endpoints in an alias chain. The added adjacent-head regression and
  final full focused gate pass. Final read-only validate covered every packet
  requirement, real adapter wiring, retained manual behavior, deterministic
  bounds, dependencies, diagnostics and cleanup: no actionable findings.
- Strict contracts/local/frontend/test TypeScript, scoped ESLint/Prettier and
  `git diff --check` pass. No UI or renderer math changed, so browser/native
  exports were not repeated; the shared camera/Motion regression gate covers
  unchanged crop consumers. Existing real-media data was used only for bounded
  read-only anonymous diagnostic summaries, never copied into tests or Git.
- Rebuilt contracts with the offline pinned package manager. Contract rebuilding
  briefly reloaded the existing watcher; read-only readiness and metadata checks
  settled before the scoped restart. Verified the idle backend tree and creation
  times, stopped all eight owned processes and confirmed listener cleanup, then
  ran normal `dev:backend` to rebuild worker/overlay. Frontend stayed running.
  Supervisor 22656 owns backend 13360 on 4000 and worker 24376 on 4200. Codex
  setup is ready and health, `/start`, sample config and capabilities
  return 200. All nine full clip hashes match before/after, preserving bases,
  edits, Motion, assets, outputs and counters; batch remains idle. Content-free
  snapshots and process/log records are outside Git in
  `C:/Users/minat/AppData/Local/Temp/clipbuilder-app-run-b66aacfb063d46f691ce1eb67999dd9b/`:
  `clip-preservation-cl205-{before,after}.json`, `runtime.json`,
  `backend-cl205.stdout.log` and `backend-cl205.stderr.log`.

Owning documentation: this packet/index, source-of-truth stable-person section
and `docs/architecture/LOCAL_CODEX_AI.md`. Earlier CL-197–204 work is intact.
Nothing was staged or committed; no configuration/credential read, real AI,
download, native media job, cloud, deployment or delegation. Deviations: none.

Fake plans and manual Motion work without API keys; real Codex planning needs
installed Codex/login/live approvals and the prepared local speech/speaker
assets. No new assets are required. Personal real-media identity/ framing
quality and hosted/Linux/release acceptance remain owner-only.
