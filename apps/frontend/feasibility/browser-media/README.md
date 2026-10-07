# Retained offline browser-media proof

The CL-005/006 testing page and its port 4185 server were retired in the
2026-10-07 code-quality remediation. There is no runnable testing UI here.
`sync-access.mjs` and its synthetic tests retain evidence that an owned OPFS
sync-access handle closes when truncation/setup fails. The earlier codec,
storage, range and full-bound browser measurements remain historical evidence in
[CL-005](../../../../docs/tickets/CL-005-implement-secure-upload-and-storage.md)
and
[CL-006](../../../../docs/tickets/CL-006-build-media-job-and-speaker-feasibility.md).

From the repository root:

```text
corepack pnpm --filter @clipbuilder/frontend test:media
```

This runs offline synthetic proof, including the
[retained audio tests](../browser-audio/README.md), with the shared fake,
paid-disabled, credential-free environment and network guard. It opens no port,
reads no visitor file and calls no provider. Synthetic proof does not verify
actual device codecs, browser storage, AI quality or a live export. Real
processing requires the owner-managed provider/private-renderer setup, enabled
live flags and applicable rights, transfer, spend and cloud approvals; paid
acceptance remains owner-manual. No local AI weights/runtime are introduced.

Feasibility sources remain excluded from public/build assets. Deployment must
still prove the historical proof paths return 404; removing the local server
does not establish deployed routing behavior.
