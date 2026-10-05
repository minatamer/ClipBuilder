# CL-009 follow-up: selected assembly request and diagnostic coverage

Status: implementation and local validation complete; owner paid retest pending.

## Authority and dependency readiness

The owner's 2026-10-05 instruction authorizes fixing the current selected
assembly failure and adding extensive backend diagnostics. This is one bounded
follow-up to CL-009, whose source selection, private renderer preparation, Files
upload and local assembly compilation already exist. The retained sample's
saved three candidates can be replayed locally without repeating transcription
or candidate selection. The renderer is already deployed; this packet requires
no renderer changes or deployment. Follow the current selected speaker/card
policy in the source of truth, including its later owner decisions.

## Observed problem and confidence

The latest owner-triggered assembly reached renderer selection and proxy
delivery, uploaded the selected video successfully, and reached ACTIVE in the
Gemini Files API. The selected-plan GenerateContent request then returned
HTTP 400 / INVALID_ARGUMENT, with only the generic invalid-argument message and
no detailed field violation. Local plan compilation and preview creation were
never reached. This is not evidence of an ADC or storage failure.

At the failed request, assembly supplied the canonical JSON schema as a transport parameter.
Candidate selection succeeded after its equivalent parameter was removed.
Use that established JSON-only request shape for selected assembly, with the
canonical response schema included as text guidance. The exact rejected field
is not proven by Google's generic error; the owner's next paid retest must
verify acceptance. Do not claim fake tests prove live provider compatibility.

The frontend currently maps a canonical remote SafeError to a local storage
error in the assembly catch path. Preserve its original safe code, message,
request ID and retry evidence instead.

## Implementation plan

1. Remove selected-plan responseJsonSchema from the provider transport request.
   Keep the same model, JSON MIME type, media sampling, limits and one attempt.
   Add canonical schema guidance to the prompt; preserve local schema parsing,
   grounding, manifest compilation and provider response capture.
2. Add fixed descriptive messages to the existing bounded, request-correlated
   backend diagnostics. Instrument input validation, signed analysis evidence,
   chosen range/context, captions, admission, selected media preparation,
   source binding checks, proxy transfer/integrity, generation, plan parsing,
   focus/cards/manifest compilation, preview creation/binding, result signing
   and all relevant cleanup paths. Preserve the original failure if cleanup
   also fails. Record safe validation reasons and structural issue locations.
3. Add bounded counts and integrity outcomes to normal diagnostics. Keep actual
   word/time values, raw and parsed Gemini output, captions and compiled plan
   in the already authorized full private capture. Preserve every existing
   logging/capture facility; never put transcripts, provider text, signed
   capabilities, identifiers, credentials or raw exception messages in normal
   logs. Extend the fixed record allowance so ordinary progress cannot consume
   the reserved failure/terminal records. Keep sink failures nonfatal.
4. Preserve validated remote SafeErrors in frontend local-media error mapping;
   retain existing local storage/codec errors and UI-safe messages.
5. Add deterministic fake regression coverage for exact request serialization,
   single dispatch, diagnostic stage/failure/cleanup coverage, bounded content
   safety and canonical UI error mapping. Run the smallest focused checks while
   editing, then all five root quality gates and a scoped validate review.
6. Update the owning service guides and ticket index. Verify backend watcher
   reload, matching process ownership and non-metered GET readiness. Preserve
   owner settings; renew only the six-hour private capture permit if needed.
   Hand off the saved-sample replay and Proceed to the owner for a paid test.

## Acceptance and evidence checklist

- [x] Selected generation is JSON-only with canonical prompt guidance and one
  dispatch; local contracts/validation are unchanged.
- [x] Useful stage messages, timings, structural facts and safe failure reasons
  identify generation versus parsing, compilation, preview and cleanup.
- [x] Full returned provider output and local reconciliation output remain in
  the ignored private capture; normal diagnostic privacy/bounds hold.
- [x] Remote provider SafeError mapping preserves its category without becoming
  STORAGE_FAILED; actual paid UI acceptance remains in the owner retest.
- [x] Focused fake regression checks and format, lint, typecheck, unit and build
  pass, with no provider or credential access.
- [x] Scoped validation and local readiness/process checks complete.
- [ ] Owner paid replay/assembly retest accepts the request and reaches preview.

## Implementation and settled verification — 2026-10-05

Changed code: `analysis/gemini.adapter.ts` (JSON-only request, schema guidance,
decoded-output capture), `analysis/gemini.diagnostics.ts` (schema location),
`analysis/analysis.diagnostics.ts` (fixed messages, assembly facts/stages, reserved
record budget and private replay capture), new
`analysis/analysis.validation-diagnostics.ts` (safe rejection locations),
`assembly/selected-assembly.usecase.ts` and `assembly/fixed-assembly.ts` (complete
assembly markers, structural evidence and private compiled outputs), and the
frontend `features/media/media.errors.ts` (canonical remote SafeError preservation).
These paths belong to their respective owning apps. Backend analysis/diagnostic/
selected-focus tests and a new frontend media-errors test cover the change.
Service guides, this packet, its parent ticket, index and source of truth are
updated. No renderer or contract change belongs to this follow-up.

All settled root gates passed:

- `corepack pnpm format:check`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test:unit` — **1,025 synthetic tests in 87 files**
- `corepack pnpm build` — including the local frontend artifact inventory

Focused injected-transport/capture/backend checks passed 209 tests in five files;
frontend mapping passed six tests. The final diagnostic/compiler check passed
46 tests after review corrections. Tests remain fake/paid-off, do not load
owner credentials and make no live provider/cloud requests.

Scoped validate review covered this packet's current unstaged/untracked changes,
excluding the preexisting source-analysis, renderer and thumbnail work. It found
two logging issues: arbitrary alphanumeric schema paths could pass the diagnostic
validator, and manifest hashing was outside the stage timer. Both are resolved;
path validation now allows only known fields, bounded indices and a redaction
marker, and compilation/hash timing shares the manifest stage. The final pass
has **no actionable local findings**. Request serialization, one dispatch,
failure preservation, private output retention, bounds/privacy and UI mapping
are covered; real provider acceptance and media quality are unverified.

The existing backend watcher reloaded the changes. Listener ownership and a
stabilization check passed: backend PID 17144 / supervisor 11188 on 4000;
frontend PID 20712 / supervisor 10900 on 3000. Eight owned processes per service
are recorded; zero previously owned backend identities remain outside its
current tree. Required health, `/start` and config GETs returned 200. The
read-only replay-options POST returned 200, emitted the new fixed messages and
recorded zero AI calls. An extra GET probe initially returned 404 because that
options route is POST-only; this was corrected without a processing request.
Windows process enumeration required the tool's explicit escalation, which
succeeded. Runtime evidence is outside Git at
`%TEMP%/clipbuilder-runtime/assembly-request-diagnostics-20261005/verification.json`.
The build's generated Next type references were restored to the running dev
form, with no remaining diff to that generated file.

Full private capture is armed and its six-hour permit is renewed through
**2026-10-06 04:14 Cairo time**. Existing evidence and the saved sample remain
preserved. Operating switches, cloud approvals and final-render availability
are unchanged. No Git mutation, cloud deployment or paid test was performed.

Owner handoff: Exit, refresh `/start`, use **Simulate find moments for sample**,
choose one candidate, then Proceed. This establishes fresh signed evidence and
tests real selected assembly without repeating transcription/selection. The
paid assembly result, framing/card/caption/preview quality, actual media/device
acceptance and final rendering/export remain owner-only or separately gated;
fake checks do not settle them. Existing rights/provider/cloud/public-release
gates are not waived.

## Scope and remaining gates

FAKE_MODE=true needs no keys and verifies deterministic request construction,
compilation, cleanup and error mapping. It does not prove live AI quality.
Real assembly needs the existing Gemini key, ADC, independent recorded paid
and assembly approvals, enabled live capabilities, and the owner's manual
test. Agents do not trigger a live paid request. Final rendering remains a
separate capability and is not enabled by this packet. No Git actions,
configuration changes, cloud deployment or new external resources are needed.
