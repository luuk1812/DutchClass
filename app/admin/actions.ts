"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");
  return supabase;
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export async function createCard(formData: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("cards").insert({
    dutch:      (formData.get("dutch")      as string).trim(),
    english:    (formData.get("english")    as string).trim(),
    example_nl: (formData.get("example_nl") as string).trim() || null,
    example_en: (formData.get("example_en") as string).trim() || null,
    category:   (formData.get("category")   as string).trim() || "vocabulary",
  });
  revalidatePath("/admin/cards");
  redirect("/admin/cards");
}

export async function updateCard(formData: FormData) {
  const supabase = await requireAdmin();
  const id = formData.get("id") as string;
  await supabase
    .from("cards")
    .update({
      dutch:      (formData.get("dutch")      as string).trim(),
      english:    (formData.get("english")    as string).trim(),
      example_nl: (formData.get("example_nl") as string).trim() || null,
      example_en: (formData.get("example_en") as string).trim() || null,
      category:   (formData.get("category")   as string).trim() || "vocabulary",
    })
    .eq("id", id);
  revalidatePath("/admin/cards");
  redirect("/admin/cards");
}

export async function deleteCard(formData: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("cards").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/cards");
}

// ─── Theory sections ──────────────────────────────────────────────────────────

export async function createTheorySection(formData: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("theory_sections").insert({
    title:       (formData.get("title")    as string).trim(),
    slug:        (formData.get("slug")     as string).trim(),
    content:     (formData.get("content")  as string).trim(),
    category:    (formData.get("category") as string).trim() || "grammar",
    order_index: parseInt(formData.get("order_index") as string) || 0,
  });
  revalidatePath("/admin/theory");
  redirect("/admin/theory");
}

export async function updateTheorySection(formData: FormData) {
  const supabase = await requireAdmin();
  const id = formData.get("id") as string;
  await supabase
    .from("theory_sections")
    .update({
      title:       (formData.get("title")    as string).trim(),
      slug:        (formData.get("slug")     as string).trim(),
      content:     (formData.get("content")  as string).trim(),
      category:    (formData.get("category") as string).trim() || "grammar",
      order_index: parseInt(formData.get("order_index") as string) || 0,
    })
    .eq("id", id);
  revalidatePath("/admin/theory");
  redirect("/admin/theory");
}

export async function deleteTheorySection(formData: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("theory_sections").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/theory");
}
