"use client";
import { format } from "date-fns";
import { IconChefHat } from "@tabler/icons-react";
import { PageHeading } from "@/components/page-heading";
import { useDemo } from "@/components/demo-provider";
export default function History() {
  const { history } = useDemo();
  return (
    <div className="page">
      <PageHeading
        eyebrow="Your progress"
        title="Cooking history"
        description="A transparent record of meals cooked and the inventory quantities deducted."
      />
      <section className="card overflow-hidden">
        {history.map((h) => (
          <article
            className="flex flex-wrap items-center gap-4 border-b p-5 last:border-0"
            key={h.id}
          >
            <span className="grid size-12 place-items-center rounded-xl bg-[#e5efe2] text-[#286249]">
              <IconChefHat />
            </span>
            <div className="min-w-[180px] flex-1">
              <h2 className="font-extrabold">{h.recipeName}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {format(new Date(h.cookedAt), "dd MMM yyyy, h:mm a")} ·{" "}
                {h.servings} servings
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(h.summary).map(([name, q]) => (
                <span key={name} className="badge bg-slate-100 text-slate-600">
                  {name}: −{q}
                </span>
              ))}
            </div>
          </article>
        ))}
        {history.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-5xl">🍽️</div>
            <h2 className="mt-4 font-bold">No meals recorded yet</h2>
            <p className="text-sm text-slate-500">
              Cook a recipe to see it here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
