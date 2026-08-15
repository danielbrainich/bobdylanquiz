"use client";

import { useState } from "react";
import Image from "next/image";
import QuizGame from "@/components/QuizGame";
import Leaderboard from "@/components/Leaderboard";
import ConfirmModal from "@/components/ConfirmModal";
import { QUESTION_COUNT } from "@/lib/quiz";

type Tab = "play" | "hallOfFame";
type PlayPhase = "start" | "quiz";

export default function GameApp() {
  const [tab, setTab] = useState<Tab>("play");
  const [playPhase, setPlayPhase] = useState<PlayPhase>("start");
  const [quizRunId, setQuizRunId] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<Tab>("play");

  const hasUnsavedProgress = playPhase === "quiz" && !(quizFinished && scoreSubmitted);

  function navigateTo(destination: Tab) {
    setPlayPhase("start");
    setTab(destination);
  }

  function startQuiz() {
    setQuizRunId((n) => n + 1);
    setQuizFinished(false);
    setScoreSubmitted(false);
    setPlayPhase("quiz");
    setTab("play");
  }

  function requestNavigate(destination: Tab) {
    if (hasUnsavedProgress) {
      setPendingDestination(destination);
      setConfirmLeaveOpen(true);
    } else {
      navigateTo(destination);
    }
  }

  function handleConfirmLeave() {
    setConfirmLeaveOpen(false);
    navigateTo(pendingDestination);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button type="button" className="brand" onClick={() => requestNavigate("play")}>
          <span className="brand-title">Tangled Up In Who?</span>
          <span className="brand-sub">A Bob Dylan Quiz</span>
        </button>
        <div className="nav-tabs">
          <button
            type="button"
            className="btn btn-small btn-play-toggle"
            onClick={() => requestNavigate("play")}
            aria-current={tab === "play" ? "page" : undefined}
          >
            {playPhase === "quiz" && !quizFinished ? "Reset" : "Play"}
          </button>
          <button
            type="button"
            className="btn btn-small"
            onClick={() => requestNavigate("hallOfFame")}
            aria-current={tab === "hallOfFame" ? "page" : undefined}
          >
            Hall of Fame
          </button>
        </div>
      </header>

      <main>
        {tab === "hallOfFame" && (
          <div className="hall-of-fame-view">
            <h2 className="poster-heading" style={{ textAlign: "center" }}>
              Hall of Fame
            </h2>
            <Leaderboard />
          </div>
        )}

        {tab === "play" && playPhase === "start" && (
          <div className="start-screen">
            <div className="hero-image-wrap">
              <Image
                src="/dylan-hero-v2.png"
                alt="Illustrated portrait of Bob Dylan"
                fill
                priority
                sizes="(min-width: 640px) 360px, min(calc(100vw - 2.5rem), 420px)"
                style={{ objectFit: "cover", objectPosition: "top center" }}
              />
            </div>
            <p className="start-blurb typewriter">
              Ten characters from the songs of Bob Dylan. Drag each one onto the
              record it belongs to &mdash; or just tap the answer. Get through
              all {QUESTION_COUNT} as fast as you can.
            </p>
            <button type="button" className="btn btn-primary" onClick={startQuiz}>
              Start Quiz
            </button>
          </div>
        )}

        {tab === "play" && playPhase === "quiz" && (
          <QuizGame
            key={quizRunId}
            onFinished={() => setQuizFinished(true)}
            onScoreSubmitted={() => setScoreSubmitted(true)}
          />
        )}
      </main>

      <footer className="site-footer">
        Unofficial fan project. Created by{" "}
        <a href="https://danielbrainich.com" target="_blank" rel="noopener noreferrer">
          Daniel Brainich
        </a>
        .
      </footer>

      <ConfirmModal
        open={confirmLeaveOpen}
        title={quizFinished ? "Leave Without Saving?" : "Leave Quiz?"}
        message={
          quizFinished
            ? "Your score won't be recorded in the Hall of Fame if you leave now."
            : "You'll lose your progress on this quiz."
        }
        confirmLabel="Leave"
        cancelLabel="Stay"
        onConfirm={handleConfirmLeave}
        onCancel={() => setConfirmLeaveOpen(false)}
      />
    </div>
  );
}
