import {
  ownerVideoLookMatrix,
  type OwnerVideoLook,
} from "../../../packages/contracts/owner/video-look.ts";

/** Only validated fixed RGB coefficients enter the native graph, before overlays. */
export function ownerVideoLookFilter(look?: OwnerVideoLook): string {
  const matrix = ownerVideoLookMatrix(look);
  if (!look || look.preset === "original" || look.strength === 0) return "null";
  const channels = ["rr", "rg", "rb", "gr", "gg", "gb", "br", "bg", "bb"];
  return `format=gbrp,colorchannelmixer=${channels.map((key, index) => `${key}=${matrix[index]}`).join(":")}`;
}
