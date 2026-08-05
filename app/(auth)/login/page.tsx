import { AuthForm } from "@/components/auth-form";
export default function Login() {
  return (
    <>
      <p className="mt-12 text-xs font-bold uppercase tracking-[.18em] text-[#47805e]">
        Welcome back
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-[-.04em]">
        Sign in to your kitchen
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#68766f]">
        Your inventory and recommendations are waiting.
      </p>
      <AuthForm mode="login" />
    </>
  );
}
