# CL-264 — Compare Gemini and Codex before convergence decisions

Status: requested capability/hosted-limit comparison completed from repository
code, 2026-11-08. Broader measured quality/latency comparison remains unperformed.

List the actual Gemini/Codex pipeline and product differences so the owner can
decide which behavior to merge. Compare local/hosted availability, intake,
transcription and word clocks, speaker attribution, moment/Hook selection,
matching titles/emphasis, images, camera/Zoom/Motion plans, audio, prompt/schema
normalization, validation, retries, logging, latency and provider boundaries.
Separate implemented behavior, verified evidence, known gaps and unverified
assumptions; distinguish shared editing/rendering from provider-specific work.

Acceptance: a repository-grounded comparison with file references and concrete
owner decisions needed. Inspect existing provider implementations/tests and
source-of-truth decisions; no model/provider calls are required for this review.
Do not merge behavior, change provider/configuration or weaken isolation merely
because it differs. Follow-up implementation needs a separately scoped packet.

Fake/no-key tests establish shared mechanics; real provider quality remains
separate with runtime/key/live flags/approvals. No spend or deployment now.

Linked work: CL-261 reminder, CL-262 Codex testing and CL-265 Gemini acceptance.

## Owner-requested capability and deployed-user limits

The owner asks which allowances exist on Codex but not Gemini, and the deployed
Gemini visitor's limits. This is a code-policy review of local Codex, local
Gemini and hosted Gemini, not verification of the live deployment or private
environment. No ignored configuration, provider, cloud or Git action was used.

| Capability | Local Codex | Local Gemini | Hosted Gemini |
| --- | --- | --- | --- |
| Source size/duration | No fixed product quota; decoding, safe arithmetic and disk reserve still apply | 10 GiB; no source-duration quota after CL-268, with bounded individual AI requests | Public defaults/ceilings 500 MiB / 20 minutes; configured limits may be smaller |
| Collection capacity | Expanded profile: no ten-clip/aggregate moment product ceiling; per-item and transport/resource limits remain | Ten processing clips; numeric AI requests up to ten | Three shared manual/AI clip slots for ordinary visitors; ten processing clips for exempt owner use |
| Manual rows | Structural submission ceiling 10,000 | Ten | Three demo slots; ten for exempt owner use |
| Find all moments | Available, bounded regional work with no aggregate moment quota | Available locally; 360-result safety ceiling and ten processing clips | Rejected by hosted server, including exemptions |
| YouTube video/audio acquisition | Available with local prerequisites | Available with local prerequisites | Excluded from UI and route allowlist; uploaded video only |
| YouTube resolution picker | All supported offered tiers, including admitted 4K | English-audio 480p–1440p choices | No YouTube intake |
| Save/open local drafts, retained-source reuse and rolling local recovery | Local features | Local features | Temporary hosted session; no durable local project library/draft routes |
| Timestamp JSON exchange | Local desktop only | Local desktop only | Not available |
| Speech/caption preparation | Installed local speech/alignment/diarization tools; Codex handles editorial planning | Gemini audio transcription/planning | Gemini audio transcription/planning |
| Image fallback after real-image search misses | Locally rendered illustration, without Gemini image calls | Gemini image-generation fallback | Gemini image-generation fallback |
| Explicit AI Hook-title generation | Available with Codex readiness | Available with Gemini readiness | Enabled by CL-267's hosted composition; explicit opt-in and provider-operation budget apply |
| Manual Find visuals | Available with local provider readiness | Available with local provider readiness | Intentionally disabled in UI and server dispatch, including owner exemptions |

The caption/text/picture/filter/camera/Hook/audio editor and native export layout
are shared. Manual clips and AI-selected clips remain available in all modes.
New manual clip bodies are 1–60 seconds, AI bodies 10–60 seconds, regardless of
the local Codex source/collection allowance. Ordinary manual Hooks can add up to
ten seconds; bundled Hook audio uses its recording-led 5.3s/7.4s clocks. English
is the current product scope. No inference fallback from Codex to Gemini occurs.

Code owners: `packages/contracts/local/capacity.ts`, `policy.ts`, `selection.ts`,
`hosted-editing.ts`, `apps/backend/local/runtime.ts`, `server.ts`,
`codex-ai.ts`, `provider-ai.ts`, frontend `resolution-choices.ts` and
`use-timestamp-exchange.ts`. Codex is rejected outside local composition by
`apps/backend/src/config/env.schema.ts`.

### Ordinary deployed visitor

- One uploaded source per session; default public input cap 500 MiB / 20 min.
- Three clip slots total, shared by manual and AI selections, not three each.
- One successful demo per network per rolling 24 hours. Admission reserves the
  network before work; the first successful export generation starts the
  cooldown, not its download. Failed/abandoned reservations expire with their
  lease; clearing cookies or Start over does not erase the durable ledger.
  IPv4 uses its address and IPv6 its /64 grouping; this is not account identity.
- Hosted access TTL defaults to two hours and is configurable from 15 minutes
  up to two hours. Hosted files are temporary and there is no durable save library.
- Per session: 32 metered provider-operation reservations, 64 native jobs, 1,024
  media reads and 2 GiB delivery. The provider-operation ceiling is also shared
  across the current workflow runtime. Image work reserves two units; these
  numbers are not counts of UI clicks or a promise of raw HTTP API-call counts.
- Up to twenty retained export revision IDs per clip, subject to the native,
  delivery and 5 GiB scratch budgets; maxima are not guaranteed simultaneously.
- Server safeguards: one active session per instance, three starts per five
  minutes per instance, and durable global UTC-day caps of twenty admitted
  sessions, one hundred metered provider operations and two hundred native jobs.
  These global limits include allowlisted owner use.
- Private IP exemptions bypass the three-clip and network-cooldown rules. They
  do not grant the Codex profile, YouTube/Find all/local-draft routes, larger
  source limits or exemption from security/global/per-session resource gates.

Sources: `packages/contracts/src/constants.ts`,
`packages/contracts/local/hosted-editing.ts`, `clips.ts`,
`apps/backend/src/config/env.schema.ts`, `apps/backend/local/hosted-runtime.ts`,
`hosted-workflow.ts` and `demo-usage.ts` plus their existing tests. The old
one-final-render public sample limit is separate from the current shared editor's
twenty-revision ceiling and should not be presented as its current export limit.

### Hosted capability decision — CL-267 follow-up

The review initially found that `hosted-workflow.ts` omitted visualDiscovery and
hookTitleSuggestions, so both defaulted to false in ClipBatch. The owner then
requested hosted Hook titles while keeping manual Find visuals disabled.
[CL-267](CL-267-hosted-hook-titles-without-find-visuals.md) owns that implementation:
explicit hosted Hook-title capability and pre-inference metering, plus disabled
manual visual capability/dispatch. Initial automatic clip pictures and local
Find visuals retain their existing gates. This is product/composition policy,
not an inherent Gemini limitation; the source fix has not been deployed.

No synthetic or real processing was triggered for this review. Existing fake/
no-key evidence establishes mechanics only. Real Codex needs its installed CLI,
sign-in/allowance and local speech tools/models; Gemini needs API keys, enabled
live features and applicable approvals. Neither real quality/latency nor the
currently deployed configuration was verified. Decisions about merging provider
behavior remain separate from CL-267's targeted hosted capability decision.
