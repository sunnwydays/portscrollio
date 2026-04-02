import Link from "next/link";
import { Post } from "@/lib/mock-data";
import { YouTubeIcon } from "@/components/icons";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group flex flex-col bg-surface-container-low rounded-2xl overflow-hidden cursor-pointer transition-colors duration-200 hover:bg-surface-container-high">
      <Link href={`/explore/${post.slug}`} className="block">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <div
            className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.02]"
            style={{
              background: `linear-gradient(160deg, ${post.bgFrom} 0%, ${post.bgTo} 100%)`,
            }}
            aria-hidden="true"
          />
          {/* Duration badge */}
          {post.duration && (
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-surface-dim/90 text-on-surface text-xs font-medium rounded">
              {post.duration}
            </span>
          )}
          {/* Video icon if it's a video post */}
          {post.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-surface-container-high/80 backdrop-blur-sm flex items-center justify-center">
                <YouTubeIcon className="w-5 h-5 text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-on-surface text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="mt-2 text-xs text-outline">
            {post.category} · {post.views} views · {post.timeAgo}
          </p>
        </div>
      </Link>
    </article>
  );
}
