export async function getLatestCommit(username: string): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    // Authenticated: all events (including private repos). Unauthenticated: public only.
    const endpoint = token
      ? `https://api.github.com/users/${username}/events`
      : `https://api.github.com/users/${username}/events/public`;

    const res = await fetch(endpoint, {
      headers,
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[github] events API returned ${res.status} for ${username}`);
      }
      return null;
    }

    const events: Array<{
      type: string;
      payload: { commits?: Array<{ message: string }> };
    }> = await res.json();

    const push = events.find((e) => e.type === "PushEvent");
    const message = push?.payload.commits?.at(-1)?.message?.split("\n")[0] ?? null;

    if (!message && process.env.NODE_ENV === "development") {
      console.warn(`[github] no PushEvent found in ${events.length} events for ${username}`);
    }

    return message;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[github] fetch failed:", err);
    }
    return null;
  }
}
