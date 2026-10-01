# ClipBuilder standalone ticket index

Status: active execution-packet index<br>
Last synchronized: 2026-10-01<br>
Parent source of truth: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)

---

## Why these files exist

**Latest architecture revision (2026-10-01):** original video/results/assets/
final MP4 are browser-owned, with no application DB or cloud object storage.
[Source of truth section 0.9](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#09-browser-owned-media-architecture-revision-2026-10-01)
and [Browser-owned media](../architecture/BROWSER_OWNED_MEDIA.md) govern.
CL-005 is a feasibility-first local-media/admission/contracts/state/config
migration packet, not resumable GCS upload. CL-006 proves browser audio/model
quality; later packets produce local composition/export. GCS/native-media/job
instructions retained in collapsed historical packets are withdrawn, not
remaining gates. CL-015 owns hosting/transport/process-guarantee/provider proof.
CL-005 is now in progress with an approved Mediabunny 1.61.0 installation and
synthetic full-bound media spike on a Windows in-app Chromium laptop. Its packet
records the measured results, AAC timing correction and reproducible harness.
This is a conditional desktop media-route go, not universal device/paid/cloud
proof. The owner explicitly approved the fixed
two-hour disposable local-workspace policy and truthful best-effort cleanup
disclosure on 2026-10-01. CL-005 now implements local intake, OPFS/IDB recovery,
actual range playback, process-local protected admission and the contracts/config
migration. Its independent finding recheck and fresh gate are recorded in the
packet. The R3 disposal/lease race was confirmed and repaired, with 316 tests
and all five root gates passing. Independent R4 revalidation found no actionable
issues and passed 18 focused tests; remaining feasibility/release gates stay open.
Private-mode/eviction/freeze observations remain open. The owner-approved
demo gate uses automated checks, measured desktop-browser behavior and responsive
viewport checks, with no hardware certification or cross-engine matrix;
CL-006 has not been started. Provider transfer/privacy,
public paid guarantees and unverified release claims remain owner gates.

Latest owner clarification (2026-10-01): CL-004 now owns the entire
development-only frontend journey, not a separate public sample feature.
`FAKE_MODE` selects one server composition. CL-005/007/009/010/011 retain real
adapter and media/privacy/rights/spend/cloud evidence, reusing CL-004 screens.
The expanded local flow passes 200 tests and all five root gates. The earlier
186-test slice is historical; independent/owner and real-media gates remain.
The latest Moments revision replaces transcript-first tabs with a vertical
gallery and a play-to-select focused player/alternatives/transcript layout;
its new verification is recorded separately at the top of CL-004. Full-motion
visual approval and real source-footage playback remain unchecked.

Each implementation ticket is a standalone execution packet for one coherent,
reviewable change. A fresh agent should be able to read the selected packet,
inspect the completed dependencies, and implement it without first loading the
entire project specification or reconstructing decisions from unrelated chats.

The packet repeats the ticket-local product context, contracts, file ownership,
scope exclusions, privacy and spend constraints, acceptance criteria, focused
verification, documentation work, gates, and commit boundary. Precision links
into the parent source of truth are for exact schemas, full matrices, and
provider or deployment detail—not an instruction to read all 5,000+ lines.

The original research brief and reusable portfolio-demo playbook remain inputs
and decision history. They never override the parent source of truth or a later
explicit owner decision.

## Authority and synchronization

Use this order when instructions conflict:

1. The latest explicit owner decision.
2. The parent ClipBuilder source of truth.
3. The active standalone ticket for ticket-local execution detail.
4. An approved architecture decision record.
5. The research brief, build playbook, prompts, experiments, or concepts.

A ticket may narrow work but may not silently change product scope,
architecture, privacy, rights, provider behavior, spend, public claims, or a
locked contract. If a material decision changes, update the parent source of
truth, this index, and every affected ticket in the same documentation change.

The parent [repository blueprint](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md#9-repository-and-decision-ownership)
describes the eventual shape. CL-001 creates only its real foundation; later
tickets add the modules they own. Never pre-create the final tree as empty
folders or placeholder files.

## Fresh-chat usage

Start an implementation chat with a prompt such as:

> Implement only CL-007 using `docs/tickets/CL-007-deliver-live-analysis-vertical-slice.md`. Read that packet completely before changing code. Inspect the repository and prove its dependencies are present. Follow the packet's scope, gates, acceptance criteria, and focused verification. Do not absorb adjacent tickets or make paid calls.

The implementation agent must:

- read the selected packet completely and inspect the current repository;
- verify every dependency from code and evidence rather than trusting a commit
  subject or unchecked checklist;
- open only the packet's precision references when an exact schema, matrix,
  prompt boundary, design token, or deployment record is needed;
- preserve unrelated user work and avoid implementing later tickets early;
- stop at unresolved visual, rights, provider, privacy, paid, or cloud gates
  instead of inventing approval;
- keep fake/sample work deterministic and unable to spend by default;
- keep credentials and user-owned identifiers blank in committed examples;
- never read ignored local secret files merely to answer a configuration
  question or claim verification;
- run the smallest targeted checks plus the packet's named manual checks;
- update the narrowest owning documentation when behavior changes;
- report changed files, verification performed, unchecked items, blockers, and
  any deliberate deviation from the packet;
- stage or commit only when the user explicitly authorizes the Git action.

## Ticket commit-message convention

Every implementation or completion commit begins with the exact ticket ID,
followed by a colon and a short imperative description:

```text
CL-001: initialize the ClipBuilder workspace
CL-010: deliver automatic clip review
```

The ticket ID always comes first. Do not prepend `feat`, `fix`, `docs`, or
another Conventional Commit type. This convention does not authorize staging,
committing, pushing, history rewriting, deployment, or provider/cloud changes.

## Cohesion and ordering rules

This plan deliberately consolidates the parent's earlier 22 draft slices into
15 original execution packets, plus owner-requested CL-004A for non-GCloud
provider readiness. Ticket count is not a quality metric; CL-015 remains last.

- One user-visible feature stays in one ticket when its frontend, backend,
  contract, and focused tests form a single reviewable vertical slice.
- Infrastructure and the feature that cannot exist without it stay together
  when separating them would create a placeholder-only or unusable commit.
- A ticket is split only for a real gate, distinct risk domain, or independently
  reviewable artifact. For example, visual approval, active-speaker feasibility,
  and final deployment are honest stop points.
- Closely related packets are adjacent: storage/upload, media/spike,
  active-speaker/visual assembly/review, and render/result.
- A later ticket must not quietly repair a missing dependency. Stop and report
  the dependency gap, or explicitly reopen the owning earlier ticket.
- New A-suffixed packets are reserved for owner-requested corrections or a
  newly discovered gate that cannot honestly fit the original boundary. Do not
  create them simply to avoid completing a ticket.

## Project-wide guardrails carried by every ticket

- ClipBuilder is a disposable public portfolio demo, not a production SaaS,
  project manager, social analytics tool, or nonlinear editor.
- One owned/licensed conversation produces grounded candidate moments and one
  selected 10–60 second vertical clip.
- Analysis returns zero to four grounded candidates, targeting three strong
  choices without padding. The visitor selects exactly one.
- The AI proposes bounded candidate and visual-plan data that references real
  transcript word IDs. Deterministic code validates and compiles it.
- After selection, composition is automatic: active-speaker framing, one fixed
  `clean-emphasis` caption profile, and bounded contextual visuals. The visitor
  only reviews, confirms one render, downloads, or clears.
- Do not add an editor, chatbot/assistant, manual trim/range path, caption
  correction/style controls, headline or visual controls, editable timeline,
  proposal/diff/apply behavior, undo, or redo.
- Do not claim virality, current trend knowledge, rights clearance, instant
  deletion, zero retention, or private platform-algorithm knowledge.
- Do not add accounts, a database, durable projects/history, batch processing,
  direct publishing, remote-platform downloads, scraped or stock B-roll,
  generative video, arbitrary renderer inputs, or sensitive inference.
- Active-speaker framing and sparse transcript-grounded contextual visuals are
  core release behavior. Do not replace them with public left/center/right crop
  presets or a generic asset picker.
- The only dependency direction is
  `apps/frontend -> packages/contracts <- apps/backend`. Applications never
  import each other; contracts stay browser-safe.
- The application has no database/cloud object store/general queue. One
  disposable browser workspace owns OPFS binaries and bounded IndexedDB data;
  backend admission is process-local, not a distributed or durable quota ledger.
- Original video/final output never cross Next.js/Express. Only disclosed bounded
  audio/text may reach protected provider routes. Provider secrets remain
  backend-only; cookie counters alone do not provide replay/atomic guarantees.
- Logs, metrics, errors, URLs, object names, fixtures, tests, and documentation
  contain no real media, filename, transcript, caption, prompt, provider raw
  payload, signed capability, credential, or user identity.
- Committed and test defaults are `PROVIDER_MODE=fake` and
  `PAID_DEMO_ENABLED=false`; all live flags are false. Tests deny network and
  assert provider call counts.
- No automatic paid-provider retry is permitted. A single
  user action consumes at most the documented operation budget.
- Every touched listener, timer, request, upload, object URL, media track,
  subprocess, temp file, lease, marker, and signed capability has an explicit
  cleanup owner.
- Phone, tablet, laptop, desktop, large-monitor, short-height, keyboard, 200%
  zoom, reduced-motion, and forced-colors behavior are release concerns—not a
  separate reduced mobile product.

## Ordered ticket index

CL-002's colors/type remain an **owner-approved interim foundation
(2026-10-01)**. The owner subsequently rejected CL-004's multi-panel/equation UI
and directed one dynamic responsive workspace with shared reusable primitives.
The revised plan is in CL-004/source-of-truth section 0.6; live/rights gates are
unchanged. CL-004's **complete local single-workspace development preview is verified** following CL-003's committed
validation fixes at `0e14f23`. Further visual feedback and substantial polish
are deferred to the later whole-flow CL-013 quality pass, not declared final.
Rights, live retention/provider/paid/cloud, and release approvals are unchanged.
Its 200-test/five-gate and responsive/cancel/restore/no-fallback results are
recorded in the packet. Actual recorded media, upload/processing and remaining accessibility
manual checks are not complete. Independent revalidation and owner review of
the revised UI remain pending.

Owner addition (2026-10-01): CL-013 also owns the original landing product film,
after the actual UI is finalized and owner-approved. Its finalized screenshot
handoff to `gpt-6.1-sol`, storyboard, cinematic cursor/screen/title treatment,
approved result reveal, web delivery and integration gates are detailed in the
packet. This is not CL-004 work. A multi-platform ending illustrates manual
sharing after download, not ClipBuilder publishing or real social uploads.

Owner setup decision (2026-10-01): [CL-004A](CL-004A-prepare-third-party-provider-readiness.md)
prepares the complete non-GCloud provider dashboard, budget and local-software
guides before integrations. [Provider setup](../operations/PROVIDER_SETUP.md),
[cost/budget worksheet](../operations/COST_MODEL.md) and
[local software readiness](../operations/THIRD_PARTY_SOFTWARE.md) now exist;
owner account/settings/budget/live evidence remains pending. CL-012 audits
them later. All GCloud provisioning and cloud verification occur only in final
CL-015. Earlier tickets implement locally and carry explicit cloud deferrals;
fake/local success never completes those external acceptance items.

The following paragraphs are historical dependency/validation evidence, not
current UI approval or ticket status.

CL-001 is **completed** with its deterministic foundation evidence recorded in
the packet. The owner rejected CL-002's standalone HTML direction, then reviewed
the first React replacement and requested stronger navy/cobalt atmosphere,
glass materials, and scroll-driven motion. The owner then rejected the second
pass navbar because it still read as an opaque gray bar instead of a glass
bubble. A researched third material pass is now implemented with a floating
native glass shell and scoped CTA refraction. That review gate was subsequently
superseded by the owner's interim foundation approval and core-flow revision
above. CL-003's committed implementation was **reopened** to align its
candidate cardinality, reducer, persistence, and obsolete proposal contracts
with the later owner decision that removed all editing/customization. That
alignment was **completed and locally verified**: contracts allow zero to
four candidates, the reducer uses immutable automatic clip review, persistence
stores only manifest identity/hash, and legacy editor/assistant configuration is
removed. CL-005 is locally verified with independent validation and release
gates open; CL-006–CL-015 remain planned. CL-010 is automatic read-only clip review
and render confirmation, not an editor/assistant ticket.
The owner subsequently reopened CL-003 for independent validation of nine
session/restore/progress/fake/cleanup findings. All nine reproduced locally.
The first corrections passed the local 150-test/build gate. A second independent
review verified eight findings but found finding 5 still partial (failure after
an in-flight save) and a new custom-abort-reason regression. CL-003 is
**locally complete** after independently reproducing both remaining defects,
applying scoped fixes, and passing fresh format, lint, typecheck, 162-test unit,
build, and diff checks. Independent side-chat revalidation is requested; its
next verdict is not inferred from local success. Earlier completion evidence
is historical. Per-finding requirements, reproduction, context, fixes, evidence,
changed files, and integration boundaries are recorded in the CL-003 packet.
Media rights, visual approval, live retention/provider/paid/cloud work, and
browser/media verification remain unchecked at their later-packet gates.
Status changes belong in the individual packet and should be summarized here
when work begins or finishes.

| Order | Ticket | Milestone | Coherent outcome | Depends on |
| ---: | --- | --- | --- | --- |
| 1 | [CL-001](CL-001-initialize-workspace-and-contracts.md) | M0 | Reproducible workspace, safe config, browser-safe contracts, and quality foundation | — |
| 2 | [CL-002](CL-002-create-and-approve-visual-reference.md) | M0 | Running responsive React landing prototype plus research evidence and explicit visual gate | CL-001 |
| 3 | [CL-003](CL-003-build-canonical-session-and-sample-foundation.md) | M1 | Canonical reducer, safe persistence, rights-recorded fixtures, and deterministic sample data | CL-001 |
| 4 | [CL-004](CL-004-deliver-sample-candidate-review.md) | M1 | Complete single-workspace development frontend journey; real adapters remain gated | CL-002, CL-003 |
| 5 | [CL-004A](CL-004A-prepare-third-party-provider-readiness.md) | M1 | Detailed non-GCloud provider dashboards, local software, privacy/keys and budget readiness | CL-001, CL-004 |
| 6 | [CL-005](CL-005-implement-secure-upload-and-storage.md) | M2 | Full-bound browser feasibility, local media/storage/range playback, protected admission and schema/state/config migration | CL-001, CL-003, CL-004, CL-004A docs |
| 7 | [CL-006](CL-006-build-media-job-and-speaker-feasibility.md) | M2 | Production worker audio profile and explicit browser audiovisual-model quality go/no-go | CL-003, CL-005 |
| 8 | [CL-007](CL-007-deliver-live-analysis-vertical-slice.md) | M3 | Protected transcription/grounded analysis with provenance and browser-owned result recovery | CL-004, CL-004A, CL-005, CL-006 |
| 9 | [CL-008](CL-008-productionize-active-speaker-assembly.md) | M4 | Validated local shot/face/active-speaker focus track for the selected clip | CL-006 local go, CL-007 |
| 10 | [CL-009](CL-009-build-contextual-visual-assembly.md) | M4 | Grounded visual plan, bounded assets/cards, complete assembly bundle and progress UI | CL-004A, CL-007, CL-008 |
| 11 | [CL-010](CL-010-deliver-automatic-clip-review.md) | M4 | Shared browser-compositor read-only review and direct Confirm export parity | CL-002, CL-004, CL-009 |
| 12 | [CL-011](CL-011-render-and-deliver-final-clip.md) | M5 | Production local H.264/AAC encode/mux/validation, final download and clear | CL-005 full-bound proof, CL-010 |
| 13 | [CL-012](CL-012-harden-security-privacy-abuse-and-spend.md) | M6 | Implemented controls and provider-readiness audit; cloud checklist only | CL-004A, CL-007, CL-009, CL-010, CL-011 |
| 14 | [CL-013](CL-013-complete-accessibility-responsive-and-performance-pass.md) | M6 | Whole-flow quality evidence plus the finalized-UI landing product film | CL-012 |
| 15 | [CL-014](CL-014-audit-release-candidate.md) | M6 | Repository release audit with explicit CL-015 external deferrals | CL-013 |
| 16 (final) | [CL-015](CL-015-deploy-validate-measure-and-rollback.md) | M7 | Approved hosting/audio transport/process-guarantee/client proof, immutable deployment, bounded live evidence and rollback; no media bucket/job | CL-014, provider/runtime readiness and owner authorization |

## Milestone boundaries

- **M0 — foundation and visual gate:** CL-001–CL-002.
- **M1 — deterministic sample story and provider setup guides:** CL-003–CL-004A.
- **M2 — private media foundation:** CL-005–CL-006.
- **M3 — live analysis:** CL-007.
- **M4 — automatic AI first cut and review:** CL-008–CL-010.
- **M5 — final render and delivery:** CL-011.
- **M6 — public-demo hardening and audit:** CL-012–CL-014.
- **M7 — final GCloud setup, deployment and controlled live evidence:** CL-015.

CL-014 is the final pre-deployment audit. CL-015 may deploy only the exact
revision and immutable image inputs that pass CL-014; any material change after
that audit requires the smallest relevant re-audit.

## Initial implementation runway

Ticket numbers define the reading order; dependencies define safe execution:

```text
Foundation lane:  CL-001 -> CL-003
Visual lane:      CL-001 -> CL-002 (owner approval)
Sample slice:     CL-002 + CL-003 -> CL-004
Readiness lane:   CL-001 + CL-004 -> CL-004A (non-GCloud guides/owner gates)
Media/analysis:   CL-003 + CL-004A docs -> CL-005 -> CL-006 (local go) -> CL-007
Assembly/review:  CL-006 + CL-007 -> CL-008 -> CL-009 -> CL-010
Delivery/release: CL-005 + CL-010 -> CL-011 -> CL-012 -> CL-013 -> CL-014 -> CL-015
```

CL-003 may proceed while CL-002 waits for visual approval. Broad production UI
styling and CL-004 completion wait for the visual gate. CL-004A documentation
supports deterministic CL-005–CL-012 work without requiring credential setup.
Any local provider check still stops at its named owner gates. Actual hosting,
transport/restart/rollout/hard-cap and deployed live validation wait for final
CL-015; cloud-media jobs/storage/render are withdrawn, not deferred. Local/fake
evidence is never relabeled as deployed or universal runtime readiness.

Do not begin feature work until CL-001 exists in code: one lockfile, three
targetable workspaces, enforced dependency direction, real quality commands,
blank environment examples, explicit fake/paid-disabled composition, safe
error contracts, and a backend health path.
