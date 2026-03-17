import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LINCE // Data Matrix Control Center",
  description: "Futuristic analytics dashboard for Lince Performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
