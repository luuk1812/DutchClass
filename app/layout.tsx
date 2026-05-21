import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Dutch Learning",
  description: "Learn Dutch with spaced repetition",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        {user && <NavBar />}
        <main className={user ? "max-w-3xl mx-auto px-4 py-6 sm:py-8" : ""}>
          {children}
        </main>
      </body>
    </html>
  );
}
