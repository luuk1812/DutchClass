import { createServerSupabaseClient } from "@/lib/supabase-server";
import { deleteTheorySection } from "../actions";
import Link from "next/link";

export default async function AdminTheoryPage() {
  const supabase = await createServerSupabaseClient();
  const { data: sections } = await supabase
    .from("theory_sections")
    .select("*")
    .order("order_index", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-xs text-gray-400 hover:text-dutch-orange">
            ← Admin
          </Link>
          <h1 className="text-2xl font-bold text-dutch-blue mt-1">Theory sections</h1>
        </div>
        <Link
          href="/admin/theory/new"
          className="bg-dutch-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          + Add section
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left w-8">#</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Category</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Slug</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sections?.map((section) => (
              <tr key={section.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{section.order_index}</td>
                <td className="px-4 py-3 font-medium text-dutch-blue">{section.title}</td>
                <td className="px-4 py-3 text-gray-400 hidden sm:table-cell capitalize">
                  {section.category}
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs hidden sm:table-cell">
                  {section.slug}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/theory/${section.id}`}
                      className="text-dutch-blue hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteTheorySection}>
                      <input type="hidden" name="id" value={section.id} />
                      <button
                        type="submit"
                        className="text-red-400 hover:text-red-600 transition"
                        onClick={(e) => {
                          if (!confirm(`Delete "${section.title}"?`)) e.preventDefault();
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
        {(!sections || sections.length === 0) && (
          <p className="text-center text-gray-400 py-8">No theory sections yet.</p>
        )}
      </div>
    </div>
  );
}
