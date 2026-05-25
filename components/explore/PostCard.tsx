import Link from "next/link";
import Image from "next/image";
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

function getYouTubeId(url: string): string | null {
  return url.match(/(?:shorts\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1] ?? null;
}

interface PostCardProps {
  post: Post;
  aspectRatio?: 'aspect-video' | 'aspect-[4/3]' | 'aspect-[5/4]';
}

export function PostCard({ post, aspectRatio = 'aspect-video' }: PostCardProps) {
  const videoId = post.video_url ? getYouTubeId(post.video_url) : null;
  // Use explicit thumbnail > YouTube auto-thumb > gradient fallback
  const thumbSrc = post.thumbnail_url
    ?? (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);

  return (
    <article className="group flex flex-col bg-surface-container-low rounded-2xl overflow-hidden cursor-pointer transition-colors duration-200 hover:bg-surface-container-high">
      <Link href={`/explore/${post.slug ?? ''}`} className="block">
        {/* Thumbnail */}
        <div className={`relative ${aspectRatio} overflow-hidden`}>
          {/* Gradient — base layer / shown when no thumbnail */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${post.bg_from} 0%, ${post.bg_to} 100%)`,
            }}
            aria-hidden="true"
          />
          {thumbSrc && (
            <Image
              src={thumbSrc}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          )}
          {/* Duration badge */}
          {post.duration && (
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-surface-dim/90 text-on-surface text-xs font-medium rounded">
              {post.duration}
            </span>
          )}
          {/* Video icon on hover */}
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
          <h3 className="font-display font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="mt-2 text-xs text-on-surface/80">
            {post.category} · {timeAgo(post.published_at)}
          </p>
        </div>
      </Link>
    </article>
  );
}
