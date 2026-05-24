import { createServerSupabaseClient } from "@/lib/supabase-server";
import FlashcardSession from "@/components/FlashcardSession";
import { parseSettings } from "@/lib/settings";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ deck?: string }>;
}) {
  const { deck: deckParam } = await searchParams;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  // If filtering by deck, get the card IDs for that deck first
  let deckCardIds: string[] | null = null;
  if (deckParam) {
    const { data: dc } = await supabase
      .from("cards").select("id").eq("deck", deckParam);
    deckCardIds = dc?.map((c) => c.id) ?? [];
  }

  // Settings + due cards + all progress in parallel
  const [{ data: settingsRow }, { data: dueReviews }, { data: dueLearning }, { data: allProgress }] =
    await Promise.all([
      supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),

      // Due review cards
      (() => {
        let q = supabase.from("card_progress").select("*, cards(*)")
          .eq("user_id", user.id).eq("state", "review").lte("due_date", today).order("due_date").limit(200);
        if (deckCardIds) q = q.in("card_id", deckCardIds);
        return q;
      })(),

      // Learning / relearning cards due now
      (() => {
        let q = supabase.from("card_progress").select("*, cards(*)")
          .eq("user_id", user.id).in("state", ["learning", "relearning"]).lte("due_at", now);
        if (deckCardIds) q = q.in("card_id", deckCardIds);
        return q;
      })(),

      // All progress (to find unseen cards)
      (() => {
        let q = supabase.from("card_progress").select("card_id").eq("user_id", user.id);
        if (deckCardIds) q = q.in("card_id", deckCardIds);
        return q;
      })(),
    ]);

  const settings = parseSettings(settingsRow as Record<string, unknown> | null);
  const seenIds = (allProgress ?? []).map((p) => p.card_id);

  // New cards (not yet in progress for this user)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let newQ: any = supabase.from("cards").select("*");
  if (deckCardIds && deckCardIds.length > 0) newQ = newQ.in("id", deckCardIds);
  else if (deckCardIds && deckCardIds.length === 0) newQ = newQ.in("id", ["__none__"]); // empty result
  if (seenIds.length > 0) newQ = newQ.not("id", "in", `(${seenIds.join(",")})`);
  newQ = newQ.limit(settings.new_cards_per_day);
  const { data: newCardsData } = await newQ;

  type CardRow = { id: string; dutch: string; english: string; example_nl: string | null; example_en: string | null; category: string };
  type ProgressRow = { state?: string; step_index?: number; interval?: number; ease_factor?: number; lapses?: number; due_date?: string; due_at?: string | null; repetitions?: number };

  const learningCards = (dueLearning ?? []).map((p) => ({ card: (p as { cards: CardRow }).cards, progress: p as ProgressRow }));
  const reviewCards   = (dueReviews  ?? []).map((p) => ({ card: (p as { cards: CardRow }).cards, progress: p as ProgressRow }));
  const newCards      = (newCardsData ?? []).map((c: CardRow) => ({ card: c, progress: null }));

  // Learning first (time-sensitive), then review, then new
  const allCards = [...learningCards, ...reviewCards, ...newCards];

  const deckLabel = deckParam ? `"${deckParam}"` : "all decks";

  if (allCards.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-5xl">🎉</p>
        <h2 className="text-2xl font-bold text-dutch-blue">All done!</h2>
        <p className="text-gray-500">No cards due in {deckLabel} right now.</p>
        <Link href="/" className="inline-block mt-4 text-dutch-orange underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/" className="text-xs text-gray-400 hover:text-dutch-orange">← Home</Link>
          <h1 className="text-2xl font-bold text-dutch-blue capitalize mt-0.5">
            {deckParam ?? "All decks"}
          </h1>
        </div>
        <span className="text-sm text-gray-500">{allCards.length} cards</span>
      </div>
      <FlashcardSession cards={allCards} settings={settings} />
    </div>
  );
}
