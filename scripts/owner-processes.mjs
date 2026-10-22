import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";

/** Content-free Windows identities; no command lines or account identifiers. */
export async function ownerProcessTree(rootPid) {
  if (process.platform !== "win32")
    throw new Error("owner_native_platform_unverified");
  const { stdout } = await promisify(execFile)(
    join(
      process.env.SystemRoot,
      "System32/WindowsPowerShell/v1.0/powershell.exe",
    ),
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "Get-CimInstance Win32_Process | Select-Object @{n='pid';e={$_.ProcessId}},@{n='parent';e={$_.ParentProcessId}},@{n='created';e={$_.CreationDate.ToUniversalTime().ToString('o')}} | ConvertTo-Json -Compress",
    ],
    { windowsHide: true, maxBuffer: 1024 * 1024 },
  );
  const all = JSON.parse(stdout);
  const found = all.filter((row) => row.pid === rootPid);
  for (let index = 0; index < found.length; index++)
    for (const row of all)
      if (
        row.parent === found[index].pid &&
        !found.some((item) => item.pid === row.pid)
      )
        found.push(row);
  return found;
}

export async function forceOwnerTree(child, identity) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const tree = await ownerProcessTree(child.pid);
  if (
    !tree.some(
      (row) => row.pid === identity.pid && row.created === identity.created,
    )
  )
    throw new Error("owner_process_identity_changed");
  await promisify(execFile)(
    "taskkill.exe",
    ["/PID", String(child.pid), "/T", "/F"],
    { windowsHide: true },
  );
}
