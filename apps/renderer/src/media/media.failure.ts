import type {
  RendererFailureCode,
  RendererFailureStage,
} from "@clipbuilder/contracts";
export type MediaFailureCode = RendererFailureCode;
export class MediaFailure extends Error {
  constructor(
    readonly code: MediaFailureCode,
    readonly stage?: RendererFailureStage,
    readonly underlyingCode?: MediaFailureCode,
  ) {
    super(code);
  }
}
