/** Transient navigation only; never serialized as an edit. */
export type EditorCameraRequest = {
  key: string;
  id: string;
  targetId: string;
  tab: "zoom" | "pan" | "motion";
};
