import { createServerSupabaseClient } from "@/lib/supabase-server";
import CardForm from "@/components/CardForm";
import { updateCard } from "../../actions";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const [{ data: card }, { data: deckRows }] = await Promise.all([
    supabase.from("cards").select("*").eq("id", id).single(),
    supabase.from("cards").select("deck").order("deck"),
  ]);

  if (!card) notFound();

  const decks = [...new Set((deckRows ?? []).map((r) => r.deck))].sort();
  if (!decks.length) decks.push("dutch");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/cards" className="text-xs text-gray-400 hover:text-dutch-orange">
          ← Cards
        </Link>
        <h1 className="text-2xl font-bold text-dutch-blue mt-1">Edit card</h1>
      </div>
      <CardForm
        action={updateCard}
        defaultValues={card}
        decks={decks}
        submitLabel="Save changes"
        cancelHref="/admin/cards"
      />
    </div>
  );
}
