"use client";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  IconArrowRight,
  IconChefHat,
  IconClock,
  IconFridge,
  IconPlus,
  IconSparkles,
} from "@tabler/icons-react";
import { useDemo } from "@/components/demo-provider";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { getExpiryStatus } from "@/lib/business/expiry";
export default function Dashboard() {
  const { profile, inventory, analyses, history } = useDemo();
  const attention = inventory.filter((i) =>
    ["expired", "today", "soon"].includes(getExpiryStatus(i.expiryDate).status),
  );
  const expired = inventory.filter(
    (i) => getExpiryStatus(i.expiryDate).status === "expired",
  );
  const stats = [
    {
      label: "วัตถุดิบทั้งหมด",
      value: inventory.length,
      Icon: IconFridge,
      bg: "#e6efe1",
    },
    {
      label: "ใกล้หมดอายุ",
      value: attention.length - expired.length,
      Icon: IconClock,
      bg: "#fff1cf",
    },
    {
      label: "หมดอายุแล้ว",
      value: expired.length,
      Icon: IconFridge,
      bg: "#fce5df",
    },
    {
      label: "สูตรแนะนำ",
      value: analyses.length,
      Icon: IconChefHat,
      bg: "#e4e9f6",
    },
  ];
  const actions = [
    { href: "/inventory/new", label: "เพิ่มวัตถุดิบ", Icon: IconPlus },
    { href: "/inventory", label: "ดูวัตถุดิบ", Icon: IconFridge },
    { href: "/recipes", label: "ค้นหาสูตรอาหาร", Icon: IconChefHat },
    { href: "/profile", label: "แก้ไขโปรไฟล์", Icon: IconArrowRight },
  ];
  return (
    <div className="page">
      <PageHeading
        eyebrow="ภาพรวม"
        title={`สวัสดี ${profile.displayName}`}
        description="มาดูกันว่าวันนี้มีอะไรเกิดขึ้นในครัวของคุณบ้าง"
        action={
          <span className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm md:flex">
            <span className="size-2 rounded-full bg-emerald-500" />
            กำลังใช้ข้อมูลสาธิต
          </span>
        }
      />
      <div className="stat-grid">
        {stats.map(({ label, value, Icon, bg }) => (
          <div className="card p-5" key={label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-[#738079]">{label}</p>
                <p className="mt-2 text-3xl font-black">{value}</p>
              </div>
              <span
                className="grid size-10 place-items-center rounded-xl"
                style={{ background: bg }}
              >
                <Icon size={20} />
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="two-col mt-6">
        <section className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold">ควรใช้ก่อน</h2>
              <p className="mt-1 text-xs text-[#738079]">
                วัตถุดิบที่ใกล้ถึงวันหมดอายุที่สุด
              </p>
            </div>
            <Link
              href="/inventory"
              className="text-sm font-bold text-[#2f7d5c]"
            >
              ดูทั้งหมด
            </Link>
          </div>
          <div className="space-y-2">
            {attention
              .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))
              .slice(0, 4)
              .map((i) => {
                const d = getExpiryStatus(i.expiryDate);
                return (
                  <div
                    key={i.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e6ebe7] p-3"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-[#f1f4ed] text-2xl">
                      {i.category === "Meat"
                        ? "🍗"
                        : i.name.includes("Spinach")
                          ? "🥬"
                          : i.name.includes("Mushroom")
                            ? "🍄"
                            : "🥦"}
                    </span>
                    <div className="min-w-[130px] flex-1">
                      <b className="block text-sm">{i.name}</b>
                      <span className="text-xs text-[#738079]">
                        {i.quantity} {i.unit} ·{" "}
                        {format(new Date(i.expiryDate + "T12:00:00"), "d MMM", {
                          locale: th,
                        })}
                      </span>
                    </div>
                    <StatusBadge
                      date={i.expiryDate}
                      estimated={i.expirySource === "estimated"}
                    />
                    <span className="w-20 text-right text-xs font-semibold text-[#68766f]">
                      {d.daysRemaining < 0
                        ? `เกินมา ${Math.abs(d.daysRemaining)} วัน`
                        : d.daysRemaining === 0
                          ? "วันนี้"
                          : `เหลือ ${d.daysRemaining} วัน`}
                    </span>
                  </div>
                );
              })}
          </div>
        </section>
        <aside className="card overflow-hidden">
          <div className="bg-[#173f31] p-6 text-white">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#b8dbc3]">
              <IconSparkles size={16} /> สูตรที่ตรงที่สุด
            </div>
            <div className="my-5 text-6xl">{analyses[0]?.recipe.emoji}</div>
            <h2 className="text-xl font-extrabold">
              {analyses[0]?.recipe.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              ใช้วัตถุดิบใกล้หมดอายุ {analyses[0]?.nearExpiry.length} รายการ
            </p>
            <div className="mt-5 flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-3 py-2 text-xs font-bold">
                ตรงกัน {analyses[0]?.percentage}%
              </span>
              <Link
                href={`/recipes/${analyses[0]?.recipe.id}`}
                className="grid size-10 place-items-center rounded-full bg-white text-[#173f31]"
              >
                <IconArrowRight />
              </Link>
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-sm font-extrabold">กิจกรรมล่าสุด</h3>
            {history.slice(0, 2).map((h) => (
              <div className="mt-3 flex items-center gap-3" key={h.id}>
                <span className="grid size-8 place-items-center rounded-full bg-[#edf3ea]">
                  ✓
                </span>
                <div>
                  <p className="text-xs font-bold">ปรุง {h.recipeName}</p>
                  <p className="text-[11px] text-[#7c8982]">
                    {format(new Date(h.cookedAt), "d MMM เวลา HH:mm", {
                      locale: th,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-extrabold">เมนูลัด</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map(({ href, label, Icon }) => (
            <Link
              href={href}
              key={label}
              className="card flex items-center gap-3 p-4 text-sm font-bold transition hover:-translate-y-0.5 hover:border-[#93b8a0]"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-[#e6efe1]">
                <Icon size={18} />
              </span>
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
