import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobCompass",
  description:
    "Find relevant jobs in Australia across trusted local platforms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}