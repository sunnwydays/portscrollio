import { cache } from "react";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { VideoFeed } from "@/components/for-you/VideoFeed";
import { Project } from "@/lib/mock-data";
import { buildPlaylist } from "@/lib/playlist";
import { getYouTubeId } from "@/lib/post-thumbnail";

const getProjects = cache(async (): Promise<Project[]> => {
  const { data } = await supabase.from("projects").select("*");
  return data ?? [];
});

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
      <h1 className="sr-only">Sunny&apos;s projects and demos</h1>
      <VideoFeed projects={projects} initialPlaylist={buildPlaylist(projects)} />
    </>
  );
}
