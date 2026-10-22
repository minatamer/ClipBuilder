type ProcessIdentity = { pid: number; parent: number; created: string };
/** Explicit fixture ports are rejected outside pre-import fake/paid-off test mode. */
type OwnerDiscoveryTestOptions = {
  temporaryRoot: string;
  probe: (supervisor: number) => Promise<ProcessIdentity[]>;
  now: () => number;
};
export function discoverOwnerHost(
  options?: OwnerDiscoveryTestOptions,
): Promise<{ token: string; runtime: string }>;
export function publishOwnerDiscovery(
  runtime: string,
  options?: OwnerDiscoveryTestOptions,
): Promise<void>;
export function clearOwnerDiscovery(
  runtime: string,
  options?: OwnerDiscoveryTestOptions,
): Promise<void>;
