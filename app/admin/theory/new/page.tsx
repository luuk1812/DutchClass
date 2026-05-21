import TheoryForm from "@/components/TheoryForm";
import { createTheorySection } from "../../actions";
import Link from "next/link";

export default function NewTheorySectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/theory" className="text-xs text-gray-400 hover:text-dutch-orange">
          ← Theory
        </Link>
        <h1 className="text-2xl font-bold text-dutch-blue mt-1">New theory section</h1>
      </div>
      <TheoryForm
        action={createTheorySection}
        submitLabel="Create section"
        cancelHref="/admin/theory"
      />
    </div>
  );
}
