import Link from "next/link";

interface CardFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    id?: string;
    dutch?: string;
    english?: string;
    example_nl?: string | null;
    example_en?: string | null;
    category?: string;
    deck?: string;
  };
  decks: string[];
  submitLabel: string;
  cancelHref: string;
}

export default function CardForm({
  action,
  defaultValues,
  decks,
  submitLabel,
  cancelHref,
}: CardFormProps) {
  return (
    <form action={action} className="bg-white rounded-xl border shadow-sm p-6 space-y-4 max-w-lg">
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <Field label="Dutch *"      name="dutch"      defaultValue={defaultValues?.dutch}      required />
      <Field label="English *"    name="english"    defaultValue={defaultValues?.english}    required />
      <Field label="Example (NL)" name="example_nl" defaultValue={defaultValues?.example_nl ?? ""} />
      <Field label="Example (EN)" name="example_en" defaultValue={defaultValues?.example_en ?? ""} />

      {/* Deck — select from existing decks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deck *</label>
        <select
          name="deck"
          defaultValue={defaultValues?.deck ?? decks[0] ?? "dutch"}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dutch-orange bg-white capitalize"
        >
          {decks.map((d) => (
            <option key={d} value={d} className="capitalize">
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input
          name="category"
          defaultValue={defaultValues?.category ?? "vocabulary"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dutch-orange"
          placeholder="vocabulary"
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

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dutch-orange"
      />
    </div>
  );
}
