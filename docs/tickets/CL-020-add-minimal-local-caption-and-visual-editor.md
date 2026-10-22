# CL-020 — Review and adjust local captions and contextual pictures

Status: queued; owner authorized fake/synthetic implementation, validation loops
and ticket commits on 2026-10-22. No paid/provider/cloud/real YouTube calls.
Dependencies: CL-017 local runtime/privacy boundary; CL-019 independent
reviewable clip bundles and source retention. Reuse current shared composition
primitives.

## Objective and value

After an automatic edit, let the owner make a few practical presentation changes
and export the revised clip. Keep the UI small: portrait preview, caption panel,
visual list and export. No general nonlinear editor or deployed controls.

## Scope and research

The [research](../research/LOCAL_OWNER_WORKFLOW_2026-10-22.md) links the
official Remotion Player, interaction and render APIs. The repository already
shares React preview/export geometry; add local-only validated parameters
instead of a separate CSS preview that cannot be reproduced in the MP4.

- Caption controls: choose from a small bundled preset set; adjust size, text/
  highlight colors, alignment and normalized position within readable bounds.
  Start with one clip-wide style/position; retain existing timed
  words/highlights.
- Visual controls: choose a cue, replace/remove its picture, move/resize it, and
  choose contain/crop from bounded presets. Permit numeric clip-relative start/
  end adjustments and adding a bounded picture cue without adding a timeline.
- Personal assets: choose local JPEG/PNG files, normalize orientation, strip
  metadata and rasterize to a bounded canonical format before preview/render.
  Keep a distinct owner-supplied provenance; replacing a generated/retrieved
  picture must not retain false AI grounding, source or rights claims.
- Preview controls: scrub/play/pause, select a layer and drag/resize with
  keyboard/numeric equivalents. Offer reset-to-automatic per panel. No undo
  stack, caption rewriting, arbitrary fonts/CSS/JSX, keyframes, video B-roll or
  audio editing in this packet. Existing speaker framing stays automatic.

## Owning areas, contracts and state

Frontend local preview/panels; backend local edit use case; renderer local
revision compilation and image handling; owner contracts; browser-safe shared
layout primitives in `packages/composition`. Public `fixed-layers.tsx` behavior
and v2/v3 frozen manifest parsing remain compatible and read-only.

Use a separately versioned owner edit document over an immutable automatic base:
source/clip/base hash, expected revision, caption style/box, cue overrides and
workspace asset IDs. Reuse normalized geometry primitives. Patch operations are
an allowlist, not arbitrary JSON paths, filenames, URLs or executable
properties. Compile/validate a complete owner render snapshot before native
worker dispatch; the public renderer must reject owner manifests.

State: review-ready → draft-dirty → validated-revision → rendering → ready. Both
UI and later CLI apply the same use case. Serialize writes or reject stale
expected revisions; refresh does not lose an acknowledged edit under the chosen
CL-017 lifecycle. Edits during render create a newer draft while the in-flight
snapshot remains frozen. Export explicitly chooses a revision; stale output is
labelled. Reading/seeking/editing never starts AI or a render automatically.

Once a valid clip bundle exists in the workspace, caption/picture adjustments,
preview and explicit re-export must work without provider keys, enabled paid
features or cloud media routes. Do not couple this deterministic editor to
availability of the AI that originally prepared the bundle. This does not
promise reopenable drafts across app restarts; CL-017 keeps that separate from
saved media.

## Privacy, media safety and resource constraints

Decode and inspect actual image bytes, reject malformed/oversized/decompression
bombs and enforce byte/pixel/dimension/count limits before import. No SVG, HTML,
animated images, external image URLs, arbitrary filesystem reads or EXIF
leakage. Serve opaque workspace IDs with the same local authorization as source
media. Own and revoke preview object URLs; release superseded assets only after
all draft/render references finish. Personal pictures need owner rights
permission.

Caption bounds must fit portrait safe areas at actual output resolution. Show
caption/picture overlap visibly rather than silently changing the owner's
placement. Clamp/reject off-canvas geometry consistently; define aspect/crop
rounding and layer order. Defaults preserve the current automatic look.
Reset/replace/edit makes zero provider calls. Optional future AI regeneration
requires a separate explicit action/budget and is out of scope here.

## Acceptance and verification

- [ ] Change caption style/position and replace/move/resize/remove/add a picture
      on one of three clips; siblings retain their own revisions and assets.
- [ ] Preview and encoded MP4 use identical revision, geometry, asset digest,
      caption clocks, colors and layering at sampled synthetic frames.
- [ ] Reopen review after export, revise, then export again without reupload,
      retranscription or any planner/image-generation call.
- [ ] Disable provider/paid/cloud capabilities after preparing a synthetic
      bundle; manual edits, preview and local re-export still succeed with zero
      egress.
- [ ] Test portrait preview scaling, keyboard input, safe-area extremes, missing
      assets, corrupt images, oversized pixels, asset replacement during render
      and concurrent stale writes. Old public manifests retain current output
      behavior.
- [ ] Focused synthetic component/contracts/native frame checks assert zero AI/
      cloud calls and no leaked bytes, paths or scratch. Run root five gates and
      public artifact exclusion check after implementation.
- [ ] Owner reviews real caption readability, picture crop/placement and final
      A/V quality separately; synthetic screenshots do not close those checks.

## Documentation and gates

Update local editor/composition guides, schema version note, source of truth and
index. Today `FAKE_MODE=true` needs no API keys and supplies a fixed synthetic
review; the editor is planned. Future deterministic edits/native rendering need
no AI key once valid media/timed captions exist, but do not supply offline
speech recognition. Real automatic captions/discovery/visual plans need provider
keys, live flags and rights/data/spend approval; paid acceptance stays
owner-only. Local tools, image/font licenses and human visual quality remain
unchecked. No Git, installation, launch, cloud, paid call or deployment
authorization.
