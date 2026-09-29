# ClipBuilder Documentation

This directory contains the product decisions, technical architecture, research inputs, and authoring context for the ClipBuilder portfolio demo.

## Start here

[CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md](CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md) is the canonical implementation specification. It defines the product contract, user journey, architecture, data boundaries, provider responsibilities, cost controls, security posture, verification strategy, and release gates.

When documents disagree, follow the authority order inside the source of truth. The supporting documents below preserve research and decision history; they do not override the current specification.

## Directory map

```text
docs/
├─ README.md
├─ CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md
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

The original AI-clipping research brief: product framing, feasibility notes, tool research, and early recommendations that informed the canonical specification.

### `reference/`

The reusable portfolio-demo build playbook used as an engineering-quality and delivery reference.

### `prompts/`

The source-of-truth authoring prompt retained for provenance. It is historical input, not an instruction to implementation agents when it conflicts with the canonical specification or a later explicit owner decision.

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
