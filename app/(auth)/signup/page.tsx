import { AuthForm } from "@/components/auth-form";
export default function Signup() {
  return (
    <>
      <p className="mt-12 text-xs font-bold uppercase tracking-[.18em] text-[#47805e]">
        Get started
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-[-.04em]">
        Create your account
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#68766f]">
        Build a smarter, lower-waste kitchen in minutes.
      </p>
      <AuthForm mode="signup" />
    </>
  );
}
