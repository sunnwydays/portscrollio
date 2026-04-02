import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { MobileHeader } from "@/components/sidebar/MobileHeader";
import { MobileNav } from "@/components/sidebar/MobileNav";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sunny — Portfolio",
  description: "UofT Computer Engineering. Builder of robots, kernels, and things that shouldn't work.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body className="bg-surface text-on-surface font-body">
        <Sidebar />
        <MobileHeader />
        <main className="lg:ml-70">{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
