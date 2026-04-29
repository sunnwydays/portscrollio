export async function getLatestCommit(username: string): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  const dev = process.env.NODE_ENV === "development";

  if (dev) console.log(`[github] searching commits for "${username}" — token: ${token ? "present" : "MISSING"}`);

  const headers: HeadersInit = {
    // Commit search requires this accept header
    Accept: "application/vnd.github.cloak-preview+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const url = `https://api.github.com/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=1`;
    const res = await fetch(url, { headers, next: { revalidate: 300 } });

    if (!res.ok) {
      if (dev) console.warn(`[github] API returned ${res.status} ${res.statusText}`);
      return null;
    }

    const data: { items: Array<{ commit: { message: string } }> } = await res.json();
    const message = data.items[0]?.commit?.message?.split("\n")[0] ?? null;

    if (dev) {
      if (message) console.log(`[github] found: "${message}"`);
      else console.warn(`[github] no commits found for "${username}"`);
    }

    return message;
  } catch (err) {
    if (dev) console.warn("[github] fetch failed:", err);
    return null;
  }
}
