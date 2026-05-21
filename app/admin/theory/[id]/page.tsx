import { createServerSupabaseClient } from "@/lib/supabase-server";
import TheoryForm from "@/components/TheoryForm";
import { updateTheorySection } from "../../actions";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditTheorySectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: section } = await supabase
    .from("theory_sections")
    .select("*")
    .eq("id", id)
    .single();

  if (!section) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/theory" className="text-xs text-gray-400 hover:text-dutch-orange">
          ← Theory
        </Link>
        <h1 className="text-2xl font-bold text-dutch-blue mt-1">Edit section</h1>
      </div>
      <TheoryForm
        action={updateTheorySection}
        defaultValues={section}
        submitLabel="Save changes"
        cancelHref="/admin/theory"
      />
    </div>
  );
}
