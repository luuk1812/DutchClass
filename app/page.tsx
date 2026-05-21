import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  // Run all counts in parallel
  const [
    { count: totalCards },
    { count: seenCount },
    { count: learningCount },
    { count: dueCount },
  ] = await Promise.all([
    supabase.from("cards").select("*", { count: "exact", head: true }),
    supabase.from("card_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("card_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("state", ["learning", "relearning"]),
    supabase.from("card_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("state", "review").lte("due_date", today),
  ]);

  const newCount = Math.max(0, (totalCards ?? 0) - (seenCount ?? 0));

  const total = newCount + (learningCount ?? 0) + (dueCount ?? 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dutch-blue">Hey Amber!</h1>
        <p className="text-gray-600 mt-1">Hurry up and practice some Dutch already!</p>
      </div>

      {/* Anki-style deck overview */}
      <div className="bg-white rounded-2xl border shadow-sm px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-gray-700">Dutch</span>
        <div className="flex gap-8 text-center">
          <div>
            <p className="text-sm font-bold text-blue-500">{newCount}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">New</p>
          </div>
          <div>
            <p className="text-sm font-bold text-orange-500">{learningCount ?? 0}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Learning</p>
          </div>
          <div>
            <p className="text-sm font-bold text-green-600">{dueCount ?? 0}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Due</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/flashcards"
          className="relative flex flex-col items-center justify-center gap-2 rounded-2xl bg-dutch-orange text-white p-8 hover:opacity-90 transition font-semibold text-lg shadow"
        >
          <span className="text-4xl">🃏</span>
          Study now
          {total > 0 && (
            <span className="text-sm font-normal opacity-90">{total} cards waiting</span>
          )}
        </Link>

        <Link
          href="/theory"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-dutch-blue text-white p-8 hover:opacity-90 transition font-semibold text-lg shadow"
        >
          <span className="text-4xl">📖</span>
          Grammar &amp; theory
        </Link>
      </div>
    </div>
  );
}
