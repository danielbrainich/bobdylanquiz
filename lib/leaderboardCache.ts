export type LeaderboardEntry = {
  id: string;
  initials: string;
  score: number;
  timeMs: number;
  createdAt: string;
};

// How long a cached response is trusted without re-checking the server. Short on
// purpose — this only exists to make navigating to the Hall of Fame feel instant,
// not to serve minutes-old standings.
const FRESH_MS = 5_000;

let cachedEntries: LeaderboardEntry[] | null = null;
let lastFetchedAt = 0;
let inFlight: Promise<LeaderboardEntry[]> | null = null;

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch("/api/scores/leaderboard", { cache: "no-store" });
  if (!res.ok) throw new Error("request failed");
  const data = await res.json();
  return data.entries;
}

function refetch(): Promise<LeaderboardEntry[]> {
  if (inFlight) return inFlight;
  inFlight = fetchLeaderboard()
    .then((entries) => {
      cachedEntries = entries;
      lastFetchedAt = Date.now();
      return entries;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

/** Warms the cache ahead of navigation. No-op if already warm or already in flight. */
export function prefetchLeaderboard() {
  if (cachedEntries || inFlight) return;
  refetch();
}

export function getCachedLeaderboard() {
  return cachedEntries;
}

/**
 * Resolves with leaderboard data. If the cache is warm and still fresh, resolves
 * instantly from it. If the cache is warm but stale, still resolves instantly from
 * it (so the UI never blocks on a spinner) while a revalidation fetch runs in the
 * background — pass `onRevalidate` to hear about the corrected data when it lands.
 * Pass `force: true` (e.g. right after the user submits a score) to skip the cache
 * entirely and wait on a fresh network response.
 */
export function loadLeaderboard(
  force: boolean,
  onRevalidate?: (entries: LeaderboardEntry[]) => void
): Promise<LeaderboardEntry[]> {
  if (force) return refetch();

  if (cachedEntries) {
    const isFresh = Date.now() - lastFetchedAt < FRESH_MS;
    if (!isFresh) refetch().then((entries) => onRevalidate?.(entries));
    return Promise.resolve(cachedEntries);
  }

  return refetch();
}
