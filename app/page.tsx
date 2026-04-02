import { mockProjects } from "@/lib/mock-data";
import { VideoCard } from "@/components/for-you/VideoCard";
import { VideoFeed } from "@/components/for-you/VideoFeed";

export default function ForYouPage() {
  return (
    <VideoFeed count={mockProjects.length}>
      {mockProjects.map((project) => (
        <VideoCard key={project.id} project={project} />
      ))}
    </VideoFeed>
  );
}
