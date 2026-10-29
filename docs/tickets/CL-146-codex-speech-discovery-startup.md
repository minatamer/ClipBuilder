# CL-146 — accept prepared speech metadata during Codex startup

Status: implemented and locally validated; plan recorded before code.
Dependency-ready after CL-135/137 and the completed
CL-135–145 packaging. Owner enabled Codex real mode and requested restart.

Restart reproduced a local startup failure after the worker/health listener
became ready: discovery registration rejects the runtime's optional speech
metadata. CL-135 added that code-owned field, but the strict discovery reader
still allows only the earlier state shape. Fake startup omits speech, masking
the mismatch. No provider/login/inference request is needed to fix or verify it.

Whole-file allocation: scripts/local-discovery.mjs admits optional speech with
strict executable/model/directory keys and the same bounded absolute-path checks
as other native prerequisites. Extend the existing synthetic discovery tests
for speech-bearing registration/readback and malformed/extra-key rejection.
Update this packet/index and the local provider guide with actual evidence.
No provider, environment, credential, port, UI, media or executable changes.

Run the focused fake/paid-off discovery checks, scoped lint/format and read-only
review. Refresh only the failed backend tree after verified shutdown, preserving
the successfully restarted frontend. Verify health/start/config and content-free
Codex capability fields with stable listeners. No real AI, ASR, paid/cloud call,
saved-media deletion, Git staging/commit/push or deployment. Runtime flags load
normally from the owner's file, which the agent does not read or modify.

- [x] Prepared speech state accepted; malformed/unknown metadata still rejected.
- [x] Synthetic discovery tests and scoped review/static checks pass.
- [x] Backend/worker stable, frontend preserved, real Codex setup reported ready.

Fake mode remains simulated/key-free. Real Codex requires CLI ChatGPT login,
prepared speech tools and owner real/master flags; startup checking does not
infer. Owner reported ChatGPT login; actual inference/ASR/quality/allowance,
physical-device, hosted and release acceptance remain untested.

## Evidence — 2026-10-29

The requested full-stack restart first verified shutdown of eight frontend and
nine backend identities, freeing 3000/4000/4200. New frontend became healthy;
backend briefly answered health, then failed discovery and withdrew its worker.
Only schema-redacted diagnostic fields were inspected: discovery/startup failed
with an unclassified error. No ignored state/configuration, credentials or media
were read. Code inspection found speech absent from readRuntime's strict state
allowlist, though the existing producer/worker already use that exact field.

A synthetic speech-bearing registration regression failed before the fix with
owner_host_unavailable. After admitting optional speech and validating the exact
executable/model/directory keys plus existing pathValue bounds, all eight
owner-discovery checks pass. New cases cover valid publication/readback without
pointer exposure, null/missing/extra keys, relative/oversized paths and control
characters; both readback and publication still reject invalid metadata. Existing
identity/expiry/concurrency/link/isolation and cleanup tests remain covered.
Tests force fake/paid-off and blocked network; no real speech or AI runs.

Scoped ESLint, test TypeScript, Prettier and whitespace checks pass. Read-only
review: Meets ticket; no actionable findings. The fix changes a private metadata
allowlist and strict validation only; no credential, execution, provider or public
capability boundary is broadened. No dependency, UI, port or configuration change.

After the fix, verified backend-only refresh removed nine current identities
and preserved the new frontend 5152 / 3000 (supervisor 21436). New backend
25312 / 4000, worker 3192 / 4200, supervisor 22172. Health, /start and
/api/sample/config returned 200. Public capability GET returned provider-ai,
aiProvider=codex, aiSetup=ready and captionProvider=local-speech, without inference
or checking login credentials. The owner independently reported ChatGPT login.

Content-free records/logs remain outside Git under OS temporary directories:
clipbuilder-restart-20261029-codex contains frontend stdout/stderr and verified
full-stack stop records; clipbuilder-restart-20261029-codex-ready contains current
backend stdout/stderr and refreshed ownership. Failed-start watcher/worker trees
were verified cleaned before replacement; saved/retained media were preserved.
No staging, commit, push, deployment, download, provider/ASR or cloud call.
The startup fix remains uncommitted for review. Deviations: the requested restart
needed this narrow source fix; all real-processing and owner acceptance gates
remain open as stated above.
