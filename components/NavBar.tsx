import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import LogoutButton from "./LogoutButton";
import MobileMenu from "./MobileMenu";

export default async function NavBar() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-dutch-blue text-lg tracking-tight">
          🇳🇱 DutchClass
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-gray-600">
          <Link href="/flashcards" className="hover:text-dutch-orange transition">Flashcards</Link>
          <Link href="/theory"     className="hover:text-dutch-orange transition">Theory</Link>
          <Link href="/stats"      className="hover:text-dutch-orange transition">Stats</Link>
          <Link href="/settings"   className="hover:text-dutch-orange transition">Settings</Link>
          {isAdmin && (
            <Link href="/admin" className="text-dutch-blue font-semibold hover:text-dutch-orange transition">
              Admin
            </Link>
          )}
          <span className="text-gray-200">|</span>
          <span className="text-xs text-gray-400 truncate max-w-[8rem]">{user?.email}</span>
          <LogoutButton />
        </div>

        {/* Mobile hamburger */}
        <MobileMenu isAdmin={isAdmin} email={user?.email} />
      </div>
    </nav>
  );
}
