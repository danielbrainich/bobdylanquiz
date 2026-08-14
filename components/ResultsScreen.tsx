"use client";

import { useState } from "react";
import { formatMinutes, LEADERBOARD_SIZE } from "@/lib/quiz";
import Leaderboard from "@/components/Leaderboard";

export default function ResultsScreen({
  score,
  timeMs,
  onPlayAgain,
  onSubmitted,
}: {
  score: number;
  timeMs: number;
  onPlayAgain: () => void;
  onSubmitted?: () => void;
}) {
  const [initials, setInitials] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (initials.length === 0 || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initials, score, timeMs }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Submission failed");
      }
      const data = await res.json();
      setSubmittedId(data.id);
      setRank(data.rank ?? null);
      setTotal(data.total ?? null);
      setRefreshSignal((n) => n + 1);
      onSubmitted?.();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="results-screen">
      <p className="result-eyebrow">Your Score</p>
      <div className="result-score">{score}/10</div>
      <div className="result-time">Time: {formatMinutes(timeMs)}</div>

      {!submittedId ? (
        <form className="initials-form" onSubmit={handleSubmit}>
          <label className="typewriter" htmlFor="initials" style={{ fontSize: "0.85rem" }}>
            Enter your initials for the Hall of Fame
          </label>
          <input
            id="initials"
            className="initials-input"
            value={initials}
            onChange={(e) =>
              setInitials(
                e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z]/g, "")
                  .slice(0, 3)
              )
            }
            maxLength={3}
            autoComplete="off"
            autoCapitalize="characters"
            aria-label="Your initials, up to 3 letters"
          />
          {errorMsg && (
            <p className="typewriter" style={{ color: "var(--wrong-bright)", fontSize: "0.8rem" }}>
              {errorMsg}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={submitting || initials.length === 0}>
            {submitting ? "Submitting…" : "Submit Score"}
          </button>
        </form>
      ) : (
        <>
          {rank !== null && total !== null ? (
            rank <= LEADERBOARD_SIZE ? (
              <p
                style={{
                  textAlign: "center",
                  margin: "0.1rem 0",
                  color: "var(--green-bright)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  letterSpacing: "0.01em",
                }}
              >
                You made the Hall of Fame &mdash; #{rank} of {total}!
              </p>
            ) : (
              <p
                className="typewriter"
                style={{ textAlign: "center", margin: "0.1rem 0", color: "var(--cream-dim)" }}
              >
                You ranked #{rank} of {total}.
              </p>
            )
          ) : (
            <p
              className="typewriter"
              style={{ textAlign: "center", margin: "0.1rem 0", color: "var(--green-bright)" }}
            >
              You&apos;re in the Hall of Fame.
            </p>
          )}

          <div style={{ marginTop: "1rem" }}>
            <Leaderboard highlightId={submittedId} refreshSignal={refreshSignal} />
          </div>

          <div className="next-row" style={{ justifyContent: "center", marginTop: "1.25rem" }}>
            <button type="button" className="btn btn-primary" onClick={onPlayAgain}>
              Play Again
            </button>
          </div>
        </>
      )}
    </div>
  );
}
