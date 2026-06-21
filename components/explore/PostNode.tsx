"use client";

import Link from "next/link";
import Image from "next/image";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Post } from "@/lib/mock-data";
import { getThumbSrc, timeAgo } from "@/lib/post-thumbnail";
import { YouTubeIcon } from "@/components/icons";

export type PostNodeData = { post: Post };
export type PostFlowNode = Node<PostNodeData, "post">;

/**
 * A graph node that looks like an Explore tile: thumbnail, title, and date.
 * Edges attach to the node via floating edges, so the hidden handles below
 * exist only to keep the node a valid edge endpoint (not for user connections).
 */
export function PostNode({ data }: NodeProps<PostFlowNode>) {
  const { post } = data;
  const thumbSrc = getThumbSrc(post);

  return (
    <article className="group w-52 flex flex-col bg-surface-container-low rounded-2xl overflow-hidden transition-colors duration-200 hover:bg-surface-container-high">
      <Handle type="target" position={Position.Top} isConnectable={false} style={{ opacity: 0 }} />
      <Link href={`/explore/${post.slug ?? ""}`} className="block">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {/* Gradient — base layer / shown when no thumbnail */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(160deg, ${post.bg_from} 0%, ${post.bg_to} 100%)` }}
            aria-hidden="true"
          />
          {thumbSrc && (
            <Image
              src={thumbSrc}
              alt={post.title}
              fill
              sizes="208px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          )}
          {/* Video icon on hover */}
          {post.video_url && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-surface-container-high/80 backdrop-blur-sm flex items-center justify-center">
                <YouTubeIcon className="w-4 h-4 text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-3">
          <h3 className="font-display font-semibold text-on-surface text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="mt-1.5 text-xs text-on-surface/70">
            {post.category ? `${post.category} · ` : ""}
            {timeAgo(post.published_at)}
          </p>
        </div>
      </Link>
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={{ opacity: 0 }} />
    </article>
  );
}
