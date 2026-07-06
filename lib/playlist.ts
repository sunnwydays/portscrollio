import { Project } from "@/lib/mock-data";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function placeLead(list: Project[], projects: Project[], leadSlug?: string): Project[] {
  if (!leadSlug) return list;
  const idx = list.findIndex((p) => (p.slug ?? p.id) === leadSlug);
  if (idx === 0) return list;
  if (idx > 0) {
    const copy = [...list];
    const [lead] = copy.splice(idx, 1);
    return [lead, ...copy];
  }
  const lead = projects.find((p) => (p.slug ?? p.id) === leadSlug);
  return lead ? [lead, ...list] : list;
}

export function buildPlaylist(projects: Project[], leadSlug?: string): Project[] {
  const primary = shuffle(projects.filter((p) => !p.is_hobby));
  const hobby = shuffle(projects.filter((p) => p.is_hobby));

  if (primary.length === 0) return placeLead(hobby, projects, leadSlug);

  const total = projects.length;
  const fixedGap = total < 4 ? 1 : total < 7 ? 2 : 0;
  const nextGap = () => fixedGap || 2 + Math.floor(Math.random() * 2);

  const result: Project[] = [];
  let hobbyIdx = 0;
  let gapCounter = 0;
  let nextHobbyAfter = nextGap();

  for (const p of primary) {
    result.push(p);
    gapCounter++;
    if (hobbyIdx < hobby.length && gapCounter >= nextHobbyAfter) {
      result.push(hobby[hobbyIdx++]);
      gapCounter = 0;
      nextHobbyAfter = nextGap();
    }
  }

  return placeLead(result, projects, leadSlug);
}
