"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Project } from "@/lib/mock-data";
import { GitHubIcon, GlobeIcon, YouTubeIcon, StackIcon, CloseIcon, VolumeOffIcon, VolumeOnIcon, PlayIcon, PauseIcon } from "@/components/icons";

const TECH_ICONS: Record<string, string> = {
  "React":          "/icons/tech/react.png",
  "Next.js":        "/icons/tech/nextjs.svg",
  "TypeScript":     "/icons/tech/typescript.png",
  "JavaScript":     "/icons/tech/javascript.png",
  "Supabase":       "/icons/tech/supabase.webp",
  "PostgreSQL":     "/icons/tech/postgresql.svg",
  "Python":         "/icons/tech/python.png",
  "Node.js":        "/icons/tech/nodejs.png",
  "Tailwind CSS":   "/icons/tech/tailwindcss.png",
  "Firebase":       "/icons/tech/firebase.png",
  "Docker":         "/icons/tech/docker.webp",
  "C":              "/icons/tech/c.png",
  "C++":            "/icons/tech/cpp.png",
  "BambuLab A1":    "/icons/tech/bambulab.webp",
  "Fusion 360":     "/icons/tech/fusion360.png",
};

function getYouTubeId(url: string): string | null {
  return url.match(/(?:shorts\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1] ?? null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ActionButtonsProps {
  project: Project;
  techList: string[];
  labels: boolean;
  dimCircles?: boolean;
  onOpenTech: () => void;
}

function ActionButtons({ project, techList, labels, dimCircles = false, onOpenTech }: ActionButtonsProps) {
  const circleBg = dimCircles ? "bg-black/40" : "bg-surface-container-high/80";
  return (
    <div className="flex flex-col items-center gap-2">
      {project.github_url && (
        <a href={project.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub"
          className="flex flex-col items-center gap-1.5 group">
          <div className={`w-12 h-12 rounded-full ${circleBg} backdrop-blur-[1px] flex items-center justify-center text-on-surface group-hover:text-primary transition-all`}>
            <GitHubIcon className="w-6 h-6" />
          </div>
          {labels && <span className="text-[10px] uppercase tracking-wider text-on-surface/90 group-hover:text-primary transition-colors">GitHub</span>}
        </a>
      )}
      {project.website_url && (
        <a href={project.website_url} target="_blank" rel="noopener noreferrer" aria-label="Website"
          className="flex flex-col items-center gap-1.5 group">
          <div className={`w-12 h-12 rounded-full ${circleBg} backdrop-blur-[1px] flex items-center justify-center text-on-surface group-hover:text-primary transition-all`}>
            <GlobeIcon className="w-6 h-6" />
          </div>
          {labels && <span className="text-[10px] uppercase tracking-wider text-on-surface/90 group-hover:text-primary transition-colors">Site</span>}
        </a>
      )}
      {techList.length > 0 && (
        <button onClick={onOpenTech} aria-label="View tech stack"
          className="flex flex-col items-center gap-1.5 group">
          <div className={`w-12 h-12 rounded-full ${circleBg} backdrop-blur-[1px] flex items-center justify-center text-on-surface group-hover:text-primary transition-all`}>
            <StackIcon className="w-6 h-6" />
          </div>
          {labels && <span className="text-[10px] uppercase tracking-wider text-on-surface/90 group-hover:text-primary transition-colors">Stack</span>}
        </button>
      )}
      {project.video_url && (
        <a href={project.video_url} target="_blank" rel="noopener noreferrer" aria-label="Watch on YouTube"
          className="flex flex-col items-center gap-1.5 group">
          <div className={`w-12 h-12 rounded-full ${circleBg} backdrop-blur-[1px] flex items-center justify-center text-on-surface group-hover:text-primary transition-all`}>
            <YouTubeIcon className="w-6 h-6" />
          </div>
          {labels && <span className="text-[10px] uppercase tracking-wider text-on-surface/90 group-hover:text-primary transition-colors">Video</span>}
        </a>
      )}
    </div>
  );
}

interface TechPanelContentProps {
  techList: string[];
  onClose: () => void;
}

function TechPanelContent({ techList, onClose }: TechPanelContentProps) {
  return (
    <>
      <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
        <h3 className="font-display font-bold text-on-surface">Tech Stack</h3>
        <button onClick={onClose} aria-label="Close tech stack"
          className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors">
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 flex flex-wrap gap-2">
        {techList.map((t) => {
          const icon = TECH_ICONS[t];
          return (
            <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-secondary text-sm font-medium">
              {icon && (
                <span className="relative w-4 h-4 shrink-0 inline-block">
                  <Image src={icon} alt="" aria-hidden={true} fill sizes="16px" style={{ objectFit: "contain" }} />
                </span>
              )}
              {t}
            </span>
          );
        })}
      </div>
    </>
  );
}

// ─── VideoCard ────────────────────────────────────────────────────────────────

interface VideoCardProps {
  project: Project;
  muted: boolean;
  onToggleMute: () => void;
  isNext?: boolean;
  isFirst?: boolean;
  desktopStackOpen?: boolean;
  onDesktopToggleStack?: () => void;
}

export function VideoCard({ project, muted, onToggleMute, isNext = false, isFirst = false, desktopStackOpen = false, onDesktopToggleStack }: VideoCardProps) {
  const [techOpen, setTechOpen] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [showPauseHint, setShowPauseHint] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const articleRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pauseHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapStartRef = useRef<{ y: number; time: number } | null>(null);
  const isNextRef = useRef(false);
  const [hintPhase, setHintPhase] = useState<"expanded" | "collapsed">("expanded");
  const hintStartedRef = useRef(false);

  const techList = (project.tech ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  const hashtags = (project.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  const videoId = project.video_url ? getYouTubeId(project.video_url) : null;
  const videoLoaded = loadedKey === "loaded";
  const currentTimeRef = useRef<number>(0);
  const [embedConfig, setEmbedConfig] = useState<{ mute: 0 | 1; start: number }>(() => ({ mute: muted ? 1 : 0, start: 0 }));


  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // shouldMountIframe: pre-mount while next in queue, keep mounted while active
  const shouldMountIframe = isInView || isNext;

  // Observe when card enters/leaves viewport
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Reset so a new iframe always waits for its own onLoad before showing
          setLoadedKey(null);
        } else {
          setIsInView(false);
          if (!isNextRef.current) {
            setLoadedKey(null);
            setPaused(false);
          }
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keep isNextRef in sync so the observer closure sees the latest value
  useEffect(() => {
    isNextRef.current = isNext;
  }, [isNext]);

  // Auto-collapse unmute hint rectangle → square after 3s (fires once per card)
  useEffect(() => {
    if (!isInView || !muted || hintStartedRef.current) return;
    hintStartedRef.current = true;
    const t = setTimeout(() => setHintPhase("collapsed"), 3000);
    return () => clearTimeout(t);
  }, [isInView, muted]);

  // Subscribe to YouTube infoDelivery events to track current time for AV resync on unmute
  useEffect(() => {
    if (!videoLoaded || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: "listening" }),
      "https://www.youtube.com"
    );
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== "https://www.youtube.com") return;
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.event === "infoDelivery" && typeof data?.info?.currentTime === "number") {
          currentTimeRef.current = data.info.currentTime;
        }
      } catch {
        // ignore malformed messages
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [videoLoaded]);

  // Sync mute state via postMessage. Reload-with-mute=0 case is handled in handleUnmute below.
  useEffect(() => {
    if (!videoLoaded || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: muted ? "mute" : "unMute", args: [] }),
      "https://www.youtube.com"
    );
  }, [muted, videoLoaded]);

  // First unmute on a card that was mounted muted: reload iframe with mute=0&start={t} so audio
  // and video boot together. postMessage unMute alone leaves audio trailing on mobile because the
  // audio decoder spins up cold. Subsequent toggles use the postMessage effect above (decoder warm).
  const handleUnmute = useCallback(() => {
    if (muted && embedConfig.mute === 1) {
      setLoadedKey(null);
      setEmbedConfig({ mute: 0, start: Math.floor(currentTimeRef.current) });
    }
    onToggleMute();
  }, [muted, embedConfig.mute, onToggleMute]);

  // Sync pause state via YouTube postMessage API
  useEffect(() => {
    if (!videoLoaded || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: paused ? "pauseVideo" : "playVideo", args: [] }),
      "https://www.youtube.com"
    );
  }, [paused, videoLoaded]);

  const togglePaused = () => {
    if (!videoLoaded) return;
    setPaused((p) => !p);
    setShowPauseHint(true);
    if (pauseHintTimer.current) clearTimeout(pauseHintTimer.current);
    pauseHintTimer.current = setTimeout(() => setShowPauseHint(false), 700);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    tapStartRef.current = { y: e.touches[0].clientY, time: Date.now() };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!tapStartRef.current) return;
    const dy = Math.abs(e.changedTouches[0].clientY - tapStartRef.current.y);
    const dt = Date.now() - tapStartRef.current.time;
    tapStartRef.current = null;
    if (dy < 10 && dt < 300) {
      e.preventDefault();
      togglePaused();
    }
  };

  const embedSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${embedConfig.mute}&loop=1&playlist=${videoId}${embedConfig.start > 0 ? `&start=${embedConfig.start}` : ""}&controls=0&modestbranding=1&playsinline=1&enablejsapi=1`
    : null;

  const bgContent = (
    <>
      {/* Gradient — base layer / loading fallback */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(160deg, ${project.bg_from} 0%, ${project.bg_to} 100%)` }}
        aria-hidden="true"
      />

      {/* YouTube thumbnail — loads before the iframe, eliminates gradient flash */}
      {videoId && (
        <Image
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt=""
          fill
          sizes="(min-width: 1024px) 54vh, 100vw"
          className="object-cover"
          aria-hidden={true}
          priority={isFirst}
        />
      )}

      {/* Radial glow overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${project.bg_to}, transparent)` }}
        aria-hidden="true"
      />

      {/* Click-to-pause overlay */}
      <div
        className="block absolute inset-0 z-15 lg:cursor-pointer"
        onClick={togglePaused}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={paused ? "Play" : "Pause"}
        role="button"
      />

      {/* Pause/play hint — fades out after tap */}
      <div
        className={`absolute inset-0 z-16 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${showPauseHint ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
      >
        <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
          {paused
            ? <PlayIcon className="w-8 h-8 text-white ml-1" />
            : <PauseIcon className="w-8 h-8 text-white" />}
        </div>
      </div>

      {/* Bottom scrim for text legibility — mobile only */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none lg:hidden"
        style={{ background: "linear-gradient(to top, #0b1326 0%, rgba(11,19,38,0.5) 55%, transparent 100%)" }}
        aria-hidden="true"
      />

      {/* Text overlay — mobile only; desktop shows title/tags in side panel */}
      <div
        className="absolute bottom-0 left-0 right-0 pl-5 pr-20 pt-6 pb-20 z-10 lg:hidden"
        style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.67) 100%)" }}
      >
        <h2 className="font-display font-bold text-lg lg:text-xl text-on-surface leading-tight tracking-tight filter-[drop-shadow(0_2px_12px_black)_drop-shadow(0_4px_24px_rgba(0,0,0,0.9))]">
          {project.title}
        </h2>
        {(hashtags.length > 0 || project.is_hobby) && (
          <p className="text-on-surface text-sm font-bold mt-1">
            {[...hashtags, ...(project.is_hobby ? ["hobby"] : [])].map((t) => `#${t.toLowerCase()}`).join(" ")}
          </p>
        )}
      </div>
    </>
  );

  return (
    <article ref={articleRef} className="h-dvh bg-surface-dim">

      {/* ─── Mobile: full-screen ─────────────────────────────────────────── */}
      <div className="lg:hidden h-full relative overflow-hidden">
        {isDesktop === false && embedSrc && shouldMountIframe && (
          <iframe
            ref={iframeRef}
            src={embedSrc}
            className={`absolute inset-0 w-full h-full pointer-events-none z-2 transition-opacity duration-700 ${videoLoaded && isInView ? "opacity-100" : "opacity-0"}`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ border: 0 }}
            title={project.title}
            onLoad={() => setLoadedKey("loaded")}
          />
        )}
        {bgContent}

        {/* Volume button, top-left of video (mobile), disappears on unmute */}
        {muted && (
          <button onClick={handleUnmute} aria-label="Unmute" className="absolute top-18 left-4 z-40">
            <div className="flex items-center bg-white rounded-xs p-3">
              <VolumeOffIcon className="w-7 h-7 text-black shrink-0" />
              <span className={`whitespace-nowrap text-[15px] font-bold uppercase tracking-wider text-black overflow-hidden transition-all duration-400 ${hintPhase === "expanded" ? "max-w-45 ml-3 opacity-100" : "max-w-0 ml-0 opacity-0"}`}>
                Tap to unmute
              </span>
            </div>
          </button>
        )}

        <div className="absolute right-2 bottom-28 z-20">
          <ActionButtons
            project={project}
            techList={techList}
            labels={false}
            dimCircles
            onOpenTech={() => setTechOpen((o) => !o)}
          />
        </div>

        {/* Backdrop */}
        <div
          className={`absolute inset-0 z-20 transition-opacity duration-300 ${techOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={() => setTechOpen(false)}
          aria-hidden="true"
        />
        {/* Slide-up tray */}
        <div
          className={`absolute bottom-14 inset-x-0 z-30 bg-surface-container-low/95 backdrop-blur-[20px] rounded-t-2xl transition-transform duration-300 ease-out ${techOpen ? "translate-y-0" : "translate-y-full"}`}
        >
          <TechPanelContent techList={techList} onClose={() => setTechOpen(false)} />
        </div>
      </div>

      {/* ─── Desktop: 16:9 video + side ─────────────────────────────────── */}
      <div className="hidden lg:grid h-full grid-cols-[1fr_auto_1fr] items-center">

        {/* Left side, title + tags, fills space from sidebar to video */}
        <div className="flex flex-col justify-end self-stretch pb-14 px-10">
          <h2 className="font-display font-bold text-xl text-on-surface leading-tight tracking-tight">
            {project.title}
          </h2>
          {(hashtags.length > 0 || project.is_hobby) && (
            <p className="text-on-surface/80 text-sm font-bold mt-1">
              {[...hashtags, ...(project.is_hobby ? ["hobby"] : [])].map((t) => `#${t.toLowerCase()}`).join(" ")}
            </p>
          )}
        </div>

        {/* Center — video + action buttons grouped so the pair is what gets centered */}
        <div className="flex h-full items-center gap-4">

          {/* 9:16 video frame — matches vertical short format */}
          <div className="group relative h-[96dvh] aspect-9/16 rounded-2xl overflow-hidden ring-1 ring-outline-variant/15 shrink-0">
            {isDesktop === true && embedSrc && shouldMountIframe && (
              <iframe
                ref={iframeRef}
                src={embedSrc}
                className={`absolute inset-0 w-full h-full pointer-events-none z-2 transition-opacity duration-700 ${videoLoaded && isInView ? "opacity-100" : "opacity-0"}`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ border: 0 }}
                title={project.title}
                onLoad={() => setLoadedKey("loaded")}
              />
            )}
            {bgContent}

            {/* Volume button — top-left of video (desktop) */}
            <button
              onClick={handleUnmute}
              aria-label={muted ? "Unmute" : "Mute"}
              className={`absolute top-7 left-7 z-20 transition-opacity duration-150 ${muted ? "opacity-100" : (paused ? "opacity-100" : "opacity-0 group-hover:opacity-100")}`}
            >
              {muted ? (
                <div className="flex items-center bg-white rounded-xs p-3">
                  <VolumeOffIcon className="w-7 h-7 text-black shrink-0" />
                  <span className={`whitespace-nowrap text-[15px] font-bold uppercase tracking-wider text-black overflow-hidden transition-all duration-400 ${hintPhase === "expanded" ? "max-w-45 ml-3 opacity-100" : "max-w-0 ml-0 opacity-0"}`}>
                    Tap to unmute
                  </span>
                </div>
              ) : (
                <VolumeOnIcon className="w-9 h-9 text-white" />
              )}
            </button>
          </div>

          {/* Action buttons — always visible, tech panel slides in beside them */}
          <div className="self-stretch flex items-end pb-6 gap-4 shrink-0">
            <ActionButtons
              project={project}
              techList={techList}
              labels={true}
              onOpenTech={() => onDesktopToggleStack?.()}
            />
            {/* Slide-out panel */}
            <div
              className={`bg-surface-container-low rounded-2xl overflow-hidden transition-[max-width,opacity] duration-300 ease-out ${desktopStackOpen && techList.length > 0 ? "max-w-64 opacity-100" : "max-w-0 opacity-0 pointer-events-none"}`}
            >
              <div className="w-64">
                <TechPanelContent techList={techList} onClose={() => onDesktopToggleStack?.()} />
              </div>
            </div>
          </div>

        </div>

        {/* Empty right column — balances the left so the center group is truly centered */}
        <div aria-hidden="true" />

      </div>
    </article>
  );
}
