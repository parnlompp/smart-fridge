"use client";
import Link from "next/link";
import { useState } from "react";
import {
  IconArrowRight,
  IconClock,
  IconFlame,
  IconLeaf,
  IconSearch,
} from "@tabler/icons-react";
import { PageHeading } from "@/components/page-heading";
import { useDemo } from "@/components/demo-provider";
import { dietLabel, difficultyLabel } from "@/lib/thai-labels";
export default function Recipes() {
  const { analyses } = useDemo();
  const [search, setSearch] = useState("");
  const shown = analyses.filter((a) =>
    a.recipe.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="page">
      <PageHeading
        eyebrow="คัดสรรจากวัตถุดิบของคุณ"
        title="สูตรอาหารแนะนำ"
        description="ระบบจะคัดสูตรที่ขัดกับอาการแพ้ รูปแบบอาหาร และข้อจำกัดทางศาสนาออกก่อน แล้วจึงจัดอันดับจากวันหมดอายุ 50% วัตถุดิบที่มี 30% และความชอบ 20%"
      />
      <label className="relative mb-6 block max-w-md">
        <span className="sr-only">ค้นหาสูตรอาหาร</span>
        <IconSearch
          className="absolute left-3 top-3 text-slate-400"
          size={19}
        />
        <input
          className="input pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาสูตรอาหารที่เหมาะกับคุณ..."
        />
      </label>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((a, index) => (
          <article
            key={a.recipe.id}
            className="card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div
              className={`relative grid h-44 place-items-center text-7xl ${index % 3 === 0 ? "bg-[#dfeadb]" : index % 3 === 1 ? "bg-[#f0e2c5]" : "bg-[#e8e4dc]"}`}
            >
              <span>{a.recipe.emoji}</span>
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-[#246445]">
                วัตถุดิบตรงกัน {a.percentage}%
              </span>
              {a.nearExpiry.length > 0 && (
                <span className="absolute bottom-4 right-4 rounded-full bg-[#173f31] px-3 py-1.5 text-xs font-bold text-white">
                  ใช้วัตถุดิบใกล้หมดอายุ {a.nearExpiry.length} รายการ
                </span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-extrabold leading-tight">
                  {a.recipe.name}
                </h2>
                <Link
                  href={`/recipes/${a.recipe.id}`}
                  aria-label={`เปิดสูตร ${a.recipe.name}`}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-[#edf3ea]"
                >
                  <IconArrowRight size={18} />
                </Link>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#68766f]">
                {a.recipe.description}
              </p>
              <p className="mt-2 text-sm font-extrabold text-[#246445]">
                คะแนนสูตรอาหาร {Math.round(a.score)} / 100
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[#596861]">
                <span className="flex items-center gap-1">
                  <IconClock size={15} />
                  {a.recipe.preparationTime} นาที
                </span>
                <span className="flex items-center gap-1">
                  <IconFlame size={15} />
                  {difficultyLabel[a.recipe.difficulty]}
                </span>
                <span className="flex items-center gap-1">
                  <IconLeaf size={15} />
                  {dietLabel[a.recipe.dietaryCategory]}
                </span>
              </div>
              {a.missing.length > 0 ? (
                <p className="mt-4 text-xs font-semibold text-[#8a5c15]">
                  ขาดวัตถุดิบ {a.missing.length} รายการ
                </p>
              ) : (
                <p className="mt-4 text-xs font-bold text-[#2b7050]">
                  คุณมีวัตถุดิบครบแล้ว
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
