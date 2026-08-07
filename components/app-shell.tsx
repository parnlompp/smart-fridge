"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconFridge,
  IconChefHat,
  IconShoppingCart,
  IconHistory,
  IconUser,
  IconFlask,
  IconLogout,
  IconBell,
} from "@tabler/icons-react";
import { Logo } from "./logo";
import { DemoProvider, useDemo } from "./demo-provider";
import { getExpiryStatus } from "@/lib/business/expiry";
const nav = [
  ["/dashboard", "หน้าหลัก", IconLayoutDashboard],
  ["/inventory", "วัตถุดิบ", IconFridge],
  ["/recipes", "สูตรอาหาร", IconChefHat],
  ["/shopping-list", "รายการซื้อของ", IconShoppingCart],
  ["/history", "ประวัติ", IconHistory],
  ["/profile", "โปรไฟล์", IconUser],
  ["/demo-scenarios", "ทดสอบระบบ", IconFlask],
] as const;
function Chrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { profile, inventory } = useDemo();
  const alerts = inventory.filter((i) =>
    ["expired", "today", "soon"].includes(getExpiryStatus(i.expiryDate).status),
  ).length;
  return (
    <div className="shell">
      <aside className="sidebar">
        <Logo light />
        <nav className="mt-10 space-y-1" aria-label="เมนูหลัก">
          {nav.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${path.startsWith(href) ? "bg-white/14 text-white" : "text-white/70 hover:bg-white/8 hover:text-white"}`}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/15 pt-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#d6ebd5] font-bold text-[#174e3b]">
              A
            </span>
            <div>
              <p className="text-sm font-bold">{profile.displayName}</p>
              <p className="text-xs text-white/60">ครัวเรือนสาธิต</p>
            </div>
          </div>
          <Link
            href="/auth/signout"
            className="mt-4 flex items-center gap-2 text-xs text-white/60 hover:text-white"
          >
            <IconLogout size={16} /> ออกจากระบบ
          </Link>
        </div>
      </aside>
      <main className="main">
        <header className="mobile-top">
          <Logo light />
          <span className="relative">
            <IconBell />
            <b className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-amber-400 text-[10px] text-black">
              {alerts}
            </b>
          </span>
        </header>
        {children}
      </main>
      <nav className="mobile-nav" aria-label="เมนูมือถือ">
        {nav.slice(0, 5).map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={`flex min-w-12 flex-col items-center gap-1 p-1 text-[10px] ${path.startsWith(href) ? "text-amber-300" : "text-white/70"}`}
          >
            <Icon size={20} />
            {label.replace("รายการซื้อของ", "ซื้อของ")}
          </Link>
        ))}
      </nav>
    </div>
  );
}
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <Chrome>{children}</Chrome>
    </DemoProvider>
  );
}
