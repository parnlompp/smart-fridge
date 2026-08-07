import { AuthForm } from "@/components/auth-form";
export default function Signup() {
  return (
    <>
      <p className="mt-12 text-xs font-bold uppercase tracking-[.18em] text-[#47805e]">
        เริ่มต้นใช้งาน
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-[-.04em]">
        สร้างบัญชีของคุณ
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#68766f]">
        สร้างครัวอัจฉริยะที่ช่วยลดขยะอาหารได้ในไม่กี่นาที
      </p>
      <AuthForm mode="signup" />
    </>
  );
}
