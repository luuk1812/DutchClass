"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { calculateNextReview, ratingLabel, ratingColor, intervalPreview, stateChip } from "@/lib/sm2";
import type { Rating, CardProgress, CardState } from "@/lib/types";
import type { ParsedSettings } from "@/lib/settings";

interface Props {
  card: {
    dutch: string;
    english: string;
    example_nl: string | null;
    example_en: string | null;
  };
  progress: CardProgress | null;
  settings: ParsedSettings;
  onRate: (rating: Rating) => void;
}

export default function FlashCard({ card, progress, settings, onRate }: Props) {
  const [flipped, setFlipped] = useState(false);

  // Stable ref so the keydown listener never goes stale
  const onRateRef = useRef(onRate);
  onRateRef.current = onRate;

  const handleRate = useCallback((rating: Rating) => {
    onRateRef.current(rating);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (!flipped) return;
      if (e.key === "1") handleRate(1);
      else if (e.key === "2") handleRate(2);
      else if (e.key === "3") handleRate(3);
      else if (e.key === "4") handleRate(4);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, handleRate]);

  const state: CardState = progress?.state ?? "new";
  const chip = stateChip(state);

  function preview(rating: Rating): string {
    return intervalPreview({
      state,
      step_index: progress?.step_index ?? 0,
      interval: progress?.interval ?? 0,
      ease_factor: progress?.ease_factor ?? 2.5,
      lapses: progress?.lapses ?? 0,
      rating,
      settings,
    });
  }

  return (
    <div className="space-y-4">
      {/* State badge + lapse count */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${chip.className}`}>
          {chip.label}
        </span>
        {(progress?.lapses ?? 0) > 0 && (
          <span className="text-xs text-gray-400">Lapses: {progress!.lapses}</span>
        )}
      </div>

      {/* Card */}
      <div
        className="card-flip w-full cursor-pointer select-none h-48 sm:h-56"
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={`card-inner relative w-full h-full ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="card-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white border-2 border-dutch-blue shadow-md p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Dutch</p>
            <p className="text-3xl font-bold text-dutch-blue">{card.dutch}</p>
            <p className="text-xs text-gray-300 mt-5">Space · Enter · click to reveal</p>
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

      {/* Rating buttons with interval previews */}
      {flipped && (
        <>
          <div className="grid grid-cols-4 gap-2">
            {([1, 2, 3, 4] as Rating[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRate(r)}
                className={`flex flex-col items-center py-3 rounded-xl text-white font-semibold text-xs sm:text-sm transition active:scale-95 ${ratingColor(r)}`}
              >
                <span>{ratingLabel(r)}</span>
                <span className="text-xs opacity-80 font-normal mt-0.5">{preview(r)}</span>
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-300">1 · 2 · 3 · 4</p>
        </>
      )}
    </div>
  );
}
