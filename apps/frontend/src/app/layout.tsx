import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ClipBuilder",
  description:
    "Turn long owned or licensed conversations into grounded vertical clips.",
};

type RootLayoutProperties = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProperties) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
