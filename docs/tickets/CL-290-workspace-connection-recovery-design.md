# CL-290 — Cohesive workspace connection recovery

Status: implemented and verified with synthetic Codex-browser checks, 2026-11-12.
The subsequent CL-286 reflective reference revision is also implemented; the
latest ticket-index entry records the complete owner-review queue.

## Owner request

The Couldn’t connect/open workspace placeholder is visually poor: tiny centered
copy, isolated bottom-right CTA and a second error/retry cluster. Redesign the
message, hierarchy and actions to the current editor standard, then take a
laptop screenshot. The supplied screenshot is a visual reference only.

## Intended behavior and acceptance

- Use one deliberately designed shared recovery presentation with clear title,
  restrained workspace/brand visual, useful concise copy and adjacent actions.
  Match existing navy/blue tokens, typography, focus and shared Button controls.
- Opening/reopening failure has one reconnect action in the recovery state;
  never duplicate it through the batch panel's portaled footer actions. Existing
  editing-session connection loss has a compact consistent toolbar treatment.
- Distinguish temporary connection failure, reconnecting and genuinely missing
  sessions. Do not fabricate saved-state guarantees, progress or completion.
  Keep explicit new-session behavior only where already supported.
- Retry the actual failed read boundary; preserve current source, acknowledged
  clips, edits, recovery, focus and unrelated apps. No AI/render retry or new paid
  work. Do not replace a usable prepared session or clear saved assets.
- Verify initial failure, repeated failure, retry pending, recovered editor and
  missing state using generated fake/no-key transport boundaries in Codex. Check
  keyboard and phone layout; keep normal-window previews and silent fixtures.
- Save and show the requested finished laptop screenshot outside Git. Document
  the owning behavior, actual checks and remaining owner review.

The normal app is healthy (health/start/config 200) with seven clips and no active
processing. The reported screenshot is not proof of a currently stopped backend.
Confirmed UI cause: experience.tsx renders its own opening error/retry, while the
initializing batch panel separately portals connection failure/retry into the
same bottom-right action target. Fix that ownership overlap, not just its CSS.

No API keys are needed for recovery or its synthetic checks. Real AI keeps its
existing provider keys/sign-in, live/spend flags and approvals. No paid test,
ignored configuration, external browser, deployment, Git or Voyagenda action.

## Execution and verification

One shared ConnectionRecovery component supplies a full workspace treatment and
compact toolbar treatment. The full state has a quiet editor illustration,
clear left-aligned headline/copy and adjacent shared Reconnect button. Missing
sessions keep the distinct explicit new-session choice; real pending reads use
Button's busy indicator. No bare spinner, progress estimate or saved-data promise.

The opening view owns its retry and suppresses the initializing batch's portaled
connection actions. Its explicit attempt restarts the stopped clip-list poll
without remounting the active editor. Old footer/pill styling is removed while
toolbar priority rules remain. Startup and reconnect reads use cache:no-store.
The first synthetic missing-session check exposed a cacheable 410 in the newly
added fixture, not proof of the owner's production failure; synthetic responses
now also declare no-store. Repeated failed retries restore keyboard focus only
when disabling the busy button left focus on body, without stealing moved focus.

Actual Codex checks: initial 503/unavailable, repeated startup failure, held read
pending, definite 410 missing and successful explicit recovery. Exactly one full
recovery group and zero bottom-right connection navigations were present while
opening. At 390px, content stayed within the viewport and keyboard retry focus
was restored. Recovered the existing clip without inference, edits or unexpected
requests. During a later editor disconnect, the compact actions stayed in the
navbar and reconnect retained the selected Captions tab and clip, proving the
editor was not remounted. Read counts were genuine; no artificial product waits.

Six existing reconnect guard cases, scoped ESLint and frontend TypeScript passed.
The fake fixture's failure/pending controls are confined to test code and release
held responses on close. A final normal-window laptop screenshot is saved outside
Git in the chat's visualization directory as connection-recovery-laptop.jpg.
Temporary phone sizing was reset. No provider or paid processing, owner clip
patch, external browser, fullscreen, configuration, Git or Voyagenda operation.

Read-only validation: no actionable findings in this scoped diff. This verifies
UI/read mechanics with fake transports, not real AI quality. Owner design review
remains available via the requested screenshot.
