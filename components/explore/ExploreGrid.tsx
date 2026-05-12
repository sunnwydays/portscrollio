"use client";

import { useState } from "react";
import { Post } from "@/lib/mock-data";
import { PostCard } from "@/components/explore/PostCard";

const ASPECTS = ["aspect-video", "aspect-[4/3]", "aspect-[5/4]"] as const;

interface ExploreGridProps {
  posts: Post[];
  tags: string[];
}

export function ExploreGrid({ posts, tags }: ExploreGridProps) {
  const [selected, setSelected] = useState("All Posts");

  const filtered =
    selected === "All Posts"
      ? posts
      : posts.filter((p) =>
          p.tags
            .split(",")
            .map((t) => t.trim())
            .includes(selected)
        );

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelected(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              selected === tag
                ? "bg-linear-to-r from-primary to-primary-container text-on-primary"
                : "bg-surface-container-high text-secondary hover:bg-surface-container-highest"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <p className="text-outline text-sm">No posts yet.</p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {filtered.map((post, i) => (
              <div key={post.id} className="break-inside-avoid mb-6">
                <PostCard post={post} aspectRatio={ASPECTS[i % ASPECTS.length]} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
