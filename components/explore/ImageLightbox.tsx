"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";

export function ImageLightbox({ children }: { children: React.ReactNode }) {
  const [src, setSrc] = useState<string | null>(null);
  const [alt, setAlt] = useState("");

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      const img = target as HTMLImageElement;
      setSrc(img.src);
      setAlt(img.alt ?? "");
    }
  }, []);

  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSrc(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [src]);

  return (
    <>
      <div onClick={handleClick} className="cursor-default [&_img]:cursor-zoom-in">
        {children}
      </div>

      {src && (
        <div
          className="fixed inset-0 lg:left-70 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-zoom-out"
          onClick={() => setSrc(null)}
          role="dialog"
          aria-label={alt || "Image preview"}
        >
          <div className="relative h-[85vh] w-[85%] max-w-6xl">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 1024px) calc(85vw - 17.5rem), 85vw"
              className="object-contain rounded-xl"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}
