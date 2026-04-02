import { mockPosts } from "@/lib/mock-data";
import { PostCard } from "@/components/explore/PostCard";

// Derive unique tags from all posts for filter chips
function getUniqueTags(posts: typeof mockPosts): string[] {
  const all = posts.flatMap((p) =>
    p.tags.split(",").map((t) => t.trim()).filter(Boolean)
  );
  return ["All Projects", ...Array.from(new Set(all))];
}

export default function ExplorePage() {
  const tags = getUniqueTags(mockPosts);

  return (
    <div className="min-h-dvh pt-14 lg:pt-0 pb-16 lg:pb-0 overflow-y-auto">
      {/* Header */}
      <div className="px-6 lg:px-10 pt-10 pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary mb-3">
          Engineering Feed
        </p>
        <h1 className="font-display font-bold text-on-surface leading-none tracking-tight">
          <span className="text-4xl lg:text-5xl">Luminous&nbsp;</span>
          <span className="text-4xl lg:text-5xl text-primary">Logic</span>
        </h1>
        <p className="mt-3 text-sm text-outline max-w-md leading-relaxed">
          Exploring the intersection of high-performance engineering and visual architecture.
        </p>

        {/* Tag filter chips — static for now, client-side filtering can be added later */}
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={tag}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                i === 0
                  ? "bg-linear-to-r from-primary to-primary-container text-on-primary"
                  : "bg-surface-container-high text-secondary hover:bg-surface-container-highest"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 lg:px-10 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
