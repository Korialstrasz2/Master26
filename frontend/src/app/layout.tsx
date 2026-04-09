import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Master26 Frontend",
  description: "Frontend Next.js + shadcn/ui + Tailwind per backend Django",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
