"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  ControlButton,
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
import { GraphHoverContext } from "@/components/explore/graph-hover-context";

const nodeTypes: NodeTypes = { post: PostNode };
const edgeTypes: EdgeTypes = { floating: FloatingEdge };

const MOBILE_QUERY = "(max-width: 1023px)";
const HELP_SEEN_KEY = "explore-graph-help-seen";

interface ExploreGraphProps {
  posts: Post[];
}

export function ExploreGraph({ posts }: ExploreGraphProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (isMobile === null) return <div className="h-full w-full" aria-hidden="true" />;
  return <Graph key={isMobile ? "mobile" : "desktop"} posts={posts} isMobile={isMobile} />;
}

const HELP_ITEMS = [
  { text: "Each tile is a blog post or video. Tap to explore.", delay: "[animation-delay:140ms]" },
  { text: "Arrows point from one post to the next in a topic.", delay: "[animation-delay:240ms]" },
  {
    text: "Drag the canvas to pan. Pinch or scroll to zoom. Drag tiles to rearrange.",
    delay: "[animation-delay:340ms]",
  },
];

/** A miniature of the real PostNode tile, drawn in SVG for the help diagram. */
function MiniTile({ x, y, fill, play = false }: { x: number; y: number; fill: string; play?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="44" height="30" rx="5" fill="#131b2e" />
      <rect width="44" height="16" rx="5" fill={`url(#${fill})`} />
      {play && <path d="M20 5 L20 11 L25 8 Z" fill="#dae2fd" fillOpacity="0.92" />}
      <rect x="6" y="20" width="26" height="2.5" rx="1.25" fill="#dae2fd" fillOpacity="0.5" />
      <rect x="6" y="24.5" width="16" height="2" rx="1" fill="#dae2fd" fillOpacity="0.28" />
    </g>
  );
}

/** Animated mini-graph: three tiles wired by flowing edges over pulsing glows. */
function HelpDiagram() {
  return (
    <svg viewBox="0 0 220 112" className="w-full" aria-hidden="true">
      <defs>
        <radialGradient id="help-glow">
          <stop offset="0%" stopColor="#4edea3" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4edea3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="help-thumb-1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0566d9" />
        </linearGradient>
        <linearGradient id="help-thumb-2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ffbbe" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="help-thumb-3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#adc6ff" />
          <stop offset="100%" stopColor="#0566d9" />
        </linearGradient>
        <linearGradient id="help-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4edea3" />
          <stop offset="100%" stopColor="#adc6ff" />
        </linearGradient>
        <marker id="help-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="#adc6ff" />
        </marker>
      </defs>

      {/* Node glows (behind everything) */}
      <circle cx="36" cy="73" r="30" fill="url(#help-glow)" className="graph-node-pulse [animation-delay:0ms]" />
      <circle cx="114" cy="29" r="30" fill="url(#help-glow)" className="graph-node-pulse [animation-delay:850ms]" />
      <circle cx="182" cy="79" r="30" fill="url(#help-glow)" className="graph-node-pulse [animation-delay:1700ms]" />

      {/* Core edges with flowing dashes and arrows */}
      <path d="M36 73 L114 29" stroke="url(#help-edge)" strokeWidth="2" fill="none" strokeLinecap="round" markerEnd="url(#help-arrow)" className="graph-edge-flow" />
      <path d="M114 29 L182 79" stroke="url(#help-edge)" strokeWidth="2" fill="none" strokeLinecap="round" markerEnd="url(#help-arrow)" className="graph-edge-flow [animation-delay:0.55s]" />

      {/* Tiles on top */}
      <MiniTile x={14} y={58} fill="help-thumb-1" play />
      <MiniTile x={92} y={14} fill="help-thumb-2" />
      <MiniTile x={160} y={64} fill="help-thumb-3" />
    </svg>
  );
}

function HelpPopup({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="graph-help-overlay absolute inset-0 z-50 flex items-center justify-center p-6"
      onClick={(e) => {
        if (panelRef.current && !panelRef.current.contains(e.target as globalThis.Node)) onClose();
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-label="How to use the explore graph"
        className="graph-help-pop w-full max-w-xs overflow-hidden rounded-2xl bg-surface-variant/60 p-5 ring-1 ring-outline-variant/15 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(6,14,32,0.5)]"
      >
        <HelpDiagram />

        <ul className="mt-4 space-y-2.5 text-sm text-on-surface/85">
          {HELP_ITEMS.map((item) => (
            <li key={item.text} className={`graph-help-bullet flex gap-2.5 ${item.delay}`}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="mt-4 w-full cursor-pointer rounded-lg bg-gradient-to-br from-primary to-primary-container py-2 text-sm font-semibold text-on-primary transition-shadow hover:shadow-[0_0_15px_rgba(111,251,190,0.35)]"
        >
          Ready to think!
        </button>
      </div>
    </div>
  );
}

function Graph({ posts, isMobile }: { posts: Post[]; isMobile: boolean }) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => buildGraph(posts), [posts]);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const onNodeMouseEnter = useCallback(
    (_: unknown, node: PostFlowNode) => setHoveredId(node.id),
    [],
  );
  const onNodeMouseLeave = useCallback(() => setHoveredId(null), []);

  const [showHelp, setShowHelp] = useState(() => {
    if (!isMobile) return false;
    try {
      return !localStorage.getItem(HELP_SEEN_KEY);
    } catch {
      return false;
    }
  });
  const closeHelp = useCallback(() => {
    setShowHelp(false);
    try {
      localStorage.setItem(HELP_SEEN_KEY, "1");
    } catch {}
  }, []);

  const onInit = useCallback(
    (instance: ReactFlowInstance<PostFlowNode, Edge>) => {
      if (!isMobile || initialNodes.length === 0) return;
      const { x, y } = initialNodes[0].position;
      instance.setCenter(x + NODE_WIDTH / 2, y + NODE_HEIGHT / 2, { zoom: 0.9, duration: 0 });
    },
    [isMobile, initialNodes],
  );

  return (
    <div className="relative h-full w-full">
      <GraphHoverContext.Provider value={hoveredId}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
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
          >
            <ControlButton onClick={() => setShowHelp(true)} aria-label="How to use this graph">
              <span className="text-sm font-semibold leading-none">?</span>
            </ControlButton>
          </Controls>
        </ReactFlow>
      </GraphHoverContext.Provider>

      {showHelp && <HelpPopup onClose={closeHelp} />}
    </div>
  );
}
