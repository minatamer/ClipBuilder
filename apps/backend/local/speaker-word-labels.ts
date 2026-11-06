import {
  ownerWordsSchema,
  type OwnerWord,
} from "../../../packages/contracts/local/selection.ts";

/** Speaker enrichment may change labels only, never admitted words, IDs or clocks. */
export function retainSpeakerLabels(
  value: unknown,
  original: readonly OwnerWord[],
): OwnerWord[] {
  const labeled = ownerWordsSchema.parse(value);
  if (
    labeled.length !== original.length ||
    labeled.some(
      (word, index) =>
        JSON.stringify({ ...word, speakerId: null }) !==
        JSON.stringify({ ...original[index]!, speakerId: null }),
    )
  )
    throw Error("codex_input_invalid");
  return labeled;
}
