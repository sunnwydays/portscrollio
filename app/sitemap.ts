import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: posts }, { data: projects }] = await Promise.all([
    supabase
      .from("posts")
      .select("slug, id, published_at")
      .order("published_at", { ascending: false }),
    supabase.from("projects").select("id"),
  ]);

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

  const watchEntries: MetadataRoute.Sitemap = (projects ?? []).map((p: { id: string }) => ({
    url: `${SITE_URL}/watch/${p.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/resume`, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [...staticEntries, ...postEntries, ...watchEntries];
}
