"use client";

import { useContext } from "react";
import {
  useInternalNode,
  type EdgeProps,
  type InternalNode,
  type Node,
} from "@xyflow/react";
import { GraphHoverContext } from "@/components/explore/graph-hover-context";

function getNodeIntersection(node: InternalNode<Node>, target: InternalNode<Node>) {
  const w = (node.measured.width ?? 0) / 2;
  const h = (node.measured.height ?? 0) / 2;
  const pos = node.internals.positionAbsolute;
  const tPos = target.internals.positionAbsolute;

  const x2 = pos.x + w;
  const y2 = pos.y + h;
  const x1 = tPos.x + (target.measured.width ?? 0) / 2;
  const y1 = tPos.y + (target.measured.height ?? 0) / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1);
  const xx3 = a * xx1;
  const yy3 = a * yy1;

  return { x: w * (xx3 + yy3) + x2, y: h * (-xx3 + yy3) + y2 };
}

function getEdgeParams(source: InternalNode<Node>, target: InternalNode<Node>) {
  const s = getNodeIntersection(source, target);
  const t = getNodeIntersection(target, source);
  return { sx: s.x, sy: s.y, tx: t.x, ty: t.y };
}

function stableHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

export function FloatingEdge({ id, source, target }: EdgeProps) {
  const { current, prev } = useContext(GraphHoverContext);
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode?.measured.width || !targetNode?.measured.width) return null;

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  const pairHash = stableHash(source < target ? source + target : target + source);
  const side = pairHash % 2 === 0 ? 1 : -1;
  const curvature = 0.12 + (Math.abs(pairHash % 100) / 100) * 0.13;
  const offset = Math.max(dist * curvature, 20) * side;
  const px = -dy / dist;
  const py = dx / dist;
  const cx = (sx + tx) / 2 + px * offset;
  const cy = (sy + ty) / 2 + py * offset;

  const pathD = `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
  const pathDReversed = `M ${tx} ${ty} Q ${cx} ${cy} ${sx} ${sy}`;

  const safeId = id.replace(/[^a-zA-Z0-9]/g, "_");
  const shadowId = `es_${safeId}`;

  // This edge fires when the firing node sits on one of its ends, unless the
  // other end is where the signal just came from: that edge stays dim so the
  // cascade never sweeps straight back one layer.
  const otherEnd = current === source ? target : source;
  const isActive = (current === source || current === target) && otherEnd !== prev;
  const isDimmed = current !== null && !isActive;

  const sweepDur = `${(1.1 + dist / 320).toFixed(2)}s`;

  // The sweep always radiates outward from the firing node.
  const firesFromSource = current === source;
  const sweepPath = firesFromSource ? pathD : pathDReversed;
  const emitX = firesFromSource ? sx : tx;
  const emitY = firesFromSource ? sy : ty;

  return (
    <g>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#060e20" floodOpacity="0.5" />
        </filter>
      </defs>

      <path
        d={pathD}
        fill="none"
        stroke={isActive ? "#6ffbbe" : "#adc6ff"}
        strokeWidth={isActive ? 2.5 : 1.5}
        strokeLinecap="round"
        filter={`url(#${shadowId})`}
        style={{
          strokeOpacity: isActive ? 0.9 : isDimmed ? 0.28 : 0.55,
          transition: "stroke 220ms ease, stroke-width 220ms ease, stroke-opacity 220ms ease",
        }}
      />

      {isActive && (
        <path
          d={sweepPath}
          pathLength={100}
          fill="none"
          stroke="#6ffbbe"
          strokeWidth={3}
          strokeLinecap="round"
          className="edge-sweep"
          style={{ animationDuration: sweepDur }}
        />
      )}

      {isActive && (
        <circle cx={emitX} cy={emitY} r={3.5} fill="#4edea3" className="edge-emit" style={{ animationDuration: sweepDur }} />
      )}
    </g>
  );
}
