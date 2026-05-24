import { createServerSupabaseClient } from "@/lib/supabase-server";
import CardForm from "@/components/CardForm";
import { createCard } from "../../actions";
import Link from "next/link";

export default async function NewCardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: deckRows } = await supabase
    .from("cards")
    .select("deck")
    .order("deck");

  const decks = [...new Set((deckRows ?? []).map((r) => r.deck))].sort();
  if (!decks.length) decks.push("dutch");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/cards" className="text-xs text-gray-400 hover:text-dutch-orange">
          ← Cards
        </Link>
        <h1 className="text-2xl font-bold text-dutch-blue mt-1">New card</h1>
      </div>
      <CardForm
        action={createCard}
        decks={decks}
        submitLabel="Create card"
        cancelHref="/admin/cards"
      />
    </div>
  );
}
