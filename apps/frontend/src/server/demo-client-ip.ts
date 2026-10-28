import { isIP } from "node:net";

/** Verified native Cloud Run ingress appends its observed client IP last. */
export function hostedDemoClientIp(headers: Headers, verified: boolean) {
  const forwarded = headers.get("x-forwarded-for");
  if (!verified || !forwarded || forwarded.length > 4096)
    throw new Error("demo_identity_unavailable");
  const chain = forwarded.split(",").map((part) => part.trim());
  const client = chain.at(-1);
  if (!client || !isIP(client)) throw new Error("demo_identity_unavailable");
  return client;
}
