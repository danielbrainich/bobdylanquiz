"use client";

import { useEffect, useRef, useState } from "react";
import type { QuizEntry } from "@/lib/data";
import { MAX_QUIZ_MS, QUESTION_COUNT, pickQuestions } from "@/lib/quiz";
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
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (startRef.current === null) {
      startRef.current = Date.now();
    }
  }, []);

  const current = questions[index];
  const isLast = index === QUESTION_COUNT - 1;

  function handleAnswer(correct: boolean, song: string) {
    if (answers.length > index) return;
    const next = [...answers, { correct, song }];
    setAnswers(next);
    if (isLast && startRef.current !== null) {
      setElapsedMs(Date.now() - startRef.current);
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
