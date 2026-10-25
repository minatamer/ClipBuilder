# CL-079 — Preserve uploaded picture transparency

Status: implemented and locally validated; owner real-media/visual acceptance is
manual. Owner bug report: 2026-10-25.

Root cause: owner uploads deliberately flatten alpha onto #101215 and encode
JPEG. Storage, delivery, saved drafts and native rendering also assume JPEG.
Fix this one pipeline: normalize alpha-bearing PNG/WebP to bounded static PNG,
retain opaque JPEG normalization, and carry an optional trusted format through
assets/compiled visuals, fixed filenames, response/data-URI MIME and saved drafts.
Missing format means legacy JPEG. The edit request cannot choose asset format.
Preserve static-raster/pixel/byte bounds, metadata stripping and authentication.

No background fill/checkerboard in composition or exports. Existing JPEG assets,
saved projects and generated art remain compatible. Previously flattened uploads
cannot recover alpha; owner must re-upload the original transparent image once.
Do not modify original media or owner projects. No AI/model, provider, cloud,
environment, deployment or Git mutation.

Verify transparent/partial-alpha PNG and WebP, JPEG compatibility and format
validation; byte-identical draft save/reopen; actual protected image delivery,
preview/shared compositor and native MP4 against synthetic colored footage.
Use transparent, half-transparent and opaque regions to distinguish correct alpha
from a dark matte. Reuse existing upload/editor/native proof; zero live API calls.
Run affected unit/type/lint/format checks and read-only validation. Rebuild current
contracts/worker and reload the normal backend with verified process ownership.
Owner real-media/visual acceptance remains manual. Works in fake mode without keys.

## Evidence — 2026-10-25

- `personal-picture.ts` preserves alpha as static lossless PNG, keeping bounded
  JPEG normalization for inputs without alpha. Input inspection, rotation,
  metadata stripping and byte/pixel/static-raster checks remain. No matte fill.
- `assets.ts` owns optional jpeg/png format, fixed extension and MIME mappings;
  absence remains legacy JPEG. Asset format is omitted from editable visuals.
  `edit-overlay.ts` fills format from admitted metadata and checks its binding.
  Batch/storage, protected asset delivery, draft records/copies and renderer
  signature/hash/data-URI checks carry it end to end. Generated/legacy JPEG
  behavior remains intact. Shared overlay markup adds no fill/background.
- Full fake/paid-off local suite: **57 files / 564 tests pass**. Targeted image,
  batch and draft tests pass: PNG and lossless WebP preserve alpha 0/128/255,
  small dimensions and half-transparent white pixels; opaque JPEG normalization,
  static/pixel/byte/metadata rejection remain. A real alpha PNG saves/reopens
  byte-for-byte with correct format and a new workspace ID; old JPEG draft
  integrity/damage/cleanup checks still pass.
- `test/owner-hosted-editor.proof.ts`: **42.26s pass** using current-source overlay
  and worker with generated footage. Upload a transparent/half-transparent/opaque
  synthetic PNG, fetch its protected image/png response and inspect browser-decoded
  alpha 0/128/255. Native H.264 frames prove clear pixels preserve underlying blue
  video (luma delta <5), partial pixels blend (130–170 luma) and opaque white stays
  solid (>210 luma). Existing picture timing 5/6/23/24, selected-picture isolation,
  caption word clocks, revision/error/retry and responsive states still pass.
  Injected analysis/plan/image/caption = 1/1/0/2; native inspect/clip/clip. These
  synthetic counters represent no real provider calls.
- Inspected `.local-build/evidence/cl079-transparent-preview-1440.png`: preview
  shows blue video through clear regions and purple through half-white, with no
  dark rectangle. Source screenshots remain synthetic/ignored. Actual owner
  imagery was not used as a fixture or modified.
- Browser-safe contracts/local/backend/frontend/proof TypeScript, affected ESLint,
  Prettier and `git diff --check` pass. No new dependency, listener, timer or
  external service. Owned browser/native scratch cleanup remains verified.
- Pinned contracts and current worker/overlay builds pass. Backend-only restart
  verifies shutdown of the owned tree before replacement. New supervisor 19872
  owns API 23436 on 4000 / worker 25400 on 4200; frontend 24236 on 3000 is retained.
  Health/start/sample checks succeed and app remains synthetic-ai. Content-safe
  logs: `C:/Users/minat/AppData/Local/Temp/clipbuilder-cl068-runtime/backend-20261025-225214.stdout.log`
  and matching `.stderr.log`; adjacent `runtime.json` records ownership.

Final read-only validation: **Meets ticket; no actionable findings**. Checked alpha
retention and partial blending, MIME/extension/signature binding, immutable format,
legacy compatibility, saved-state restoration, fixed paths/resource bounds,
architecture/privacy and cleanup. CL-067–078 pending work is preserved and outside
this verdict. No scope deviation. Already-flattened uploaded copies still require
the owner to remove/re-upload the original transparent PNG; migration cannot
recover discarded alpha. Owner actual-file/visual acceptance is unchecked. No
paid API call, environment change, Git mutation, cloud action or deployment.
