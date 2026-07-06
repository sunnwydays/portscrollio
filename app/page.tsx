import type { Metadata } from "next";
import { FeedPage } from "@/components/for-you/FeedPage";
import { getProjects } from "@/lib/feed";
import { getYouTubeId } from "@/lib/post-thumbnail";

export const metadata: Metadata = {
  title: "For You",
  description:
    "Watch project demos across distributed systems, robotics, kernels, and machine learning, with code and engineering breakdowns.",
  alternates: { canonical: "/" },
};

export default async function ForYouPage() {
  const projects = await getProjects();

  const videoListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: projects.map((p, i) => {
      const videoId = getYouTubeId(p.video_url);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "VideoObject",
          name: p.title,
          description: p.description,
          ...(videoId
            ? {
                thumbnailUrl: [`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`],
                embedUrl: `https://www.youtube.com/embed/${videoId}`,
              }
            : {}),
          contentUrl: p.video_url,
          ...(p.published_at ? { uploadDate: p.published_at } : {}),
          keywords: [p.tech, p.tags].filter(Boolean).join(","),
        },
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoListLd).replace(/</g, "\\u003c") }}
      />
      <FeedPage />
    </>
  );
}
