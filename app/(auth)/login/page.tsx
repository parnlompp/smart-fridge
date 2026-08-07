import { AuthForm } from "@/components/auth-form";
export default function Login() {
  return (
    <>
      <p className="mt-12 text-xs font-bold uppercase tracking-[.18em] text-[#47805e]">
        ยินดีต้อนรับกลับมา
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-[-.04em]">
        เข้าสู่ระบบครัวของคุณ
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#68766f]">
        วัตถุดิบและสูตรอาหารแนะนำของคุณพร้อมแล้ว
      </p>
      <AuthForm mode="login" />
    </>
  );
}
