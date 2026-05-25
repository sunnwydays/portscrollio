import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/mock-data";
import { ExploreGrid } from "@/components/explore/ExploreGrid";

function getUniqueTags(posts: Post[]): string[] {
  const all = posts.flatMap((p) =>
    p.tags.split(",").map((t) => t.trim()).filter(Boolean)
  );
  return ["All Posts", ...Array.from(new Set(all))];
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
      <div className="px-6 lg:px-10 pt-10 pb-10">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary mb-3">
          Understand me
        </p>
        <h1 className="font-display font-bold text-on-surface leading-none tracking-tight">
          <span className="text-4xl lg:text-5xl">Sunny&apos;s&nbsp;</span>
          <span className="text-4xl lg:text-5xl text-primary">Thoughts</span>
        </h1>
        <p className="mt-3 text-sm text-on-surface/85 max-w-md leading-relaxed">
          I&apos;ve been thinking the things there are to think about life. Take a look to find a new perspective.
        </p>

        <ExploreGrid posts={posts} tags={tags} />
      </div>
    </div>
  );
}
