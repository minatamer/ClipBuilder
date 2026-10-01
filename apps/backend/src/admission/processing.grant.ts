import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import {
  processingActionSchema,
  sessionIdSchema,
  uuidV4Schema,
} from "@clipbuilder/contracts";
import { z } from "zod";
import { ApplicationError } from "../http/errorMapper.js";

const tokenPart = z.string().regex(/^[A-Za-z0-9_-]+$/u);
export const grantKeysSchema = z
  .record(
    z.string().regex(/^[A-Za-z0-9_-]{1,80}$/u),
    z.string().regex(/^[A-Za-z0-9_-]{43}$/u),
  )
  .refine(
    (keys) => Object.keys(keys).length >= 1 && Object.keys(keys).length <= 4,
  );
const grantSchema = z
  .object({
    version: z.literal(1),
    bootEpoch: uuidV4Schema,
    sessionId: sessionIdSchema,
    issuedAtMs: z.number().int().nonnegative(),
    expiresAtMs: z.number().int().positive(),
    csrf: z.string().length(43),
    nonces: z.record(processingActionSchema, uuidV4Schema),
  })
  .strict();
export type ProcessingGrant = z.infer<typeof grantSchema>;

export function readGrantKeys(
  json: string,
  activeId: string,
): Record<string, string> {
  let keys: Record<string, string>;
  try {
    keys = grantKeysSchema.parse(JSON.parse(json));
  } catch {
    throw new Error("Invalid processing grant key configuration.");
  }
  if (
    !keys[activeId] ||
    Object.values(keys).some(
      (key) =>
        Buffer.from(key, "base64url").length !== 32 ||
        Buffer.from(key, "base64url").toString("base64url") !== key,
    )
  )
    throw new Error("Invalid processing grant key configuration.");
  return keys;
}

export class ProcessingGrantCodec {
  constructor(
    private readonly keys: Readonly<Record<string, string>>,
    private readonly activeId: string,
    readonly bootEpoch: string,
    private readonly now: () => number,
    private readonly ttlMs: number,
  ) {}
  encode(grant: ProcessingGrant): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv(
      "aes-256-gcm",
      Buffer.from(this.keys[this.activeId]!, "base64url"),
      iv,
    );
    cipher.setAAD(Buffer.from(`clipbuilder-grant-v1:${this.activeId}`));
    const body = Buffer.concat([
      cipher.update(JSON.stringify(grantSchema.parse(grant))),
      cipher.final(),
    ]);
    return `${this.activeId}.${iv.toString("base64url")}.${body.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}`;
  }
  decode(token: string): ProcessingGrant {
    try {
      if (token.length > 4096) throw new Error();
      const parts = token.split(".");
      if (
        parts.length !== 4 ||
        parts.some((part) => !tokenPart.safeParse(part).success)
      )
        throw new Error();
      const [keyId, iv, body, tag] = parts;
      const key = this.keys[keyId!];
      if (
        !key ||
        Buffer.from(iv!, "base64url").length !== 12 ||
        Buffer.from(tag!, "base64url").length !== 16
      )
        throw new Error();
      const decipher = createDecipheriv(
        "aes-256-gcm",
        Buffer.from(key, "base64url"),
        Buffer.from(iv!, "base64url"),
      );
      decipher.setAAD(Buffer.from(`clipbuilder-grant-v1:${keyId}`));
      decipher.setAuthTag(Buffer.from(tag!, "base64url"));
      const clear = Buffer.concat([
        decipher.update(Buffer.from(body!, "base64url")),
        decipher.final(),
      ]);
      const grant = grantSchema.parse(JSON.parse(clear.toString("utf8")));
      if (
        grant.bootEpoch !== this.bootEpoch ||
        grant.issuedAtMs > this.now() ||
        grant.expiresAtMs <= this.now() ||
        grant.expiresAtMs - grant.issuedAtMs !== this.ttlMs
      )
        throw new Error();
      return grant;
    } catch {
      throw new ApplicationError({ code: "SESSION_INVALID" });
    }
  }
}

export function equalToken(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.byteLength === b.byteLength && timingSafeEqual(a, b);
}
