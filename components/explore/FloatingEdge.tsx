"use client";

import {
  useInternalNode,
  type EdgeProps,
  type InternalNode,
  type Node,
} from "@xyflow/react";

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
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode?.measured.width || !targetNode?.measured.width) return null;

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  const hash = stableHash(id);
  // Derive curve direction and magnitude from the unordered node pair so
  // reciprocal edges (A->B and B->A) trace the exact same arc and overlap
  // cleanly instead of forming a messy doubled line.
  const pairHash = stableHash(source < target ? source + target : target + source);
  // The perpendicular vector flips when source/target swap, so to land both
  // reciprocal edges on the same arc, side must flip with direction too. The
  // pairHash term just picks which way the shared arc bends.
  const dirSign = source < target ? 1 : -1;
  const side = dirSign * (pairHash % 2 === 0 ? 1 : -1);
  const curvature = 0.12 + (Math.abs(pairHash % 100) / 100) * 0.13;
  const offset = Math.max(dist * curvature, 20) * side;
  const px = -dy / dist;
  const py = dx / dist;
  const cx = (sx + tx) / 2 + px * offset;
  const cy = (sy + ty) / 2 + py * offset;

  const pathD = `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;

  const angle = Math.atan2(ty - cy, tx - cx) * (180 / Math.PI);

  const safeId = id.replace(/[^a-zA-Z0-9]/g, "_");
  const gradId = `eg_${safeId}`;
  const shadowId = `es_${safeId}`;

  const dur = 2.2 + dist / 180;
  const durStr = `${dur.toFixed(1)}s`;
  const p2Begin = `${(dur * 0.4).toFixed(1)}s`;
  const p3Begin = `${(dur * 0.7).toFixed(1)}s`;

  const glowDelay = `${(Math.abs(hash) % 25) / 10}s`;

  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1={sx} y1={sy} x2={tx} y2={ty} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4edea3" />
          <stop offset="50%" stopColor="#6ffbbe" />
          <stop offset="100%" stopColor="#adc6ff" />
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#060e20" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Core line with a soft drop shadow for depth */}
      <path d={pathD} fill="none" stroke={`url(#${gradId})`} strokeWidth={2} strokeOpacity={0.8} filter={`url(#${shadowId})`} />

      {/* Energy flow: animated dashes traveling along the curve */}
      <path d={pathD} fill="none" stroke={`url(#${gradId})`} strokeWidth={2} className="edge-energy" />

      {/* Source connection pulse */}
      <circle cx={sx} cy={sy} r={3} fill="#4edea3" className="edge-node-pulse" style={{ animationDelay: glowDelay }} />

      {/* Arrow at target */}
      <g transform={`translate(${tx} ${ty}) rotate(${angle})`}>
        <circle r={5} fill="#adc6ff" opacity={0.12} />
        <path d="M -11 -7.5 L 0 0 L -11 7.5" fill="none" stroke="#adc6ff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      </g>

      {/* Particle 1: green, largest */}
      <g className="edge-particle">
        <animateMotion dur={durStr} repeatCount="indefinite" path={pathD} />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur={durStr} repeatCount="indefinite" />
        <circle r={6} fill="#4edea3" opacity={0.15} />
        <circle r={2.5} fill="#4edea3" />
      </g>

      {/* Particle 2: blue, medium */}
      <g className="edge-particle">
        <animateMotion dur={durStr} repeatCount="indefinite" path={pathD} begin={p2Begin} />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur={durStr} repeatCount="indefinite" begin={p2Begin} />
        <circle r={4} fill="#adc6ff" opacity={0.12} />
        <circle r={2} fill="#adc6ff" />
      </g>

      {/* Particle 3: mint, smallest */}
      <g className="edge-particle">
        <animateMotion dur={durStr} repeatCount="indefinite" path={pathD} begin={p3Begin} />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur={durStr} repeatCount="indefinite" begin={p3Begin} />
        <circle r={3} fill="#6ffbbe" opacity={0.1} />
        <circle r={1.5} fill="#6ffbbe" />
      </g>
    </g>
  );
}
