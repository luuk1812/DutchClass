"use client";

import { useState } from "react";
import FlashCard from "./FlashCard";
import type { Rating, CardProgress } from "@/lib/types";
import type { ParsedSettings } from "@/lib/settings";
import { ratingLabel } from "@/lib/sm2";

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

interface Toast {
  id: number;
  dutch: string;
  ratingLabel: string;
  status: "retrying" | "failed";
}

const RETRY_DELAYS = [1000, 3000]; // ms before 2nd and 3rd attempts
let nextToastId = 0;

async function postRating(cardId: string, rating: Rating): Promise<void> {
  const res = await fetch("/api/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ card_id: cardId, rating }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export default function FlashcardSession({ cards, settings }: Props) {
  const [index, setIndex]     = useState(0);
  const [done, setDone]       = useState(false);
  const [results, setResults] = useState<Rating[]>([]);
  const [toasts, setToasts]   = useState<Toast[]>([]);

  function removeToast(id: number) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  async function handleRate(rating: Rating) {
    const current = cards[index];

    // ── Optimistic: advance the UI immediately ──────────────────────────────
    setResults((r) => [...r, rating]);
    if (index + 1 >= cards.length) setDone(true);
    else setIndex((i) => i + 1);

    // ── Fire API in background ──────────────────────────────────────────────
    const id     = ++nextToastId;
    const dutch  = current.card.dutch;
    const label  = ratingLabel(rating);

    // First attempt — silent, no toast yet
    try {
      await postRating(current.card.id, rating);
      return; // happy path, done
    } catch {
      // first attempt failed — show "retrying" toast
    }

    setToasts((t) => [...t, { id, dutch, ratingLabel: label, status: "retrying" }]);

    // Retry twice more
    let saved = false;
    for (let i = 0; i < RETRY_DELAYS.length; i++) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[i]));
      try {
        await postRating(current.card.id, rating);
        saved = true;
        break;
      } catch {
        // try next
      }
    }

    if (saved) {
      // Success on retry — quietly dismiss
      removeToast(id);
    } else {
      // All retries exhausted — show failure
      setToasts((t) =>
        t.map((x) => (x.id === id ? { ...x, status: "failed" } : x))
      );
      setTimeout(() => removeToast(id), 8000);
    }
  }

  // ── Session complete screen ─────────────────────────────────────────────────
  if (done) {
    const counts = results.reduce<Record<number, number>>(
      (a, r) => ({ ...a, [r]: (a[r] ?? 0) + 1 }),
      {}
    );
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
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => { setIndex(0); setDone(false); setResults([]); }}
            className="px-6 py-2 rounded-full bg-dutch-orange text-white font-medium hover:opacity-90"
          >
            Review again
          </button>
          <a
            href="/"
            className="px-6 py-2 rounded-full border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition"
          >
            Back to home
          </a>
        </div>

        <ToastStack toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  // ── Active session ──────────────────────────────────────────────────────────
  const current       = cards[index];
  const newCount      = cards.filter((c) => !c.progress).length;
  const learningCount = cards.filter(
    (c) => c.progress?.state === "learning" || c.progress?.state === "relearning"
  ).length;
  const reviewCount = cards.filter((c) => c.progress?.state === "review").length;

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

      <ToastStack toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

// ── Toast stack (fixed bottom-right) ─────────────────────────────────────────

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-4 flex flex-col gap-2 z-50 max-w-xs w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm pointer-events-auto transition-all ${
            t.status === "retrying"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {t.status === "retrying" ? "🔄" : "⚠️"}
          </span>
          <div className="flex-1 min-w-0">
            {t.status === "retrying" ? (
              <p>
                Saving{" "}
                <span className="font-semibold">&ldquo;{t.dutch}&rdquo;</span>{" "}
                → {t.ratingLabel}&hellip;
              </p>
            ) : (
              <p>
                <span className="font-semibold">&ldquo;{t.dutch}&rdquo;</span>{" "}
                → {t.ratingLabel} wasn&apos;t saved
              </p>
            )}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 text-current opacity-40 hover:opacity-70 transition leading-none mt-0.5"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Tally({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
