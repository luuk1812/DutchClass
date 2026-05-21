export interface ParsedSettings {
  learning_steps: number[];     // minutes, e.g. [1, 10]
  graduating_interval: number;  // days
  easy_interval: number;        // days
  relearn_steps: number[];      // minutes, e.g. [10]
  new_cards_per_day: number;
  max_reviews_per_day: number;
}

export const DEFAULT_SETTINGS: ParsedSettings = {
  learning_steps: [1, 10],
  graduating_interval: 1,
  easy_interval: 4,
  relearn_steps: [10],
  new_cards_per_day: 20,
  max_reviews_per_day: 200,
};

export function parseSettings(row: Record<string, unknown> | null): ParsedSettings {
  if (!row) return DEFAULT_SETTINGS;
  return {
    learning_steps: String(row.learning_steps ?? "1 10")
      .split(" ").map(Number).filter((n) => n > 0),
    graduating_interval: Math.max(1, Number(row.graduating_interval ?? 1)),
    easy_interval: Math.max(1, Number(row.easy_interval ?? 4)),
    relearn_steps: String(row.relearn_steps ?? "10")
      .split(" ").map(Number).filter((n) => n > 0),
    new_cards_per_day: Math.max(1, Number(row.new_cards_per_day ?? 20)),
    max_reviews_per_day: Math.max(1, Number(row.max_reviews_per_day ?? 200)),
  };
}
