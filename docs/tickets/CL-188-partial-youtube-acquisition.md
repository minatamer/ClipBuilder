# CL-188 — Download only the requested YouTube section

Status: Authorized and queued, 2026-11-02. Owner AFK authorization lifts the
previous execution hold; use execute/validate/fix loops and local
ticket-prefixed commits without push. Depends on CL-185–187 and the existing
local downloader.

## Owner request

Allow a YouTube URL plus start/end timestamps so an owner can acquire and
analyze only the relevant part of a long video. This must reduce acquisition
scope when the offered media supports it, rather than download everything and
merely hide the rest. Entire video remains available. No hosted YouTube intake
is added.

## Proposed implementation packet

- Reuse CL-186's one-window fields in the existing resolution/download stage.
  Bind the admitted source identity, chosen formats/audio, offered revision and
  original start/end to the explicit Download action. Changing any of them
  invalidates stale offers/operations rather than downloading the wrong section.
- Investigate the pinned installed yt-dlp/FFmpeg partial-download path and prove
  it fits current egress controls. Upstream yt-dlp documents
  `--download-sections` with `*start-end` and requires FFmpeg; this establishes
  feasibility, not proof that our pinned downloader or network policy already
  supports it.
- Construct allowlisted native argument arrays from validated values. Any FFmpeg
  HTTP access must retain the existing isolated downloader boundary, checked
  hosts/DNS/redirects and cancellation; do not open arbitrary worker network
  access or pass shell/user-supplied downloader arguments.
- Preserve the highest selected master quality without an unnecessary lossy
  re-encode. Stream-copy cuts can start at earlier keyframes; retain only needed
  padding and record the measured original offset/usable interval. Analysis,
  playback and export honor the requested exact window. If accurate independent
  section files require re-encoding, document that tradeoff explicitly rather
  than silently trading source quality for exact cuts.
- Do not promise byte-perfect network savings: formats/fragments and keyframe
  alignment can require nearby bytes. If section acquisition is unsupported,
  show an actionable failure/explicit whole-video alternative; never silently
  fetch the full two-hour source. Retries remain explicit.
- Bind saved-source/catalog identities to video, formats, quality, original
  interval and measured offset. A verified full master can satisfy a section
  offline without another download; disjoint/partial masters cannot pretend to
  cover it. Preserve old full-source records and all retained owner files.
- Display truthful measured transfer/preparation states and keep cancel/footer
  geometry. Cleanup removes only owned interrupted temporary downloads, never an
  existing saved master, recovery asset or export.

## File allocation and verification plan

Contracts: acquisition/import/catalog interval metadata. Backend: existing
YouTube offer/identity/acquisition orchestration and egress/process adapters.
Native: section inspection/remux and original clock mapping. Frontend: existing
acquisition card and offline reuse. Docs: downloader guide, source of truth,
packet and index. Keep upload analysis-window behavior owned by CL-186.

Fake/paid-off/offline tests cover a twenty-minute section of two-hour metadata,
argument construction, exact fake request counts, keyframe padding, measured
offsets, stale offers, unsupported section transport, saved full/partial reuse,
cancel/failure/retry and orphan cleanup. A loopback synthetic media server plus
current-source binaries must demonstrate actual range/section requests and a
decodable synchronized result; route all test traffic to loopback. Verify the
export uses only the requested interval and hosted rejects every forged path
before download dispatch. Browser phone/desktop states, types/lint and validate.

## Research and capability boundary

[yt-dlp section options](https://github.com/yt-dlp/yt-dlp/blob/master/README.md)
document partial downloads; its
[cutting FAQ](https://github.com/yt-dlp/yt-dlp/wiki/FAQ#downloading-clips-and-cutting-out-sponsor-sections-is-inaccurate)
explains re-encoding/accuracy costs. The chosen padded-master approach is a
proposed engineering solution requiring the synthetic native proof. Fake mode
needs no provider keys and cannot prove real YouTube availability. Actual
acquisition uses prepared local tools/network and an accessible permitted
source, independently of AI credentials. Subsequent Codex needs local speech
assets/login/allowance; Gemini requires its key/live approvals. No real URL,
download, rights acceptance, inference, installation, restart, config, cloud,
deployment or Git action is authorized by this planning packet.
