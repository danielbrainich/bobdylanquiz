"use client";

import { useEffect, useState } from "react";
import type { QuizEntry } from "@/lib/data";
import { MAX_QUIZ_MS, QUESTION_COUNT, formatMinutes, pickQuestions } from "@/lib/quiz";
import QuestionCard from "@/components/QuestionCard";
import ResultsScreen from "@/components/ResultsScreen";

type Answer = { correct: boolean; song: string };

export default function QuizGame({
  onFinished,
  onScoreSubmitted,
}: {
  onFinished?: () => void;
  onScoreSubmitted?: () => void;
}) {
  const [questions] = useState<QuizEntry[]>(() => pickQuestions());
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [liveElapsedMs, setLiveElapsedMs] = useState(0);

  useEffect(() => {
    if (elapsedMs !== null) return;
    const id = setInterval(() => setLiveElapsedMs(Date.now() - startTime), 250);
    return () => clearInterval(id);
  }, [elapsedMs, startTime]);

  const displayElapsedMs = elapsedMs ?? liveElapsedMs;

  const current = questions[index];
  const isLast = index === QUESTION_COUNT - 1;

  function handleAnswer(correct: boolean, song: string) {
    if (answers.length > index) return;
    const next = [...answers, { correct, song }];
    setAnswers(next);
    if (isLast) {
      setElapsedMs(Date.now() - startTime);
    }
  }

  function handleNext() {
    if (isLast) {
      setFinished(true);
      onFinished?.();
    } else {
      setIndex(index + 1);
    }
  }

  if (finished && elapsedMs !== null) {
    const timedOut = elapsedMs >= MAX_QUIZ_MS;
    const score = timedOut ? 0 : answers.filter((a) => a.correct).length;
    return (
      <ResultsScreen
        score={score}
        timeMs={elapsedMs}
        onPlayAgain={() => window.location.reload()}
        onSubmitted={onScoreSubmitted}
      />
    );
  }

  return (
    <div className="quiz-view">
      <div className="progress-row">
        <span>
          Question {index + 1} / {QUESTION_COUNT}
        </span>
        <span>{formatMinutes(displayElapsedMs)}</span>
        <span>Score: {answers.filter((a) => a.correct).length}</span>
      </div>

      <QuestionCard
        key={index}
        entry={current}
        isLast={isLast}
        onAnswer={handleAnswer}
        onNext={handleNext}
      />
    </div>
  );
}
