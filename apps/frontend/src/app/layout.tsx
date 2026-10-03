import type { Metadata } from "next";
import type { ReactNode } from "react";
import { connection } from "next/server";
import "../styles/tokens.css";

export const metadata: Metadata = {
  title: "ClipBuilder — Grounded AI-assisted clipping",
  description:
    "Find grounded moments in owned conversations and keep control of the final vertical edit.",
};

type RootLayoutProperties = Readonly<{
  children: ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProperties) {
  await connection();
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
