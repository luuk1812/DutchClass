import CardForm from "@/components/CardForm";
import { createCard } from "../../actions";
import Link from "next/link";

export default function NewCardPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/cards" className="text-xs text-gray-400 hover:text-dutch-orange">
          ← Cards
        </Link>
        <h1 className="text-2xl font-bold text-dutch-blue mt-1">New card</h1>
      </div>
      <CardForm action={createCard} submitLabel="Create card" cancelHref="/admin/cards" />
    </div>
  );
}
