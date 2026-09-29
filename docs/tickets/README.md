# ClipBuilder standalone ticket index

Status: active execution-packet index<br>
Last synchronized: 2026-09-29<br>
Parent source of truth: [`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)

---

## Why these files exist

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
CL-010: build the reversible editor
```

The ticket ID always comes first. Do not prepend `feat`, `fix`, `docs`, or
another Conventional Commit type. This convention does not authorize staging,
committing, pushing, history rewriting, deployment, or provider/cloud changes.

## Cohesion and ordering rules

This plan deliberately consolidates the parent's earlier 22 draft slices into
15 execution packets. Ticket count is not a quality metric.

- One user-visible feature stays in one ticket when its frontend, backend,
  contract, and focused tests form a single reviewable vertical slice.
- Infrastructure and the feature that cannot exist without it stay together
  when separating them would create a placeholder-only or unusable commit.
- A ticket is split only for a real gate, distinct risk domain, or independently
  reviewable artifact. For example, visual approval, active-speaker feasibility,
  and final deployment are honest stop points.
- Closely related packets are adjacent: storage/upload, media/spike,
  active-speaker/visual assembly/editor, and render/result.
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
- The AI proposes bounded candidate, visual-plan, or edit data that references
  real transcript word IDs. Deterministic code validates and compiles it.
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
- The application has no general database or queue. Browser state plus narrow,
  private, expiring storage objects and content-free coordination markers are
  the complete session model.
- Large media bypasses Next.js and Express bodies. Provider secrets remain
  backend/job-only. Signed/resumable capabilities remain short-lived and
  memory-only.
- Logs, metrics, errors, URLs, object names, fixtures, tests, and documentation
  contain no real media, filename, transcript, caption, prompt, provider raw
  payload, signed capability, credential, or user identity.
- Committed and test defaults are `PROVIDER_MODE=fake` and
  `PAID_DEMO_ENABLED=false`; all live flags are false. Tests deny network and
  assert provider call counts.
- No automatic paid-provider or Cloud Run task retry is permitted. A single
  user action consumes at most the documented operation budget.
- Every touched listener, timer, request, upload, object URL, media track,
  subprocess, temp file, lease, marker, and signed capability has an explicit
  cleanup owner.
- Phone, tablet, laptop, desktop, large-monitor, short-height, keyboard, 200%
  zoom, reduced-motion, and forced-colors behavior are release concerns—not a
  separate reduced mobile product.

## Ordered ticket index

CL-001 is **completed** with its deterministic foundation evidence recorded in
the packet. CL-002 has a reviewable standalone reference and is **awaiting
explicit owner visual approval**; its broad styling dependents remain blocked.
CL-003–CL-015 remain planned. Status changes belong in the individual packet
and should be summarized here when work begins or finishes.

| Order | Ticket | Milestone | Coherent outcome | Depends on |
| ---: | --- | --- | --- | --- |
| 1 | [CL-001](CL-001-initialize-workspace-and-contracts.md) | M0 | Reproducible workspace, safe config, browser-safe contracts, and quality foundation | — |
| 2 | [CL-002](CL-002-create-and-approve-visual-reference.md) | M0 | Reviewable design reference plus desktop/phone concepts and explicit visual gate | CL-001 |
| 3 | [CL-003](CL-003-build-canonical-session-and-sample-foundation.md) | M1 | Canonical reducer, safe persistence, rights-recorded fixtures, and deterministic sample data | CL-001 |
| 4 | [CL-004](CL-004-deliver-sample-candidate-review.md) | M1 | Complete no-cost landing-to-candidate-review experience | CL-002, CL-003 |
| 5 | [CL-005](CL-005-implement-secure-upload-and-storage.md) | M2 | Private direct resumable upload, grant/storage security, completion, and cleanup | CL-001, CL-003 |
| 6 | [CL-006](CL-006-build-media-job-and-speaker-feasibility.md) | M2 | Safe media-job runtime, authoritative inspection, and active-speaker go/no-go evidence | CL-003, CL-005 |
| 7 | [CL-007](CL-007-deliver-live-analysis-vertical-slice.md) | M3 | Upload-to-grounded-candidates analysis across adapters, job, API, recovery, and UI | CL-004, CL-006 |
| 8 | [CL-008](CL-008-productionize-active-speaker-assembly.md) | M4 | Validated shot/face/active-speaker focus track for the selected clip | CL-006, CL-007 |
| 9 | [CL-009](CL-009-build-contextual-visual-assembly.md) | M4 | Grounded visual plan, bounded assets/cards, complete assembly bundle, and progress UI | CL-007, CL-008 |
| 10 | [CL-010](CL-010-build-reversible-editor-and-assistant.md) | M4 | Deterministic editor plus one bounded proposal/diff/apply/undo flow | CL-002, CL-004, CL-009 |
| 11 | [CL-011](CL-011-render-and-deliver-final-clip.md) | M5 | Deterministic MP4 render, validation, result, download, retry, and clear | CL-005, CL-010 |
| 12 | [CL-012](CL-012-harden-security-privacy-abuse-and-spend.md) | M6 | Public-demo security, privacy, abuse, capacity, retention, and spend controls | CL-007, CL-009, CL-010, CL-011 |
| 13 | [CL-013](CL-013-complete-accessibility-responsive-and-performance-pass.md) | M6 | Whole-flow responsive, accessibility, motion, and performance evidence | CL-012 |
| 14 | [CL-014](CL-014-audit-release-candidate.md) | M6 | Reconciled tickets, whole-codebase quality pass, deterministic release gate | CL-013 |
| 15 | [CL-015](CL-015-deploy-validate-measure-and-rollback.md) | M7 | Immutable deployment, unpaid probes, bounded live validation, cost/cleanup evidence, and rollback proof | CL-014 and every owner gate |

## Milestone boundaries

- **M0 — foundation and visual gate:** CL-001–CL-002.
- **M1 — deterministic sample story:** CL-003–CL-004.
- **M2 — private media foundation:** CL-005–CL-006.
- **M3 — live analysis:** CL-007.
- **M4 — AI first cut and reversible editor:** CL-008–CL-010.
- **M5 — final render and delivery:** CL-011.
- **M6 — public-demo hardening and audit:** CL-012–CL-014.
- **M7 — deployment and controlled live evidence:** CL-015.

CL-014 is the final pre-deployment audit. CL-015 may deploy only the exact
revision and immutable image inputs that pass CL-014; any material change after
that audit requires the smallest relevant re-audit.

## Initial implementation runway

Ticket numbers define the reading order; dependencies define safe execution:

```text
Foundation lane:  CL-001 -> CL-003 -> CL-005 -> CL-006 -> CL-007
Visual lane:      CL-001 -> CL-002 (owner approval)
Sample slice:     CL-002 + CL-003 -> CL-004
Assembly/editor:  CL-006 + CL-007 -> CL-008 -> CL-009 -> CL-010
Delivery/release: CL-005 + CL-010 -> CL-011 -> CL-012 -> CL-013 -> CL-014 -> CL-015
```

CL-003 may proceed while CL-002 waits for visual approval. Broad production UI
styling and CL-004 completion wait for the visual gate. Live/cloud portions of
CL-005–CL-012 also stop at their named owner gates, while fake adapters,
contracts, local composition, and deterministic tests can continue.

Do not begin feature work until CL-001 exists in code: one lockfile, three
targetable workspaces, enforced dependency direction, real quality commands,
blank environment examples, explicit fake/paid-disabled composition, safe
error contracts, and a backend health path.
