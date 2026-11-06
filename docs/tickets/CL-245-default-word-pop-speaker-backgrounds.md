# CL-245 — Restore Word pop and speaker-colored word backgrounds

Status: Completed through CL-244, 2026-11-07. Owner follow-up supersedes CL-240's
default foreground-color revision while retaining its attribution preservation.

The owner asks to bring back the default caption style with a colored background
and Word pop animation. Use the established TikTok/Word pop default with readable
base foreground and a distinct speaker-colored active-word background. Do not
recolor all ordinary caption text by default. Explicit styles/colors, disabled
speaker coloring and saved clip edits remain authoritative.

## Acceptance

- Fresh captions keep the default Word pop animation and per-speaker colored
  active-word background in preview/export. Normal text retains the chosen style.
- Default/full-caption color handling for non-highlight styles remains readable;
  do not fake labels or change transcript words/times.
- Verify shared composition and current-source native output with synthetic,
  no-key fixtures and retain explicit custom/disabled/unknown cases.
- Record product precedence in the source of truth, evidence here and index.
  No saved owner clip modification, provider call, configuration, Git mutation,
  cloud or deployment. Generated proofs do not claim real AI quality.

## Evidence

The implicit speaker palette again preserves the caption style's foreground and
background, assigning the distinct speaker accent to the active-word highlight.
The existing TikTok default retains its pop animation. Explicit custom palettes,
disabled speaker coloring, unknown labels and saved edits retain precedence.

CL-244's 150-case no-key gate covers speaker palettes and styled composition;
three generated workflow proofs include actual current-source native MP4 checks
for colored word backgrounds and readable normal text in body and Hook. Generated
Codex-browser checks confirm blue/orange speaker highlight controls and aligned
44px fields at laptop/tablet/phone sizes without page overflow. Native and browser
proofs use synthetic media and no provider API keys; real AI title quality is
separate. The bounded real local speaker check is recorded only in CL-244.

Source-of-truth precedence and service documentation are updated. The shared
native build/reload, source/edit/output preservation, resource cleanup and clean
scoped validate verdict are recorded in CL-244. No owner clip edit, paid-provider
call, configuration change, cloud/deployment or Git mutation. Physical-device,
assistive-technology and broader visual acceptance remain manual.
