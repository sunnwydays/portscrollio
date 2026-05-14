"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Project } from "@/lib/mock-data";
import { GitHubIcon, YouTubeIcon, StackIcon, CloseIcon, VolumeOffIcon, VolumeOnIcon, PlayIcon, PauseIcon } from "@/components/icons";

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
  muted: boolean;
  showUnmuteHint: boolean;
  onOpenTech: () => void;
  onToggleMute: () => void;
}

function ActionButtons({ project, techList, labels, muted, showUnmuteHint, onOpenTech, onToggleMute }: ActionButtonsProps) {
  return (
    <div className="flex flex-col items-center gap-7">
      {project.github_url && (
        <a href={project.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub"
          className="flex flex-col items-center gap-1.5 group">
          <div className="w-12 h-12 rounded-full bg-surface-container-high/80 backdrop-blur-sm flex items-center justify-center text-on-surface group-hover:text-primary transition-all">
            <GitHubIcon className="w-5 h-5" />
          </div>
          {labels && <span className="text-[10px] uppercase tracking-wider text-on-surface/50 group-hover:text-primary transition-colors">GitHub</span>}
        </a>
      )}
      {project.video_url && (
        <a href={project.video_url} target="_blank" rel="noopener noreferrer" aria-label="Watch on YouTube"
          className="flex flex-col items-center gap-1.5 group">
          <div className="w-12 h-12 rounded-full bg-surface-container-high/80 backdrop-blur-sm flex items-center justify-center text-on-surface group-hover:text-primary transition-all">
            <YouTubeIcon className="w-5 h-5" />
          </div>
          {labels && <span className="text-[10px] uppercase tracking-wider text-on-surface/50 group-hover:text-primary transition-colors">Video</span>}
        </a>
      )}
      {techList.length > 0 && (
        <button onClick={onOpenTech} aria-label="View tech stack"
          className="flex flex-col items-center gap-1.5 group">
          <div className="w-12 h-12 rounded-full bg-surface-container-high/80 backdrop-blur-sm flex items-center justify-center text-on-surface group-hover:text-primary transition-all">
            <StackIcon className="w-5 h-5" />
          </div>
          {labels && <span className="text-[10px] uppercase tracking-wider text-on-surface/50 group-hover:text-primary transition-colors">Stack</span>}
        </button>
      )}
      <div className="relative">
        <button onClick={onToggleMute} aria-label={muted ? "Unmute" : "Mute"}
          className="flex flex-col items-center gap-1.5 group">
          <div className={`w-12 h-12 rounded-full bg-surface-container-high/80 backdrop-blur-sm flex items-center justify-center transition-all ${muted ? "text-outline group-hover:text-primary" : "text-primary"}`}>
            {muted ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeOnIcon className="w-5 h-5" />}
          </div>
          {labels && <span className="text-[10px] uppercase tracking-wider text-on-surface/50 group-hover:text-primary transition-colors">{muted ? "Sound" : "Mute"}</span>}
        </button>
        {showUnmuteHint && (
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 flex items-center gap-2 pointer-events-none animate-bounce">
            <span className="text-[10px] font-semibold text-primary bg-surface-container-high/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg whitespace-nowrap uppercase tracking-wider">
              Tap to unmute
            </span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-primary flex-shrink-0">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </div>
        )}
      </div>
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
              {icon && <Image src={icon} alt="" aria-hidden={true} width={16} height={16} className="shrink-0" />}
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
  showUnmuteHint: boolean;
}

export function VideoCard({ project, muted, onToggleMute, showUnmuteHint }: VideoCardProps) {
  const [techOpen, setTechOpen] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [showPauseHint, setShowPauseHint] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const articleRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pauseHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Observe when card enters/leaves viewport
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (!entry.isIntersecting) {
          setLoadedKey(null);
          setPaused(false);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

      {/* Radial glow overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${project.bg_to}, transparent)` }}
        aria-hidden="true"
      />

      {/* Click-to-pause overlay — desktop only; mobile YouTube iframe can't freeze frames */}
      <div
        className="hidden lg:block absolute inset-0 z-15 cursor-pointer"
        onClick={togglePaused}
        aria-label={paused ? "Play" : "Pause"}
        role="button"
      />

      {/* Pause/play hint — fades out after tap */}
      <div
        className={`absolute inset-0 z-16 hidden lg:flex items-center justify-center pointer-events-none transition-opacity duration-500 ${showPauseHint ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
      >
        <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
          {paused
            ? <PlayIcon className="w-8 h-8 text-white ml-1" />
            : <PauseIcon className="w-8 h-8 text-white" />}
        </div>
      </div>

      {/* Bottom scrim for text legibility */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{ background: "linear-gradient(to top, #0b1326 0%, rgba(11,19,38,0.5) 55%, transparent 100%)" }}
        aria-hidden="true"
      />

      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 right-0 pl-5 pr-20 lg:px-5 pb-20 lg:pb-8 z-10">
        <div className="flex flex-wrap gap-2 mb-3">
          {hashtags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-full bg-surface-container-high/80 backdrop-blur-sm text-secondary text-[10px] font-semibold uppercase tracking-wider">
              {tag}
            </span>
          ))}
          {project.is_hobby && (
            <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider">
              Hobby
            </span>
          )}
        </div>
        <h2 className="font-display font-bold text-2xl text-on-surface leading-tight tracking-tight">
          {project.title}
        </h2>
        <p className="mt-1.5 text-xs text-on-surface/70 leading-relaxed line-clamp-2">
          {project.description}
        </p>
      </div>
    </>
  );

  return (
    <article ref={articleRef} className="h-dvh bg-surface">

      {/* ─── Mobile: full-screen ─────────────────────────────────────────── */}
      <div className="lg:hidden h-full relative overflow-hidden">
        {isDesktop === false && embedSrc && isInView && (
          <iframe
            ref={iframeRef}
            src={embedSrc}
            className={`absolute inset-0 w-full h-full pointer-events-none z-2 transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ border: 0 }}
            title={project.title}
            onLoad={() => setLoadedKey("loaded")}
          />
        )}
        {bgContent}

        <div className="absolute right-4 bottom-28 z-20">
          <ActionButtons
            project={project}
            techList={techList}
            labels={false}
            muted={muted}
            showUnmuteHint={showUnmuteHint && isInView}
            onOpenTech={() => setTechOpen(true)}
            onToggleMute={handleUnmute}
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
      <div className="hidden lg:flex h-full items-center justify-center gap-8">

        {/* 9:16 video frame — matches vertical short format */}
        <div className="relative h-[85dvh] aspect-9/16 rounded-2xl overflow-hidden ring-1 ring-outline-variant/15 shrink-0">
          {isDesktop === true && embedSrc && isInView && (
            <iframe
              ref={iframeRef}
              src={embedSrc}
              className={`absolute inset-0 w-full h-full pointer-events-none z-2 transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ border: 0 }}
              title={project.title}
              onLoad={() => setLoadedKey("loaded")}
            />
          )}
          {bgContent}
        </div>

        {/* Right side — buttons always visible, tech panel slides in beside them */}
        <div className="self-stretch flex items-end pb-24 gap-4 shrink-0">
          <ActionButtons
            project={project}
            techList={techList}
            labels={true}
            muted={muted}
            showUnmuteHint={showUnmuteHint && isInView}
            onOpenTech={() => setTechOpen(true)}
            onToggleMute={handleUnmute}
          />
          {/* Slide-out panel */}
          <div
            className={`bg-surface-container-low rounded-2xl overflow-hidden transition-[max-width,opacity] duration-300 ease-out ${techOpen ? "max-w-64 opacity-100" : "max-w-0 opacity-0 pointer-events-none"}`}
          >
            <div className="w-64">
              <TechPanelContent techList={techList} onClose={() => setTechOpen(false)} />
            </div>
          </div>
        </div>

      </div>
    </article>
  );
}
