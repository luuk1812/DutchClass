import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  // New: cards this user has never touched
  const { count: totalCards } = await supabase
    .from("cards").select("*", { count: "exact", head: true });
  const { count: seenCount } = await supabase
    .from("card_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id);
  const newCount = Math.max(0, (totalCards ?? 0) - (seenCount ?? 0));

  // Learning: cards currently in learning or relearning steps
  const { count: learningCount } = await supabase
    .from("card_progress").select("*", { count: "exact", head: true })
    .eq("user_id", user.id).in("state", ["learning", "relearning"]);

  // Due: graduated cards due for review today
  const { count: dueCount } = await supabase
    .from("card_progress").select("*", { count: "exact", head: true })
    .eq("user_id", user.id).eq("state", "review").lte("due_date", today);

  const total = newCount + (learningCount ?? 0) + (dueCount ?? 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dutch-blue">Hey Amber!</h1>
        <p className="text-gray-600 mt-1">Hurry up and practice some Dutch already!</p>
      </div>

      {/* Anki-style deck overview */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <span className="font-semibold text-gray-700">Dutch</span>
          <div className="flex gap-6 text-sm font-semibold">
            <span className="text-blue-500">{newCount}</span>
            <span className="text-orange-500">{learningCount ?? 0}</span>
            <span className="text-green-600">{dueCount ?? 0}</span>
          </div>
        </div>
        <div className="px-6 py-2 flex justify-end gap-6 text-xs text-gray-400 font-medium uppercase tracking-wide">
          <span>New</span>
          <span>Learning</span>
          <span>Due</span>
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
