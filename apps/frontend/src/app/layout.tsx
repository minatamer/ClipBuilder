import type { Metadata } from "next";
import type { ReactNode } from "react";
import { connection } from "next/server";
import "../styles/tokens.css";
import {
  OwnerCaptionFontFace,
  OWNER_CAPTION_FONT_URL,
} from "../../../../packages/composition/local/caption-font.tsx";

export const metadata: Metadata = {
  title: "ClipBuilder — Grounded AI-assisted clipping",
  description:
    "Find grounded moments in owned conversations and keep control of the final vertical edit.",
  icons: { icon: { url: "/favicon.png", type: "image/png", sizes: "96x96" } },
};

type RootLayoutProperties = Readonly<{
  children: ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProperties) {
  await connection();
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href={OWNER_CAPTION_FONT_URL}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <OwnerCaptionFontFace />
      </head>
      <body>{children}</body>
    </html>
  );
}
