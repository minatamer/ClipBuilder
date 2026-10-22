import type { OwnerOverlay } from "../../../packages/contracts/owner/clips.ts";

declare global {
  function clipbuilderOwnerPrepare(value: {
    overlay: OwnerOverlay;
    assets: Record<string, string>;
  }): void;
  function clipbuilderOwnerPaint(frame: number): Promise<void>;
}
export {};
