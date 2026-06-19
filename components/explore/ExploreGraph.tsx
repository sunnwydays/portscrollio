"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type EdgeTypes,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Post } from "@/lib/mock-data";
import { buildGraph, NODE_HEIGHT, NODE_WIDTH } from "@/lib/graph";
import { PostNode, type PostFlowNode } from "@/components/explore/PostNode";
import { FloatingEdge } from "@/components/explore/FloatingEdge";

const nodeTypes: NodeTypes = { post: PostNode };
const edgeTypes: EdgeTypes = { floating: FloatingEdge };

// Connections are faint accents on desktop, but need more presence on a small
// touch screen where the graph is usually further zoomed out.
const MOBILE_EDGE_STYLE = { stroke: "#adc6ff", strokeOpacity: 0.6, strokeWidth: 3 };

// lg breakpoint — below it the layout is touch-first (no fixed sidebar).
const MOBILE_QUERY = "(max-width: 1023px)";
const HINT_KEY = "explore-graph-hint-seen";

interface ExploreGraphProps {
  posts: Post[];
}

export function ExploreGraph({ posts }: ExploreGraphProps) {
  // Resolve the viewport class before mounting React Flow. The mobile and
  // desktop graphs differ enough (framing, edge weight, controls) that we build
  // the right one up front rather than reconfiguring after paint. Rendering
  // client-only also avoids the SSR hydration mismatch from timeAgo() + node
  // measurement.
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (isMobile === null) return <div className="h-full w-full" aria-hidden="true" />;
  // Remount on breakpoint change so the initial framing and edges rebuild cleanly.
  return <Graph key={isMobile ? "mobile" : "desktop"} posts={posts} isMobile={isMobile} />;
}

function Graph({ posts, isMobile }: { posts: Post[]; isMobile: boolean }) {
  const { nodes: initialNodes, edges: builtEdges } = useMemo(() => buildGraph(posts), [posts]);
  const initialEdges = useMemo<Edge[]>(
    () => (isMobile ? builtEdges.map((e) => ({ ...e, style: MOBILE_EDGE_STYLE })) : builtEdges),
    [builtEdges, isMobile],
  );
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // First-load hint (mobile, once ever): a graph isn't an obvious touch UI.
  // Safe to read storage in the initializer — Graph only ever mounts client-side.
  const [showHint, setShowHint] = useState(() => {
    if (!isMobile) return false;
    try {
      return !localStorage.getItem(HINT_KEY);
    } catch {
      return false;
    }
  });
  const dismissHint = useCallback(() => {
    setShowHint(false);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      // private mode / storage disabled — just let the hint not persist.
    }
  }, []);
  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(dismissHint, 5000);
    return () => clearTimeout(timer);
  }, [showHint, dismissHint]);

  // On mobile, frame the newest post (nodes are ordered newest-first) at a
  // readable zoom and let the reader pan, instead of fitting the whole graph,
  // which shrinks every tile to a thumbnail. Desktop uses fitView (below).
  const onInit = useCallback(
    (instance: ReactFlowInstance<PostFlowNode, Edge>) => {
      if (!isMobile || initialNodes.length === 0) return;
      const { x, y } = initialNodes[0].position;
      instance.setCenter(x + NODE_WIDTH / 2, y + NODE_HEIGHT / 2, { zoom: 0.9, duration: 0 });
    },
    [isMobile, initialNodes],
  );

  return (
    <div
      className="relative h-full w-full"
      onPointerDown={showHint ? dismissHint : undefined}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodeDragThreshold={isMobile ? 8 : 1}
        fitView={!isMobile}
        fitViewOptions={{ padding: 0.25 }}
        minZoom={isMobile ? 0.45 : 0.2}
        maxZoom={1.5}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        className="bg-surface"
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1.5} color="#222a3d" />
        <Controls
          showInteractive={false}
          position={isMobile ? "top-right" : "bottom-left"}
          fitViewOptions={isMobile ? { padding: 0.2, minZoom: 0.6, maxZoom: 1 } : { padding: 0.25 }}
        />
      </ReactFlow>
      {showHint && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-6">
          <p className="rounded-full bg-surface-variant/60 px-4 py-2 text-xs font-medium text-on-surface/90 backdrop-blur-[20px]">
            Drag to explore · tap a tile to open
          </p>
        </div>
      )}
    </div>
  );
}
