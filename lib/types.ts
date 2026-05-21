export type Rating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

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
  interval: number;       // days until next review
  ease_factor: number;    // default 2.5
  due_date: string;       // ISO date string
  repetitions: number;
  last_reviewed: string | null;
}

export interface CardWithProgress extends Card {
  progress: CardProgress | null;
}

export interface TheorySection {
  id: string;
  title: string;
  slug: string;
  content: string;        // markdown
  order_index: number;
  category: string;
}
