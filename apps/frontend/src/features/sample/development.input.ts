import { PUBLIC_LIMITS } from "@clipbuilder/contracts";
import type { LocalSourceSummary } from "../session/session.types";

// Only declared metadata is used; this is not real local media inspection.
export function developmentInput(
  file?: Pick<File, "size" | "type">,
): LocalSourceSummary {
  const declaredBytes = file?.size ?? 8 * 1024 * 1024;
  const reason =
    file !== undefined && file.type !== "video/mp4"
      ? "type"
      : !Number.isSafeInteger(declaredBytes) ||
          declaredBytes <= 0 ||
          declaredBytes > PUBLIC_LIMITS.maxSourceBytes
        ? "size"
        : null;
  return {
    sourceId: "development-input",
    declaredBytes,
    contentType: "video/mp4",
    validation:
      reason === null
        ? { status: "accepted" }
        : { status: "rejected", reasonCode: reason },
  };
}
