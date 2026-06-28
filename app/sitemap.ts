import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: posts } = await supabase
    .from("posts")
    .select("slug, id, published_at")
    .order("published_at", { ascending: false });

  const postEntries: MetadataRoute.Sitemap = (posts ?? [])
    .map((p: { slug?: string | null; id: string; published_at?: string | null }) => {
      const slug = p.slug ?? p.id;
      if (!slug) return null;
      return {
        url: `${SITE_URL}/explore/${slug}`,
        lastModified: p.published_at ? new Date(p.published_at) : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/resume`, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [...staticEntries, ...postEntries];
}
