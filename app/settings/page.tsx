import { createServerSupabaseClient } from "@/lib/supabase-server";
import { parseSettings, DEFAULT_SETTINGS } from "@/lib/settings";
import { saveSettings } from "./actions";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("user_settings").select("*").eq("user_id", user.id).maybeSingle();
  const s = parseSettings(row as Record<string, unknown> | null);

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-dutch-blue">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Adjust how your cards are scheduled</p>
      </div>

      <form action={saveSettings} className="bg-white rounded-xl border shadow-sm p-6 space-y-5">

        <Section title="New cards" description="How new cards are introduced">
          <Field
            name="learning_steps"
            label="Learning steps (minutes)"
            hint="Space-separated, e.g. 1 10"
            defaultValue={s.learning_steps.join(" ")}
          />
          <Row>
            <Field
              name="graduating_interval"
              label="Graduating interval"
              hint="Days before first review"
              defaultValue={String(s.graduating_interval)}
              type="number"
            />
            <Field
              name="easy_interval"
              label="Easy interval"
              hint="Days when tapping Easy"
              defaultValue={String(s.easy_interval)}
              type="number"
            />
          </Row>
          <Field
            name="new_cards_per_day"
            label="New cards per day"
            hint=""
            defaultValue={String(s.new_cards_per_day)}
            type="number"
          />
        </Section>

        <hr />

        <Section title="Reviews" description="How graduated cards are rescheduled">
          <Field
            name="relearn_steps"
            label="Relearn steps (minutes)"
            hint="Steps after a lapse, e.g. 10"
            defaultValue={s.relearn_steps.join(" ")}
          />
          <Field
            name="max_reviews_per_day"
            label="Max reviews per day"
            hint=""
            defaultValue={String(s.max_reviews_per_day)}
            type="number"
          />
        </Section>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-dutch-orange text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            Save settings
          </button>
          <span className="text-xs text-gray-400">
            Defaults: {DEFAULT_SETTINGS.learning_steps.join(" ")} steps ·{" "}
            {DEFAULT_SETTINGS.graduating_interval}d graduating ·{" "}
            {DEFAULT_SETTINGS.new_cards_per_day} new/day
          </span>
        </div>
      </form>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({
  name, label, hint, defaultValue, type = "text",
}: {
  name: string; label: string; hint: string; defaultValue: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {hint && <span className="ml-1 font-normal text-gray-400 text-xs">({hint})</span>}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        min={type === "number" ? 1 : undefined}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dutch-orange"
      />
    </div>
  );
}
