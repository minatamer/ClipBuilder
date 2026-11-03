# CL-202 — View editor pictures in a large dialog

Status: Locally implemented and verified, 2026-11-03. Final validate: no
actionable findings. Owner personal visual/real-media acceptance remains open.

The owner requests a View action for each editor image so small thumbnails can
be inspected clearly in a large dialog. Depends on the existing prepared editor
and CL-198–201 work; preserve all existing unstaged changes and owner media.

## Acceptance and scope

- Each picture card exposes View independently of its existing edit/selection
  button. Open the exact protected asset at a useful large desktop size, fitted
  without cropping/distortion, with a responsive phone layout and clear label.
- Reuse native modal dialog/shared Button/design tokens. Support Close, Escape,
  backdrop click, keyboard focus containment and focus return to the trigger.
  Keep loading/failure feedback and Close visible. Closed dialogs load no large
  image; unmount/close releases it. No page overflow or unreachable controls.
- Viewing pauses the existing preview but never alters picture edits, selection,
  revisions, dirty Apply/Discard state or saved media. Existing readiness and
  pending guards remain; preview positioning gestures are unchanged. Hosted
  editor uses the same protected asset path and UI, without new backend routes.
- Verify real editor integration using generated images only: each image opens
  its own asset, desktop/phone bounds, original aspect, focus/keyboard/backdrop,
  loading/error/reopen, no automatic processing POST or dirty edit, and cleanup.
  Run focused frontend/test types, lint/format and browser evidence; validate
  until no actionable findings. Owner personal visual/real-media acceptance
  remains open. No real AI/provider/download/configuration/Git/cloud action.

Owners: a small image-dialog component/styles, picture cards in clip-editor,
existing responsive browser proof and narrow owning documentation. No backend,
contracts, new dependency or runtime restart is needed.

Viewing existing images works in fake mode without API keys and in normal local
or hosted use without AI. New image generation/clip processing still needs the
chosen provider's existing sign-in/key, live gates and explicit owner action.

## Implementation and execute/validate evidence

Each picture card keeps its existing Edit selection and gains a separate View
button. The native dialog uses the exact existing protected asset URL, fits the
whole original with contain sizing in a desktop surface up to 80rem, and stays
inside the phone viewport. Shared buttons/tokens provide the heading and visible
44px Close control. The existing player pauses on opening; drafts/selection,
revisions and media are not changed. Pending fieldset/readiness guards remain.

Closed dialogs mount no large image. Opening resets loading state; success
reveals the original, and failure leaves concise retry guidance with Close
available. Close/Escape/backdrop dismissal releases the image and returns focus
to the owning View button. Native modality plus plain Tab/Shift-Tab handling
keeps focus on Close, while browser modifier shortcuts remain available. Dialog
and image nodes are naturally removed with their owning card/editor on unmount;
there are no new timers/listeners/object URLs or backend resources.

The expanded generated-media responsive editor browser proof passes, including
all existing phone/tablet/laptop/desktop checks and new 320px/1440px image
states. Two generated PNGs (1600x900 landscape and 900x1600 portrait) verify
each View opens its own original. Checks cover large-size/contain/viewport
geometry, loading feedback, failure/reopen, real Escape keyboard input, Close,
backdrop, forward/reverse focus containment, focus return, image-node release
and unchanged selection/dirty state. The desktop case keeps an unapplied Fit
change throughout viewing; its normal unload guard remained active until the
synthetic edit was explicitly discarded before test navigation. No extra
processing POST was made. Synthetic desktop/phone dialog screenshots were
inspected.

Frontend and test strict no-emit types, scoped ESLint, Prettier and whitespace
checks pass. Execute/validate adjusted test waits for native close/React cleanup
and selected-control rendering, and retained the dirty-navigation guard rather
than bypassing it. Final review: no actionable findings, duplicate schemas,
unsafe production casts, new dependency or content-bearing diagnostics.

Changed files: new `picture-image-dialog.tsx` and its CSS module;
`clip-editor.tsx` card integration; `style.css` card grouping;
`test/local-responsive-editor.proof.ts`; feature README, source of truth, index
and this ticket. No backend/contracts/configuration changes or service restart
were required. Prior CL-197–201 work remains preserved and unstaged. No owner
image/clip was used as a fixture or altered, no real AI/media job was run, and
no Git/cloud/deployment action was performed. Personal visual/real-image and
deployed hosted acceptance remain owner-only; fake evidence does not establish
new AI image quality. Deviation: none.
