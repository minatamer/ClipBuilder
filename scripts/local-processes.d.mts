import type { ChildProcess } from "node:child_process";
export type LocalProcessIdentity = {
  pid: number;
  parent: number;
  created: string;
};
export function ownerProcessTree(
  rootPid: number | undefined,
): Promise<LocalProcessIdentity[]>;
export function forceOwnerTree(
  child: ChildProcess,
  identity: LocalProcessIdentity | undefined,
): Promise<void>;
