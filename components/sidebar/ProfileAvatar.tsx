"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const WEIGHTS = [0.75, 0.20, 0.05];
const SESSION_KEY = "profile_avatar";
const DEFAULT_SRC = "/avatars/1/autoronto.JPG";

function pickSrc(categories: string[][]): string | null {
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < categories.length; i++) {
    cum += WEIGHTS[i];
    if (r < cum) {
      const imgs = categories[i];
      if (imgs.length === 0) return null;
      return `/avatars/${i + 1}/${imgs[Math.floor(Math.random() * imgs.length)]}`;
    }
  }
  return null;
}

function getOrPickSrc(categories: string[][]): string | null {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) return stored;
  const picked = pickSrc(categories);
  if (picked) sessionStorage.setItem(SESSION_KEY, picked);
  return picked;
}

interface ProfileAvatarProps {
  categories: string[][];
  className?: string;
  postSlugs?: string[];
}

export function ProfileAvatar({ categories, className = "w-14 h-14 rounded-2xl", postSlugs }: ProfileAvatarProps) {
  const router = useRouter();
  // useSyncExternalStore: server snapshot = null (avoids hydration mismatch),
  // client snapshot = sessionStorage value or a freshly picked image.
  const src = useSyncExternalStore(
    () => () => {},
    () => getOrPickSrc(categories),
    () => null
  );
  const [pickedError, setPickedError] = useState(false);
  const [defaultError, setDefaultError] = useState(false);
  const [pickedVisible, setPickedVisible] = useState(false);

  function handleClick() {
    if (!postSlugs || postSlugs.length === 0) return;
    console.log("you found an easter egg!");
    const slug = postSlugs[Math.floor(Math.random() * postSlugs.length)];
    router.push(`/explore/${slug}`);
  }

  const clickable = postSlugs && postSlugs.length > 0;
  const wrapperProps = clickable
    ? { onClick: handleClick, role: "button" as const, tabIndex: 0, className: "cursor-pointer" }
    : {};

  const showPicked = src && !pickedError;

  const image = (
    <div className="relative">
      {!defaultError ? (
        <Image
          src={DEFAULT_SRC}
          alt="Profile photo"
          width={56}
          height={56}
          className={`${className} object-cover`}
          onError={() => setDefaultError(true)}
          priority
        />
      ) : (
        <div className={`${className} bg-surface-container-high flex items-center justify-center text-2xl font-display font-bold text-primary`}>
          S
        </div>
      )}
      {showPicked && (
        <Image
          src={src}
          alt="Profile photo"
          width={56}
          height={56}
          className={`${className} object-cover absolute inset-0 transition-all duration-500 ${pickedVisible ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
          onLoad={() => setPickedVisible(true)}
          onError={() => setPickedError(true)}
          priority
        />
      )}
    </div>
  );

  return <div {...wrapperProps}>{image}</div>;
}
