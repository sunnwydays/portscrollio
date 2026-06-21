import { Post } from "@/lib/mock-data";

/** Extract the 11-char video ID from a YouTube watch/shorts/youtu.be URL. */
export function getYouTubeId(url: string): string | null {
  return url.match(/(?:shorts\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1] ?? null;
}

/**
 * Resolve a post's thumbnail source.
 * Priority: explicit thumbnail_url ► YouTube auto-thumb ► null (caller renders gradient fallback).
 */
export function getThumbSrc(post: Post): string | null {
  if (post.thumbnail_url) return post.thumbnail_url;
  const videoId = post.video_url ? getYouTubeId(post.video_url) : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
}

/** Human-friendly relative time, e.g. "today", "3d ago", "2mo ago". */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
