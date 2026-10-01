# Local third-party software readiness

Status: inventory and procedure prepared; media-tool installation not
verified<br> Last synchronized: 2026-10-01<br> Setup owner: CL-004A;
implementation owners: CL-006/008/009/011<br> GCloud
installation/authentication/provisioning and target-runtime evidence: final
CL-015

## Scope and Safety

This guide distinguishes local dependencies from provider dashboards. It does
not authorize installing/downloading software or model weights, accepting terms,
reading private media, calling providers, building/pushing cloud images or
starting/restarting another thread's processes. Use only approved synthetic or
rights-approved media; store actual media, weights and private artifacts outside
Git. Synthetic contract tests do not prove model quality or real MP4 output.

The future source-of-truth tree is not proof that a module, binary, script or
container exists today. The owning feature ticket must deliver the exact pinned
installation commands and verification alongside its first real module. Do not
run guessed Python entry points or scaffold future directories to satisfy a
list.

## Inventory and Ownership

| Software                                                    | Role                                                                 | Owning ticket / readiness gate                                                                         |
| ----------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Node.js and Corepack/pnpm                                   | Existing Next/Express/contracts toolchain                            | CL-001; root package engine and package-manager pin                                                    |
| OpenAI/Deepgram/storage/job SDKs                            | Backend-only adapter dependencies                                    | CL-007/009 and cloud adapter code owners; exact lockfile versions, fake request tests, zero paid retry |
| FFmpeg and ffprobe                                          | Inspection, speech extraction, captions/crops/assets, MP4 validation | CL-006 pins binaries/build features; CL-011 proves output                                              |
| Python, PyTorch and vision dependencies                     | Local bounded speaker processor                                      | CL-006 pins platform/CPU-compatible versions and locks                                                 |
| PySceneDetect and detector/tracker dependencies             | Shot boundaries and bounded face geometry                            | CL-006 spike, CL-008 production compiler                                                               |
| Light-ASD code and weights                                  | First active-speaker feasibility target                              | CL-006 exact commit/hash/license/download approval and local go/no-go                                  |
| TalkNet code and weights                                    | Conditional comparison, not a second pass for each clip              | CL-006 only after Light-ASD no-go and explicit owner comparison approval                               |
| MathJax and card rasterizer                                 | Exact source-controlled equation/information cards                   | CL-009 exact Node dependency, sanitization and deterministic render proof                              |
| Fonts, codec/build dependencies and approved static assets  | Fixed captions/card layout and legal distribution                    | CL-006/009/011 exact revisions, rights/license inventory and renderer parity                           |
| Local container runtime/build tools                         | Reproducible job runtime and constrained local benchmark             | CL-006; install only when needed/authorized; no registry push                                          |
| GCloud CLI, project identity, registry/storage/secrets/jobs | Deployment operations                                                | CL-015 only; no service-account JSON in env or repo                                                    |

No paid vision API, speech synthesis, generative-video tool or stock
subscription is needed for the locked flow. CL-013's editable product film may
need a local authoring dependency chosen in that ticket; do not purchase a tool
or expand the production request path here.

## Existing JavaScript Toolchain

Check the public root `package.json` before setup. At this review its Node
engine is `^22.13.0 || ^24.0.0` and package manager is `pnpm@11.19.0`. Use the
pinned manager, not a global unpinned `pnpm` or mixed npm lockfile.

Read-only version checks from repository root:

```powershell
node --version
corepack --version
corepack pnpm --version
```

Corepack can retrieve a missing pinned runtime; obtain download approval when
needed. If dependencies are missing, the owner-authorized first-time command is
`corepack pnpm install --frozen-lockfile`. That install can use the network and
is not a provider smoke test. Do not run it automatically during a docs review.

The fake application's commands/config belong to the app READMEs. Do not
reinstall, restart listeners or run the main thread's full checks as a side-chat
readiness probe. For implementation, the owning ticket requires the focused
tests and final root gate; tests never load local secrets or contact providers.

## Media and Vision Installation Procedure

1. CL-006 first selects an approved local execution route (native tools or a
   local pinned container), compatible with the owner's Windows host and
   intended Linux/CPU job image. Record OS/architecture and available
   CPU/RAM/disk.
2. Read official release/installation sources and code/weights licenses before
   installing. Pin every binary/package/commit and hash the actual weights; do
   not use mutable `latest`, untrusted download mirrors or a private source URL.
3. Obtain explicit approval for downloads/installations and model terms. Keep
   weights read-only outside Git or in approved build inputs; do not download
   model artifacts on application import, startup or per request.
4. Build a locked isolated Python environment; record the exact supported CPU
   build, detector/tracker dependencies and download sources. GPU/cloud access
   must not become a prerequisite for local/fake development.
5. Verify ffprobe/FFmpeg version and required
   demuxer/decoder/encoder/filter/font features, then test only synthetic media
   within strict local process bounds. Verify process abort/timeout/output caps
   and cleanup before real sample work.
6. Run the rights-approved local Light-ASD feasibility matrix on the pinned
   runtime: one face, wide alternating speakers, listener motion, overlap and
   cuts. Record runtime/memory/quality; issue a local go/no-go for CL-008.
7. If tooling/media/license approval is missing, finish only independently
   testable foundations and retain an unchecked feasibility gate. A fake track
   cannot authorize speaker productionization.
8. CL-015 later repeats the approved benchmark on actual Cloud Run resources.
   Label local numbers local; failed cloud feasibility blocks launch and can
   reopen the implementation/architecture followed by a focused CL-014 re-audit.

Useful read-only binary checks once the approved tools exist:

```powershell
ffmpeg -version
ffprobe -version
python --version
```

Do not assume those tools are installed or on PATH. Root example values such as
`/usr/local/bin/ffmpeg`, `/opt/venv/bin/python` and `/app/models/...` describe
the intended container, not Windows paths. Use only the owning ticket's approved
absolute local overrides for `FFMPEG_PATH`, `FFPROBE_PATH`, `PYTHON_PATH`,
`FONT_DIR`, `ACTIVE_SPEAKER_ENTRYPOINT` and `ACTIVE_SPEAKER_WEIGHTS_PATH`. Never
overwrite other ignored env settings or dump their contents to diagnose PATH.

## Cards, Fonts and Output

CL-009 must choose/pin the actual MathJax/rasterization packages and document
the executable command for its real script/module. It must restrict the TeX
subset, sanitize generated SVG, bound dimensions/output size and prove offline
deterministic cards. Generated-image pricing does not apply to these local
cards. CL-011 must prove licensed font resolution, fixed-caption styling, safe
crop/ asset argument compilation and valid synced MP4 output. Do not install
arbitrary system fonts, introduce remote font fetches in jobs or call a headless
external render service to fill a missing local component.

Record exact font/code/model/weights licenses and distribution conditions for
the specific versions. An upstream project's license alone does not prove that
downloaded weights, sample media, fonts or a selected codec build may be
bundled. No redistribution approval or legal conclusion is inferred from this
inventory.

## Readiness Record and Troubleshooting

- [ ] Owner-approved install/download route and OS/CPU profile recorded.
- [ ] Exact versions/commits/lockfiles/weights hashes and sources recorded.
- [ ] Code, binary build, weights, fonts and fixture rights/licenses reviewed.
- [ ] Approved absolute runtime paths resolve; no startup/model network
      download.
- [ ] Synthetic inspection/process/card/render tests run offline with cleanup.
- [ ] Actual local speaker benchmark provides explicit go/no-go, not fake proof.
- [ ] Focus/preview/render parity and output gates completed in owning tickets.
- [ ] Final Cloud Run CPU/memory/runtime proof still unchecked until CL-015.

If a command is missing, report the binary name and owning ticket, not a guessed
install. If CPU libraries fail, reconcile OS/Python/runtime pins before changing
the model. If weights or fonts fail, check approved local path/hash/license
without printing media or secrets. If resource bounds fail, do not raise them or
rent a GPU silently; record a no-go and obtain an architecture decision.

Each implementation handoff must append the real install/version/hash commands,
expected non-content output, observed status and OS-specific troubleshooting to
this guide or its owning package README. Until then installation is unverified.

## Canonical References

These are the approved upstream starting points already named by the product
plan; re-open the exact version's installation/license documentation at
execution.

- [FFmpeg documentation](https://ffmpeg.org/documentation.html) and
  [license/build guidance](https://ffmpeg.org/legal.html).
- [Light-ASD upstream](https://github.com/Junhua-Liao/Light-ASD).
- [TalkNet upstream](https://github.com/TaoRuijie/TalkNet-ASD), conditional
  comparison only.
- [PySceneDetect documentation](https://www.scenedetect.com/docs/).
- [MathJax server components](https://docs.mathjax.org/en/v4.0/server/components.html).
- [Backend local commands and configuration](../../apps/backend/README.md).
- [Frontend local commands and configuration](../../apps/frontend/README.md).
