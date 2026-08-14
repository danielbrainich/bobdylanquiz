"use client";

import { useEffect, useState } from "react";
import { formatMinutes, LEADERBOARD_SIZE } from "@/lib/quiz";

type Entry = {
  id: string;
  initials: string;
  score: number;
  timeMs: number;
  createdAt: string;
};

export default function Leaderboard({
  highlightId,
  refreshSignal,
}: {
  highlightId?: string | null;
  refreshSignal?: number;
}) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch("/api/scores/leaderboard", { cache: "no-store" });
        if (!res.ok) throw new Error("request failed");
        const data = await res.json();
        if (!ignore) {
          setEntries(data.entries);
          setError(false);
        }
      } catch {
        if (!ignore) setError(true);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [refreshSignal]);

  if (error) {
    return <p className="empty-state">Couldn&apos;t load the Hall of Fame. Try again later.</p>;
  }

  if (!entries) {
    return <p className="empty-state">Loading scores&hellip;</p>;
  }

  const rows = Array.from({ length: LEADERBOARD_SIZE }, (_, i) => entries[i] ?? null);

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="leaderboard-table">
        <caption>Top Ten</caption>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Initials</th>
            <th className="num">Score</th>
            <th className="num">Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry, i) =>
            entry ? (
              <tr key={entry.id} className={entry.id === highlightId ? "highlight" : undefined}>
                <td>{i + 1}</td>
                <td>{entry.initials}</td>
                <td className="num">{entry.score}/10</td>
                <td className="num">{formatMinutes(entry.timeMs)}</td>
              </tr>
            ) : (
              <tr key={`empty-${i}`} className="empty-row">
                <td>{i + 1}</td>
                <td>&mdash;</td>
                <td className="num">&mdash;</td>
                <td className="num">&mdash;</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
