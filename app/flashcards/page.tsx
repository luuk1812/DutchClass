import { createServerSupabaseClient } from "@/lib/supabase-server";
import FlashcardSession from "@/components/FlashcardSession";
import { parseSettings } from "@/lib/settings";
import type { Card, CardProgress } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function FlashcardsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  // Settings
  const { data: settingsRow } = await supabase
    .from("user_settings").select("*").eq("user_id", user.id).maybeSingle();
  const settings = parseSettings(settingsRow as Record<string, unknown> | null);

  // 1. Due review cards
  const { data: dueReviews } = await supabase
    .from("card_progress")
    .select("*, cards(*)")
    .eq("user_id", user.id)
    .eq("state", "review")
    .lte("due_date", today)
    .order("due_date")
    .limit(settings.max_reviews_per_day);

  // 2. Learning/relearning cards due now (minute precision)
  const { data: dueLearning } = await supabase
    .from("card_progress")
    .select("*, cards(*)")
    .eq("user_id", user.id)
    .in("state", ["learning", "relearning"])
    .lte("due_at", now);

  // 3. New cards (no progress record yet for this user)
  const { data: allProgress } = await supabase
    .from("card_progress").select("card_id").eq("user_id", user.id);
  const seenIds = allProgress?.map((p) => p.card_id) ?? [];

  let newCards: Card[] = [];
  if (seenIds.length > 0) {
    const { data } = await supabase
      .from("cards").select("*")
      .not("id", "in", `(${seenIds.join(",")})`)
      .limit(settings.new_cards_per_day);
    newCards = (data ?? []) as Card[];
  } else {
    const { data } = await supabase
      .from("cards").select("*").limit(settings.new_cards_per_day);
    newCards = (data ?? []) as Card[];
  }

  type JoinRow = CardProgress & { cards: Card };
  const learningCards = (dueLearning ?? []).map((p) => ({ card: (p as JoinRow).cards, progress: p as CardProgress }));
  const reviewCards   = (dueReviews  ?? []).map((p) => ({ card: (p as JoinRow).cards, progress: p as CardProgress }));
  const brandNewCards = newCards.map((c) => ({ card: c, progress: null }));

  // Order: learning first (time-sensitive), then review, then new
  const allCards = [...learningCards, ...reviewCards, ...brandNewCards];

  if (allCards.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-5xl">🎉</p>
        <h2 className="text-2xl font-bold text-dutch-blue">All done for today!</h2>
        <p className="text-gray-500">No cards due right now. Come back later.</p>
        <Link href="/" className="inline-block mt-4 text-dutch-orange underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dutch-blue">Flashcards</h1>
        <span className="text-sm text-gray-500">{allCards.length} in session</span>
      </div>
      <FlashcardSession cards={allCards} settings={settings} />
    </div>
  );
}
