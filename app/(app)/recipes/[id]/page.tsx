"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronLeft,
  IconClock,
  IconMinus,
  IconPlus,
  IconShoppingCart,
  IconX,
} from "@tabler/icons-react";
import { useDemo } from "@/components/demo-provider";
import { createShoppingItems } from "@/lib/business/shopping-list";
import { dietLabel, difficultyLabel, unitLabel } from "@/lib/thai-labels";
import type { Unit } from "@/lib/types";
export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { analyses, addShopping, cook } = useDemo();
  const analysis = analyses.find((a) => a.recipe.id === id);
  const [servings, setServings] = useState(
    analysis?.recipe.defaultServings ?? 2,
  );
  const [notice, setNotice] = useState("");
  if (!analysis)
    return (
      <div className="page">
        <h1 className="text-2xl font-bold">ไม่สามารถเปิดสูตรอาหารนี้ได้</h1>
        <p className="mt-2">
          สูตรนี้อาจขัดกับข้อมูลการแพ้อาหารหรือรูปแบบอาหารของคุณ
        </p>
        <Link href="/recipes" className="btn btn-secondary mt-5">
          กลับไปหน้าสูตรอาหาร
        </Link>
      </div>
    );
  const { recipe } = analysis;
  const scale = servings / recipe.defaultServings;
  function confirmCook() {
    const result = cook(id, servings);
    setNotice(
      result.ok
        ? "สำเร็จ อัปเดตคลังวัตถุดิบและบันทึกประวัติการทำอาหารแล้ว"
        : `ไม่ได้หักวัตถุดิบ เนื่องจากมีไม่เพียงพอ: ${result.insufficient.map((x) => `${x.name} (ต้องใช้ ${x.needed}${unitLabel[x.unit as Unit]} มี ${x.available}${unitLabel[x.unit as Unit]})`).join(", ")}`,
    );
  }
  return (
    <div className="page">
      <Link
        href="/recipes"
        className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-[#507064]"
      >
        <IconChevronLeft size={17} />
        สูตรอาหารทั้งหมด
      </Link>
      <div className="grid gap-7 lg:grid-cols-[.9fr_1.1fr]">
        <div className="card grid min-h-[340px] place-items-center bg-[#e2ecdc] text-9xl">
          {recipe.emoji}
        </div>
        <div className="py-3">
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-[#173f31] text-white">
              {Math.round(analysis.score)} / 100 คะแนนสูตรอาหาร
            </span>
            <span className="badge bg-[#dcebdd] text-[#286249]">
              {analysis.percentage}% วัตถุดิบตรงกัน
            </span>
            <span className="badge bg-slate-100 text-slate-600">
              {dietLabel[recipe.dietaryCategory]}
            </span>
            {recipe.source?.reviewStatus === "unreviewed" && (
              <span className="badge bg-amber-100 text-amber-800">
                รอตรวจสอบข้อมูลโภชนาการและข้อจำกัดอาหาร
              </span>
            )}
          </div>
          <div className="mt-4 grid max-w-xl grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-orange-50 p-3 text-orange-800">
              <b className="block text-base">{analysis.expiryPriorityPoints}</b>
              วันหมดอายุ / 50
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
              <b className="block text-base">{analysis.quantityMatchPoints}</b>
              วัตถุดิบ / 30
            </div>
            <div className="rounded-xl bg-purple-50 p-3 text-purple-800">
              <b className="block text-base">{analysis.preferencePoints}</b>
              ความชอบ / 20
            </div>
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-[-.04em]">
            {recipe.name}
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-[#68766f]">
            {recipe.description}
          </p>
          <div className="mt-6 flex gap-6 text-sm font-bold">
            <span className="flex gap-2">
              <IconClock size={19} />
              {recipe.preparationTime} นาที
            </span>
            <span>{difficultyLabel[recipe.difficulty]}</span>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm font-bold">จำนวนที่เสิร์ฟ</span>
            <div className="flex items-center rounded-xl border bg-white">
              <button
                aria-label="ลดจำนวนที่เสิร์ฟ"
                className="p-3"
                onClick={() => setServings(Math.max(1, servings - 1))}
              >
                <IconMinus size={16} />
              </button>
              <b className="w-8 text-center">{servings}</b>
              <button
                aria-label="เพิ่มจำนวนที่เสิร์ฟ"
                className="p-3"
                onClick={() => setServings(servings + 1)}
              >
                <IconPlus size={16} />
              </button>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={confirmCook}>
              ฉันทำเมนูนี้แล้ว
            </button>
            {analysis.missing.length > 0 && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  addShopping(
                    createShoppingItems(
                      analysis.missing.map((x) => ({
                        ...x,
                        requiredQuantity: x.requiredQuantity * scale,
                      })),
                      recipe.id,
                    ),
                  );
                  setNotice("เพิ่มวัตถุดิบที่ขาดลงในรายการซื้อของแล้ว");
                }}
              >
                <IconShoppingCart size={18} />
                เพิ่มวัตถุดิบที่ขาด
              </button>
            )}
          </div>
          {notice && (
            <p
              role="status"
              className={`mt-4 rounded-xl p-4 text-sm font-semibold ${notice.startsWith("สำเร็จ") || notice.startsWith("เพิ่ม") ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
            >
              {notice}
            </p>
          )}
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.8fr]">
        <section className="card p-6">
          <h2 className="text-xl font-extrabold">วัตถุดิบ</h2>
          <div className="mt-5 space-y-2">
            {recipe.ingredients.map((item) => {
              const missing = analysis.missing.some(
                (x) => x.ingredientId === item.ingredientId,
              );
              const soon = analysis.nearExpiry.some(
                (x) => x.ingredientId === item.ingredientId,
              );
              return (
                <div
                  key={item.ingredientId}
                  className="flex items-center gap-3 rounded-xl border border-[#e6ebe7] p-3"
                >
                  <span
                    className={`grid size-8 place-items-center rounded-full ${missing ? "bg-red-50 text-red-600" : soon ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
                  >
                    {missing ? (
                      <IconX size={17} />
                    ) : soon ? (
                      <IconAlertTriangle size={17} />
                    ) : (
                      <IconCheck size={17} />
                    )}
                  </span>
                  <div className="flex-1">
                    <b className="text-sm">{item.name}</b>
                    {soon && (
                      <span className="block text-xs font-semibold text-amber-700">
                        ควรใช้เร็ว ๆ นี้
                      </span>
                    )}
                    {item.isOptional && (
                      <span className="block text-xs text-slate-500">
                        ไม่บังคับ
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold">
                    {item.requiredQuantity * scale} {unitLabel[item.unit]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="text-xl font-extrabold">วิธีทำ</h2>
          <ol className="mt-5 space-y-5">
            {recipe.instructions.map((step, i) => (
              <li className="flex gap-4 text-sm leading-6" key={step}>
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#173f31] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
