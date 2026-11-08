# CL-270 — Fix custom-domain startup connection

Status: custom-domain configuration corrected and startup verified, 2026-11-08.
Real hosted upload/challenge/AI acceptance remains owner-only and unverified.

The owner reports Couldn't connect / Try again at `tryclipbuilder.com/start`
and explicitly requests diagnosis and a fix. Read-only reproduction: both page
hosts return 200, but the custom domain returns 403 on hosted capability/session
GETs and 400 on configuration; the managed origin returns 200 for all three.
The deployed FRONTEND_ORIGIN remains the managed URL, and the existing exact
Host/TLS check correctly rejects custom-host API requests. CL-269 preserved that
configuration and tested only its managed origin; this follow-up owns the gap.

Use the documented exact custom-domain cutover rather than weakening origin,
TLS, CSRF, IAM or verified-IP guards or adding routes. Select
`https://tryclipbuilder.com` as the single hosted processing origin. Align the
frontend/backend origin and expected Turnstile hostname; preserve private backend
audiences/callers, all secret references, resource/spend/usage limits and existing
images. Align the legacy renderer hosted origin and disposable-bucket CORS where
required by the existing release guide, preserving localhost and private IAM.
Keep DNS unchanged when its existing mapping/TLS is healthy.

The owner's existing deployment authorization plus this explicit fix request
authorizes the necessary bounded configuration revisions and non-processing
acceptance checks. Stage paid enablement safely during the change, preserve
rollback metadata, and verify the real custom-host bridge and browser startup.
No real upload, Gemini inference, additional paid run, secret payload/ignored-env
read, new identity, broad IAM or unrelated cloud mutation. Local stays stopped.

Acceptance:

- Reuse focused fake/no-key origin/transport tests; exact custom host works and
  arbitrary/forged hosts stay rejected. No application source change is needed
  unless a separate confirmed defect is found and allocated first.
- Check existing custom-domain mapping/TLS and named configuration metadata;
  record rollback settings privately, never full secret/env contents in Git.
- Apply the existing guide's canonical-origin cutover. Verify custom-host page,
  configuration, capabilities/session GETs, paid feature flags and signed private
  bridge, keeping Find visuals off and Hook titles on. No session creation or AI.
- In the Codex browser, the initial connection finishes and the footer retry
  error disappears. Preserve challenge/consent gates and clearly distinguish any
  unverified real Turnstile/AI flow from no-key synthetic or read-only checks.
- Keep local ports 3000/4000/4200 free and record actual verification/status in
  this packet and the index. Existing real-run authorization remains consumed.

## Correction and verification

- Existing domain mapping and TLS are Ready. No DNS change was necessary.
  Temporarily held hosted paid processing, aligned frontend/backend
  `FRONTEND_ORIGIN` and backend `TURNSTILE_EXPECTED_HOSTNAME` with the custom
  domain, then restored both existing paid enablement values to true.
- Renderer `HOSTED_FRONTEND_ORIGIN` and disposable upload-bucket CORS now use
  the exact custom origin. Renderer/local CORS still preserve
  `http://localhost:3000`; methods, response headers and max age are unchanged.
  Bucket lifecycle, access prevention and uniform access remain unchanged.
- Configuration-only revisions serve at 100%. Existing immutable application
  images, runtime identities/resources, private backend audiences/callers,
  secret references and frontend/backend IAM are preserved. Rollback metadata
  and detailed configuration receipts remain private outside Git.
- All five custom-host GETs return 200: `/start`, `/api/sample/config`,
  `/api/local/capabilities`, `/api/local/session` and `/api/local/workspace`.
  Configuration reports live analysis/assembly/render and provider-AI planning,
  captions and Hook titles; manual Find visuals remains false. Public bounds
  remain 524,288,000 bytes / 1,200 seconds and three clips.
- The retired managed hostname's capability API returns 403; anonymous direct
  backend health returns 403. No second public processing origin or relaxed
  Host/TLS/Origin/CSRF/client-IP guard was added.
- Codex in-app browser refresh settles on the enabled upload screen with no
  Connecting, Couldn't connect or Try again footer. A content-free intake
  screenshot was retained outside Git. No file was selected or session created.
- Focused frontend `control-api`, `local-workflow` and `demo-client-ip` suites
  pass: 26 tests across three files, using isolated fake/paid-off/no-key setup.
  These prove transport/origin behavior, not real Gemini output or upload quality.
- Ports 3000/4000/4200 have zero listeners; the local app remains stopped.
  No ignored configuration, secret payload, retained media or saved work changed.
  No Gemini/provider inference, real upload, challenge solve or retry occurred.

The Cloudflare widget dashboard hostname allowlist was not inspected or changed;
its real challenge and the complete hosted processing flow still need owner
acceptance. Backend expected-hostname metadata alone does not prove that flow.

Whole-file release bookkeeping allocation: this packet, `docs/tickets/README.md`
and `docs/operations/CLOUD_RUN_PUBLIC_DEPLOYMENT_2026-10-07.md`. No application
source change or image rebuild. Use the continuing authorized release commit/push
with formatting, whitespace and exact staged-file checks.
