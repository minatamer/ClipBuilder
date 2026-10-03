import { MediaFailure } from "../src/media/media.failure.js";
import type {
  TemporaryIntent,
  IntentRecord,
  TemporaryMediaStore,
} from "../src/expiry/temporary-intent.js";
import type { ArtifactReference } from "@clipbuilder/contracts";
import type { Writable } from "node:stream";
export class MemoryMediaStore implements TemporaryMediaStore {
  withSignal<T>(signal: AbortSignal, work: () => Promise<T>) {
    signal.throwIfAborted();
    return work();
  }
  readonly intents = new Map<string, IntentRecord>();
  readonly objects = new Map<
    string,
    {
      artifactId: string;
      generation: string;
      bytes: number;
      expiresAtMs?: number;
    }[]
  >();
  readonly calls = { begin: 0, cancel: 0, delete: 0, download: 0, upload: 0 };
  failDelete = false;
  private sequence = 1;
  async assertDisposable() {}
  async expiredArtifacts(nowMs: number) {
    return [...this.objects].flatMap(([sessionId, objects]) =>
      objects
        .filter((o) => o.expiresAtMs !== undefined && o.expiresAtMs <= nowMs)
        .map((o) => ({
          sessionId,
          artifactId: o.artifactId,
          generation: o.generation,
        })),
    );
  }
  async listIntents() {
    return structuredClone([...this.intents.values()]);
  }
  async getIntent(id: string) {
    return structuredClone(this.intents.get(id) ?? null);
  }
  async saveIntent(intent: TemporaryIntent, generation: string) {
    const previous = this.intents.get(intent.binding.sessionId);
    if ((previous?.generation ?? "0") !== generation)
      throw new MediaFailure("conflict");
    const record = {
      intent: structuredClone(intent),
      generation: String(this.sequence++),
    };
    this.intents.set(intent.binding.sessionId, record);
    return structuredClone(record);
  }
  async deleteIntent(id: string, generation: string) {
    if (this.intents.get(id)?.generation !== generation)
      throw new MediaFailure("conflict");
    this.intents.delete(id);
  }
  async beginUpload(_intent: TemporaryIntent) {
    void _intent;
    this.calls.begin++;
    return "https://storage.googleapis.com/upload/storage/v1/b/synthetic/o?upload_id=synthetic";
  }
  async cancelUpload(_url: string) {
    void _url;
    this.calls.cancel++;
  }
  async listArtifacts(id: string) {
    return structuredClone(this.objects.get(id) ?? []);
  }
  async deleteArtifact(id: string, artifactId: string, generation: string) {
    this.calls.delete++;
    if (this.failDelete) throw new MediaFailure("cleanup_pending");
    this.objects.set(
      id,
      (this.objects.get(id) ?? []).filter(
        (o) => !(o.artifactId === artifactId && o.generation === generation),
      ),
    );
  }
  async artifactMetadata(id: string, artifactId: string, generation: string) {
    const item = this.objects
      .get(id)
      ?.find((o) => o.artifactId === artifactId && o.generation === generation);
    if (!item) throw new MediaFailure("invalid");
    return { bytes: item.bytes, contentType: "video/mp4" };
  }
  async download(
    _id: string,
    _artifact: string,
    _generation: string,
    _path: string,
    _signal: AbortSignal,
  ) {
    void [_id, _artifact, _generation, _path, _signal];
    this.calls.download++;
  }
  async stream(
    id: string,
    artifactId: string,
    generation: string,
    range: { start: number; end: number },
    destination: Writable,
    signal: AbortSignal,
  ) {
    signal.throwIfAborted();
    await this.artifactMetadata(id, artifactId, generation);
    destination.end(Buffer.alloc(range.end - range.start + 1));
  }
  async upload(
    id: string,
    artifactId: string,
    _path: string,
    _expiry: number,
    _signal: AbortSignal,
  ): Promise<ArtifactReference> {
    void [_path, _expiry, _signal];
    this.calls.upload++;
    const item = {
      artifactId,
      generation: String(this.sequence++),
      bytes: 1024,
    };
    this.objects.set(id, [...(this.objects.get(id) ?? []), item]);
    return { ...item, checksum: "b".repeat(64) };
  }
}
