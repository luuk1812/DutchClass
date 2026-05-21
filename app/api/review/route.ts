import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { calculateNextReview } from "@/lib/sm2";
import type { Rating } from "@/lib/types";

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

  // Load existing progress if any
  const { data: existing } = await supabase
    .from("card_progress")
    .select("*")
    .eq("card_id", card_id)
    .maybeSingle();

  const next = calculateNextReview(
    rating,
    existing?.interval ?? 0,
    existing?.ease_factor ?? 2.5,
    existing?.repetitions ?? 0
  );

  const now = new Date().toISOString();

  if (existing) {
    await supabase
      .from("card_progress")
      .update({ ...next, last_reviewed: now })
      .eq("id", existing.id);
  } else {
    // user_id is intentionally omitted here — add auth if needed
    await supabase.from("card_progress").insert({
      card_id,
      ...next,
      last_reviewed: now,
      repetitions: next.repetitions,
    });
  }

  return NextResponse.json({ ok: true, next });
}
