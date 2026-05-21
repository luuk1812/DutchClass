import { createServerSupabaseClient } from "@/lib/supabase-server";
import FlashcardSession from "@/components/FlashcardSession";
import Link from "next/link";

export default async function FlashcardsPage() {
  const supabase = await createServerSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  // Get due cards with their content
  const { data: dueProgress } = await supabase
    .from("card_progress")
    .select("*, cards(*)")
    .lte("due_date", today)
    .order("due_date", { ascending: true })
    .limit(20);

  // Also get new cards (no progress yet) to fill session up to 20
  const reviewedCardIds = dueProgress?.map((p) => p.card_id) ?? [];
  const needed = 20 - (dueProgress?.length ?? 0);

  let newCards: { id: string; dutch: string; english: string; example_nl: string | null; example_en: string | null; category: string; created_at: string }[] = [];
  if (needed > 0) {
    const query = supabase.from("cards").select("*").limit(needed);
    if (reviewedCardIds.length > 0) {
      query.not("id", "in", `(${reviewedCardIds.join(",")})`);
    }
    const { data } = await query;
    newCards = data ?? [];
  }

  const dueCards = dueProgress?.map((p) => ({ progress: p, card: p.cards })) ?? [];
  const brandNewCards = newCards.map((c) => ({ progress: null, card: c }));
  const allCards = [...dueCards, ...brandNewCards];

  if (allCards.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-5xl">🎉</p>
        <h2 className="text-2xl font-bold text-dutch-blue">All done for today!</h2>
        <p className="text-gray-500">No cards due right now. Come back tomorrow.</p>
        <Link href="/" className="inline-block mt-4 text-dutch-orange underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dutch-blue">Flashcards</h1>
        <span className="text-sm text-gray-500">{allCards.length} cards this session</span>
      </div>
      <FlashcardSession cards={allCards} />
    </div>
  );
}
