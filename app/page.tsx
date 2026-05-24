import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import EasterEgg from "@/components/EasterEgg";
import LetterNotice from "@/components/LetterNotice";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  // Fetch all cards and user progress in parallel
  const [{ data: allCards }, { data: userProgress }] = await Promise.all([
    supabase.from("cards").select("id, deck"),
    supabase.from("card_progress")
      .select("card_id, state, due_date")
      .eq("user_id", user.id),
  ]);

  // Build a progress lookup map
  const progressMap = new Map((userProgress ?? []).map((p) => [p.card_id, p]));

  // Compute per-deck stats
  const deckNames = [...new Set((allCards ?? []).map((c) => c.deck))].sort();

  const deckStats = deckNames.map((deck) => {
    const cards = (allCards ?? []).filter((c) => c.deck === deck);
    const newCount = cards.filter((c) => !progressMap.has(c.id)).length;
    const learningCount = cards.filter((c) => {
      const s = progressMap.get(c.id)?.state;
      return s === "learning" || s === "relearning";
    }).length;
    const dueCount = cards.filter((c) => {
      const p = progressMap.get(c.id);
      return p?.state === "review" && (p.due_date ?? "") <= today;
    }).length;
    const total = newCount + learningCount + dueCount;
    return { deck, newCount, learningCount, dueCount, total };
  });

  const grandTotal = deckStats.reduce((s, d) => s + d.total, 0);

  return (
    <div className="space-y-6">
      <LetterNotice email={user.email ?? ""} />

      {/* Deck list */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-5 py-2 bg-gray-50 border-b text-xs font-medium uppercase tracking-wide text-gray-400">
          <span>Deck</span>
          <div className="flex gap-6 text-right">
            <span className="w-8">New</span>
            <span className="w-14">Learn</span>
            <span className="w-8">Due</span>
          </div>
        </div>

        {deckStats.map(({ deck, newCount, learningCount, dueCount, total }) => (
          <Link
            key={deck}
            href={`/flashcards?deck=${encodeURIComponent(deck)}`}
            className="flex items-center justify-between px-5 py-4 border-b last:border-0 hover:bg-orange-50 transition group"
          >
            <span className="font-medium text-gray-800 capitalize group-hover:text-dutch-orange transition">
              {deck}
            </span>
            <div className="flex gap-6 text-sm font-semibold text-right">
              <span className={`w-8 text-center ${newCount > 0 ? "text-blue-500" : "text-gray-300"}`}>
                {newCount}
              </span>
              <span className={`w-14 text-center ${learningCount > 0 ? "text-orange-500" : "text-gray-300"}`}>
                {learningCount}
              </span>
              <span className={`w-8 text-center ${dueCount > 0 ? "text-green-600" : "text-gray-300"}`}>
                {dueCount}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/flashcards"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-dutch-orange text-white p-6 sm:p-8 hover:opacity-90 transition font-semibold text-lg shadow"
        >
          <span className="text-4xl">🃏</span>
          Study all decks
          {grandTotal > 0 && (
            <span className="text-sm font-normal opacity-90">{grandTotal} cards waiting</span>
          )}
        </Link>

        <Link
          href="/theory"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-dutch-blue text-white p-6 sm:p-8 hover:opacity-90 transition font-semibold text-lg shadow"
        >
          <span className="text-4xl">📖</span>
          Grammar &amp; theory
        </Link>
      </div>

      <EasterEgg email={user.email ?? ""} />
    </div>
  );
}
