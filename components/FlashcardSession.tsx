"use client";

import { useState } from "react";
import FlashCard from "./FlashCard";
import type { Rating } from "@/lib/types";

interface SessionCard {
  card: {
    id: string;
    dutch: string;
    english: string;
    example_nl: string | null;
    example_en: string | null;
    category: string;
  };
  progress: { interval: number; ease_factor: number; repetitions: number } | null;
}

export default function FlashcardSession({ cards }: { cards: SessionCard[] }) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<{ rating: Rating }[]>([]);

  async function handleRate(rating: Rating) {
    const current = cards[index];
    await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card_id: current.card.id, rating }),
    });

    setResults((r) => [...r, { rating }]);

    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  if (done) {
    const counts = results.reduce<Record<number, number>>((acc, r) => {
      acc[r.rating] = (acc[r.rating] ?? 0) + 1;
      return acc;
    }, {});

    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-5xl">✅</p>
        <h2 className="text-2xl font-bold text-dutch-blue">Session complete!</h2>
        <div className="flex justify-center gap-6 text-sm mt-4">
          <Stat label="Again" value={counts[1] ?? 0} color="text-red-500" />
          <Stat label="Hard" value={counts[2] ?? 0} color="text-orange-500" />
          <Stat label="Good" value={counts[3] ?? 0} color="text-green-600" />
          <Stat label="Easy" value={counts[4] ?? 0} color="text-blue-500" />
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-400">
        <span>{index + 1} / {cards.length}</span>
        <span className="capitalize">{current.card.category}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-dutch-orange h-1.5 rounded-full transition-all"
          style={{ width: `${((index) / cards.length) * 100}%` }}
        />
      </div>

      <FlashCard card={current.card} onRate={handleRate} />
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-gray-500">{label}</p>
    </div>
  );
}
