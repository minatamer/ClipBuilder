import { z } from "zod";
import { ownerDigestSchema } from "./assets.ts";
import {
  ownerAcquisitionModeSchema,
  ownerSavedSourceVariantSchema,
  ownerYoutubeImportRequestSchema,
  ownerYoutubeLinkRequestSchema,
  OWNER_ACQUISITION_LIMITS,
} from "./acquisition.ts";
import { ownerIdSchema } from "./policy.ts";

export const ownerSourceDestinationSchema = z.enum(["downloads", "desktop"]);
export type OwnerSourceDestination = z.infer<
  typeof ownerSourceDestinationSchema
>;
export const ownerSavedSourceEntrySchema = z
  .object({
    destination: ownerSourceDestinationSchema,
    variant: ownerSavedSourceVariantSchema,
  })
  .strict();
export type OwnerSavedSourceEntry = z.infer<typeof ownerSavedSourceEntrySchema>;
export const ownerSourceCatalogSchema = z
  .object({
    entries: z
      .array(ownerSavedSourceEntrySchema)
      .max(OWNER_ACQUISITION_LIMITS.catalogRecords * 2),
    bytes: z.number().int().nonnegative(),
    warning: z.boolean(),
    destinations: z.array(ownerSourceDestinationSchema).max(2),
  })
  .strict();
export type OwnerSourceCatalog = z.infer<typeof ownerSourceCatalogSchema>;
export const ownerSourceLookupSchema = z
  .object({
    sourceId: ownerDigestSchema,
    mode: ownerAcquisitionModeSchema.nullable(),
    metadataAvailable: z.boolean(),
    saved: z
      .array(ownerSavedSourceEntrySchema)
      .max(OWNER_ACQUISITION_LIMITS.catalogRecords * 2),
  })
  .strict();
export const ownerSourceMetadataRequestSchema = ownerYoutubeLinkRequestSchema
  .extend({ rightsAcknowledged: z.literal(true) })
  .strict();
export const ownerSourceImportSchema = z
  .object({
    request: ownerYoutubeImportRequestSchema,
    destination: ownerSourceDestinationSchema,
  })
  .strict();
export const ownerSourceOpenSchema = z
  .object({
    destination: ownerSourceDestinationSchema,
    variantId: ownerIdSchema,
  })
  .strict();
