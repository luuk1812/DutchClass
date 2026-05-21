"use client";

import { useState } from "react";
import FlashCard from "./FlashCard";
import type { Rating, CardProgress } from "@/lib/types";
import type { ParsedSettings } from "@/lib/settings";

interface SessionCard {
  card: {
    id: string;
    dutch: string;
    english: string;
    example_nl: string | null;
    example_en: string | null;
    category: string;
  };
  progress: CardProgress | null;
}

interface Props {
  cards: SessionCard[];
  settings: ParsedSettings;
}

export default function FlashcardSession({ cards, settings }: Props) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<Rating[]>([]);

  async function handleRate(rating: Rating) {
    const current = cards[index];
    await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card_id: current.card.id, rating }),
    });
    setResults((r) => [...r, rating]);
    if (index + 1 >= cards.length) setDone(true);
    else setIndex((i) => i + 1);
  }

  if (done) {
    const counts = results.reduce<Record<number, number>>((a, r) => ({ ...a, [r]: (a[r] ?? 0) + 1 }), {});
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-5xl">✅</p>
        <h2 className="text-2xl font-bold text-dutch-blue">Session complete!</h2>
        <div className="flex justify-center gap-8 mt-4">
          <Tally label="Again" value={counts[1] ?? 0} color="text-red-500" />
          <Tally label="Hard"  value={counts[2] ?? 0} color="text-orange-500" />
          <Tally label="Good"  value={counts[3] ?? 0} color="text-green-600" />
          <Tally label="Easy"  value={counts[4] ?? 0} color="text-blue-500" />
        </div>
        <button
          onClick={() => { setIndex(0); setDone(false); setResults([]); }}
          className="mt-6 px-6 py-2 rounded-full bg-dutch-orange text-white font-medium hover:opacity-90"
        >
          Review again
        </button>
      </div>
    );
  }

  const current = cards[index];
  const newCount      = cards.filter((c) => !c.progress).length;
  const learningCount = cards.filter((c) => c.progress?.state === "learning" || c.progress?.state === "relearning").length;
  const reviewCount   = cards.filter((c) => c.progress?.state === "review").length;

  return (
    <div className="space-y-4">
      {/* Anki-style count header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm font-semibold">
          <span className="text-blue-500">{newCount}</span>
          <span className="text-orange-500">{learningCount}</span>
          <span className="text-green-600">{reviewCount}</span>
        </div>
        <span className="text-sm text-gray-400">{index + 1} / {cards.length}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1">
        <div
          className="bg-dutch-orange h-1 rounded-full transition-all"
          style={{ width: `${(index / cards.length) * 100}%` }}
        />
      </div>

      {/* key= forces full remount on card change → state resets cleanly */}
      <FlashCard
        key={current.card.id}
        card={current.card}
        progress={current.progress}
        settings={settings}
        onRate={handleRate}
      />
    </div>
  );
}

function Tally({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
