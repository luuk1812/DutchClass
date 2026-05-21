import type { Rating } from "./types";

export interface SM2Result {
  interval: number;
  ease_factor: number;
  repetitions: number;
  due_date: string;
}

/**
 * SM-2 spaced repetition algorithm.
 * Rating scale: 1=Again, 2=Hard, 3=Good, 4=Easy
 */
export function calculateNextReview(
  rating: Rating,
  currentInterval: number,
  currentEase: number,
  currentRepetitions: number
): SM2Result {
  // Normalize rating to 0–5 scale that SM-2 expects
  const q = [0, 1, 3, 5][rating - 1];

  let interval: number;
  let ease_factor = Math.max(1.3, currentEase + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  let repetitions = currentRepetitions;

  if (q < 3) {
    // Failed — reset
    interval = 1;
    repetitions = 0;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(currentInterval * ease_factor);
    }
  }

  const due = new Date();
  due.setDate(due.getDate() + interval);

  return {
    interval,
    ease_factor,
    repetitions,
    due_date: due.toISOString().split("T")[0],
  };
}

export function ratingLabel(rating: Rating): string {
  return { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" }[rating];
}

export function ratingColor(rating: Rating): string {
  return {
    1: "bg-red-500 hover:bg-red-600",
    2: "bg-orange-400 hover:bg-orange-500",
    3: "bg-green-500 hover:bg-green-600",
    4: "bg-blue-500 hover:bg-blue-600",
  }[rating];
}
