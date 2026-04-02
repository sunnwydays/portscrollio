"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForYouIcon, ExploreIcon } from "@/components/icons";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "For You", icon: ForYouIcon },
    { href: "/explore", label: "Explore", icon: ExploreIcon },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 inset-x-0 z-30 h-14 bg-surface-variant/60 backdrop-blur-[20px] border-t border-outline-variant/15 flex lg:hidden"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
              isActive ? "text-primary" : "text-outline hover:text-on-surface"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
