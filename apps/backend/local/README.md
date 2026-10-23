# Local editing backend

These modules extend the normal backend at `/v1/local`, mounted only for local
loopback requests. Normal startup owns the native worker and `.env.local`;
there is no separate host executable or owner/provider command.

The [local workflow guide](../../../docs/operations/LOCAL_WORKFLOW.md) owns
setup and operation. [Agent commands](AGENT_COMMANDS.md) use the same validated
use cases with a private per-run capability. Browser requests pass through the
same-origin Next proxy; the token stays server-side. Source masters, drafts and
exports retain their existing compatible formats and external storage paths.

Fake AI requires no keys; real downloads/native media are independent. Real AI
uses normal Gemini configuration/approvals and stays owner-manual. Synthetic
checks never call YouTube, Gemini or cloud resources.
