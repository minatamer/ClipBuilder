declare global {
  function clipbuilderOwnerPrepare(value: string): void;
  function clipbuilderOwnerPaint(frame: number): Promise<void>;
}
export {};
