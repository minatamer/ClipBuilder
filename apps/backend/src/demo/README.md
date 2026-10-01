# Deterministic sample foundation

`sampleAnalysis.ts` owns the synthetic, production-shaped sample response and
precomputed immutable automatic assembly metadata. Its candidate fixtures cover
the zero, one, curated three, and maximum four boundaries without weak padding.
`sampleManifest.ts` records the pending sample asset status, while
`sampleFakes.ts` composes the explicit success, timeout, provider-error, and
operation fixtures. The fake clock, fixture provider, and operation store run
without network or credentials, expose call counts, reject unknown keys, and
never replace a failed live call.

CL-004's `conversationSample.ts` is a separate original precomputed text
fixture: three distinct 58-second conversations for the revised UI. Its timings
are synthetic, not a recorded/transcribed source. Existing CL-003 fixtures stay
immutable. `sampleSession.ts` exposes this analysis only through fake/local
fixture routes. Following the owner's scope clarification, its operation store
now advances explicitly development-only inspection/analysis/build/render
scripts. Starts are counted/idempotent, provider calls stay zero, and no bytes
are uploaded, inferred or rendered. `conversationAssembly.ts` provides an
immutable synthetic framing/quote/caption specification for each choice, never
real assets or recorded footage. No download capability exists.
The bounded ephemeral session map/cookie is not a production grant or storage
implementation; `sampleSession.test.ts` asserts expiry/capacity/clear and call
counts alongside existing zero-to-four fixture boundaries.

No sample video, poster, or generated visual binary is present. Source-of-truth
section 0.9 supersedes the former GCS sample/object-generation handoff. CL-005
migrates the legacy synthetic descriptor fields with shared contracts/tests;
later approved sample delivery must supply immutable rights-approved assets
to the browser without introducing visitor-content storage or a media job.
The delivery/rights/publication choice is still gated; this documentation pass
does not add a binary, read real media or alter these fixtures.
