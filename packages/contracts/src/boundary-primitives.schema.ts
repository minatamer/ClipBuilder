import { z } from "zod";

export const offsetDateTimeSchema = z.string().datetime({ offset: true });

export const turnstileTokenSchema = z.string().min(1).max(2_048);
