"use client";

import { useState } from "react";
import { ratingLabel, ratingColor } from "@/lib/sm2";
import type { Rating } from "@/lib/types";

interface Props {
  card: {
    dutch: string;
    english: string;
    example_nl: string | null;
    example_en: string | null;
  };
  onRate: (rating: Rating) => void;
}

export default function FlashCard({ card, onRate }: Props) {
  const [flipped, setFlipped] = useState(false);

  function handleRate(rating: Rating) {
    setFlipped(false);
    // Small delay so the card visually resets before the next one renders
    setTimeout(() => onRate(rating), 150);
  }

  return (
    <div className="space-y-4">
      <div
        className="card-flip w-full cursor-pointer select-none"
        style={{ height: 220 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={`card-inner relative w-full h-full ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="card-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white border-2 border-dutch-blue shadow-md p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Dutch</p>
            <p className="text-3xl font-bold text-dutch-blue">{card.dutch}</p>
            <p className="text-sm text-gray-400 mt-4">Tap to reveal</p>
          </div>

          {/* Back */}
          <div className="card-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-dutch-orange shadow-md p-6 text-center text-white">
            <p className="text-xs uppercase tracking-widest opacity-70 mb-3">English</p>
            <p className="text-2xl font-bold">{card.english}</p>
            {card.example_nl && (
              <div className="mt-4 text-sm opacity-90 space-y-0.5">
                <p className="italic">&ldquo;{card.example_nl}&rdquo;</p>
                {card.example_en && <p className="opacity-75">{card.example_en}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          {([1, 2, 3, 4] as Rating[]).map((r) => (
            <button
              key={r}
              onClick={() => handleRate(r)}
              className={`py-3 rounded-xl text-white font-semibold text-sm transition ${ratingColor(r)}`}
            >
              {ratingLabel(r)}
            </button>
          ))}
        </div>
      )}

      {!flipped && (
        <p className="text-center text-xs text-gray-400">Click the card to flip it</p>
      )}
    </div>
  );
}
