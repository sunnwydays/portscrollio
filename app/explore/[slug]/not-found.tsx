import crypto from "crypto";
import Link from "next/link";
import { PlaceholderImage } from "@/components/explore/PlaceholderImage";
import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/mock-data";

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  const index = crypto.randomInt(items.length);
  return items[index];
}

export default async function NotFound() {
  const { data } = await supabase.from("posts").select("*");
  const posts: Post[] = data ?? [];
  const randomPost = pickRandom(posts);

  return (
    <div className="min-h-dvh pt-14 lg:pt-0 pb-16 lg:pb-0 flex flex-col items-center justify-center px-6">
      <div className="mb-8">
        <PlaceholderImage />
      </div>
      <h1 className="font-display font-bold text-2xl lg:text-3xl text-on-surface text-center">
        This post doesn&apos;t exist (yet)
      </h1>
      <p className="text-on-surface/60 mt-3 text-center max-w-md">
        Check back later, I might be cooking something up
      </p>
      {randomPost && (
        <Link
          href={`/explore/${randomPost.slug ?? ""}`}
          className="text-primary hover:text-primary-fixed transition-colors mt-2 text-center max-w-md"
        >
          Check out this post though
        </Link>
      )}
    </div>
  );
}
