import Link from "next/link";
import { Post } from "@/lib/mock-data";
import { YouTubeIcon } from "@/components/icons";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

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
              background: `linear-gradient(160deg, ${post.bg_from} 0%, ${post.bg_to} 100%)`,
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
          {post.video_url && (
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
            {post.category} · {timeAgo(post.published_at)}
          </p>
        </div>
      </Link>
    </article>
  );
}
