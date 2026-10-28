import { isIP } from "node:net";

/** Requires the documented Google LB ingress chain; never trust its supplied prefix. */
export function hostedDemoClientIp(headers: Headers, verified: boolean) {
  const forwarded = headers.get("x-forwarded-for");
  if (!verified || !forwarded || forwarded.length > 4096)
    throw new Error("demo_identity_unavailable");
  const chain = forwarded.split(",").map((part) => part.trim());
  const client = chain.at(-2),
    proxy = chain.at(-1);
  if (!client || !proxy || !isIP(client) || !isIP(proxy))
    throw new Error("demo_identity_unavailable");
  return client;
}
