# Internal local media worker

The normal backend starts and drains this loopback-only worker automatically.
There is no separate user-facing application or startup command. Fixed jobs,
private authentication, pinned tools and cancellation boundaries are preserved.
The native child receives fake/paid-off flags and no provider credentials even
when the backend uses real Gemini AI. It never dispatches cloud processing.

See the [local workflow guide](../../../docs/operations/LOCAL_WORKFLOW.md).
Synthetic native proofs use generated media, not retained source masters.
