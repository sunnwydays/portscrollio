import { Project } from "@/lib/mock-data";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildPlaylist(projects: Project[]): Project[] {
  const primary = shuffle(projects.filter((p) => !p.is_hobby));
  const hobby = shuffle(projects.filter((p) => p.is_hobby));

  if (primary.length === 0) return hobby;

  const result: Project[] = [];
  let hobbyIdx = 0;
  let gapCounter = 0;
  let nextHobbyAfter = 2 + Math.floor(Math.random() * 2); // 2 or 3

  for (const p of primary) {
    result.push(p);
    gapCounter++;
    if (hobbyIdx < hobby.length && gapCounter >= nextHobbyAfter) {
      result.push(hobby[hobbyIdx++]);
      gapCounter = 0;
      nextHobbyAfter = 2 + Math.floor(Math.random() * 2);
    }
  }

  return result;
}
