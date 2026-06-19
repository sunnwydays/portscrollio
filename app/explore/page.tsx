import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/mock-data";
import { ExploreGraph } from "@/components/explore/ExploreGraph";

export default async function ExplorePage() {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false });

  const posts: Post[] = data ?? [];

  return (
    <div className="h-dvh pt-14 lg:pt-0 pb-16 lg:pb-0 overflow-hidden relative">
      <div className="absolute top-14 lg:top-0 left-0 z-10 px-6 lg:px-10 pt-6 pb-4 max-w-sm bg-surface/80 backdrop-blur-xl rounded-br-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary mb-2">
          Understand me
        </p>
        <h1 className="font-display font-bold text-on-surface leading-none tracking-tight">
          <span className="text-3xl lg:text-4xl">Sunny&apos;s&nbsp;</span>
          <span className="text-3xl lg:text-4xl text-primary">Thoughts</span>
        </h1>
        <p className="mt-2 text-xs text-on-surface/70 leading-relaxed">
          Take a look to find a new perspective.
        </p>
      </div>

      <div className="h-full w-full">
        <ExploreGraph posts={posts} />
      </div>
    </div>
  );
}
