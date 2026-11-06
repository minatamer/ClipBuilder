/** Narrow documented native API; this module loads only in the owned child. */
declare module "sherpa-onnx-node" {
  interface Stream {
    acceptWaveform(value: { sampleRate: number; samples: Float32Array }): void;
    inputFinished(): void;
  }
  class SpeakerEmbeddingExtractor {
    constructor(config: {
      model: string;
      numThreads: number;
      provider: "cpu";
      debug: boolean;
    });
    createStream(): Stream;
    isReady(stream: Stream): boolean;
    compute(stream: Stream, externalBuffer: boolean): Float32Array;
  }
  const native: {
    SpeakerEmbeddingExtractor: typeof SpeakerEmbeddingExtractor;
    readWave(path: string): { sampleRate: number; samples: Float32Array };
  };
  export default native;
}
