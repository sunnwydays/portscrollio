"use client";

import { useState } from "react";
import { Project } from "@/lib/mock-data";
import { GitHubIcon, YouTubeIcon, StackIcon, CloseIcon } from "@/components/icons";

// ─── Sub-components (module-level to satisfy react-hooks/static-components) ──

interface ActionButtonsProps {
  project: Project;
  techList: string[];
  labels: boolean;
  onOpenTech: () => void;
}

function ActionButtons({ project, techList, labels, onOpenTech }: ActionButtonsProps) {
  return (
    <div className="flex flex-col items-center gap-7">
      {project.githubUrl && (
        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub"
          className="flex flex-col items-center gap-1.5 group">
          <div className="w-12 h-12 rounded-full bg-surface-container-high/80 backdrop-blur-sm flex items-center justify-center text-on-surface group-hover:text-primary transition-all">
            <GitHubIcon className="w-5 h-5" />
          </div>
          {labels && <span className="text-[10px] uppercase tracking-wider text-on-surface/50 group-hover:text-primary transition-colors">GitHub</span>}
        </a>
      )}
      {project.videoUrl && (
        <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" aria-label="Watch demo"
          className="flex flex-col items-center gap-1.5 group">
          <div className="w-12 h-12 rounded-full bg-surface-container-high/80 backdrop-blur-sm flex items-center justify-center text-on-surface group-hover:text-primary transition-all">
            <YouTubeIcon className="w-5 h-5" />
          </div>
          {labels && <span className="text-[10px] uppercase tracking-wider text-on-surface/50 group-hover:text-primary transition-colors">Demo</span>}
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
        {techList.map((t) => (
          <span key={t} className="px-3 py-1.5 rounded-full bg-surface-container-high text-secondary text-sm font-medium">
            {t}
          </span>
        ))}
      </div>
    </>
  );
}

// ─── VideoCard ────────────────────────────────────────────────────────────────

interface VideoCardProps {
  project: Project;
}

export function VideoCard({ project }: VideoCardProps) {
  const [techOpen, setTechOpen] = useState(false);
  const techList = project.tech.split(",").map((t) => t.trim()).filter(Boolean);
  const hashtags = project.tags.split(",").map((t) => t.trim());

  const bgContent = (
    <>
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(160deg, ${project.bgFrom} 0%, ${project.bgTo} 100%)` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${project.bgTo}, transparent)` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{ background: "linear-gradient(to top, #0b1326 0%, rgba(11,19,38,0.5) 55%, transparent 100%)" }}
        aria-hidden="true"
      />
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 z-10">
        <div className="flex flex-wrap gap-2 mb-3">
          {hashtags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-full bg-surface-container-high/80 backdrop-blur-sm text-secondary text-[10px] font-semibold uppercase tracking-wider">
              {tag}
            </span>
          ))}
          {project.isHobby && (
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
    <article className="h-dvh bg-surface">

      {/* ─── Mobile: full-screen ─────────────────────────────────────────── */}
      <div className="lg:hidden h-full relative overflow-hidden">
        {bgContent}

        <div className="absolute right-4 bottom-28 z-10">
          <ActionButtons
            project={project}
            techList={techList}
            labels={false}
            onOpenTech={() => setTechOpen(true)}
          />
        </div>

        {techOpen && (
          <>
            <div className="absolute inset-0 z-20" onClick={() => setTechOpen(false)} aria-hidden="true" />
            <div className="absolute bottom-0 inset-x-0 z-30 bg-surface-container-low/95 backdrop-blur-[20px] rounded-t-2xl">
              <TechPanelContent techList={techList} onClose={() => setTechOpen(false)} />
            </div>
          </>
        )}
      </div>

      {/* ─── Desktop: phone frame + side ─────────────────────────────────── */}
      <div className="hidden lg:flex h-full items-center justify-center gap-8">

        {/* Phone frame */}
        <div className="relative h-[90dvh] w-[min(400px,40vw)] rounded-[2.5rem] overflow-hidden ring-1 ring-outline-variant/15 shrink-0">
          {bgContent}
        </div>

        {/* Right side */}
        <div className="h-[90dvh] flex items-end pb-16 shrink-0">
          {techOpen ? (
            <div className="w-64 bg-surface-container-low rounded-2xl overflow-hidden ring-1 ring-outline-variant/15">
              <TechPanelContent techList={techList} onClose={() => setTechOpen(false)} />
            </div>
          ) : (
            <ActionButtons
              project={project}
              techList={techList}
              labels={true}
              onOpenTech={() => setTechOpen(true)}
            />
          )}
        </div>

      </div>
    </article>
  );
}
