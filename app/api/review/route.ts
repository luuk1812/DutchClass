import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { calculateNextReview } from "@/lib/sm2";
import { parseSettings } from "@/lib/settings";
import type { Rating, CardState } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { card_id, rating } = (await req.json()) as { card_id: string; rating: Rating };

  if (!card_id || ![1, 2, 3, 4].includes(rating)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list: { name: string; value: string; options?: Record<string, unknown> }[]) =>
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Load settings
  const { data: settingsRow } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const settings = parseSettings(settingsRow as Record<string, unknown> | null);

  // Load existing progress
  const { data: existing } = await supabase
    .from("card_progress")
    .select("*")
    .eq("card_id", card_id)
    .eq("user_id", user.id)
    .maybeSingle();

  const stateBefore: CardState = (existing?.state as CardState) ?? "new";

  const result = calculateNextReview({
    state: stateBefore,
    step_index: existing?.step_index ?? 0,
    interval: existing?.interval ?? 0,
    ease_factor: existing?.ease_factor ?? 2.5,
    lapses: existing?.lapses ?? 0,
    rating,
    settings,
  });

  const now = new Date().toISOString();

  if (existing) {
    await supabase.from("card_progress").update({
      state: result.state,
      step_index: result.step_index,
      interval: result.interval,
      ease_factor: result.ease_factor,
      lapses: result.lapses,
      due_date: result.due_date,
      due_at: result.due_at,
      last_reviewed: now,
      repetitions: (existing.repetitions ?? 0) + 1,
    }).eq("id", existing.id);
  } else {
    await supabase.from("card_progress").insert({
      card_id,
      user_id: user.id,
      state: result.state,
      step_index: result.step_index,
      interval: result.interval,
      ease_factor: result.ease_factor,
      lapses: result.lapses,
      due_date: result.due_date,
      due_at: result.due_at,
      last_reviewed: now,
      repetitions: 1,
    });
  }

  // Log review for stats
  await supabase.from("reviews").insert({
    user_id: user.id,
    card_id,
    rating,
    state_before: stateBefore,
  });

  return NextResponse.json({ ok: true, result });
}
