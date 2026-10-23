# CL-052 — Picture controls and realistic fake content

Status: implemented and validated. Dependency: validated CL-051.

Authority: [complete owner audit](CL-050-clean-local-flow-and-editor.md).

Acceptance:

- Fictional conversation has varied natural dialogue and speakers, sensible
  punctuated word cues and deterministic source-bounded timing. Fake candidate
  count/duration behavior remains valid; never imply source transcription.
- Replace orange rectangle with a bundled recognizable real sample photograph,
  explicit provenance/credit, no runtime download. Authorized sample may be
  source-controlled; owner source/media remain private and never fixtures.
- Pictures support multiple independent cues and PNG/JPEG/WebP static uploads,
  existing byte/pixel/admission limits, direct selected upload insertion, compact
  picker and one selected picture's controls. No duplicate add/upload steps.
- Timing, entrance/exit (none/fade/pop/slide), position presets, drag and resize;
  split picture controls into Image / Timing / Motion / Position sub-tabs rather
  than a long form. Preserve registered asset validation and old drafts.
- Keep automatic generation budget at its existing bound; manually placed cues
  may use the existing 20 admitted assets. Bound manual cue count explicitly;
  do not increase provider attempts. Operation request limit must admit a complete
  valid edit at that bound. Shared frame-driven visuals and export-cache parity.
- Focused units, upload admission, duration/animation edge cases, fake caption
  integrity and actual browser controls; final integrated native proof CL-053.
- Read-only validate and fix before CL-053. All AI fake/paid-off; no env reads,
  real YouTube, provider/cloud calls, Git mutation or process changes.

Sample source decision: NASA Apollo 17 Blue Marble, NASA credit, no people/logos,
for local informational testing. Verify asset-specific source and
[NASA media guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/),
record bundled derivative details. This is a static sample, not AI imagery and
does not imply NASA endorsement. No provider-generated image is required.

Implementation: fictional multi-turn dialogue with opaque speaker labels and
500ms source-bounded word clocks, original captions and deterministic grounded
fake proposals. Bundled 192101-byte official NASA sample (credit/provenance in
backend SAMPLE_MEDIA.md); no runtime network. Production-like backend build
copies the sample beside its local fake adapter.

Picture strip selects one cue, with Image/Timing/Motion/Position sub-tabs.
Upload directly inserts the acknowledged asset, including server deduplication;
PNG/JPEG/WebP static inputs normalize to the existing JPEG profile. Optional
entrance/exit/duration fields run in shared frame-based composition/cache. One/
two-frame cues remain visible. Twenty manual cues/admitted assets are independent
of three AI image attempts; full 42-operation replacements fit the request bound.

Evidence: **462 local units across 44 files pass**, including raster admission,
fake dialogue/image detail, manual bounds, all animation cache keys and existing
API/draft/agent compatibility. Native/browser proof passes in **62.32 seconds**:
new real sample image/captions versus source pixels, three formats uploaded and
inserted, >3 manual cues, timing/motion/center controls, Apply/Discard, saved
round-trip, existing native exports/reopen/retry/responsive checks. Fake counts
remain 4/4/3/3; no additional native jobs from editing/upload/recovery, cleanup
zero. Frontend/test/local/contracts types and scoped lint pass; format checked.

Read-only validate: **Meets ticket; no actionable findings.** Reviewed schema
limits/provider budget separation, admitted-asset receipts, deduplication,
optional legacy fields, frame clocks/cache, async draft preservation and actual
API wiring. Corrected speaker-label format and updated obsolete orange-block/
caption-gap pixel assertions to compare actual source/output frames. Source
masters/configuration/other apps preserved. Physical devices/owner review and
real AI remain unverified; CL-053 supplies combined final evidence. No Git,
paid/cloud/provider or app-process action; only the documented public sample
download was made during implementation research, outside test execution.
