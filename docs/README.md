# ClipBuilder Documentation

This directory contains the product decisions, technical architecture, research inputs, and authoring context for the ClipBuilder portfolio demo.

## Start here

[CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md](CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md) is the canonical implementation specification. It defines the product contract, user journey, architecture, data boundaries, provider responsibilities, cost controls, security posture, verification strategy, and release gates.

When documents disagree, follow the authority order inside the source of truth. The supporting documents below preserve research and decision history; they do not override the current specification.

The current [Gemini/private Cloud Run plan](architecture/GEMINI_REMOTION_MIGRATION.md),
[file inventory](architecture/MIGRATION_FILE_INVENTORY.md) and
[setup guide](operations/CLOUD_RUN_RENDERER_SETUP.md) replace older browser-only,
local-model and provider mechanisms. Local implementation through CL-014 and
CL-015 artifact preparation is verified synthetically. The [release audit](operations/RELEASE_CANDIDATE_AUDIT.md)
and [quality matrix](operations/EXPERIENCE_QUALITY_MATRIX.md), with
[local release preparation](operations/LOCAL_RELEASE_PREPARATION.md), separate code
readiness from actual native/media/device/AI/cloud/owner release evidence.
`FAKE_MODE=true` needs no keys and proves fixtures, not real MP4 or AI quality.
Real providers require keys/live/data/rights/paid approval; private media compute
needs independent cloud approval. No local AI weights are used. Older contracts
and records remain collapsed history where superseded.

## Current shared editing flow

CL-061 makes uploaded video → manual/AI moments → shared caption/picture/filter
editor → export the normal application in local and hosted composition. Only
YouTube acquisition is local-only. The former public no-editor rule is superseded.
See [hosted editor release preparation](operations/HOSTED_EDITOR_RELEASE_PREPARATION.md)
for architecture, temporary sessions and owner release gates. The deployed
revision is unchanged. Synthetic fake/no-key checks prove workflow/native
behavior, not real Gemini quality or hosted acceptance. CL-063 additionally
verifies both images and a bounded native editor flow in offline local Linux
Docker; maximum hosted resources and actual remote identity/routing remain
unchecked. Agents must never deploy or run credit-consuming tests without new
explicit approval.

## Historical locked demo flow (superseded by CL-061)

ClipBuilder exposes one narrow visitor journey: choose the sample or upload one
owned/licensed conversation, watch analysis, preview zero to four grounded
candidate moments, choose exactly one, watch the automatic vertical clip build,
review the read-only result, confirm one render, and download it. The automatic
clip uses active-speaker framing, one fixed caption profile, and bounded
transcript-grounded visuals.

The demo has no editor, chatbot, assistant prompt, manual trim/range path,
caption correction or style choice, headline control, visual/focus controls,
editable timeline, proposal/diff workflow, undo, or redo.

## Directory map

```text
docs/
├─ README.md
├─ CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
├─ architecture/
│  ├─ GEMINI_REMOTION_MIGRATION.md
│  ├─ MIGRATION_FILE_INVENTORY.md
│  ├─ DOCUMENTATION_REVIEW.md
│  └─ BROWSER_OWNED_MEDIA.md (superseded history)
├─ operations/
│  ├─ CLOUD_RUN_RENDERER_SETUP.md
│  └─ Provider, cost, software and rights guides
├─ tickets/
│  ├─ README.md
│  └─ CL-001-… through CL-015-….md
├─ prompts/
│  └─ AI_CLIPPING_SOURCE_OF_TRUTH_PROMPT.txt
├─ reference/
│  └─ PORTFOLIO_DEMO_BUILD_PLAYBOOK.md
└─ research/
   └─ AI_CLIPPING_DEMO_BRIEF.md
```

### `research/`

The current AI-clipping research summary: product framing, feasibility notes,
tool research, and the recorded decision to reject a visitor-facing editor.

### `reference/`

The reusable portfolio-demo build playbook used as an engineering-quality and delivery reference.

### `prompts/`

The source-of-truth maintenance prompt. It restates the locked flow so future
documentation revisions cannot silently reintroduce editing or customization.

### `tickets/`

The ordered standalone implementation packets. Start with the
[ticket index](tickets/README.md), then give an implementation agent exactly one
dependency-ready packet. Each packet repeats the context, scope, contracts,
gates, acceptance criteria, and focused verification needed for its coherent
commit boundary.

## Current identity

- Product: **ClipBuilder**
- Preferred domain: `tryclipbuilder.com`
- Backup name: **ClipAssistant**

The word `try` belongs only to the preferred domain; the displayed product name and wordmark remain **ClipBuilder**.
