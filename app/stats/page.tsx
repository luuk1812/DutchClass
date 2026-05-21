import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function StatsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, state_before, created_at")
    .eq("user_id", user.id)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at");

  const today = new Date().toISOString().split("T")[0];

  // Group by date
  const byDate: Record<string, { count: number; byRating: Record<number, number> }> = {};
  for (const r of reviews ?? []) {
    const date = r.created_at.split("T")[0];
    if (!byDate[date]) byDate[date] = { count: 0, byRating: {} };
    byDate[date].count++;
    byDate[date].byRating[r.rating] = (byDate[date].byRating[r.rating] ?? 0) + 1;
  }

  const todayStats = byDate[today] ?? { count: 0, byRating: {} };

  // Retention: review-state cards rated >= 3 in last 30d
  const reviewStateCards = (reviews ?? []).filter((r) => r.state_before === "review");
  const retained = reviewStateCards.filter((r) => r.rating >= 3).length;
  const retention = reviewStateCards.length > 0
    ? Math.round((retained / reviewStateCards.length) * 100)
    : null;

  // Streak: consecutive days with reviews going back from today
  let streak = 0;
  const check = new Date();
  for (let i = 0; i < 365; i++) {
    const d = check.toISOString().split("T")[0];
    if ((byDate[d]?.count ?? 0) > 0) { streak++; check.setDate(check.getDate() - 1); }
    else break;
  }

  // Total reviews ever
  const { count: totalReviews } = await supabase
    .from("reviews").select("*", { count: "exact", head: true }).eq("user_id", user.id);

  // Last 14 days chart
  const chartDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const date = d.toISOString().split("T")[0];
    return { date, count: byDate[date]?.count ?? 0, label: d.toLocaleDateString("en", { weekday: "short" }) };
  });
  const maxCount = Math.max(1, ...chartDays.map((d) => d.count));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-dutch-blue">Statistics</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat value={todayStats.count}          label="Today"      sub="reviews"    accent="text-dutch-orange" />
        <Stat value={retention !== null ? `${retention}%` : "—"} label="Retention" sub="last 30d" accent="text-green-600" />
        <Stat value={streak > 0 ? `${streak} 🔥` : "0"} label="Streak" sub="days" accent="text-blue-500" />
        <Stat value={totalReviews ?? 0}          label="Total"      sub="all time"   accent="text-dutch-blue" />
      </div>

      {/* Today's breakdown */}
      {todayStats.count > 0 && (
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Today&apos;s breakdown</h2>
          <div className="flex gap-8">
            <BItem label="Again" count={todayStats.byRating[1] ?? 0} color="text-red-500" />
            <BItem label="Hard"  count={todayStats.byRating[2] ?? 0} color="text-orange-500" />
            <BItem label="Good"  count={todayStats.byRating[3] ?? 0} color="text-green-600" />
            <BItem label="Easy"  count={todayStats.byRating[4] ?? 0} color="text-blue-500" />
          </div>
        </div>
      )}

      {/* 14-day chart */}
      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-4">Reviews — last 14 days</h2>
        <div className="flex items-end gap-1.5 h-28">
          {chartDays.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end" title={`${day.date}: ${day.count}`}>
              <div
                className="w-full rounded-t bg-dutch-orange opacity-80"
                style={{ height: day.count > 0 ? `${Math.max(4, (day.count / maxCount) * 100)}%` : "2px", opacity: day.count > 0 ? undefined : 0.15 }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          {chartDays.map((d, i) => (
            <span key={d.date} className={`flex-1 text-center ${i % 2 !== 0 ? "opacity-0" : ""}`}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, sub, accent }: { value: string | number; label: string; sub: string; accent: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm text-center">
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function BItem({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div>
      <p className={`text-2xl font-bold ${color}`}>{count}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
