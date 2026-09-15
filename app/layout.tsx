import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "../styles/globals.css";

const manrope = Manrope({
  subsets: ["latin", "greek"],
  variable: "--font-manrope"
});

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "VouliMatch",
  description: "Μάθε με ποιο κόμμα ταιριάζεις περισσότερο βάσει ψηφοφοριών.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VouliMatch",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el">
      <body className={`${manrope.variable} min-h-screen bg-slate-50 text-slate-900`}>{children}</body>
    </html>
  );
}
