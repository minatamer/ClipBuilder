# Local owner UI

The separate React/esbuild UI is served by the
[owner host](../../backend/owner/README.md) on `http://localhost:4100/`. It is not
a Next route and has no public navigation or hosted feature flag. Browser code
receives bounded IDs/metadata and relative local media URLs, never filesystem
paths, credentials or worker capabilities. The session capability is HttpOnly
and SameSite; mutations also require the exact local Origin.

CL-017 supports choosing one MP4, native source playback, fixed first-ten-seconds
local portrait encoding, output playback/download and clearing the processing
copy. Busy controls are disabled and errors/statuses are announced. Fake AI
and paid-off labels remain visible. Encoding uses real local FFmpeg without API
keys; AI analysis and owner-media quality remain unverified. No offline model
or weights are provided. Later ticket controls are not yet implemented.

Build and focused checks use the root `owner:*` commands documented in the host
guide. Public frontend commands/configuration remain in the parent README.
