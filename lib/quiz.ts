import { DATA, ALL_SONGS, type QuizEntry } from "@/lib/data";

export function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const QUESTION_COUNT = 10;
export const LEADERBOARD_SIZE = 10;
export const MAX_QUIZ_MS = 60 * 60 * 1000;

export function pickQuestions(): QuizEntry[] {
  return shuffle(DATA).slice(0, QUESTION_COUNT);
}

export function buildOptions(entry: QuizEntry): string[] {
  const decoys = shuffle(ALL_SONGS.filter((song) => song !== entry.song)).slice(
    0,
    3
  );
  return shuffle([entry.song, ...decoys]);
}

const CORRECT_HEADLINES = ["Correct!", "Exactly!", "Nailed It!", "Right On!"];
const WRONG_HEADLINES = ["Not Quite", "Nope", "Close, But No", "Missed It"];

export function randomHeadline(correct: boolean): string {
  const pool = correct ? CORRECT_HEADLINES : WRONG_HEADLINES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function formatMinutes(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
