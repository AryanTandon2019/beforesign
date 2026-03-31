import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "BeforeSign — AI Contract Analysis",
  description: "Upload any contract. See where you're getting screwed. AI analyzes every clause in 30 seconds.",
};

import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
      </head>
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans bg-white text-black antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
