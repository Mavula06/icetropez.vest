import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SupportChat from "@/components/support-chat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Icetropez.Vest",
  description: "Smart investing and wealth growth with Icetropez.Vest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <div className="app-background">
          <div className="background-overlay" />

          <div className="background-glow background-glow-one" />
          <div className="background-glow background-glow-two" />

          <div className="app-content">
            {children}
          </div>

          <SupportChat />
        </div>
      </body>
    </html>
  );
}