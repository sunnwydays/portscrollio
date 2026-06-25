"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CloseIcon, ForYouIcon, ExploreIcon, GitCommitIcon, TrendingUpIcon, DumbbellIcon, GitHubIcon, LinkedInIcon, ResumeIcon } from "@/components/icons";
import { ProfileAvatar } from "./ProfileAvatar";

interface StatRow {
  key: string;
  label: string;
  value: string;
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  settings: Record<string, string>;
  stats: StatRow[];
  avatarCategories: string[][];
}

export function MobileDrawer({ open, onClose, settings, stats, avatarCategories }: MobileDrawerProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "For You", icon: ForYouIcon },
    { href: "/explore", label: "Explore", icon: ExploreIcon },
  ];

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-surface-dim/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface-container-low/95 backdrop-blur-[20px] flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Close navigation"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Profile */}
        <div className="px-6 pb-6">
          <div className="relative w-14 h-14 mb-4">
            <ProfileAvatar categories={avatarCategories} />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface-container-low animate-pulse" />
          </div>
          <p className="font-display font-bold text-xl text-on-surface">Sunny</p>
          <p className="text-sm text-on-surface/85 mt-0.5">UofT Computer Engineering</p>
          <p className="text-sm text-primary mt-2 font-medium">{settings.status}</p>
        </div>

        {/* Nav */}
        <nav aria-label="Main navigation" className="px-4 pb-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-linear-to-r from-primary to-primary-container text-on-primary"
                    : "text-on-surface/70 hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Activity Feed */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface/75 mb-4">Activity Feed</p>

          {/* Latest commit */}
          <div className="bg-surface-container rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <GitCommitIcon className="w-4 h-4 text-secondary" />
              <span className="text-[10px] uppercase tracking-widest text-on-surface/75 font-semibold">Last Commit</span>
            </div>
            <p className="text-sm text-primary font-medium leading-snug">&ldquo;{settings.latest_commit}&rdquo;</p>
          </div>

          {/* Stats */}
          {stats.map((stat) => {
            const isProgress = stat.value.includes("%");
            const progressVal = isProgress ? parseInt(stat.value) : 0;

            return (
              <div key={stat.key} className="bg-surface-container rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {isProgress ? (
                    <TrendingUpIcon className="w-4 h-4 text-secondary" />
                  ) : (
                    <DumbbellIcon className="w-4 h-4 text-secondary" />
                  )}
                  <span className="text-[10px] uppercase tracking-widest text-on-surface/75 font-semibold truncate">
                    {stat.label}
                  </span>
                </div>
                {isProgress ? (
                  <div className="space-y-1.5">
                    <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-primary to-primary-container rounded-full"
                        style={{ width: `${progressVal}%` }}
                      />
                    </div>
                    <span className="text-xs text-on-surface/80">{stat.value}</span>
                  </div>
                ) : (
                  <p className="text-2xl font-display font-bold text-on-surface">{stat.value}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Connect */}
        <div className="px-6 py-5 border-t border-outline-variant/20">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface/75 mb-4">Connect</p>
          <div className="flex gap-4">
            {settings.github_url && (
              <a href={settings.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-outline hover:text-primary transition-colors">
                <GitHubIcon className="w-5 h-5" />
              </a>
            )}
            {settings.linkedin_url && (
              <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-outline hover:text-primary transition-colors">
                <LinkedInIcon className="w-5 h-5" />
              </a>
            )}
            {settings.resume_url && (
              <Link href="/resume" aria-label="Resume" onClick={onClose} className="text-outline hover:text-primary transition-colors">
                <ResumeIcon className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
