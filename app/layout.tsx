import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { MobileHeader } from "@/components/sidebar/MobileHeader";
import { MobileNav } from "@/components/sidebar/MobileNav";
import { supabase } from "@/lib/supabase";
import { getLatestCommit } from "@/lib/github";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SUNNY'S PORTSCROLLIO",
  description: "UofT Computer Engineering. Learning, optimizing, and building things for a change.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [{ data: statsRows }, { data: settingsRows }] = await Promise.all([
    supabase.from("stats").select("*").order("display_order"),
    supabase.from("settings").select("key, value"),
  ]);

  const stats = statsRows ?? [];
  const settings: Record<string, string> = Object.fromEntries(
    (settingsRows ?? []).map(({ key, value }: { key: string; value: string }) => [key, value])
  );

  const username = settings.github_url?.split("github.com/")[1]?.split("/")[0];
  const latestCommit = username ? await getLatestCommit(username) : null;
  if (latestCommit) settings.latest_commit = latestCommit;

  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body className="bg-surface text-on-surface font-body">
        <Sidebar settings={settings} stats={stats} />
        <MobileHeader settings={settings} stats={stats} />
        <main className="lg:ml-70">{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
