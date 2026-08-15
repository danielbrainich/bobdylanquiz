import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DATA } from "@/lib/data";
import { QUESTION_COUNT, formatMinutes } from "@/lib/quiz";

export const dynamic = "force-dynamic";

const ABANDON_CUTOFF_MS = 30 * 60 * 1000;
const SAVED_ANSWERS_LIMIT = 25;

const SONG_BY_CHARACTER = new Map<string, string>(DATA.map((d) => [d.character, d.song]));

function pct(part: number, total: number): string {
  if (total === 0) return "—";
  return `${Math.round((part / total) * 100)}%`;
}

export default async function StatsPage() {
  // This page is force-dynamic and intentionally reads the current time on every request.
  // eslint-disable-next-line react-hooks/purity
  const cutoff = new Date(Date.now() - ABANDON_CUTOFF_MS);

  const [
    totalStarted,
    totalFinished,
    finishedWithInitials,
    inProgress,
    abandoned,
    dropOffRaw,
    characterStats,
    completedAgg,
    savedEntries,
  ] = await Promise.all([
    prisma.quizRun.count(),
    prisma.quizRun.count({ where: { finishedAt: { not: null } } }),
    prisma.quizRun.count({
      where: { finishedAt: { not: null }, scoreEntry: { isNot: null } },
    }),
    prisma.quizRun.count({ where: { finishedAt: null, startedAt: { gt: cutoff } } }),
    prisma.quizRun.count({ where: { finishedAt: null, startedAt: { lte: cutoff } } }),
    prisma.quizRun.groupBy({
      by: ["answeredCount"],
      where: { finishedAt: null, startedAt: { lte: cutoff } },
      _count: { _all: true },
    }),
    prisma.characterStat.findMany({ orderBy: { served: "desc" } }),
    prisma.quizRun.aggregate({
      where: { finishedAt: { not: null } },
      _avg: { score: true, timeMs: true },
    }),
    prisma.scoreEntry.findMany({
      where: { quizRunId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: SAVED_ANSWERS_LIMIT,
      include: {
        quizRun: { include: { answers: { orderBy: { createdAt: "asc" } } } },
      },
    }),
  ]);

  const finishedWithoutInitials = totalFinished - finishedWithInitials;

  const dropOffMap = new Map(dropOffRaw.map((d) => [d.answeredCount, d._count._all]));
  const dropOffRows = Array.from({ length: QUESTION_COUNT }, (_, i) => ({
    answeredCount: i,
    count: dropOffMap.get(i) ?? 0,
  }));

  const tiles = [
    { label: "Quizzes Started", value: totalStarted },
    { label: "Completed", value: totalFinished },
    { label: "Completed, Saved Score", value: finishedWithInitials },
    { label: "Completed, No Save", value: finishedWithoutInitials },
    { label: "Abandoned Mid-Quiz", value: abandoned },
    { label: "Currently In Progress", value: inProgress },
    {
      label: "Avg. Score",
      value: completedAgg._avg.score !== null ? completedAgg._avg.score.toFixed(1) : "—",
    },
    {
      label: "Avg. Time",
      value:
        completedAgg._avg.timeMs !== null
          ? formatMinutes(Math.round(completedAgg._avg.timeMs))
          : "—",
    },
  ];

  return (
    <div className="app-shell stats-page">
      <header className="site-header">
        <Link href="/" className="brand" style={{ textDecoration: "none" }}>
          <span className="brand-title">Tangled Up In Who?</span>
          <span className="brand-sub">Stats</span>
        </Link>
      </header>

      <main>
        <h2 className="poster-heading">Quiz Stats</h2>

        <div className="stat-grid">
          {tiles.map((tile) => (
            <div key={tile.label} className="stat-tile">
              <div className="stat-value">{tile.value}</div>
              <div className="stat-label">{tile.label}</div>
            </div>
          ))}
        </div>

        <h2 className="poster-heading" style={{ marginTop: "2rem" }}>
          Drop-off by Question
        </h2>
        <p className="typewriter empty-state" style={{ padding: 0, marginBottom: "0.75rem" }}>
          Of the quizzes abandoned mid-way, how many questions they answered before leaving.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Questions Answered Before Leaving</th>
                <th className="num">Abandoned</th>
              </tr>
            </thead>
            <tbody>
              {dropOffRows.map((row) => (
                <tr key={row.answeredCount}>
                  <td>{row.answeredCount}</td>
                  <td className="num">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="poster-heading" style={{ marginTop: "2rem" }}>
          Character Performance
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Character</th>
                <th>Song</th>
                <th className="num">Served</th>
                <th className="num">Correct</th>
                <th className="num">Wrong</th>
                <th className="num">Correct %</th>
              </tr>
            </thead>
            <tbody>
              {characterStats.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={6}>No data yet.</td>
                </tr>
              ) : (
                characterStats.map((c) => (
                  <tr key={c.character}>
                    <td>{c.character}</td>
                    <td>{SONG_BY_CHARACTER.get(c.character) ?? "—"}</td>
                    <td className="num">{c.served}</td>
                    <td className="num">{c.correct}</td>
                    <td className="num">{c.wrong}</td>
                    <td className="num">{pct(c.correct, c.served)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <h2 className="poster-heading" style={{ marginTop: "2rem" }}>
          Saved Leaderboard Answers
        </h2>
        <p className="typewriter empty-state" style={{ padding: 0, marginBottom: "0.75rem" }}>
          Most recent {savedEntries.length} entries that saved initials, with what they got
          right and wrong.
        </p>
        {savedEntries.length === 0 ? (
          <p className="empty-state">No saved entries yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {savedEntries.map((entry) => (
              <div key={entry.id} className="panel">
                <div
                  className="typewriter"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <span>
                    <b>{entry.initials}</b> &mdash; {entry.score}/{QUESTION_COUNT} &mdash;{" "}
                    {formatMinutes(entry.timeMs)}
                  </span>
                  <span style={{ color: "var(--cream-dim)" }}>
                    {entry.createdAt.toLocaleString()}
                  </span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Character</th>
                        <th>Song</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.quizRun?.answers.length ? (
                        entry.quizRun.answers.map((a, i) => (
                          <tr key={a.id}>
                            <td>{i + 1}</td>
                            <td>{a.character}</td>
                            <td>{SONG_BY_CHARACTER.get(a.character) ?? "—"}</td>
                            <td className={a.correct ? "text-correct" : "text-wrong"}>
                              {a.correct ? "Correct" : "Wrong"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="empty-row">
                          <td colSpan={4}>No answer detail recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
