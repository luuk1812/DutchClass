import { createServerSupabaseClient } from "@/lib/supabase-server";
import FlashcardSession from "@/components/FlashcardSession";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function FlashcardsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  // Due cards for this user
  const { data: dueProgress } = await supabase
    .from("card_progress")
    .select("*, cards(*)")
    .eq("user_id", user.id)
    .lte("due_date", today)
    .order("due_date", { ascending: true })
    .limit(20);

  // New cards this user has never seen
  const reviewedCardIds = dueProgress?.map((p) => p.card_id) ?? [];

  // Get all cards this user has any progress on (to exclude from "new")
  const { data: allProgress } = await supabase
    .from("card_progress")
    .select("card_id")
    .eq("user_id", user.id);

  const allReviewedIds = allProgress?.map((p) => p.card_id) ?? [];
  const needed = 20 - (dueProgress?.length ?? 0);

  let newCards: {
    id: string;
    dutch: string;
    english: string;
    example_nl: string | null;
    example_en: string | null;
    category: string;
    created_at: string;
  }[] = [];

  if (needed > 0) {
    let query = supabase.from("cards").select("*").limit(needed);
    if (allReviewedIds.length > 0) {
      query = query.not("id", "in", `(${allReviewedIds.join(",")})`);
    }
    const { data } = await query;
    newCards = data ?? [];
  }

  const dueCards = (dueProgress ?? []).map((p) => ({ progress: p, card: p.cards }));
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
