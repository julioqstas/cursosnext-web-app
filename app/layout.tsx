import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ISIMOVA Academy",
  description: "Plataforma de aprendizaje en línea — ISIMOVA Academy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body suppressHydrationWarning className={`${inter.variable} antialiased bg-surface text-on-surface font-sans`}>
        {children}
      </body>
    </html>
  );
}
