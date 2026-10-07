export type StopEffect = () => void;
export type EffectCleanupFailure = "stopper" | "object-url";

export class SessionEffectRegistry {
  readonly #objectUrls = new Set<string>();
  readonly #stoppers = new Set<StopEffect>();

  constructor(
    private readonly reportFailure: (
      resource: EffectCleanupFailure,
    ) => void = () => {},
  ) {}

  private release(resource: EffectCleanupFailure, stop: StopEffect): void {
    try {
      stop();
    } catch {
      try {
        this.reportFailure(resource);
      } catch {
        // Reporting cannot prevent the remaining owned resources from draining.
      }
    }
  }

  registerObjectUrl(url: string): StopEffect {
    this.#objectUrls.add(url);
    return () => this.revokeObjectUrl(url);
  }

  registerStopper(stop: StopEffect): StopEffect {
    this.#stoppers.add(stop);
    return () => {
      if (this.#stoppers.delete(stop)) this.release("stopper", stop);
    };
  }

  revokeObjectUrl(url: string): void {
    if (this.#objectUrls.delete(url)) {
      this.release("object-url", () => URL.revokeObjectURL(url));
    }
  }

  clear(): void {
    const stoppers = [...this.#stoppers];
    const urls = [...this.#objectUrls];
    // Relinquish this snapshot before invoking callbacks that may re-enter cleanup.
    this.#stoppers.clear();
    this.#objectUrls.clear();
    for (const stop of stoppers) this.release("stopper", stop);
    for (const url of urls)
      this.release("object-url", () => URL.revokeObjectURL(url));
  }

  get ownedEffectCount(): number {
    return this.#objectUrls.size + this.#stoppers.size;
  }
}
