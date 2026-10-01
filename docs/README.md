# ClipBuilder Documentation

This directory contains the product decisions, technical architecture, research inputs, and authoring context for the ClipBuilder portfolio demo.

## Start here

[CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md](CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md) is the canonical implementation specification. It defines the product contract, user journey, architecture, data boundaries, provider responsibilities, cost controls, security posture, verification strategy, and release gates.

When documents disagree, follow the authority order inside the source of truth. The supporting documents below preserve research and decision history; they do not override the current specification.

The latest [browser-owned-media contract](architecture/BROWSER_OWNED_MEDIA.md)
is incorporated by source-of-truth section 0.9. Original video/final output stay
local; there is no application DB or cloud object-storage service. Protected
bounded audio/text AI requests remain proposed and gated. CL-005 owns the
file-level migration and feasibility-first plan; older server-media sections
are explicitly historical, not instructions to provision their resources.

## Locked demo flow

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
│  └─ BROWSER_OWNED_MEDIA.md
├─ operations/
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
