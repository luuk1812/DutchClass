import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import LogoutButton from "./LogoutButton";

export default async function NavBar() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-dutch-blue text-lg tracking-tight">
          🇳🇱 DutchClass
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium text-gray-600">
          <Link href="/flashcards" className="hover:text-dutch-orange transition">
            Flashcards
          </Link>
          <Link href="/theory" className="hover:text-dutch-orange transition">
            Theory
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-dutch-blue font-semibold hover:text-dutch-orange transition"
            >
              Admin
            </Link>
          )}
          <span className="text-gray-300">|</span>
          <span className="text-xs text-gray-400 hidden sm:block">{user?.email}</span>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
