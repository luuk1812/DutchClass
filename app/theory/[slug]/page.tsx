import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function TheorySectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: section } = await supabase
    .from("theory_sections")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!section) notFound();

  return (
    <div className="space-y-6">
      <Link href="/theory" className="text-sm text-dutch-orange hover:underline">
        ← Back to theory
      </Link>

      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{section.category}</p>
        <h1 className="text-2xl font-bold text-dutch-blue">{section.title}</h1>
      </div>

      {/* Render content as pre-formatted text. Swap for a markdown renderer if desired. */}
      <div className="prose prose-sm max-w-none bg-white rounded-xl border p-6 whitespace-pre-wrap leading-relaxed">
        {section.content}
      </div>
    </div>
  );
}
