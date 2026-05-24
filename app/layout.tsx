import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fitaru Admin CMS",
  description: "Dashboard web admin untuk mengelola aplikasi Fitaru.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
