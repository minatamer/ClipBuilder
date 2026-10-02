# Cloud Run renderer setup at the first cloud-dependent local test

Status: **Private setup, authentication, verified Linux image and the rights-confirmed
2:45 upload/proxy/render/audio/cancellation/independent expiry proof passed. CL-006
is complete.** This guide itself authorizes no cloud, credential, paid or Git action.

The existing project's ID, billing, europe-west1 region and exact private resource
names were verified privately. The owner approved build/private setup, ADC,
Remotion SSR license coverage, the USD 1 media test allowance, this source's rights
and necessary image retries until the test passed. Five builds and four cloud
media dispatches were recorded; Gemini stayed off. Exact digest, timings, output
profile, cancellation and 404 deletion evidence are in
[CL-006](../tickets/CL-006-build-media-job-and-speaker-feasibility.md#completed-private-cloud-foundation--2026-10-02).

The renderer retains 4 CPU/8 GiB, min zero/max one, concurrency two, a single
media slot, 900-second request timeout, 840-second work deadline and two-operation
per-process cap. Independent accelerated expiry passed without changing production
TTLs. Original owner input was preserved; test media and owned temporary build
contexts were removed. Resources and the enabled expiry schedule remain retained;
ancillary storage/scheduler/secret charges can continue. Alerts are advisory.

Current frontend/backend flow still uses fixtures. CL-007 is next; live Gemini,
public sample/release, full maximum-envelope stress and product integration remain
separate gates. Fake-plan cloud media tests need no AI key. The
[cloud migration](../architecture/GEMINI_REMOTION_MIGRATION.md) owns product and
privacy responsibilities; the [cost model](COST_MODEL.md) owns recorded budgets.

After documentation approval, reach this setup checkpoint as soon as a genuine
cloud-dependent local test needs it and its minimum local image/adapters and
private-access/cleanup/spend controls are ready, potentially during CL-005/006
integration. Bring necessary lifecycle/security controls forward; do not wait
for all CL-007–014 features or the final public release audit. Establish only
isolated private infrastructure for separately authorized synthetic tests, then
resume the owning packet. Complete public deployment is a distinct later CL-015
checkpoint requiring the release audit and separate approval.

## Proceed together in separate checkpoints

1. Keep the frontend and Express backend local. Confirm the actual project ID,
   region, billing/IAM prerequisites, Remotion license and an explicit build
   spend ceiling. The project display name alone is insufficient.
2. The owner installs gcloud and completes CLI login. After bounded build-only
   authorization, inspect existing resources, prepare the named build identity,
   staging bucket and image repository, then submit one allowlisted Linux image
   build with a 20-minute timeout. Repair a failed image before proceeding.
3. After the image passes, obtain separate authorization for the private renderer,
   temporary media bucket, cleanup secret/identity/schedule and bounded synthetic
   tests. Establish local ADC impersonation at this checkpoint, after its IAM grant.
4. Verify private invocation, synthetic media processing and independent expiry;
   the current browser workflow still uses fixtures. Resume the owning integration
   packet using the private typed renderer port.
5. Real source upload and live Gemini require their later explicit rights,
   transfer, credential and paid-call gates. Public application deployment has
   its own release checkpoint.

## Confirm the setup inputs per checkpoint

- Verify project **ID**, project number and permitted region privately in the
  Console project selector or with the read-only commands below. Record no
  account identifiers in Git/docs/logs. Review existing resources before changes.
- Confirm active billing, a small explicit build/test ceiling and alerts,
  allowed data geography and Remotion license/telemetry. Before later real-source
  or live-AI tests, confirm sample rights and Google paid-data terms separately.
  A project budget alert does not enforce a spending cap.
- At the private-media checkpoint, authorize one private renderer, one dedicated
  disposable bucket, required identities/secrets and one bounded expiry schedule.
  This deploys a **test renderer**, not the complete public application.
- Cloud Build additionally needs a separate build-only source staging bucket,
  narrowly scoped build identity and one build budget. Do not repurpose the
  visitor-media bucket for build sources or let gcloud create unnamed defaults.
- Verify the Node/Docker image before private service deployment: exact lockfile/binary
  digests/notices, synthetic input/output/cancel/scratch proof, content-safe
  logging and absence of all frontend feasibility/debug pages/model assets.
- Windows Node proof is recorded in CL-006. Docker is unavailable here; the owner
  installed/authenticated gcloud, available through its standard Windows install
  path even when the terminal PATH is stale. Prefer the one authorized Cloud Build over installing
  Docker/virtualization. The first cloud workload is the Linux image build,
  preceded by its separately authorized build-only resource/IAM setup; stop if
  it fails and repair the image before deploying or uploading test media.
- Owner supplies actual configuration manually in ignored/managed secret
  storage. Never read .env.local, export secrets to terminal or create JSON keys.

## Authentication identities are distinct

`gcloud auth login` authenticates the CLI for authorized management commands.
It does not configure the local app's Application Default Credentials (ADC).
`gcloud auth application-default login` configures ADC for server client
libraries, preferably impersonating a dedicated local test caller. Both logins
are owner actions at setup, not actions performed now. The Cloud Run service
runs as a separate attached runtime service account and uses its metadata
credentials; it does not inherit the user's CLI login or local ADC.
See [ADC](https://docs.cloud.google.com/docs/authentication/application-default-credentials)
and [Cloud Run developer authentication](https://docs.cloud.google.com/run/docs/authenticating/developers).

Before ADC impersonation, an authorized IAM administrator grants the human
developer **Service Account Token Creator** (`roles/iam.serviceAccountTokenCreator`)
on the dedicated **local caller service account**, not on the project. This
allows that developer to impersonate only that caller. Its renderer invocation
and Storage access remain the separate service/bucket-scoped grants below.
Node.js supports this local ADC flow; verify the selected client library when
implementing it. See [official local ADC setup](https://docs.cloud.google.com/docs/authentication/set-up-adc-local-dev-environment).

Use Google-signed ID tokens with the renderer service URL as audience for
invocation; an access token for Storage is a different credential. The local
Express API obtains these via server-side ADC/impersonation, never the browser.
Cloud Run IAM requires authentication even with fake AI. Add application-level
purpose/session/revision checks after platform authentication.
[Service-to-service authentication](https://docs.cloud.google.com/run/docs/authenticating/service-to-service)
owns the official token flow. No token is printed, committed or embedded in a URL.

| Identity | Minimum proposed access | No access |
| --- | --- | --- |
| Human deployer | Cloud Run administration, Artifact Registry writer and service-account actAs on the named runtime only; narrowly authorized resource setup | Broad Owner/Editor as an app requirement |
| Human local developer | roles/iam.serviceAccountTokenCreator on the dedicated local caller service account only | Project-wide token creation, service-account key creation or direct browser credentials |
| Human build submitter | Build submission in the selected project; source upload to the named staging bucket; service-account actAs on the named build identity | App-runtime or local-caller impersonation as a build requirement |
| Renderer runtime | storage.objectUser plus a single-permission storage.buckets.get custom role on the dedicated bucket; read only its named encrypted-cleanup secret | Gemini key, other buckets, bucket administration or IAM policy read |
| Local control/test caller | run.invoker on renderer; named caller impersonation only if selected | Direct bucket access, browser credential or public invocation |
| Scheduled expiry caller | run.invoker on renderer, application purpose restricted to expiry | Render/AI dispatch authority |
| Build identity | Writer on the named image repository; objectViewer on the named build-source bucket; logging.logWriter in the selected project | Visitor media bucket and Gemini secret |

Separate exact service identities and bucket-level grants; the standard
objectUser role includes create/read/update/delete needed for transient media.
Startup and every expiry sweep also read the bucket's disposable-retention
settings. `roles/storage.objectUser` does not grant `storage.buckets.get`;
the setup administrator must create a project custom role containing only that
permission and bind it to this bucket for the renderer identity. The runtime
does not need bucket create/update/delete or getIamPolicy. See the primary
[object role permissions](https://docs.cloud.google.com/storage/docs/access-control/iam-roles)
and [bucket metadata API](https://docs.cloud.google.com/storage/docs/json_api/v1/buckets/get).
Use generation preconditions and an opaque reserved prefix in application code.
Review whether a narrower custom object role is warranted; do not broaden
runtime permissions for convenience. Scheduler identity can invoke the private
endpoint but app verification must restrict it to cleanup, not renderer actions.

## Command path — placeholders only, do not run yet

If gcloud remains unavailable, install the owner-managed Windows CLI using
[Google's official installer guide](https://docs.cloud.google.com/sdk/docs/install-sdk#windows),
then reopen the terminal and verify `gcloud --version`. Do not initialize/login
or enable APIs until cloud authorization is granted. Docker is unnecessary for
the recommended Cloud Build path. The dashboard remains useful for project,
billing, IAM and resource inspection; commands preserve the exact bounded setup.

After authorization, the owner verifies IDs and chooses values. These command
templates intentionally contain no project/account/key values. Store filled
variables only in a private shell/session; do not paste them back into docs.

### Checkpoint 1: owner login, build-only bootstrap and one Linux image

An authorized setup administrator needs permission to enable the selected APIs,
create the named service account/bucket/repository and set their IAM bindings.
Before submission, verify the human's `cloudbuild.builds.create/get` permissions
(for example through Cloud Build Editor), source-object upload and bucket-metadata
read on the staging bucket, and `iam.serviceAccounts.actAs` on the build identity.
Grant Service Account User on that service account only if its actAs permission
is missing; keep source-upload grants on the staging bucket. Existing
organization policies and IAM must be inspected before choosing grants.
See [custom build identities/logging](https://docs.cloud.google.com/build/docs/securing-builds/configure-user-specified-service-accounts),
[build submitter actAs](https://docs.cloud.google.com/build/docs/cloud-build-service-account-updates)
and [repository-scoped IAM](https://docs.cloud.google.com/artifact-registry/docs/access-control).

```powershell
# Owner completes interactive login after the checkpoint is authorized.
gcloud auth login
# Inspect privately, do not commit output.
gcloud projects list --filter="name=ClipBuilder"
gcloud projects describe $projectId
gcloud config set project $projectId

# Only the separately approved build bootstrap APIs/resources.
gcloud services enable cloudbuild.googleapis.com iam.googleapis.com artifactregistry.googleapis.com storage.googleapis.com logging.googleapis.com --project=$projectId
gcloud iam service-accounts create $buildIdentityName --project=$projectId
$buildIdentity = "$buildIdentityName@$projectId.iam.gserviceaccount.com"
$buildServiceAccountResource = "projects/$projectId/serviceAccounts/$buildIdentity"
gcloud artifacts repositories create $repositoryName --repository-format=docker --location=$region --project=$projectId
gcloud storage buckets create "gs://$buildSourceBucket" --project=$projectId --location=$region --uniform-bucket-level-access --public-access-prevention --soft-delete-duration=0
gcloud storage buckets update "gs://$buildSourceBucket" --no-versioning --clear-retention-period --lifecycle-file=$privateBuildSourceLifecycleFile
gcloud artifacts repositories add-iam-policy-binding $repositoryName --project=$projectId --location=$region --member="serviceAccount:$buildIdentity" --role=roles/artifactregistry.writer
gcloud storage buckets add-iam-policy-binding "gs://$buildSourceBucket" --member="serviceAccount:$buildIdentity" --role=roles/storage.objectViewer
gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$buildIdentity" --role=roles/logging.logWriter
# If missing, the authorized IAM administrator grants only the named identity.
gcloud iam service-accounts add-iam-policy-binding $buildIdentity --project=$projectId --member="user:$humanBuildSubmitterEmail" --role=roles/iam.serviceAccountUser
$approvedBuildSourceStagingUri = "gs://$buildSourceBucket/source"

# Generate locally from the repo root; submit only this allowlisted context.
$approvedBuildContext = (corepack pnpm --filter @clipbuilder/renderer exec tsx scripts/build-context.ts | Select-Object -Last 1).Trim()
$imageTag = "$region-docker.pkg.dev/$projectId/$repositoryName/renderer:cl006-test"
gcloud builds submit $approvedBuildContext --project=$projectId --region=$region --config="$approvedBuildContext/apps/renderer/cloudbuild.yaml" --substitutions="_IMAGE=$imageTag" --service-account=$buildServiceAccountResource --gcs-source-staging-dir=$approvedBuildSourceStagingUri --timeout=1200s --suppress-logs
# Verify binary hashes and production image contents, then resolve immutable digest.
gcloud artifacts docker images describe $imageTag --project=$projectId --format="value(image_summary.digest)"
# Construct $imageDigest from that exact verified sha256 result.
```

The owner supplies each resource name privately before executing this template;
reuse only a verified matching build resource within the approved scope. The
build-source lifecycle file contains a Delete action with `age:1` for this dedicated
bucket; it never contains visitor media. Inspect its retention/hold settings.
Build logs use the checked-in `CLOUD_LOGGING_ONLY` configuration, so no extra GCS
log bucket is created. Review logs privately for content-safe failures; do not
copy account identifiers or credential output into evidence. Record the image
result and stop at this checkpoint before requesting private-media setup.

### Checkpoint 2: private media service and bounded synthetic tests

These commands require their own bounded authorization after image verification.
The image repository/digest already come from checkpoint 1. No local ADC login
is needed to build the image.

```powershell
# Explicitly authorized private-media APIs only.
gcloud services enable run.googleapis.com iamcredentials.googleapis.com secretmanager.googleapis.com cloudscheduler.googleapis.com --project=$projectId

# Owner-selected names; no service-account JSON key creation.
gcloud iam service-accounts create $rendererIdentityName --project=$projectId
gcloud iam service-accounts create $localCallerIdentityName --project=$projectId
gcloud iam service-accounts create $cleanupIdentityName --project=$projectId

# NEW dedicated temporary bucket, not an existing unrelated bucket.
gcloud storage buckets create "gs://$temporaryBucket" --project=$projectId --location=$region --uniform-bucket-level-access --public-access-prevention --soft-delete-duration=0
gcloud storage buckets update "gs://$temporaryBucket" --no-versioning --clear-retention-period --lifecycle-file=$privateLifecycleFile --cors-file=$privateCorsFile

gcloud storage buckets add-iam-policy-binding "gs://$temporaryBucket" --member="serviceAccount:$rendererIdentity" --role=roles/storage.objectUser
# Authorized setup administrator creates only the required metadata-read role.
gcloud iam roles create $bucketMetadataRoleName --project=$projectId --title="Temporary media bucket metadata read" --permissions=storage.buckets.get --stage=GA
gcloud storage buckets add-iam-policy-binding "gs://$temporaryBucket" --member="serviceAccount:$rendererIdentity" --role="projects/$projectId/roles/$bucketMetadataRoleName"
```

The private lifecycle file contains a Delete action with `age:1` and
`matchesPrefix:["media/"]`. Preserve encrypted `intents/` until the application
verifies unfinished-upload cancellation and generation deletion; a bucket-wide
rule could discard the cleanup obligation during an outage. The separate expiry
scan also deletes expired orphan/late-upload generations. CORS is exact-origin
for normal http://localhost:3000 and bounded resumable PUT/Content-Range flows;
no wildcard or private account data. JSON API CORS behavior must be observed in
the first synthetic browser upload, including returned generation and Origin.
No retention lock, default/event
hold or backup/version-retaining feature is allowed on this disposable bucket.
The [bucket command reference](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create)
and current stable update reference must be checked again when setup is executed.

With the exact attached renderer identity, verify both disposable-bucket
metadata GET and synthetic object operations at setup. Static permission
inspection is not a credentialed IAM test. Do not weaken the bucket validation
or replace this narrow grant with Storage Admin to make startup succeed.

```powershell
gcloud run deploy $rendererService --image=$imageDigest --project=$projectId --region=$region --service-account=$rendererIdentity --no-allow-unauthenticated --cpu=4 --memory=8Gi --concurrency=2 --min-instances=0 --max-instances=1 --timeout=900 --cpu-throttling --env-vars-file=$privateRendererEnvironmentFile --set-secrets="/var/run/clipbuilder/cleanup/key=$cleanupSecretName`:1"

gcloud run services add-iam-policy-binding $rendererService --project=$projectId --region=$region --member="serviceAccount:$localCallerIdentity" --role=roles/run.invoker
gcloud run services add-iam-policy-binding $rendererService --project=$projectId --region=$region --member="serviceAccount:$cleanupIdentity" --role=roles/run.invoker

# Authorized IAM administrator grants this human only the named caller's tokens.
gcloud iam service-accounts add-iam-policy-binding $localCallerIdentity --project=$projectId --member="user:$humanDeveloperEmail" --role=roles/iam.serviceAccountTokenCreator
# Human developer then creates local ADC by impersonating that caller.
# Target a service account ending in .iam.gserviceaccount.com, not a human email.
gcloud auth application-default login --impersonate-service-account=$localCallerIdentity

# Owner-selected verified URL; OIDC audience is the private renderer base URL.
gcloud scheduler jobs create http $cleanupSchedule --project=$projectId --location=$region --schedule="*/15 * * * *" --uri="$rendererUrl/internal/expiry" --http-method=POST --oidc-service-account-email=$cleanupIdentity --oidc-token-audience=$rendererUrl --attempt-deadline=180s
```

The owner-managed renderer env YAML must match `apps/renderer/.env.example`:
RENDERER_ENABLED=true, CLOUD_SPEND_APPROVED=true, REMOTION_LICENSE_CONFIRMED=true,
RENDERER_MAX_OPERATIONS=2 for one prepare and one render, exact RENDERER_BUCKET,
RENDERER_AUDIENCE, RENDERER_CALLER_EMAIL, RENDERER_EXPIRY_CALLER_EMAIL,
RENDERER_CLEANUP_KEY_FILE=/var/run/clipbuilder/cleanup/key and the approved exact
FRONTEND_ORIGIN. The Dockerfile already supplies binary/bundle paths. Keep all
AI keys absent from this environment. Mount an owner-created base64url 32-byte
key as a Secret Manager file and grant runtime secretAccessor only on that
named secret. Never place secret content in CLI arguments or Git.

First deploy disabled with RENDERER_ENABLED=false to establish the stable URL;
the executable deliberately refuses disabled startup, so this revision is not
ready. If status.url is absent, read the assigned URL from the server's
run.googleapis.com/urls annotation privately. Set the exact audience in the
owner-managed env YAML and update the same service with all approved gates.
Do not report readiness until IAM/token/health and bucket checks pass. A failed
disabled revision is expected bootstrap evidence, not a working deployment.

For local control tests, only root `.env.example` entries
CLOUD_RENDER_ENVIRONMENT=cloud, CLOUD_SPEND_APPROVED=true and
PRIVATE_RENDERER_ORIGIN=<verified URL> change manually; FAKE_MODE=true and all
paid/live AI gates stay false. The backend adapter is an isolated typed port;
the browser product still uses fixtures until its owning integration tickets.
Never enable a removed LIVE_RENDER_ENABLED/LIVE_UPLOAD_ENABLED flag. Use ADC
impersonation after the exact Token Creator grant above; no JSON key is needed.

The per-process operation cap is not a global billing quota and resets on a new
instance. Approve one build at checkpoint 1 and at most two media dispatches
separately at checkpoint 2; a retry or restart that needs more calls requires a
new bounded authorization. Budget
alerts do not hard-stop spend. Scheduler authentication/cleanup is verified
before admitting media. Remove the named build context/staged source after the
test using verified absolute paths and separately authorized cloud teardown.
The media service has no Gemini key. Local control holds its owner-managed key
only for separately authorized live AI. Application media semaphore is one;
request concurrency two reserves capacity for cancel/expiry. Verify service
maximum instances and rollout overlap, rather than treating flags as a global
hard quota. [Deploy reference](https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy).

The container must listen on `0.0.0.0` at the injected `PORT`. It serves only
small authenticated, schema-validated descriptors and content-free health;
original media uses the approved GCS transport. Bake the fixed composition,
Chromium and FFmpeg into the image; no arbitrary composition, URL, command or
runtime binary download is accepted.

## Dashboard alternative

1. Select and verify the actual project ID in Google Cloud Console; confirm
   billing, region, existing resources and test budget privately.
   Complete the build-only checkpoint first: create the named build identity,
   staging bucket and repository with the same scoped grants above, then submit
   the locally generated context through gcloud. A Console project selection
   does not install the CLI or configure local ADC. Proceed below only after
   image verification and separate private-media authorization.
2. Enable the named APIs. Create the dedicated identities with the table's
   service/bucket/secret-scoped grants; no default broad service account/key.
   In IAM & Admin > Roles, create the metadata-read custom role with only
   storage.buckets.get. On the dedicated bucket's Permissions page, grant that
   custom role and Storage Object User to the renderer runtime identity only.
3. Create a regional standard private bucket. Enable uniform access and public
   access prevention; set soft delete to zero, versioning/holds/retention off.
   Apply exact-origin CORS and the age-one-day lifecycle backstop only to media/;
   preserve intents/ obligations until verified cleanup. Verify settings and
   metadata read using the exact attached runtime identity.
4. Create a regional Docker Artifact Registry repository, push the approved
   image, and deploy its digest to a private Cloud Run service with the runtime
   identity/resources/deadlines above. Do not enable unauthenticated access.
5. Grant invoker only to the local caller and cleanup identity. Configure the
   service's allowed callers/purposes; use owner ADC impersonation for the local
   server. Before that login, open IAM & Admin > Service Accounts > the dedicated
   local caller > Permissions/Grant access; grant the human developer Service
   Account Token Creator on this service account only. Do not add it in the
   project's IAM page. Dashboard service setup does not establish ADC on the workstation.
6. Create an authenticated 15-minute HTTP expiry schedule using cleanup OIDC.
   Test it on synthetic expired objects, including a crashed operation and
   encrypted unfinished-upload cancellation. No visitor media is needed.
7. Configure advisory budget alerts and content-free failure/overdue-cleanup
   alerts. Keep live Gemini/public paid traffic disabled. Save no IDs/secrets
   in repository examples; use private owner setup evidence.

## Readiness, cleanup and bounded real tests

Before real media, verify IAM denial for unauthenticated/wrong caller; no public
object access; health content-free; exact synthetic upload size/generation;
partial/resumable cancellation; Node render MP4 profile/sample sync; source and
manifest fencing; OOM/timeout/cancel process-tree cleanup; output retries with
zero AI calls; deletion not-found including all versions; expiry after browser
close and service restart; overdue retry/backlog alarms; no content in logs.
Budget the synthetic calls/cloud bytes before dispatch. Fake AI + cloud render
is still paid cloud compute and requires explicit authorization.

Successful processing completion is a validated final output publication.
Delete raw/proxy/intermediate/assets then; final output expires after ten minutes
or session expiry, whichever is earlier. Download initiation is not completion.
The independent sweeper targets operational 2h33m raw / 43m final-output bounds
while healthy, including one scheduled retry and three-minute execution;
provider outages can exceed them, require intake shutdown and
incident cleanup, and preclude an unconditional permanent-deletion promise.
Do not rely on unload/finally/lifecycle alone. The migration contract defines
encrypted expiring cleanup intents, retries, counts and verification.

Only after owner call/rights/transfer approval, test the local app against the
private renderer and live Gemini using the owned reference source. Measure
admission/upload/proxy/AI/candidate/focus/preview/render/validated download times,
actual speaking-face correctness against independent audible labels, final
captions/layout/audio sync, bytes/tokens/cloud resources and cost. This has not
been done; neither cloud speed nor Gemini accuracy is assumed.

Teardown is a later separately authorized action: pause scheduler/new intake,
fence/cancel active work, verify owned temporary generations/sessions deleted,
then delete only the named test service/schedule/identities/repository/bucket
when the owner wants that. Confirm residual images/secrets/retained bytes and
charges; never delete the existing project or unrelated resources. Keep
content-free aggregate evidence, not raw content or credentials.
