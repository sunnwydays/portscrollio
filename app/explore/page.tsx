import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/mock-data";
import { ExploreGraph } from "@/components/explore/ExploreGraph";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Ever think about gambling, sleep, and sidequesting (together)? I do! Come disagree with Sunny's connected thoughts on society, life, and tech.",
  alternates: { canonical: "/explore" },
  openGraph: {
    title: "Explore - SUNNY'S PORTSCROLLIO",
    description:
      "Sunny's connected takes on society, life, and tech",
    url: "/explore",
  },
};

function getBlogReadingMinutes(): number {
  const contentDir = path.join(process.cwd(), "content");
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
  let totalWords = 0;
  for (const file of files) {
    const text = fs.readFileSync(path.join(contentDir, file), "utf-8");
    totalWords += text.split(/\s+/).filter(Boolean).length;
  }
  return totalWords / 238;
}

function getVideoMinutes(posts: Post[]): number {
  let totalSeconds = 0;
  for (const post of posts) {
    if (!post.duration) continue;
    const parts = post.duration.split(":").map(Number);
    if (parts.length === 2) totalSeconds += parts[0] * 60 + parts[1];
    else if (parts.length === 3) totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return totalSeconds / 60;
}

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  const index = crypto.randomInt(items.length);
  return items[index];
}

export default async function ExplorePage() {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false });

  const posts: Post[] = data ?? [];
  const totalMinutes = Math.ceil(getBlogReadingMinutes() + getVideoMinutes(posts));
  const randomPost = pickRandom(posts);

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
        <div className="mt-3 space-y-1 text-[10px] uppercase tracking-widest">
          <p>
            <span className="text-on-surface/50">Read everything </span>
            <span className="text-primary font-semibold">{totalMinutes} min</span>
          </p>
          {randomPost && (
            <Link
              href={`/explore/${randomPost.slug ?? ""}`}
              className="block text-on-surface/50 hover:text-on-surface transition-colors"
            >
              Read something{" "}
              <span className="text-primary font-semibold">10 sec</span>
            </Link>
          )}
        </div>
      </div>

      <div className="h-full w-full">
        <ExploreGraph posts={posts} />
      </div>
    </div>
  );
}
