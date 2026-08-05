"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget),
      email = String(fd.get("email")),
      password = String(fd.get("password"));
    const supabase = createClient();
    if (!supabase) {
      setError(
        "Supabase is not configured. Use Start demo to explore the application.",
      );
      setLoading(false);
      return;
    }
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${location.origin}/auth/callback` },
          });
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    router.push(mode === "signup" ? "/profile/setup" : "/dashboard");
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label>
        <span className="label">Email address</span>
        <input
          className="input"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="alex@example.com"
        />
      </label>
      <label>
        <span className="label">Password</span>
        <input
          className="input"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
          required
          placeholder="At least 8 characters"
        />
      </label>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700"
        >
          {error}
        </p>
      )}
      <button disabled={loading} className="btn btn-primary w-full">
        {loading
          ? "Please wait…"
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>
      <div className="relative my-4 text-center text-xs text-slate-400 before:absolute before:left-0 before:right-0 before:top-1/2 before:border-t">
        <span className="relative bg-white px-3">or</span>
      </div>
      <Link className="btn btn-secondary w-full" href="/api/demo-session">
        Continue with demo data
      </Link>
      <p className="text-center text-sm text-slate-500">
        {mode === "login"
          ? "New to Smart Fridge? "
          : "Already have an account? "}
        <Link
          className="font-bold text-[#2f7d5c]"
          href={mode === "login" ? "/signup" : "/login"}
        >
          {mode === "login" ? "Create account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
