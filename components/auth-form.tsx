"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const fd = new FormData(e.currentTarget),
      email = String(fd.get("email")),
      password = String(fd.get("password"));
    const supabase = createClient();
    if (!supabase) {
      setError("ยังไม่ได้ตั้งค่า Supabase โปรดใช้โหมดสาธิตเพื่อทดลองแอป");
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
    if (mode === "signup" && !result.data.session) {
      setMessage("สร้างบัญชีแล้ว โปรดตรวจสอบอีเมลเพื่อยืนยันก่อนเข้าสู่ระบบ");
      setLoading(false);
      return;
    }
    router.push(mode === "signup" ? "/profile/setup" : "/dashboard");
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label>
        <span className="label">อีเมล</span>
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
        <span className="label">รหัสผ่าน</span>
        <input
          className="input"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
          required
          placeholder="อย่างน้อย 8 ตัวอักษร"
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
      {message && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"
        >
          {message}
        </p>
      )}
      <button disabled={loading} className="btn btn-primary w-full">
        {loading
          ? "กรุณารอสักครู่..."
          : mode === "login"
            ? "เข้าสู่ระบบ"
            : "สร้างบัญชี"}
      </button>
      <div className="relative my-4 text-center text-xs text-slate-400 before:absolute before:left-0 before:right-0 before:top-1/2 before:border-t">
        <span className="relative bg-white px-3">หรือ</span>
      </div>
      <Link className="btn btn-secondary w-full" href="/api/demo-session">
        ใช้งานต่อด้วยข้อมูลสาธิต
      </Link>
      <p className="text-center text-sm text-slate-500">
        {mode === "login" ? "ยังไม่มีบัญชีใช่ไหม? " : "มีบัญชีอยู่แล้วใช่ไหม? "}
        <Link
          className="font-bold text-[#2f7d5c]"
          href={mode === "login" ? "/signup" : "/login"}
        >
          {mode === "login" ? "สร้างบัญชี" : "เข้าสู่ระบบ"}
        </Link>
      </p>
    </form>
  );
}
