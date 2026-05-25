import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch profiles, all cards, and all progress in parallel
  const [{ data: profiles }, { data: allCards }, { data: allProgress }] =
    await Promise.all([
      supabase.from("profiles").select("id, email, role, created_at").order("created_at"),
      supabase.from("cards").select("id, deck"),
      supabase.from("card_progress").select("user_id, card_id, state, due_date, due_at"),
    ]);

  const today = new Date().toISOString().split("T")[0];
  const now   = new Date().toISOString();
  const totalCards = (allCards ?? []).length;

  // Build deck list for breakdown
  const deckNames = [...new Set((allCards ?? []).map((c) => c.deck))].sort();

  // Per-user stats
  const users = (profiles ?? []).map((p) => {
    const progress = (allProgress ?? []).filter((r) => r.user_id === p.id);
    const progressMap = new Map(progress.map((r) => [r.card_id, r]));

    const seen     = progress.length;
    const newCount = totalCards - seen;
    const learning = progress.filter(
      (r) => r.state === "learning" || r.state === "relearning"
    ).length;
    const review = progress.filter((r) => r.state === "review").length;
    const dueReview = progress.filter(
      (r) => r.state === "review" && (r.due_date ?? "") <= today
    ).length;
    const dueLearning = progress.filter(
      (r) =>
        (r.state === "learning" || r.state === "relearning") &&
        r.due_at != null &&
        r.due_at <= now
    ).length;
    const dueTotal = dueReview + dueLearning;

    const pct = totalCards > 0 ? Math.round((seen / totalCards) * 100) : 0;

    // Per-deck breakdown
    const deckBreakdown = deckNames.map((deck) => {
      const deckCards = (allCards ?? []).filter((c) => c.deck === deck);
      const deckSeen  = deckCards.filter((c) => progressMap.has(c.id)).length;
      const deckTotal = deckCards.length;
      const deckPct   = deckTotal > 0 ? Math.round((deckSeen / deckTotal) * 100) : 0;
      return { deck, deckSeen, deckTotal, deckPct };
    });

    return {
      id: p.id,
      email: p.email ?? "—",
      role: p.role ?? "user",
      joinedAt: p.created_at,
      seen,
      newCount,
      learning,
      review,
      dueTotal,
      pct,
      deckBreakdown,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-xs text-gray-400 hover:text-dutch-orange">
            ← Admin
          </Link>
          <h1 className="text-2xl font-bold text-dutch-blue mt-1">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {users.length} registered · {totalCards} cards total
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 text-sm">{u.email}</span>
                  {u.role === "admin" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-dutch-orange text-white px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Joined {new Date(u.joinedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              {/* Due badge */}
              {u.dueTotal > 0 && (
                <span className="text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-full px-2.5 py-0.5">
                  {u.dueTotal} due
                </span>
              )}
            </div>

            {/* Overall progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Overall progress</span>
                <span>{u.seen} / {totalCards} cards seen ({u.pct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-dutch-orange rounded-full transition-all"
                  style={{ width: `${u.pct}%` }}
                />
              </div>
            </div>

            {/* State breakdown pills */}
            <div className="flex flex-wrap gap-2">
              <Pill label="New"       value={u.newCount}  color="bg-blue-50 text-blue-600 border-blue-200" />
              <Pill label="Learning"  value={u.learning}  color="bg-orange-50 text-orange-600 border-orange-200" />
              <Pill label="Review"    value={u.review}    color="bg-green-50 text-green-700 border-green-200" />
            </div>

            {/* Per-deck breakdown */}
            {deckNames.length > 1 && (
              <div className="pt-1 space-y-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">By deck</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {u.deckBreakdown.map(({ deck, deckSeen, deckTotal, deckPct }) => (
                    <div key={deck} className="space-y-0.5">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="capitalize">{deck}</span>
                        <span>{deckSeen}/{deckTotal}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-dutch-blue rounded-full transition-all"
                          style={{ width: `${deckPct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {users.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-12">No users yet.</p>
        )}
      </div>
    </div>
  );
}

function Pill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2.5 py-0.5 ${color}`}>
      <span className="font-bold">{value}</span>
      <span>{label}</span>
    </span>
  );
}
