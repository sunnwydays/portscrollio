"use client";

import { useState } from "react";
import { MenuIcon } from "@/components/icons";
import { MobileDrawer } from "./MobileDrawer";

export function MobileHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-30 h-14 flex items-center justify-between px-4 bg-surface-variant/60 backdrop-blur-[20px] lg:hidden">
        <span className="font-display font-bold text-on-surface">
          Sunny <span className="text-outline font-normal">• UofT</span>
        </span>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
