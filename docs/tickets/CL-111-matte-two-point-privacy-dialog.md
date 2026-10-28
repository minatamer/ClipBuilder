# CL-111 — matte, concise two-point Privacy dialog

Owner follow-up, 2026-10-28: redesign the shared Privacy dialog; research useful
patterns, shorten the text, combine related facts into two points, keep the blue
theme and move away from glass/liquid-glass materials. This supersedes CL-100's
material choice. Preserve CL-095–110 and the healthy app; execute/validate locally.

## Research and direction

- [ICO: drafting privacy information](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/how-should-we-draft-our-privacy-information/)
  supports short sentences, clear headings and understandable grouping without
  hiding material facts. Apply as content-design guidance, not a claim of legal
  compliance or a new retention policy.
- [USWDS modal guidance](https://designsystem.digital.gov/components/modal/)
  favors a simple purpose, restrained content and clear dismissal. Keep this
  user-opened information dialog, with no consent/acceptance flow or new controls.
  Its optional reduced-motion behavior does not override this repo's motion rule.
- [WAI modal pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
  informs named semantic content, initial title focus, native modal containment,
  Escape, a visible close control and return to the invoking trigger.

Chosen design: one solid navy sheet, a small blue privacy mark, a clear headline,
brief purpose and two unboxed groups separated by a rule: Your files (use and
storage/cleanup) and AI processing (transfer, retention and mode-specific images).
No glass, bright multi-layer gradients, numbered table or decorative focus halo.

## File allocation and requirements

- `privacy-dialog.tsx`: shorter two-group content and a compact preview-only
  notice. Preserve every mode distinction: no reads/uploads in the development
  preview; no publishing/marketing/demo reuse; local versus device/cloud storage;
  Exit cleanup, possible delays/best-effort and downloaded-file exceptions; local
  tab-close limitation; bounded Gemini media copy/separate retention; generated
  versus Wikimedia/fallback picture descriptions. No new promises about training,
  encryption, deletion speed or vendor control. Preserve the shared trigger API.
  Native dialog keeps focus/keyboard/close/backdrop behavior; start reading at the
  title and keep close reachable when longer mode content scrolls.
- `page.module.css`: replace only the dialog material/layout, remove obsolete
  glass/badge/table selectors and conflicting dialog glass fallbacks; retain
  unrelated landing surfaces. Solid backdrop dimming, legible type, restrained
  blue icons/lines, 44px close target, phone/short-screen scroll and forced colors.
- Existing `page.test.tsx`: verify two groups and concise mode-specific facts,
  unchanged trigger variants and absent unsupported promises.
- New guarded `test/local-privacy.proof.ts`: exercise actual shared dialogs in
  preview/local/cloud/generated-picture fixtures using current source; inspect
  desktop/tablet/320/390/short-screen, keyboard/Tab/Escape/focus return, backdrop
  dismissal, scroll/close reachability, solid materials and forced-color states.
  Reuse actual landing integration where its Privacy selectors need adaptation.
- Narrow source-of-truth privacy decision, frontend README Privacy paragraph and
  this packet/index own evidence.

No provider/media processing, configuration, backend/worker, external asset,
dependency, Git mutation or deployment. Synthetic/current-source browser proofs
block external/mutation requests and clean owned browsers/listeners in finally.
Run focused units, frontend/test types, affected lint/format/whitespace and scoped
browser checks. Validate read-only, fix confirmed findings and repeat to no issues.

The UI works with FAKE_MODE=true/no keys. Real AI retains its provider keys/live
flags/approval and owner-action requirements. Personal visual, physical-device,
rights, real-AI, hosted and release acceptance remains owner-only.

## Status

Implemented and locally verified, 2026-10-28. All prior CL-095–110 work remains
preserved and unstaged; owner personal visual acceptance remains open.

### Delivered design and refinements

- Replaced the bright/glass nesting with one opaque navy sheet, a small blue
  privacy mark, restrained borders and a dim backdrop without blur. Two unboxed
  icon/text groups replace the three numbered table rows. Copy is shorter while
  retaining the mode-specific facts listed above. The preview state is a small
  inline note; the dialog adds no consent, acceptance or processing action.
- Reading begins at the named title, with a simple purpose description and
  independently navigable semantic sections. The 44px close control stays in the
  fixed lead while a keyboard-focusable details region scrolls when needed.
  Escape, outside click, close click and native focus return are retained.
- Browser inspection caught native Tab moving beyond the final stop; explicit
  Tab/Shift-Tab wrap now keeps sequential navigation in the dialog while modified
  browser shortcuts are left alone. The actual landing exposed a global outline
  on the static initial-focus heading; a scoped rule removes that outline while
  keeping actionable/scroll-region focus indicators. The Wikimedia sentence now
  names the recipient explicitly to avoid confusing it with Gemini transfer.
- Removed obsolete glass/table selectors and conflicting dialog transparency
  fallbacks. Forced colors retain readable system colors. The frontend README's
  stale four-row description now matches the shared two-group implementation.

### Actual checks and visual states

- **12 page units passed**, final 1.41s: two groups, no publishing/marketing/demo
  reuse, all preview/local/cloud/generated-image distinctions, cleanup/download
  exceptions, Gemini retention, Wikimedia versus generated-picture facts and
  unchanged trigger variants. No unsupported deletion/storage promise was added.
- Frontend and root test types, affected ESLint/Prettier and whitespace pass.
  Pinned CDP type gaps for forced colors/Shift modifiers use documented existing
  test conventions; no unsafe cast or new dependency was introduced.
- Guarded `test/local-privacy.proof.ts`: **passed, final 7.05s**. Current-source
  fixtures exercise all four disclosure modes at **1366×768, 768×1024, 390×844,
  320×568 and 844×390**. Checks cover two sections, solid material/no gradients or
  backdrop blur, full horizontal text, visible 44px close, title focus, forward/
  reverse Tab wrap, Escape/focus return and keyboard End scrolling with the last
  disclosure and close control reachable. Pointer close/backdrop and forced-color
  states pass. The actual landing also opens/closes the same component correctly
  with the final title styling. No existing integration selector needed changing.
- Inspected desktop, phone/cloud, short-screen and forced-color captures. Fresh
  synthetic evidence stays ignored under `.local-build/evidence/cl111-*.png`;
  `cl111-actual-landing.png` shows the final dialog on the real landing page.
- Zero external/processing requests; mutations blocked. Test browsers/listeners
  close in finally, including failure paths; scratch preparation precedes opening
  the fixture listener. No configuration/private media/provider/cloud action.
  Normal app/Studio services remain available. No native rebuild was needed.

### V111-final — read-only validation

TL;DR:

- Goal: a clearer, shorter Privacy dialog in the same palette, without glass.
- Delivered: matte two-group layout, preserved mode-specific disclosures and
  verified keyboard/scroll/dismissal behavior.
- Remaining: owner personal visual, physical-device and release acceptance.

**Verdict: Meets ticket. No actionable findings.** Reviewed the settled
ticket-owned unstaged worktree over `b945401`, the shared workspace trigger
integration and allocated documentation. Prior CL-095–110 changes remain
preserved and excluded except direct integration.

Coverage: **Covered** primary-source design research, solid blue-theme material,
two shorter groups, all prior privacy facts/modes, no new promise/consent flow,
responsive/short-screen reading, native dialog semantics, title focus, keyboard
containment, dismissal/focus return, forced colors, cleanup and documentation.
**Unverified** owner personal visual, physical devices, rights, actual provider
settings/AI quality, hosted/cloud and release acceptance. The UI remains API-free
in FAKE_MODE=true/no keys; real AI still needs keys/live flags/approvals and owner
action. This copy/design review is not a legal-compliance certification.

Checks: evidence above plus stale selectors, dependency direction, duplicate copy,
debug output, unsupported claims and cleanup. No full suite/build or paid/live
processing check was needed. Deviation: none. Nothing staged, committed, pushed
or deployed.
