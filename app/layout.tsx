import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { MobileHeader } from "@/components/sidebar/MobileHeader";
import { MobileNav } from "@/components/sidebar/MobileNav";
import { supabase } from "@/lib/supabase";
import { getLatestCommit } from "@/lib/github";
import { getAvatarCategories } from "@/lib/avatars";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/autoronto_computer.jpg",
        alt: "Sunny working on the aUToronto self-driving car project",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/autoronto_computer.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [{ data: statsRows }, { data: settingsRows }, { data: postsRows }] = await Promise.all([
    supabase.from("stats").select("*").order("display_order"),
    supabase.from("settings").select("key, value"),
    supabase.from("posts").select("id, slug"),
  ]);

  const stats = statsRows ?? [];
  const settings: Record<string, string> = Object.fromEntries(
    (settingsRows ?? []).map(({ key, value }: { key: string; value: string }) => [key, value])
  );

  const username = settings.github_url?.split("github.com/")[1]?.split("/")[0];
  const latestCommit = username ? await getLatestCommit(username) : null;
  if (latestCommit) settings.latest_commit = latestCommit;

  const avatarCategories = getAvatarCategories();
  const postSlugs = (postsRows ?? []).map(
    (p: { id: string; slug?: string | null }) => p.slug ?? p.id
  ).filter(Boolean) as string[];

  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body className="bg-surface text-on-surface font-body">
        <Sidebar settings={settings} stats={stats} avatarCategories={avatarCategories} postSlugs={postSlugs} />
        <MobileHeader settings={settings} stats={stats} avatarCategories={avatarCategories} postSlugs={postSlugs} />
        <main className="lg:ml-70">{children}</main>
        <MobileNav />
        <Analytics />
      </body>
    </html>
  );
}
