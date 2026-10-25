# Internal local media worker

The normal backend starts and drains this loopback-only worker automatically.
There is no separate user-facing application or startup command. Fixed jobs,
private authentication, pinned tools and cancellation boundaries are preserved.
The native child receives fake/paid-off flags and no provider credentials even
when the backend uses real Gemini AI. It never dispatches cloud processing.

See the [local workflow guide](../../../docs/operations/LOCAL_WORKFLOW.md).
Synthetic native proofs use generated media, not retained source masters.

Final edited/portrait exports use original source pixels and a source-height
portrait canvas (even-pixel codec rounding), preserving native portrait sizes
and the source's nominal frame rate. Variable-rate sources are normalized to
that rate; edit/overlay timestamps retain their logical 30 fps clock. Preview
cuts stay 1080x1920/30 fps and never feed final encoding. The original is cut,
cropped, overlaid and H.264-encoded once at CRF 18; no fixed 8 Mb/s ceiling or
silent resolution downgrade is used to fit capacity. High-resolution overlays
are rasterized at the corresponding pixel density. Source/duration/byte/disk,
decode and cleanup guards remain. See CL-070 for synthetic detail/native-rate
evidence and the separate legacy-path limitation. Real-media visual acceptance
and hosted maximum workload capacity remain owner/release checks.
