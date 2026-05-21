import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const { count: dueCount } = await supabase
    .from("card_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .lte("due_date", today);

  const { count: totalCards } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true });

  const { count: totalSections } = await supabase
    .from("theory_sections")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dutch-blue">Hey Amber!</h1>
        <p className="text-gray-600 mt-1">Hurry up and practice some Dutch already!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Cards due today" value={dueCount ?? 0} accent="text-dutch-orange" />
        <StatCard label="Total flashcards" value={totalCards ?? 0} accent="text-dutch-blue" />
        <StatCard label="Theory sections" value={totalSections ?? 0} accent="text-green-600" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/flashcards"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-dutch-orange text-white p-8 hover:opacity-90 transition font-semibold text-lg shadow"
        >
          <span className="text-4xl">🃏</span>
          Review flashcards
          {(dueCount ?? 0) > 0 && (
            <span className="text-sm font-normal opacity-90">{dueCount} due now</span>
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

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
