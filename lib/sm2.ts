import type { Rating, CardState } from "./types";
import type { ParsedSettings } from "./settings";

export interface SM2Input {
  state: CardState;
  step_index: number;
  interval: number;
  ease_factor: number;
  lapses: number;
  rating: Rating;
  settings: ParsedSettings;
}

export interface SM2Result {
  state: CardState;
  step_index: number;
  interval: number;
  ease_factor: number;
  lapses: number;
  due_date: string;    // date-only string for review cards
  due_at: string | null; // ISO datetime string for learning cards
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function calculateNextReview(input: SM2Input): SM2Result {
  const { state, step_index, interval, ease_factor, lapses, rating, settings } = input;
  const { learning_steps, relearn_steps, graduating_interval, easy_interval } = settings;
  const now = new Date();

  // ─── New / Learning ──────────────────────────────────────────────────────────
  if (state === "new" || state === "learning") {
    if (rating === 4) {
      // Easy → graduate immediately
      const due = addDays(now, easy_interval);
      return { state: "review", step_index: 0, interval: easy_interval, ease_factor: 2.5, lapses, due_date: toDateString(due), due_at: null };
    }
    if (rating === 3) {
      // Good → advance step, graduate if last step
      const next = step_index + 1;
      if (next >= learning_steps.length) {
        const due = addDays(now, graduating_interval);
        return { state: "review", step_index: 0, interval: graduating_interval, ease_factor: 2.5, lapses, due_date: toDateString(due), due_at: null };
      }
      const due = addMinutes(now, learning_steps[next]);
      return { state: "learning", step_index: next, interval: 0, ease_factor: 2.5, lapses, due_date: toDateString(due), due_at: due.toISOString() };
    }
    if (rating === 2) {
      // Hard → repeat current step
      const due = addMinutes(now, learning_steps[step_index] ?? learning_steps[0]);
      return { state: "learning", step_index, interval: 0, ease_factor: 2.5, lapses, due_date: toDateString(due), due_at: due.toISOString() };
    }
    // Again (1) → back to step 0
    const due = addMinutes(now, learning_steps[0] ?? 1);
    return { state: "learning", step_index: 0, interval: 0, ease_factor: 2.5, lapses, due_date: toDateString(due), due_at: due.toISOString() };
  }

  // ─── Relearning ──────────────────────────────────────────────────────────────
  if (state === "relearning") {
    const steps = relearn_steps.length > 0 ? relearn_steps : [10];
    if (rating === 4 || (rating === 3 && step_index + 1 >= steps.length)) {
      // Graduate back to review
      const reviewInterval = Math.max(1, interval);
      const due = addDays(now, reviewInterval);
      return { state: "review", step_index: 0, interval: reviewInterval, ease_factor, lapses, due_date: toDateString(due), due_at: null };
    }
    if (rating === 3) {
      const next = step_index + 1;
      const due = addMinutes(now, steps[next]);
      return { state: "relearning", step_index: next, interval, ease_factor, lapses, due_date: toDateString(due), due_at: due.toISOString() };
    }
    // Again or Hard → restart relearn steps
    const due = addMinutes(now, steps[0]);
    return { state: "relearning", step_index: 0, interval, ease_factor, lapses, due_date: toDateString(due), due_at: due.toISOString() };
  }

  // ─── Review ──────────────────────────────────────────────────────────────────
  if (rating === 1) {
    // Lapse
    const newInterval = Math.max(1, Math.floor(interval * 0.5));
    const newEase = Math.max(1.3, ease_factor - 0.2);
    const steps = relearn_steps.length > 0 ? relearn_steps : [];
    if (steps.length > 0) {
      const due = addMinutes(now, steps[0]);
      return { state: "relearning", step_index: 0, interval: newInterval, ease_factor: newEase, lapses: lapses + 1, due_date: toDateString(due), due_at: due.toISOString() };
    }
    const due = addDays(now, newInterval);
    return { state: "review", step_index: 0, interval: newInterval, ease_factor: newEase, lapses: lapses + 1, due_date: toDateString(due), due_at: null };
  }
  if (rating === 2) {
    const newInterval = Math.max(interval + 1, Math.round(interval * 1.2));
    const newEase = Math.max(1.3, ease_factor - 0.15);
    const due = addDays(now, newInterval);
    return { state: "review", step_index: 0, interval: newInterval, ease_factor: newEase, lapses, due_date: toDateString(due), due_at: null };
  }
  if (rating === 3) {
    const newInterval = Math.max(interval + 1, Math.round(interval * ease_factor));
    const due = addDays(now, newInterval);
    return { state: "review", step_index: 0, interval: newInterval, ease_factor, lapses, due_date: toDateString(due), due_at: null };
  }
  // Easy (4)
  const newInterval = Math.max(interval + 1, Math.round(interval * ease_factor * 1.3));
  const newEase = Math.min(4.0, ease_factor + 0.15);
  const due = addDays(now, newInterval);
  return { state: "review", step_index: 0, interval: newInterval, ease_factor: newEase, lapses, due_date: toDateString(due), due_at: null };
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

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

export function intervalPreview(input: SM2Input): string {
  const result = calculateNextReview(input);
  if (result.due_at) {
    const mins = Math.max(1, Math.round((new Date(result.due_at).getTime() - Date.now()) / 60_000));
    return mins < 60 ? `${mins}m` : `${Math.round(mins / 60)}h`;
  }
  return result.interval === 1 ? "1d" : `${result.interval}d`;
}

export function stateChip(state: CardState): { label: string; className: string } {
  return {
    new:        { label: "New",        className: "bg-blue-100 text-blue-600" },
    learning:   { label: "Learning",   className: "bg-orange-100 text-orange-600" },
    review:     { label: "Review",     className: "bg-green-100 text-green-700" },
    relearning: { label: "Relearning", className: "bg-red-100 text-red-600" },
  }[state];
}
