"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveSettings(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("user_settings").upsert(
    {
      user_id:             user.id,
      learning_steps:      (formData.get("learning_steps") as string).trim() || "1 10",
      graduating_interval: Math.max(1, parseInt(formData.get("graduating_interval") as string) || 1),
      easy_interval:       Math.max(1, parseInt(formData.get("easy_interval")       as string) || 4),
      relearn_steps:       (formData.get("relearn_steps") as string).trim() || "10",
      new_cards_per_day:   Math.max(1, parseInt(formData.get("new_cards_per_day")   as string) || 20),
      max_reviews_per_day: Math.max(1, parseInt(formData.get("max_reviews_per_day") as string) || 200),
    },
    { onConflict: "user_id" }
  );

  revalidatePath("/settings");
  redirect("/settings");
}
