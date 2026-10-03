# Retained sample setup and preservation

Owner-directed CL-016 follow-up. Local implementation is available; no cloud
resource, credential, upload or actual sample playback has been verified by this
change. This guide owns the fixed retained-source path. The existing
[local master rules](LOCAL_RELEASE_PREPARATION.md#retained-owner-demonstration-source)
and [cloud media guide](CLOUD_RUN_RENDERER_SETUP.md) still apply.

## Permanent master and disposable copies

The owner-authorized continuous 7:41 excerpt remains ignored in
`private/retained-demo-source/` under the generic `input.mp4` name. Preserve that
directory, its ignored manifest and preservation notice. Do not move, replace,
delete, commit, put in frontend public/build output or include it in fixtures/CI.
Do not copy its private provenance, identifiers or hashes into logs/docs.

Create/use a **separate private retained-media bucket**, never the renderer's
disposable visitor bucket. It must have no automatic deletion lifecycle, visitor
sweeper, session TTL or cleanup job. Keep public access prevention and uniform
bucket access; do not grant public principals. The application reader receives
only object-read permissions on this bucket and no create/update/delete role.
The operator who performs the single upload is separate from the app reader.
Review inherited IAM as well as the bucket grant. Google's
[Storage Object Viewer role](https://docs.cloud.google.com/storage/docs/access-control/iam-roles)
includes object reads/listing without object deletion.

The existing visitor bucket remains the destination for normal user uploads and
disposable processing copies. Its documented lifecycle and application scans
target `media/`, so a retained object outside that prefix could technically share
it. A separate bucket is the proposed preservation boundary, not a claim that
every existing object automatically expires: the renderer's bucket-wide object
role includes deletion. This avoids giving the visitor renderer deletion access
to the permanent master. The owner asked for clarification of this choice; no
second bucket, IAM change, cloud upload or current-policy inspection has occurred.
The final destination remains at the owner checkpoint. MP4 file type is unrelated
to retention/IAM isolation; the existing intake supports MP4 and WebM and also
enforces inspection, byte/duration and processing constraints.

The backend holds a fixed bucket/object/generation/byte reference. Reads are
generation-pinned; replacing the object requires an explicit owner update rather
than silently changing input. Browser media is served through
`/api/analysis/sample-source` → `/v1/retained-sample/video`, using server ADC.
No private GCS URL, resource name, account identifier or signed capability is
sent to the browser. OAuth-authenticated reads and generation-specific media
requests are supported by Google's [authentication](https://docs.cloud.google.com/storage/docs/authentication)
and [object GET documentation](https://docs.cloud.google.com/storage/docs/json_api/v1/objects/get).

Selecting the sample makes a temporary browser copy and passes it through the
ordinary media inspection/workspace. **Find moments** uploads a separate
disposable processing copy using the existing consent/admission/AI gates.
Visitor Clear, cancellation, expiry, final-export cleanup and renderer sweeps
only operate on those copies. No master reference is included in their cleanup
descriptors; the new reader has no delete method. Disabling the sample flag
stops app reads without deleting either master.

## Concrete owner checkpoint

Before using credentials or uploading, resolve the retained bucket/project/region
and reader identity with the owner. Confirm it is separate from disposable
storage, with the policy and read-only access above; new resource/IAM changes
must be specifically authorized. Existing private-renderer test approval does
not certify this bucket's retention policy. Keep actual identifiers in ignored
owner configuration/runtime records, never Git, screenshots, URLs or output.
The owner completes the browser login; no service-account JSON is needed.

For the selected reader account, the owner runs this locally, substituting the
placeholder without putting its real value into this document:

```powershell
gcloud auth application-default login --impersonate-service-account=READER_ACCOUNT_EMAIL
```

Service-account impersonation for local Node ADC is documented by
[Google](https://docs.cloud.google.com/storage/docs/authentication#service_account_impersonation).
It needs the owner's existing permission to obtain an access token for that
account. Login does not grant bucket access. A new IAM grant remains its own
owner-approved action. ADC unlocks authenticated preview reads; it does not
enable Gemini, prove real AI quality, or complete the upload/storage checkpoint.
The CLI upload identity and the application's ADC are separate configurations.

Once the destination and upload identity are approved, perform a single
create-only upload of the exact local master. A command template is:

```powershell
gcloud storage cp private/retained-demo-source/input.mp4 gs://RETAINED_BUCKET/RETAINED_OBJECT --if-generation-match=0 --content-type=video/mp4 --cache-control=no-store
```

The [generation precondition](https://docs.cloud.google.com/storage/docs/request-preconditions)
and [CLI flags](https://docs.cloud.google.com/sdk/gcloud/reference/storage/cp)
prevent overwriting an existing live object and set the media type expected by
the stream validator. Do not use sync, wildcard upload, move, delete, recursive
cleanup, gzip or a public ACL. Verify bytes/generation/content type and bucket
retention/IAM without printing private metadata. Record exact values privately.
Failure must not delete the local master or retry against another destination.

## Owner configuration and verification

Populate the matching blank entries from `.env.example` manually in the ignored
root `.env.local`. Never read that file to diagnose setup. Keep each private
reference blank in committed examples:

```text
RETAINED_SAMPLE_BUCKET=
RETAINED_SAMPLE_OBJECT=
RETAINED_SAMPLE_GENERATION=
RETAINED_SAMPLE_BYTES=
```

After the checkpoint succeeds, opt into `RETAINED_SAMPLE_ENABLED=true`, local
real-media composition (`FAKE_MODE=false`, `APP_ENV=local`) and approved cloud
storage spend (`CLOUD_SPEND_APPROVED=true`). This source-preview path needs no
Gemini key; keep `PAID_DEMO_ENABLED=false` and every `LIVE_*` flag false for a
preview-only test. Defaults/tests retain `FAKE_MODE=true`, retained reads off,
paid/live flags off and no cloud/credential access. There is no local AI runtime
or model involved. Public hosting remains disabled by the local gate.

Restart the normal app stack using repository lifecycle rules; do not force
test flags or expose a second browser mode switch. Content-free config should
report local media and retained sample availability. On **Use sample**, verify
the full source plays/seeks in **Step 1**, with no analysis request or transfer
to Gemini. Clear it and repeat to confirm the master remains intact and only
the temporary workspace copy disappears. Retained reads are limited to two
concurrent streams, 60 starts per minute per process and a 60-second deadline;
source bytes are capped and exact range/MIME/length are verified. These limits
do not establish a monetary hard cap or authorize public deployment.

Then test normal **Find moments** only under the separately approved
rights/provider/consent/challenge/keys/live/spend gates. Sample source ranges,
speaker coordinates, captions, visuals and final edits are never hardcoded.
Keep actual source attribution/license/marketing/provider-transfer evidence with
the owner's existing rights record and satisfy it before public distribution.
Fake candidates/output do not certify this source's analysis quality.

Cloud/master upload, ADC, IAM/lifecycle inspection, actual preview/seek, source
attribution/public rights, paid analysis, device and release evidence remain
unchecked until produced. CL-016 owns that record; no deployment or Git mutation
is authorized by this guide.
