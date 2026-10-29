import { z } from "zod";

/** A closed illustration vocabulary, never model-authored markup or asset URLs. */
export const ownerIllustrationSchema = z
  .object({
    layout: z.enum(["concept", "process", "comparison"]),
    heading: z.string().min(1).max(60),
    items: z
      .array(
        z
          .object({
            label: z.string().min(1).max(40),
            icon: z.enum([
              "person",
              "globe",
              "idea",
              "computer",
              "chart",
              "clock",
              "box",
              "check",
              "leaf",
            ]),
          })
          .strict(),
      )
      .min(1)
      .max(4),
  })
  .strict();
export type OwnerIllustration = z.infer<typeof ownerIllustrationSchema>;
