import type {
  OwnerAcquisitionMode,
  OwnerYoutubeChoice,
  OwnerYoutubeOffer,
  OwnerYoutubeSelection,
} from "../../../packages/contracts/owner/acquisition.ts";

export type OwnerLinkedIdentity = {
  videoId: string;
  sourceId: string;
  canonicalUrl: string;
};
export type AcquisitionTransferProgress = {
  stage: "video" | "audio";
  downloadedBytes: number;
  totalBytes: number | null;
};
export type OwnerAcquisitionPort = {
  mode: OwnerAcquisitionMode;
  metadata(
    identity: OwnerLinkedIdentity,
    signal: AbortSignal,
  ): Promise<OwnerYoutubeOffer>;
  download(
    input: {
      identity: OwnerLinkedIdentity;
      offer: OwnerYoutubeOffer;
      choice: OwnerYoutubeChoice;
      selection: OwnerYoutubeSelection;
      directory: string;
    },
    progress: (value: AcquisitionTransferProgress) => void,
    signal: AbortSignal,
  ): Promise<void>;
};
