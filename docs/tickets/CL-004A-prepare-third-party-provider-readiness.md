# CL-004A — Google and cloud readiness

Current authority: [cloud migration](../architecture/GEMINI_REMOTION_MIGRATION.md), [provider guide](../operations/PROVIDER_SETUP.md), [cloud setup](../operations/CLOUD_RUN_RENDERER_SETUP.md). Status: documentation/local corrections approved; account/setup/live readiness remains unchecked. Private temporary GCS is approved as design, not provisioning. Verify model/structured output, paid Google data policy/rights/call budget, Remotion SSR licensing/Linux notices and actual project ID/region/identities privately at the external gate. Fake offline tests remain key/ADC/network-free; fake AI plus remote compute still costs cloud resources. Do not follow superseded Deepgram/OpenAI/no-GCS setup. CL-006 records installed SDKs and current local proof; no documentation approval is needed again.

<details><summary>Earlier readiness packet — historical where superseded</summary>

# CL-004A - Prepare third-party provider readiness

Status: Planned<br> Milestone: M1 - provider readiness before real
integrations<br> Last synchronized: 2026-10-01<br> Depends on: CL-001
configuration/secret boundaries and CL-004 development preview<br> Blocks:
CL-005/CL-007/CL-009 external provider readiness, not deterministic
implementation<br> Suggested commit:
`CL-004A: document provider setup and validation gates`<br> Parent plan:
[`../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md`](../CLIPBUILDER_DEMO_SOURCE_OF_TRUTH.md)<br>
Ticket index: [`README.md`](README.md)

---

## Objective

**Browser-owned revision (2026-10-01):** source-of-truth section 0.9 and the
[browser contract](../architecture/BROWSER_OWNED_MEDIA.md) supersede this
packet's native-media/software/cloud-resource inventory. Prepare WebCodecs,
Mediabunny (MPL-2.0), browser workers/OPFS/IndexedDB, conditional codec/model
dependencies, fonts/cards and protected bounded audio/text readiness instead.
No original-video upload, GCS bucket or Cloud Run media job is part of CL-015.
Provider dashboards/privacy/budgets remain; existing env entries still describe
legacy planned code until CL-005 migrates schema/example/tests together. Do not
populate obsolete storage/job/native-media fields. Download/install/model,
provider/paid/cloud authorizations remain separate from these guides.

Give the owner one complete, understandable setup path for every non-GCloud
third-party dependency before real integrations: official dashboard links,
account/project and billing steps, model access, least-privilege credentials,
ignored local configuration, privacy/retention, numerical spending decisions,
rate limits, verification, troubleshooting, rotation, and shutdown.

Owner decision (2026-10-01): prepare these detailed guides now. GCloud account,
billing, project/API enablement, IAM, registry, secrets, hosting service
provisioning, deployed transport/control proof and deployment belong only to
CL-015, the final ticket. No media bucket/job is planned. Earlier packets implement and verify local/fake ports,
adapters and configuration without requiring cloud resources.

This suffix is an owner-requested readiness gate, not a renumbering of existing
tickets. CL-012 later audits the implemented controls and current owner
evidence; it must not be the owner's first provider-setup guide.

## Deliverables and ownership

- [`../operations/PROVIDER_SETUP.md`](../operations/PROVIDER_SETUP.md):
  canonical service inventory, dashboard walkthroughs, environment mapping, data
  controls, key lifecycle, safe validation and owner readiness record.
- [`../operations/COST_MODEL.md`](../operations/COST_MODEL.md): dated price
  references, per-action formulas, numerical owner worksheet, enforcement versus
  alerts, bounded validation authorization and incident response.
- [`../operations/THIRD_PARTY_SOFTWARE.md`](../operations/THIRD_PARTY_SOFTWARE.md):
  local binaries/packages/weights/fonts, exact-version and license requirements,
  installation ownership, offline checks and missing-tool handling.
- Parent decision/sequence and index; narrow handoffs in CL-005/006/007/008/009/
  011/012/014/015. Do not edit CL-004's application implementation or UI
  evidence.

## Required inventory

OpenAI provides candidate analysis, visual planning and bounded image
generation; Deepgram provides prerecorded speech-to-text; Cloudflare Turnstile
protects admitted live actions. Browser media/model/card/font dependencies are
listed in the current software guide. Native/Python tools are only conditional
approved offline reference tooling, not the deployed browser media pipeline.

No social-platform accounts, publishing APIs, OAuth integrations, stock-media
subscription, generative-video service, database, queue, analytics/replay
service or second hosting platform is needed. CL-013's film shows manual
external sharing after download; it does not create product integrations or
authorize uploads.

## Dependency evidence

Inspect the public root `.env.example`, explicit backend config schema and app
READMEs, not ignored `.env.local`. Distinguish declared configuration from
implemented adapters: storing a key cannot make an unavailable real flow work.
Reconfirm safe defaults (`FAKE_MODE=true`, paid master and all live flags
false). Do not change the main thread's local env, processes, configuration or
code.

## Implementation checklist

### 1. Complete the guides

- [ ] Inventory required, conditional, local-only, deferred-cloud and excluded
      services, with one owner and integration ticket for each.
- [ ] Open current official docs; record review dates and direct links. Verify
      named models without silently replacing them with newer models.
- [ ] Include dashboard navigation, prerequisites, billing/access stop points,
      minimum permissions, supported model/feature settings, privacy controls,
      env mapping, expected outcome, failure cases, rotation and revocation.
- [ ] Identify unavailable/account-specific controls as unverified, not assumed.
- [ ] Keep keys and account/project identifiers blank; never embed dashboard
      screenshots, provider payloads, actual media or private evidence.

### 2. Guide the owner, only when separately authorized

- [ ] Ask for provider/account creation or settings-change approval before that
      external action; documentation authorization is not dashboard
      authorization.
- [ ] Have the owner privately create/select isolated provider projects, review
      billing and data settings, configure caps/alerts, and create scoped keys.
- [ ] Have the owner manually populate matching blank `.env.local` entries;
      preserve existing contents and safe mode flags. No secrets in
      chat/terminal.
- [ ] Complete the numerical cost worksheet before any credentialed call; keep
      private account references in the owner's private store, outside the repo.
- [ ] Record sanitized evidence, date, scope and remaining blockers separately
      from documentation completion. No guessing that a checkbox is satisfied.

### 3. Handoff without premature live/cloud work

- [ ] CL-005 owns protected admission and real local media/storage/range
      playback, capability preflight and schema/state/config migration.
- [ ] CL-006 owns production worker audio and rights-approved browser speaker
      feasibility; CL-008 needs that browser go decision. Actual deployed
      runtime delivery/transport proof remains CL-015, not server media compute.
- [ ] CL-007 owns Deepgram/OpenAI analysis adapters, exact request settings,
      privacy proof and fake contract tests; CL-009 owns visual/image/card
      adapters.
- [ ] Fix a required config gap in its implementation ticket with
      schema/example/ test synchronization, never by adding an unknown local env
      variable here.
- [ ] CL-012 audits readiness, real implemented gates and exact call counts.
- [ ] CL-014 audits repository readiness and explicitly carries outstanding
      CL-015 cloud evidence, without requiring deployment before its own audit.
- [ ] CL-015 provisions approved hosting last, runs transport/control/client
      checks, starts unpaid, then performs only specifically approved live
      validation.

## Privacy and spend invariants

- Reading public docs requires no credential, provider call or payment.
- Account setup, funding, verification, downloads, installations, key use,
  provider settings changes and paid tests each need appropriate explicit
  approval.
- Unit tests/CI stay fake, network-denied and secret-free. Provider Playground
  requests are also paid/content-bearing actions, not free configuration checks.
- `store: false` is not a promise of zero provider retention. Confirm endpoint,
  model and project policy, including caches and image handling.
- Rate limits, prepaid balance and alert emails are not substitutes for a
  verified enforced spend control. Unknown enforcement blocks live approval.
- SDK paid retries stay zero; no automatic provider/model fallback or repeated
  smoke call to test a cap by spending until it trips.
- No GCloud mutation or cloud evidence belongs in this ticket.

## Acceptance criteria

- [ ] A first-time owner can follow every required dashboard path without
      reconstructing setup from multiple feature tickets.
- [ ] Every public env setting has a documented source/owner; credentials and
      private identifiers remain blank in committed examples.
- [ ] Every provider has dated model/access/data/billing/limit references,
      least-privilege setup, usage review, troubleshooting and key lifecycle
      steps.
- [ ] Cost worksheet covers fixed action counts, text/image/audio bounds,
      monthly caps, alerts, concurrency, overshoot uncertainty and kill
      switches.
- [ ] Local software inventory separates already installed from future ticket
      work; no guessed version, binary path, weights hash or license approval.
- [ ] GCloud provisioning and evidence are explicitly transferred to final
      CL-015; earlier dependencies remain executable locally without a cycle.
- [ ] All owner-only/account/credential/privacy/rights/paid/cloud items remain
      unchecked until actual authorized evidence exists.

## Focused verification

- [ ] Check Markdown formatting, relative links, queue order/dependencies,
      environment-name mapping and sanitized content; run `git diff --check`.
- [ ] Re-read current official sources before owner execution; dashboard labels,
      pricing, plans and access can change after the review date.
- [ ] Check the public example retains fake/off defaults and blank secrets; do
      not inspect ignored env or run the application to test credentials.
- [ ] No application regression suite is needed for this documentation-only
      planning change. Implementation tickets retain their own required gates.
- [ ] Report exactly what was inspected and what remains owner-only; do not mark
      live behavior, budgets, visual/media approval or cloud setup verified.

## Documentation preparation evidence (2026-10-01)

The three owner guides were authored from public repository configuration and
official OpenAI, Deepgram and Cloudflare documentation reviewed on this date.
Documentation preparation is complete; owner setup and this ticket's readiness
acceptance are not complete. The owner approved documentation preparation and
final-ticket cloud ordering, not account setup, numerical budgets, purchases,
credentials or live calls. External readiness and this packet's owner execution
remain pending.

### Documentation-only checks

- [x] Parsed all 15 changed Markdown documents with the installed Markdown
      parser; all 117 relative file links resolved.
- [x] Verified 16 ordered packets, CL-004A after CL-004 and CL-015 last, with
      every index dependency earlier than its consumer (no dependency cycle).
- [x] Checked 25 exact env-name references against public `.env.example`;
      fake/off defaults and matching blank credential/cloud entries were
      preserved. No ignored env or secret file was read.
- [x] Forced Prettier checks on the four new documents using
      `node node_modules/prettier/bin/prettier.cjs --check --ignore-path .gitignore`
      with their explicit paths. Root `.prettierignore` excludes Markdown, so
      its ordinary formatting gate alone would not prove these documents were
      formatted.
- [x] Scoped `git diff --check` passed; staged file list was empty. Existing
      CRLF-to-LF Git notices are normalization warnings, not whitespace
      failures.

No application tests/build, account mutations, installations, local env changes,
provider calls, paid/cloud work, process changes, Git mutations or messages to
the main thread were performed for this documentation change. All service
readiness checkboxes in the owner guides remain unchecked. The existing CL-002
speaker revision, CL-004 implementation and CL-013 film plan were preserved.

## Completion handoff

Report guide paths, reviewed sources/dates, configuration gaps, exact local
checks, owner decisions and remaining blockers. Separate documentation-ready,
account-ready, adapter-ready and authorized-live states. Do not stage/commit,
message another thread, provision, fund, install or call anything merely because
this packet exists.

</details>
