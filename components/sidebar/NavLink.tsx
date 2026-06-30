"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function NavLink({ href, icon, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
        isActive
          ? "bg-linear-to-r from-primary to-primary-container text-on-primary shadow-[0_2px_14px_rgba(78,222,163,0.35)]"
          : "text-on-surface/70 hover:text-on-surface hover:bg-surface-container"
      }`}
    >
      <span className="w-5 h-5 shrink-0">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
