"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Project } from "@/lib/mock-data";
import { VideoCard } from "./VideoCard";

interface VideoFeedProps {
  projects: Project[];
}

export function VideoFeed({ projects }: VideoFeedProps) {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const indexRef = useRef(0);
  const lockRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDir = useRef(0);
  const count = projects.length;

  const go = useCallback(
    (next: number) => {
      if (lockRef.current) return;
      const clamped = Math.max(0, Math.min(count - 1, next));
      if (clamped === indexRef.current) return;
      indexRef.current = clamped;
      setIndex(clamped);
      lockRef.current = true;
      setTimeout(() => { lockRef.current = false; }, 420);
    },
    [count]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      pendingDir.current = e.deltaY > 0 ? 1 : -1;
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => {
        go(indexRef.current + pendingDir.current);
        wheelTimer.current = null;
      }, 100);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 40) return;
      go(indexRef.current + (dy > 0 ? 1 : -1));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
    };
  }, [go]);

  return (
    <div ref={containerRef} className="h-dvh overflow-hidden">
      <div
        className="will-change-transform"
        style={{
          transform: `translateY(calc(${index} * -100dvh))`,
          transition: "transform 350ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {projects.map((project) => (
          <VideoCard
            key={project.id}
            project={project}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
          />
        ))}
      </div>
    </div>
  );
}
