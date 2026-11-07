# CL-264 — Compare Gemini and Codex before convergence decisions

Status: planned for 2026-11-08; comparison not performed by this reminder.

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
