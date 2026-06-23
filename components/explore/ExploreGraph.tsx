"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
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
import { GraphHoverContext, type GraphHoverState } from "@/components/explore/graph-hover-context";

const nodeTypes: NodeTypes = { post: PostNode };
const edgeTypes: EdgeTypes = { floating: FloatingEdge };

const MOBILE_QUERY = "(max-width: 1023px)";
const HELP_SEEN_KEY = "explore-graph-help-seen";

// How long a node stays "firing" before the signal walks on, and how long after
// the last touch/pan before an autoplaying cascade resumes.
const CASCADE_HOLD_MS = 1900;
const CASCADE_RESUME_MS = 1400;
// Wait for onInit centering / fitView to settle before the first ambient fire.
const CASCADE_START_MS = 900;
// How many recently fired nodes to remember and avoid revisiting, so the walk
// keeps moving instead of bouncing across a reciprocal (bidirectional) edge.
const RECENT_LIMIT = 4;
// Quiet gap between mobile autoplay cascades: a base rest plus jitter so the
// random firings don't feel metronomic.
const CASCADE_REST_MS = 1200;
const CASCADE_REST_JITTER = 2600;

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
  { text: "Lines connect related posts. Hover a tile to see its connections light up.", delay: "[animation-delay:240ms]" },
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
      </defs>

      {/* Node glows (behind everything) */}
      <circle cx="36" cy="73" r="30" fill="url(#help-glow)" className="graph-node-pulse [animation-delay:0ms]" />
      <circle cx="114" cy="29" r="30" fill="url(#help-glow)" className="graph-node-pulse [animation-delay:850ms]" />
      <circle cx="182" cy="79" r="30" fill="url(#help-glow)" className="graph-node-pulse [animation-delay:1700ms]" />

      {/* Core edges with flowing dashes and arrows */}
      <path d="M36 73 L114 29" stroke="url(#help-edge)" strokeWidth="2" fill="none" strokeLinecap="round" className="graph-edge-flow" />
      <path d="M114 29 L182 79" stroke="url(#help-edge)" strokeWidth="2" fill="none" strokeLinecap="round" className="graph-edge-flow [animation-delay:0.55s]" />

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

function pickRandom<T>(arr: T[]): T | undefined {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
}

function useGraphCascade({
  edges,
  autoStart,
  instanceRef,
  wrapperRef,
  setFiring,
}: {
  edges: Edge[];
  autoStart: boolean;
  instanceRef: RefObject<ReactFlowInstance<PostFlowNode, Edge> | null>;
  wrapperRef: RefObject<HTMLDivElement | null>;
  setFiring: (current: string | null, prev?: string | null) => void;
}) {
  const adjacency = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const e of edges) {
      let arr = m.get(e.source);
      if (arr) arr.push(e.target);
      else m.set(e.source, [e.target]);
      arr = m.get(e.target);
      if (arr) arr.push(e.source);
      else m.set(e.target, [e.source]);
    }
    return m;
  }, [edges]);

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const pausedRef = useRef(false);
  const activeRef = useRef(false);
  // "hover" -> a desktop hover drives it and it loops from the hovered seed.
  // "auto" -> mobile autoplay; the chain plays once, then a new random one
  // starts after a rest. null -> idle.
  const modeRef = useRef<"hover" | "auto" | null>(null);
  // The node a hover cascade restarts from when its chain reaches an end.
  const hoverSeedRef = useRef<string | null>(null);
  // True while a cascade is mid-flight, so mobile never autoplays a second one
  // on top of one already running.
  const playingRef = useRef(false);
  const currentRef = useRef<string | null>(null);
  // The node the signal just came from. It is never chosen as the next hop, so
  // the walk never fires straight back along a reciprocal (bidirectional) edge.
  const prevRef = useRef<string | null>(null);
  // Trail of recently fired nodes so the walk doesn't bounce back and forth.
  const recentRef = useRef<string[]>([]);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRef = useRef<() => void>(() => {});
  const scheduleAutoRef = useRef<() => void>(() => {});

  // The set of node ids whose center sits inside the visible canvas, so the
  // cascade can keep the action on screen. Empty set means "unknown" -> no filter.
  const visibleIds = useCallback((): Set<string> => {
    const instance = instanceRef.current;
    const wrap = wrapperRef.current;
    const ids = new Set<string>();
    if (!instance || !wrap) return ids;
    const vp = instance.getViewport();
    const { width, height } = wrap.getBoundingClientRect();
    const margin = 40;
    for (const n of instance.getNodes()) {
      const cx = (n.position.x + NODE_WIDTH / 2) * vp.zoom + vp.x;
      const cy = (n.position.y + NODE_HEIGHT / 2) * vp.zoom + vp.y;
      if (cx >= -margin && cx <= width + margin && cy >= -margin && cy <= height + margin)
        ids.add(n.id);
    }
    return ids;
  }, [instanceRef, wrapperRef]);

  const step = useCallback(() => {
    if (!activeRef.current) return;
    if (pausedRef.current) {
      stepTimerRef.current = setTimeout(() => scheduleRef.current(), 400);
      return;
    }
    const current = currentRef.current;
    const prev = prevRef.current;
    const recent = recentRef.current;
    const fresh = (id: string) => !recent.includes(id);
    // The next hop is never the current node nor the one we just came from, so
    // the walk can't fire straight back along a reciprocal edge.
    const allowed = (id: string) => id !== current && id !== prev;

    // Walk one edge along the chain. We follow the post's own connections only,
    // no cross-graph jumps, so a cascade is a self-contained burst.
    const targets = current
      ? (adjacency.get(current) ?? []).filter((t) => allowed(t))
      : [];
    const next = pickRandom(targets.filter(fresh)) ?? pickRandom(targets);

    if (next) {
      prevRef.current = current;
      currentRef.current = next;
      recent.push(next);
      if (recent.length > RECENT_LIMIT) recent.shift();
      setFiring(next, current);
      stepTimerRef.current = setTimeout(
        () => scheduleRef.current(),
        CASCADE_HOLD_MS + Math.random() * 500,
      );
      return;
    }

    // Chain reached a dead end.
    if (modeRef.current === "hover" && hoverSeedRef.current) {
      // While the tile is hovered, loop the burst from the hovered seed.
      currentRef.current = hoverSeedRef.current;
      prevRef.current = null;
      recentRef.current = [hoverSeedRef.current];
      setFiring(hoverSeedRef.current);
      stepTimerRef.current = setTimeout(
        () => scheduleRef.current(),
        CASCADE_HOLD_MS + Math.random() * 500,
      );
      return;
    }

    // Mobile autoplay: this burst is done. Rest, then a new random one starts.
    activeRef.current = false;
    playingRef.current = false;
    setFiring(null);
    if (autoStart && !reducedMotion) {
      autoTimerRef.current = setTimeout(
        () => scheduleAutoRef.current(),
        CASCADE_REST_MS + Math.random() * CASCADE_REST_JITTER,
      );
    }
  }, [adjacency, autoStart, reducedMotion, setFiring]);
  useEffect(() => {
    scheduleRef.current = step;
  }, [step]);

  // Light a fresh cascade at a node and start the walk from there.
  const beginCascade = useCallback(
    (id: string, mode: "hover" | "auto") => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      modeRef.current = mode;
      hoverSeedRef.current = mode === "hover" ? id : null;
      currentRef.current = id;
      prevRef.current = null;
      recentRef.current = [id];
      setFiring(id);
      if (reducedMotion) return;
      activeRef.current = true;
      playingRef.current = true;
      stepTimerRef.current = setTimeout(
        () => scheduleRef.current(),
        CASCADE_HOLD_MS + Math.random() * 500,
      );
    },
    [reducedMotion, setFiring],
  );

  // Desktop: a tile hover ignites (and keeps looping) a cascade from that node.
  const ignite = useCallback((id: string) => beginCascade(id, "hover"), [beginCascade]);

  // Desktop: pointer left the tile, so the cascade stops and the graph rests.
  // Only tears down a hover cascade, never an in-flight mobile autoplay burst.
  const stop = useCallback(() => {
    if (modeRef.current !== "hover") return;
    activeRef.current = false;
    playingRef.current = false;
    modeRef.current = null;
    hoverSeedRef.current = null;
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    setFiring(null);
  }, [setFiring]);

  // Mobile: seed a random cascade, preferring an in-view node that can fire.
  const startAuto = useCallback(() => {
    if (playingRef.current || pausedRef.current) {
      // Busy or paused: try again shortly rather than overlapping a burst.
      autoTimerRef.current = setTimeout(() => scheduleAutoRef.current(), 800);
      return;
    }
    const all = instanceRef.current?.getNodes() ?? [];
    if (all.length === 0) {
      autoTimerRef.current = setTimeout(() => scheduleAutoRef.current(), 800);
      return;
    }
    const vis = visibleIds();
    const pool = all.filter((n) => vis.size === 0 || vis.has(n.id));
    const firing = pool.filter((n) => (adjacency.get(n.id)?.length ?? 0) > 0);
    const seed = pickRandom(firing.length ? firing : pool)?.id ?? all[0].id;
    beginCascade(seed, "auto");
  }, [adjacency, instanceRef, visibleIds, beginCascade]);
  useEffect(() => {
    scheduleAutoRef.current = startAuto;
  }, [startAuto]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  const resume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, CASCADE_RESUME_MS);
  }, []);

  // Mobile only: once the canvas has settled, start the self-running loop of
  // random, non-overlapping cascades. Desktop never autoplays.
  useEffect(() => {
    if (!autoStart || reducedMotion) return;
    const start = setTimeout(() => scheduleAutoRef.current(), CASCADE_START_MS);
    return () => clearTimeout(start);
  }, [autoStart, reducedMotion]);

  // Stop all timers on unmount.
  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, []);

  return { ignite, stop, pause, resume };
}

function Graph({ posts, isMobile }: { posts: Post[]; isMobile: boolean }) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => buildGraph(posts), [posts]);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [firing, setFiringState] = useState<GraphHoverState>({ current: null, prev: null });
  const setFiring = useCallback(
    (current: string | null, prev: string | null = null) => setFiringState({ current, prev }),
    [],
  );

  const wrapperRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ReactFlowInstance<PostFlowNode, Edge> | null>(null);

  const { ignite, stop, pause, resume } = useGraphCascade({
    edges: initialEdges,
    autoStart: isMobile,
    instanceRef,
    wrapperRef,
    setFiring,
  });

  // Desktop: hovering a tile ignites a cascade from it that loops while hovered;
  // leaving the tile stops it. Mobile autoplays instead (no hover events fire).
  const onNodeMouseEnter = useCallback(
    (_: unknown, node: PostFlowNode) => ignite(node.id),
    [ignite],
  );

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
      instanceRef.current = instance;
      if (!isMobile || initialNodes.length === 0) return;
      const { x, y } = initialNodes[0].position;
      instance.setCenter(x + NODE_WIDTH / 2, y + NODE_HEIGHT / 2, { zoom: 0.9, duration: 0 });
    },
    [isMobile, initialNodes],
  );

  // Freeze the cascade while the help sheet is up so it isn't animating behind it.
  useEffect(() => {
    if (showHelp) pause();
    else resume();
  }, [showHelp, pause, resume]);

  return (
    <div ref={wrapperRef} className="relative h-full w-full">
      <GraphHoverContext.Provider value={firing}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={stop}
          onInit={onInit}
          onMoveStart={pause}
          onMoveEnd={resume}
          onNodeDragStart={pause}
          onNodeDragStop={resume}
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
