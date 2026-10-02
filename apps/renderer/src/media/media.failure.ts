export type MediaFailureCode =
  | "invalid"
  | "unauthorized"
  | "busy"
  | "expired"
  | "conflict"
  | "budget"
  | "canceled"
  | "cleanup_pending"
  | "media_failed";
export class MediaFailure extends Error {
  constructor(readonly code: MediaFailureCode) {
    super(code);
  }
}
