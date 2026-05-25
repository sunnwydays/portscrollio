import { supabase } from "@/lib/supabase";
import { VideoFeed } from "@/components/for-you/VideoFeed";
import { Project } from "@/lib/mock-data";
import { buildPlaylist } from "@/lib/playlist";

export default async function ForYouPage() {
  const { data } = await supabase
    .from("projects")
    .select("*")

  const projects: Project[] = data ?? [];

  return <VideoFeed projects={projects} initialPlaylist={buildPlaylist(projects)} />;
}
