"use client";

import { useState } from "react";
import Image from "next/image";

// ─── Add your image filenames here once uploaded ──────────────────────────────
// Place files under public/avatars/1/, public/avatars/2/, public/avatars/3/
// Example: ["gym.jpg", "desk.jpg"]
const CATEGORIES: string[][] = [
  [], // category 1 — 75%: e.g. casual / everyday photos
  [], // category 2 — 20%: e.g. professional / smart-casual
  [], // category 3 —  5%: e.g. formal / rare/special moments
];

const WEIGHTS = [0.75, 0.20, 0.05];
const SESSION_KEY = "profile_avatar";

function pickSrc(): string | null {
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < CATEGORIES.length; i++) {
    cum += WEIGHTS[i];
    if (r < cum) {
      const imgs = CATEGORIES[i];
      if (imgs.length === 0) return null;
      return `/avatars/${i + 1}/${imgs[Math.floor(Math.random() * imgs.length)]}`;
    }
  }
  return null;
}

export function ProfileAvatar() {
  // Lazy init runs once on the client — reads or writes sessionStorage, no effect needed
  const [src] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) return stored;
    const picked = pickSrc();
    if (picked) sessionStorage.setItem(SESSION_KEY, picked);
    return picked;
  });
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <Image
        src={src}
        alt="Profile photo"
        width={56}
        height={56}
        className="w-14 h-14 rounded-2xl object-cover"
        onError={() => setImgError(true)}
        priority
      />
    );
  }

  return (
    <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-2xl font-display font-bold text-primary">
      S
    </div>
  );
}
