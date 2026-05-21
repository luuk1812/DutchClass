import Link from "next/link";

interface TheoryFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    id?: string;
    title?: string;
    slug?: string;
    content?: string;
    category?: string;
    order_index?: number;
  };
  submitLabel: string;
  cancelHref: string;
}

export default function TheoryForm({
  action,
  defaultValues,
  submitLabel,
  cancelHref,
}: TheoryFormProps) {
  return (
    <form action={action} className="bg-white rounded-xl border shadow-sm p-6 space-y-4 max-w-2xl">
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          name="title"
          defaultValue={defaultValues?.title ?? ""}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dutch-orange"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug * <span className="font-normal text-gray-400">(URL-safe, e.g. plural-nouns)</span>
        </label>
        <input
          name="slug"
          defaultValue={defaultValues?.slug ?? ""}
          required
          pattern="[a-z0-9\-]+"
          title="Lowercase letters, numbers and hyphens only"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dutch-orange"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            name="category"
            defaultValue={defaultValues?.category ?? "grammar"}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dutch-orange"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
          <input
            name="order_index"
            type="number"
            defaultValue={defaultValues?.order_index ?? 0}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dutch-orange"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content * <span className="font-normal text-gray-400">(plain text or markdown)</span>
        </label>
        <textarea
          name="content"
          defaultValue={defaultValues?.content ?? ""}
          required
          rows={12}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-dutch-orange resize-y"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="bg-dutch-orange text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          {submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
