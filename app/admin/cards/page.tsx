import { createServerSupabaseClient } from "@/lib/supabase-server";
import { deleteCard } from "../actions";
import Link from "next/link";

export default async function AdminCardsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-xs text-gray-400 hover:text-dutch-orange">
            ← Admin
          </Link>
          <h1 className="text-2xl font-bold text-dutch-blue mt-1">Flashcards</h1>
        </div>
        <Link
          href="/admin/cards/new"
          className="bg-dutch-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          + Add card
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Dutch</th>
              <th className="px-4 py-3 text-left">English</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Category</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cards?.map((card) => (
              <tr key={card.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-dutch-blue">{card.dutch}</td>
                <td className="px-4 py-3 text-gray-600">{card.english}</td>
                <td className="px-4 py-3 text-gray-400 hidden sm:table-cell capitalize">
                  {card.category}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/cards/${card.id}`}
                      className="text-dutch-blue hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteCard}>
                      <input type="hidden" name="id" value={card.id} />
                      <button
                        type="submit"
                        className="text-red-400 hover:text-red-600 transition"
                        onClick={(e) => {
                          if (!confirm(`Delete "${card.dutch}"?`)) e.preventDefault();
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!cards || cards.length === 0) && (
          <p className="text-center text-gray-400 py-8">No cards yet.</p>
        )}
      </div>
    </div>
  );
}
