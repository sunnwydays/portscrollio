import { VideoFeed } from "@/components/for-you/VideoFeed";
import { buildPlaylist } from "@/lib/playlist";
import { getProjects } from "@/lib/feed";

interface FeedPageProps {
  leadSlug?: string;
}

export async function FeedPage({ leadSlug }: FeedPageProps) {
  const projects = await getProjects();

  return (
    <>
      <h1 className="sr-only">Sunny&apos;s projects and demos</h1>
      <VideoFeed projects={projects} initialPlaylist={buildPlaylist(projects, leadSlug)} />
    </>
  );
}
