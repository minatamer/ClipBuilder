export type StopEffect = () => void;

export class SessionEffectRegistry {
  readonly #objectUrls = new Set<string>();
  readonly #stoppers = new Set<StopEffect>();

  registerObjectUrl(url: string): StopEffect {
    this.#objectUrls.add(url);
    return () => this.revokeObjectUrl(url);
  }

  registerStopper(stop: StopEffect): StopEffect {
    this.#stoppers.add(stop);
    return () => this.#stoppers.delete(stop);
  }

  revokeObjectUrl(url: string): void {
    if (this.#objectUrls.delete(url)) {
      URL.revokeObjectURL(url);
    }
  }

  clear(): void {
    for (const stop of this.#stoppers) stop();
    this.#stoppers.clear();
    for (const url of this.#objectUrls) URL.revokeObjectURL(url);
    this.#objectUrls.clear();
  }

  get ownedEffectCount(): number {
    return this.#objectUrls.size + this.#stoppers.size;
  }
}
