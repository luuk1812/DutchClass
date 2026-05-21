export type Rating = 1 | 2 | 3 | 4;
export type CardState = "new" | "learning" | "review" | "relearning";

export interface Card {
  id: string;
  dutch: string;
  english: string;
  example_nl: string | null;
  example_en: string | null;
  category: string;
  created_at: string;
}

export interface CardProgress {
  id: string;
  user_id: string;
  card_id: string;
  state: CardState;
  step_index: number;
  interval: number;
  ease_factor: number;
  lapses: number;
  due_date: string;
  due_at: string | null;
  repetitions: number;
  last_reviewed: string | null;
}

export interface TheorySection {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  order_index: number;
}
