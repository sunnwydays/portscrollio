"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const images = ["/autoronto_computer.jpg", "/screen_inception.jpg"] as const;

export function PlaceholderImage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(Math.random() < 0.5 ? 0 : 1);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setIndex((i) => (i === 0 ? 1 : 0))}
      className="cursor-pointer"
    >
      <Image
        src={images[index]}
        alt="Placeholder"
        width={400}
        height={400}
        className="rounded-2xl object-cover max-w-full"
      />
    </button>
  );
}
