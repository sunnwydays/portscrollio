import type { Edge } from "@xyflow/react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { Post } from "@/lib/mock-data";
import type { PostFlowNode } from "@/components/explore/PostNode";

type SimNode = SimulationNodeDatum & { id: string };
type SimLink = SimulationLinkDatum<SimNode>;

// Keep in sync with PostNode's rendered size (w-52 ≈ 208px, ~188px tall).
export const NODE_WIDTH = 208;
export const NODE_HEIGHT = 188;
export function buildGraph(posts: Post[]): { nodes: PostFlowNode[]; edges: Edge[] } {
  const linkable = posts.filter((p): p is Post & { slug: string } => Boolean(p.slug));
  const slugSet = new Set(linkable.map((p) => p.slug));

  const edgeKeys = new Set<string>();
  const edges: Edge[] = [];
  for (const post of linkable) {
    const related = (post.related ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const target of related) {
      if (target === post.slug || !slugSet.has(target)) continue;
      const key = `${post.slug}->${target}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      edges.push({
        id: key,
        source: post.slug,
        target,
        type: "floating",
      });
    }
  }

  const simNodes: SimNode[] = linkable.map((p) => ({ id: p.slug }));
  const simLinks: SimLink[] = edges.map((e) => ({ source: e.source, target: e.target }));

  forceSimulation(simNodes)
    .force(
      "link",
      forceLink<SimNode, SimLink>(simLinks)
        .id((d) => d.id)
        .distance(280)
        .strength(0.5),
    )
    .force("charge", forceManyBody().strength(-1200))
    .force("collide", forceCollide(Math.max(NODE_WIDTH, NODE_HEIGHT) / 2 + 20))
    .force("center", forceCenter(0, 0))
    .force("x", forceX(0).strength(0.04))
    .force("y", forceY(0).strength(0.04))
    .stop()
    .tick(400);

  const nodes: PostFlowNode[] = linkable.map((post, i) => ({
    id: post.slug,
    type: "post",
    position: { x: simNodes[i].x ?? 0, y: simNodes[i].y ?? 0 },
    data: { post },
  }));

  return { nodes, edges };
}
