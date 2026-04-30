import { supabase } from "@/lib/supabase";
import { PostCard } from "@/components/explore/PostCard";
import { Post } from "@/lib/mock-data";

function getUniqueTags(posts: Post[]): string[] {
  const all = posts.flatMap((p) =>
    p.tags.split(",").map((t) => t.trim()).filter(Boolean)
  );
  return ["All Projects", ...Array.from(new Set(all))];
}

export default async function ExplorePage() {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false });

  const posts: Post[] = data ?? [];
  const tags = getUniqueTags(posts);

  return (
    <div className="min-h-dvh pt-14 lg:pt-0 pb-16 lg:pb-0 overflow-y-auto">
      {/* Header */}
      <div className="px-6 lg:px-10 pt-10 pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary mb-3">
          Understand me
        </p>
        <h1 className="font-display font-bold text-on-surface leading-none tracking-tight">
          <span className="text-4xl lg:text-5xl">Sunny&apos;s&nbsp;</span>
          <span className="text-4xl lg:text-5xl text-primary">Thoughts</span>
        </h1>
        <p className="mt-3 text-sm text-outline max-w-md leading-relaxed">
          I&apos;ve been thinking the things there are to think about life. Take a read to find a new perspective.
        </p>

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
        {posts.length === 0 ? (
          <p className="text-outline text-sm">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
