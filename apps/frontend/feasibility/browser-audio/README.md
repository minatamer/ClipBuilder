# Retained offline audio proof

These CL-006 modules are synthetic test support, moved out of the product worker
in the 2026-10-07 code-quality remediation. The current product uploads the
admitted original and uses the private Node renderer's AAC/proxy pipeline.
Browser workspace extraction, its protocol and its test UI have been retired.
Production cleanup still removes the legacy audio-scratch folder.

```text
corepack pnpm --filter @clipbuilder/frontend test:media
```

Run from the repository root. Vitest installs the shared hardcoded fake,
paid-disabled environment before imports, removes credentials and intercepts
network access. These injected codec/sample/storage tests cover offsets, gaps,
byte ceilings, decoded clocks, cancellation and scratch ownership. They open no
server, use no real media, download no tools and call no provider. Native
browser measurements recorded in
[CL-006](../../../../docs/tickets/CL-006-build-media-job-and-speaker-feasibility.md)
remain dated evidence; this command does not repeat them.

The ordinary fake/no-key product journey supplies labelled fixtures with
Download disabled. Real AI/export requires the owner-managed provider/private
renderer setup, enabled live flags and applicable approvals, with paid checks
owner-manual. No local AI model or weights are installed or verified here.

These modules are not imported by product source and must stay out of public
assets and deployment entrypoints. Existing dependency notices remain
applicable; no third-party implementation was copied or modified by this move.
