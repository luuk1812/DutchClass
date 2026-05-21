import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  const { count: cardCount } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true });

  const { count: theoryCount } = await supabase
    .from("theory_sections")
    .select("*", { count: "exact", head: true });

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-dutch-blue">Admin panel</h1>
        <p className="text-gray-500 text-sm mt-1">Manage content for DutchClass</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Cards" value={cardCount ?? 0} />
        <StatCard label="Theory sections" value={theoryCount ?? 0} />
        <StatCard label="Users" value={userCount ?? 0} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminLink
          href="/admin/cards"
          emoji="🃏"
          title="Manage cards"
          description="Add, edit, or delete flashcards"
        />
        <AdminLink
          href="/admin/theory"
          emoji="📖"
          title="Manage theory"
          description="Add, edit, or delete grammar lessons"
        />
      </div>

      <Link href="/" className="inline-block text-sm text-gray-400 hover:text-dutch-orange">
        ← Back to app
      </Link>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm text-center">
      <p className="text-2xl font-bold text-dutch-blue">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function AdminLink({
  href,
  emoji,
  title,
  description,
}: {
  href: string;
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border bg-white p-5 hover:border-dutch-orange hover:shadow-sm transition"
    >
      <span className="text-3xl">{emoji}</span>
      <div>
        <p className="font-semibold text-dutch-blue">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
