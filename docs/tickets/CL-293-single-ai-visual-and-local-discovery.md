# CL-293 — One AI visual per clip and local-only discovery

Status: planning record adopted by CL-294, 2026-11-12. The owner subsequently
requests sequential execution/validation of all listed tasks. CL-294 owns the
implementation and evidence; preserve this original scope record. No provider
or Git action is authorized by this planning packet.

## Owner request

- Cap automatic AI-added visuals at one picture or video per clip, whether
  generated or fetched, in both normal local and deployed processing.
- Keep the Find visuals CTA local-only. Hosted must not expose or permit this
  manual discovery action through a hidden route.
- Preserve manual uploads, manual editing, saved media and all security/spend
  boundaries. The automatic cap is not a one-media limit on manual editing.

## Implementation acceptance, when authorized

Audit both Codex and Gemini planning/acquisition/assembly paths, initial creation
and explicit rediscovery. Count generated and fetched media toward one shared
automatic budget; do not run separate one-item budgets for each kind. Keep the
effective automatic result to one visual per clip, including repeated discovery,
without deleting manual additions or unrelated existing saved assets. Define
Hook/body representation carefully so copying one visual into a repeated Hook
does not unintentionally acquire another asset. Preserve usable provider-output
acceptance and explicit retries; no automatic provider retries or new quality
rejection gate.

Gate local discovery in both UI capabilities and the server. Hosted upload,
normal automatic processing, manual media controls and other editing remain
available. Verify with fake/no-key transports and exact call counts: oversized
provider proposals, generated/retrieved alternatives, repeated discovery,
manual media coexistence, saved-state reopen, hosted hidden CTA and denied
discovery dispatch. No real provider quality acceptance is claimed by fixtures.

## Export-resolution observation

Read-only ffprobe inspection of the owner's designated downloaded MP4 reports
608 by 1080 pixels, H.264, roughly 23.976 fps and 32.28 seconds. Current export
profile preserves the landscape source height, deriving portrait width from it;
a 1080-high source therefore yields 608 by 1080 rather than 1080 by 1920.
This establishes that the upload is below a full-HD portrait canvas. The TikTok
540P badge's exact platform classification/transcoding rule is not established
by the local probe. No export-profile change or upscale was requested or made.
Keep the real filename/media outside repository documentation and fixtures.
