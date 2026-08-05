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
export default function Recipes() {
  const { analyses } = useDemo();
  const [search, setSearch] = useState("");
  const shown = analyses.filter((a) =>
    a.recipe.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="page">
      <PageHeading
        eyebrow="Made for your fridge"
        title="Recipe recommendations"
        description="Allergen and diet conflicts are removed before recipes are ranked by match, food-saving potential, missing items, and prep time."
      />
      <label className="relative mb-6 block max-w-md">
        <span className="sr-only">Search recipes</span>
        <IconSearch
          className="absolute left-3 top-3 text-slate-400"
          size={19}
        />
        <input
          className="input pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suitable recipes..."
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
                {a.percentage}% match
              </span>
              {a.nearExpiry.length > 0 && (
                <span className="absolute bottom-4 right-4 rounded-full bg-[#173f31] px-3 py-1.5 text-xs font-bold text-white">
                  Uses {a.nearExpiry.length} expiring soon
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
                  aria-label={`Open ${a.recipe.name}`}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-[#edf3ea]"
                >
                  <IconArrowRight size={18} />
                </Link>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#68766f]">
                {a.recipe.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[#596861]">
                <span className="flex items-center gap-1">
                  <IconClock size={15} />
                  {a.recipe.preparationTime} min
                </span>
                <span className="flex items-center gap-1">
                  <IconFlame size={15} />
                  {a.recipe.difficulty}
                </span>
                <span className="flex items-center gap-1">
                  <IconLeaf size={15} />
                  {a.recipe.dietaryCategory}
                </span>
              </div>
              {a.missing.length > 0 ? (
                <p className="mt-4 text-xs font-semibold text-[#8a5c15]">
                  Missing {a.missing.length} ingredient
                  {a.missing.length === 1 ? "" : "s"}
                </p>
              ) : (
                <p className="mt-4 text-xs font-bold text-[#2b7050]">
                  You have everything you need
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
