import { supabase } from "@/lib/supabase";
import { VideoFeed } from "@/components/for-you/VideoFeed";
import { Project } from "@/lib/mock-data";

export default async function ForYouPage() {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("order_index");

  const projects: Project[] = data ?? [];

  return <VideoFeed projects={projects} />;
}
