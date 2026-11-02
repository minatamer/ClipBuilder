# CL-191 — Inspect Downloads storage and remove expired recovery

Status: Completed, 2026-11-02. Separate owner-authorized housekeeping; does not
authorize implementation of CL-184–190, CL-192 or CL-193.

## Owner request and scope

Inspect the ClipBuilder folder in Downloads and clean up obsolete backups before
future long-video testing. Preserve useful saved work and retained media. The
actual folder is `Downloads/ClipBuilder`, not a second directory with a space.
No private media names, transcript content or identifiers belong in this packet.

## Findings and action

- The library contained two explicitly saved projects, three saved source
  videos, five published exports, and the separate `.recovery` rolling store.
- The recovery store held 24 files totaling 66,053,340 bytes, approximately 63.0
  MiB. Both its current and previous snapshot were about 40 hours old, beyond
  the existing two-hour recovery expiry. This store is separate from owner-saved
  projects, sources and exports.
- Verified no running repository app/native processing and no 3000/4000/4200
  listeners before cleanup. No application was stopped, started or reconfigured.
- Verified the resolved absolute cleanup target was exactly the library's
  `.recovery` directory. Inspected its ancestors and descendants for reparse
  points; none were present. Rechecked expiry and absence of active processing
  immediately before mutation.
- Moved only that expired store to the Windows Recycle Bin, preserving a
  reversible recovery path. Its 63.0 MiB is removed from the library; this does
  not claim the disk space is reclaimed before the Recycle Bin is emptied.
- Kept both saved projects, all three sources and all five exports. Their 20
  files total 115,502,566 bytes, approximately 110.2 MiB. Verified the same
  paths, counts, lengths and SHA-256 hashes before/after cleanup, without
  printing private filenames or hashes. No retained repository master or private
  log was touched. Age alone is not permission to delete saved work.

## Verification and deviations

Read-only structural/size inventory and bounded JSON metadata inspection
identified categories and recovery expiry without printing media content. Native
process/port queries initially lacked sandbox CIM access; the read-only query
and narrow Recycle Bin operation then passed explicit tool escalation. No
automatic approval rejection occurred. Cleanup target absence and all 20
protected file identities/lengths/hashes passed after the operation.

This is filesystem housekeeping, with no application code or fake/live
processing run. No unit suite is needed for an external expired-folder removal.
The remaining library is intentionally preserved, not classified as trash.

## Capability and authorization boundary

No keys, model runtime, Codex allowance, Gemini, downloader or renderer call was
used. Fake mode is not needed for read-only inventory or Recycle Bin cleanup.
Future fake app checks remain no-key/paid-off; real Codex needs prepared local
speech assets, saved ChatGPT login/allowance and local gates. Gemini needs its
key/live approvals but is excluded from this owner's development/testing run. No
ignored configuration read/edit, cloud, deployment or Git mutation occurred.
