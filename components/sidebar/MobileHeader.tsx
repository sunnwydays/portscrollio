"use client";

import { useState } from "react";
import { MenuIcon } from "@/components/icons";
import { MobileDrawer } from "./MobileDrawer";
import { ProfileAvatar } from "./ProfileAvatar";

interface MobileHeaderProps {
  settings: Record<string, string>;
  stats: { key: string; label: string; value: string }[];
  avatarCategories: string[][];
}

export function MobileHeader({ settings, stats, avatarCategories }: MobileHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-30 h-14 flex items-center justify-between px-4 bg-surface-variant/60 backdrop-blur-[20px] lg:hidden">
        <div className="flex items-center gap-3">
          <ProfileAvatar categories={avatarCategories} className="w-9 h-9 rounded-xl" />
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm text-on-surface leading-tight">Sunny</span>
            <span className="text-xs text-outline leading-tight">UofT Computer Engineering</span>
          </div>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} settings={settings} stats={stats} avatarCategories={avatarCategories} />
    </>
  );
}
