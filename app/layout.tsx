import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Legal Case SaaS — RLS Multi-Tenant Sandbox",
  description: "A Zero-Trust multi-tenant legal dashboard demonstrating PostgreSQL Row Level Security (RLS) policies.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=1", type: "image/x-icon" },
      { url: "/favicon.png?v=1", type: "image/png" },
      { url: "/favicon.svg?v=1", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=1" />
        <link rel="icon" type="image/png" href="/favicon.png?v=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=1" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
