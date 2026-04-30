import fs from "fs";
import path from "path";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

export function getAvatarCategories(): string[][] {
  return [1, 2, 3].map((i) => {
    const dir = path.join(process.cwd(), "public", "avatars", String(i));
    try {
      return fs
        .readdirSync(dir)
        .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()));
    } catch {
      return [];
    }
  });
}
