"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Project } from "@/lib/mock-data";
import { VideoCard } from "./VideoCard";
import { buildPlaylist } from "@/lib/playlist";

interface VideoFeedProps {
  projects: Project[];
  initialPlaylist: Project[];
}

export function VideoFeed({ projects, initialPlaylist }: VideoFeedProps) {
  const [playlist, setPlaylist] = useState(initialPlaylist);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [desktopStackOpen, setDesktopStackOpen] = useState(false);
  const handleDesktopToggleStack = useCallback(() => setDesktopStackOpen((s) => !s), []);
  const indexRef = useRef(0);
  const lockRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDir = useRef(0);
  const syncedRef = useRef(false);
  const count = playlist.length;

  const handleToggleMute = useCallback(() => setMuted((m) => !m), []);

  const go = useCallback(
    (next: number) => {
      if (lockRef.current) return;
      if (next >= count) {
        setPlaylist((prev) => {
          const newBatch = buildPlaylist(projects);
          const lastVideo = prev[prev.length - 1];
          if (newBatch.length >= 2 && lastVideo && newBatch[0].id === lastVideo.id) {
            [newBatch[0], newBatch[1]] = [newBatch[1], newBatch[0]];
          }
          return [...prev, ...newBatch];
        });
        indexRef.current = count;
        setIndex(count);
        lockRef.current = true;
        setTimeout(() => { lockRef.current = false; }, 420);
        return;
      }
      const clamped = Math.max(0, Math.min(count - 1, next));
      if (clamped === indexRef.current) return;
      indexRef.current = clamped;
      setIndex(clamped);
      lockRef.current = true;
      setTimeout(() => { lockRef.current = false; }, 420);
    },
    [count, projects]
  );

  useEffect(() => {
    if (!syncedRef.current) {
      syncedRef.current = true;
      if (window.location.pathname === "/") return;
    }
    const current = playlist[index];
    if (!current) return;
    const target = `/watch/${current.slug ?? current.id}`;
    if (window.location.pathname !== target) {
      window.history.replaceState(null, "", target);
    }
  }, [index, playlist]);

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

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        go(indexRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        go(indexRef.current - 1);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
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
        {playlist.map((project, i) => (
          <VideoCard
            key={i}
            project={project}
            muted={muted}
            onToggleMute={handleToggleMute}
            isFirst={i === 0}
            desktopStackOpen={desktopStackOpen}
            onDesktopToggleStack={handleDesktopToggleStack}
          />
        ))}
      </div>
    </div>
  );
}
