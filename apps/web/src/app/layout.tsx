import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RealTime Chat API - Pricing",
  description: "Scalable real-time chat API with usage-based pricing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
