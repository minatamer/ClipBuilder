import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { lstat, readdir } from "node:fs/promises";
import { join } from "node:path";
type Row = {
  pid: number;
  parent: number;
  created: string;
  name: string;
  rss: number;
  threads: number;
};
async function processes(): Promise<Row[]> {
  if (process.platform !== "win32" || !process.env.SystemRoot)
    throw new Error("owner_resource_platform_unverified");
  const { stdout } = await promisify(execFile)(
    join(
      process.env.SystemRoot,
      "System32/WindowsPowerShell/v1.0/powershell.exe",
    ),
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "Get-CimInstance Win32_Process | Select-Object @{n='pid';e={$_.ProcessId}},@{n='parent';e={$_.ParentProcessId}},@{n='created';e={$_.CreationDate.ToUniversalTime().ToString('o')}},@{n='name';e={$_.Name}},@{n='rss';e={[double]$_.WorkingSetSize}},@{n='threads';e={$_.ThreadCount}} | ConvertTo-Json -Compress",
    ],
    { windowsHide: true, maxBuffer: 1024 * 1024, timeout: 10_000 },
  );
  const value: unknown = JSON.parse(stdout);
  if (!Array.isArray(value) || value.length > 10000)
    throw new Error("owner_resource_snapshot_invalid");
  return value.map((row: unknown) => {
    if (
      typeof row !== "object" ||
      row === null ||
      !("pid" in row) ||
      typeof row.pid !== "number" ||
      !Number.isSafeInteger(row.pid) ||
      row.pid < 0 ||
      !("parent" in row) ||
      typeof row.parent !== "number" ||
      !Number.isSafeInteger(row.parent) ||
      row.parent < 0 ||
      !("created" in row) ||
      typeof row.created !== "string" ||
      row.created.length < 20 ||
      !("name" in row) ||
      typeof row.name !== "string" ||
      !row.name ||
      !("rss" in row) ||
      typeof row.rss !== "number" ||
      !Number.isFinite(row.rss) ||
      row.rss < 0 ||
      !("threads" in row) ||
      typeof row.threads !== "number" ||
      !Number.isSafeInteger(row.threads) ||
      row.threads < 0
    )
      throw new Error("owner_resource_snapshot_invalid");
    return {
      pid: row.pid,
      parent: row.parent,
      created: row.created,
      name: row.name,
      rss: row.rss,
      threads: row.threads,
    };
  });
}
async function disk(root: string) {
  let logical = 0,
    unique = 0;
  const identities = new Set<string>();
  async function visit(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink())
        throw new Error("owner_resource_link_rejected");
      const file = join(directory, entry.name);
      try {
        const info = await lstat(file, { bigint: true });
        if (info.isSymbolicLink())
          throw new Error("owner_resource_link_rejected");
        if (info.isDirectory()) await visit(file);
        else if (info.isFile()) {
          logical += Number(info.size);
          const key = `${info.dev}:${info.ino}`;
          if (!identities.has(key)) {
            identities.add(key);
            unique += Number(info.size);
          }
        }
      } catch (error) {
        // Atomic native publication/removal can race a read-only sample.
        if (!(
          error instanceof Error &&
          "code" in error &&
          error.code === "ENOENT"
        ))
          throw error;
      }
    }
  }
  await visit(root);
  return { logical, unique };
}

/** Opt-in synthetic harness telemetry: no command lines, environment or media content. */
export async function sampleOwnerResources(root: string) {
  const started = performance.now();
  const observed = new Map<string, Row>();
  const peaks = {
    rssBytes: 0,
    processes: 0,
    threads: 0,
    ffmpegProcesses: 0,
    chromeProcesses: 0,
    logicalDiskBytes: 0,
    uniqueDiskBytes: 0,
  };
  let samples = 0,
    stopped = false,
    timer: ReturnType<typeof setTimeout> | undefined;
  let failed = false;
  async function sample() {
    const all = await processes();
    const owned = all.filter((row) => row.pid === process.pid);
    for (let index = 0; index < owned.length; index++)
      for (const row of all)
        if (
          row.parent === owned[index]!.pid &&
          !owned.some((item) => item.pid === row.pid)
        )
          owned.push(row);
    // Exclude only this sampler's own short-lived PowerShell query from metrics.
    const measured = owned.filter(
      (row) =>
        !["powershell.exe", "conhost.exe"].includes(row.name.toLowerCase()),
    );
    for (const row of measured)
      if (row.pid !== process.pid)
        observed.set(`${row.pid}:${row.created}`, row);
    const bytes = await disk(root);
    peaks.rssBytes = Math.max(
      peaks.rssBytes,
      measured.reduce((sum, row) => sum + row.rss, 0),
    );
    peaks.processes = Math.max(peaks.processes, measured.length);
    peaks.threads = Math.max(
      peaks.threads,
      measured.reduce((sum, row) => sum + row.threads, 0),
    );
    peaks.ffmpegProcesses = Math.max(
      peaks.ffmpegProcesses,
      measured.filter((row) => row.name.toLowerCase() === "ffmpeg.exe").length,
    );
    peaks.chromeProcesses = Math.max(
      peaks.chromeProcesses,
      measured.filter((row) => row.name.toLowerCase() === "chrome.exe").length,
    );
    peaks.logicalDiskBytes = Math.max(peaks.logicalDiskBytes, bytes.logical);
    peaks.uniqueDiskBytes = Math.max(peaks.uniqueDiskBytes, bytes.unique);
    samples++;
  }
  let pending = Promise.resolve();
  function schedule() {
    timer = setTimeout(() => {
      pending = sample()
        .catch(() => {
          failed = true;
        })
        .finally(() => {
          if (!stopped) schedule();
        });
    }, 500);
  }
  await sample();
  schedule();
  return {
    async finish() {
      stopped = true;
      clearTimeout(timer);
      await pending;
      if (failed) throw new Error("owner_resource_sample_failed");
      const current = await processes();
      const survivors = current.filter((row) =>
        observed.has(`${row.pid}:${row.created}`),
      );
      return {
        wallMs: Math.round(performance.now() - started),
        samples,
        peaks,
        observedChildren: observed.size,
        survivors: survivors.length,
      };
    },
  };
}
