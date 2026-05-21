import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-dutch-blue text-lg tracking-tight">
          🇳🇱 DutchClass
        </Link>
        <div className="flex gap-5 text-sm font-medium text-gray-600">
          <Link href="/flashcards" className="hover:text-dutch-orange transition">
            Flashcards
          </Link>
          <Link href="/theory" className="hover:text-dutch-orange transition">
            Theory
          </Link>
        </div>
      </div>
    </nav>
  );
}
