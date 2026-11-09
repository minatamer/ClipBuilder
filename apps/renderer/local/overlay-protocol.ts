declare global {
  function clipbuilderOwnerPrepare(value: string): void;
  function clipbuilderOwnerPaint(
    frame: number,
    assets?: Record<string, string>,
  ): Promise<void>;
}
export {};
