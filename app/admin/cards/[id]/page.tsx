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

  const { data: card } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .single();

  if (!card) notFound();

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
        submitLabel="Save changes"
        cancelHref="/admin/cards"
      />
    </div>
  );
}
