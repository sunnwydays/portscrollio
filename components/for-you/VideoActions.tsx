"use client";

import { useState } from "react";
import { GitHubIcon, YouTubeIcon, StackIcon, CloseIcon } from "@/components/icons";

interface VideoActionsProps {
  githubUrl: string;
  videoUrl: string;
  tech: string; // comma-separated
}

export function VideoActions({ githubUrl, videoUrl, tech }: VideoActionsProps) {
  const [techOpen, setTechOpen] = useState(false);
  const techList = tech.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <>
      {/* Right-side action buttons */}
      <div className="absolute right-4 bottom-32 lg:bottom-40 flex flex-col items-center gap-6 z-10">
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on GitHub"
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-11 h-11 rounded-full bg-surface-container-high/80 backdrop-blur-sm flex items-center justify-center text-on-surface group-hover:text-primary group-hover:bg-surface-container-highest transition-all">
              <GitHubIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-on-surface/60 group-hover:text-primary transition-colors hidden lg:block">
              GitHub
            </span>
          </a>
        )}

        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Watch demo"
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-11 h-11 rounded-full bg-surface-container-high/80 backdrop-blur-sm flex items-center justify-center text-on-surface group-hover:text-primary group-hover:bg-surface-container-highest transition-all">
              <YouTubeIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-on-surface/60 group-hover:text-primary transition-colors hidden lg:block">
              Demo
            </span>
          </a>
        )}

        {techList.length > 0 && (
          <button
            onClick={() => setTechOpen(true)}
            aria-label="View tech stack"
            aria-expanded={techOpen}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-11 h-11 rounded-full bg-surface-container-high/80 backdrop-blur-sm flex items-center justify-center text-on-surface group-hover:text-primary group-hover:bg-surface-container-highest transition-all">
              <StackIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-on-surface/60 group-hover:text-primary transition-colors hidden lg:block">
              Stack
            </span>
          </button>
        )}
      </div>

      {/* Tech panel — slides in from right on desktop, bottom on mobile */}
      {techOpen && (
        <>
          <div
            className="absolute inset-0 z-20"
            onClick={() => setTechOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 inset-x-0 lg:inset-x-auto lg:right-0 lg:inset-y-0 lg:w-72 z-30 bg-surface-container-low/95 backdrop-blur-[20px] flex flex-col rounded-t-2xl lg:rounded-none">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
              <h3 className="font-display font-bold text-on-surface">Tech Stack</h3>
              <button
                onClick={() => setTechOpen(false)}
                aria-label="Close tech stack"
                className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-wrap gap-2">
              {techList.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-full bg-surface-container-high text-secondary text-sm font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
