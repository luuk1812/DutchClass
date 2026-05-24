"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup" | "forgot";

export default function LoginForm() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode]         = useState<Mode>("login");
  const [msg, setMsg]           = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading]   = useState(false);
  const router  = useRouter();
  const supabase = createClient();

  function switchMode(next: Mode) {
    setMode(next);
    setMsg(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();

      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        router.push("/");
        router.refresh();

      } else {
        // forgot password
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/auth/reset-password`,
        });
        if (error) throw error;
        setMsg({ type: "success", text: "Reset link sent! Check your email." });
      }
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
      {msg && (
        <div className={`rounded-lg p-3 text-sm ${
          msg.type === "error"
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-green-50 text-green-700 border border-green-200"
        }`}>
          {msg.text}
        </div>
      )}

      {/* Email — always shown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dutch-orange"
        />
      </div>

      {/* Password — hidden in forgot mode */}
      {mode !== "forgot" && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            {mode === "login" && (
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-xs text-dutch-orange hover:underline"
              >
                Forgot password?
              </button>
            )}
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dutch-orange"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-dutch-orange text-white rounded-lg py-2.5 font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition"
      >
        {loading ? "…" : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
      </button>

      {/* Footer links */}
      <p className="text-center text-sm text-gray-500">
        {mode === "forgot" ? (
          <>
            {"Remember it? "}
            <button type="button" onClick={() => switchMode("login")} className="text-dutch-orange hover:underline font-medium">
              Sign in
            </button>
          </>
        ) : mode === "login" ? (
          <>
            {"No account? "}
            <button type="button" onClick={() => switchMode("signup")} className="text-dutch-orange hover:underline font-medium">
              Sign up
            </button>
          </>
        ) : (
          <>
            {"Already have one? "}
            <button type="button" onClick={() => switchMode("login")} className="text-dutch-orange hover:underline font-medium">
              Sign in
            </button>
          </>
        )}
      </p>
    </form>
  );
}
