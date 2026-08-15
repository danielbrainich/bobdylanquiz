"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { QuizEntry } from "@/lib/data";
import { buildOptions, randomHeadline } from "@/lib/quiz";
import ArrowIcon from "@/components/ArrowIcon";

type Phase = "idle" | "feedback" | "exiting" | "gone";

export default function QuestionCard({
  entry,
  isLast,
  onAnswer,
  onNext,
}: {
  entry: QuizEntry;
  isLast: boolean;
  onAnswer: (correct: boolean, chosenSong: string) => void;
  onNext: () => void;
}) {
  const options = useMemo(() => buildOptions(entry), [entry]);
  const [answeredSong, setAnsweredSong] = useState<string | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [headline, setHeadline] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [dragging, setDragging] = useState(false);
  const [drag, setDrag] = useState({ dx: 0, dy: 0 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const answered = answeredSong !== null;

  function commitAnswer(song: string) {
    if (answered) return;
    const correct = song === entry.song;
    setAnsweredSong(song);
    setWasCorrect(correct);
    setHeadline(randomHeadline(correct));
    setPhase("feedback");
    onAnswer(correct, song);
  }

  function songIndexAtPoint(x: number, y: number): number | null {
    const el = document.elementFromPoint(x, y);
    const box = el?.closest("[data-song-index]");
    if (!box) return null;
    const idx = box.getAttribute("data-song-index");
    return idx === null ? null : Number(idx);
  }

  function endDrag(clientX?: number, clientY?: number) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    setHoverIndex(null);
    const idx =
      clientX !== undefined && clientY !== undefined
        ? songIndexAtPoint(clientX, clientY)
        : null;
    if (idx !== null) {
      commitAnswer(options[idx]);
    } else {
      setDrag({ dx: 0, dy: 0 });
    }
  }

  // Safety net: if pointer capture is released without a clean pointerup
  // (e.g. some trackpad/gesture interactions), the card would otherwise get
  // stuck mid-drag with pointer-events disabled. Catch it at the window level.
  useEffect(() => {
    if (!dragging) return;
    function handleWindowEnd(e: PointerEvent) {
      endDrag(e.clientX, e.clientY);
    }
    window.addEventListener("pointerup", handleWindowEnd);
    window.addEventListener("pointercancel", handleWindowEnd);
    return () => {
      window.removeEventListener("pointerup", handleWindowEnd);
      window.removeEventListener("pointercancel", handleWindowEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (answered) return;
    cardRef.current?.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    draggingRef.current = true;
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    setDrag({ dx, dy });
    setHoverIndex(songIndexAtPoint(e.clientX, e.clientY));
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    endDrag(e.clientX, e.clientY);
  }

  function handleLostPointerCapture() {
    // No reliable coordinates here — always treat as an invalid drop so the
    // card snaps back rather than risk mis-committing an answer.
    endDrag();
  }

  function handleFeedbackAnimationEnd() {
    if (phase === "feedback") setPhase("exiting");
  }

  function handleExitTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (phase === "exiting" && e.propertyName === "opacity") setPhase("gone");
  }

  const cardClasses = [
    "char-card",
    dragging ? "dragging" : "",
    answered ? "locked" : "",
    phase === "feedback" ? (wasCorrect ? "feedback-correct" : "feedback-wrong") : "",
    phase === "exiting" ? "exiting" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="quiz-question">
      <div className="character-zone">
        {phase !== "gone" && (
          <div
            ref={cardRef}
            className={cardClasses}
            style={{ "--dx": `${drag.dx}px`, "--dy": `${drag.dy}px` } as React.CSSProperties}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onLostPointerCapture={handleLostPointerCapture}
            onAnimationEnd={handleFeedbackAnimationEnd}
            onTransitionEnd={handleExitTransitionEnd}
            aria-label={`Drag ${entry.character} onto the matching song`}
          >
            <div className="char-name">{entry.character}</div>
          </div>
        )}
      </div>

      <div className="answer-block">
        <div className="song-grid">
          {options.map((song, i) => {
            const isCorrectBox = song === entry.song;
            const isChosenWrong = answered && song === answeredSong && !isCorrectBox;
            const classes = [
              "song-box",
              answered ? "disabled" : "",
              answered && isCorrectBox ? "correct" : "",
              isChosenWrong ? "wrong" : "",
              !answered && hoverIndex === i ? "drop-hover" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={song}
                type="button"
                data-song-index={i}
                className={classes}
                onClick={() => commitAnswer(song)}
                disabled={answered}
              >
                {song}
              </button>
            );
          })}
        </div>
      </div>

      {answered && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reveal-title"
          >
            <h2
              id="reveal-title"
              className={`poster-heading ${wasCorrect ? "text-correct" : "text-wrong"}`}
              style={{ fontSize: "1.15rem" }}
            >
              {headline}
            </h2>
            <p className="reveal typewriter">
              <b>{entry.character}</b>{" "}
              <b>
                <ArrowIcon />
              </b>{" "}
              <b>{entry.song}</b>: &ldquo;{entry.quote}&rdquo;
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-primary" onClick={onNext}>
                <span>{isLast ? "See Results" : "Next"}</span>
                <ArrowIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
