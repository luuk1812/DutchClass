import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function TheoryPage() {
  const supabase = await createServerSupabaseClient();
  const { data: sections } = await supabase
    .from("theory_sections")
    .select("id, title, slug, category, order_index")
    .order("order_index", { ascending: true });

  const grouped = (sections ?? []).reduce<Record<string, typeof sections>>(
    (acc, s) => {
      if (!s) return acc;
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category]!.push(s);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-dutch-blue">Grammar &amp; Theory</h1>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold text-gray-700 mb-3 capitalize">{category}</h2>
          <ul className="space-y-2">
            {items?.map((s) => (
              <li key={s!.id}>
                <Link
                  href={`/theory/${s!.slug}`}
                  className="flex items-center gap-3 rounded-xl border bg-white p-4 hover:border-dutch-orange hover:shadow-sm transition"
                >
                  <span className="text-xl">📄</span>
                  <span className="font-medium">{s!.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {(!sections || sections.length === 0) && (
        <p className="text-gray-400">No theory sections yet. Add some in Supabase!</p>
      )}
    </div>
  );
}
