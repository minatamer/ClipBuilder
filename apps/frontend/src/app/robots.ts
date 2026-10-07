import type { MetadataRoute } from "next";
import { controlEnvironment } from "../server/control-api";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(controlEnvironment() === "production"
        ? { allow: "/", disallow: ["/start", "/api/"] }
        : { disallow: "/" }),
    },
  };
}
