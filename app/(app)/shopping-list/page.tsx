"use client";
import { useState } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useDemo } from "@/components/demo-provider";
import { PageHeading } from "@/components/page-heading";
import type { Unit } from "@/lib/types";
export default function Shopping() {
  const {
    shopping,
    addShopping,
    toggleShopping,
    deleteShopping,
    clearCompleted,
  } = useDemo();
  const [name, setName] = useState("");
  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addShopping([
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        quantity: 1,
        unit: "pieces" as Unit,
        isPurchased: false,
      },
    ]);
    setName("");
  }
  return (
    <div className="page">
      <PageHeading
        eyebrow="Plan ahead"
        title="Shopping list"
        description="Missing recipe ingredients and manual reminders, together in one place."
        action={
          <button className="btn btn-secondary" onClick={clearCompleted}>
            Clear completed
          </button>
        }
      />
      <form onSubmit={add} className="card mb-5 flex gap-3 p-4">
        <label className="flex-1">
          <span className="sr-only">New shopping item</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add milk, apples, rice…"
          />
        </label>
        <button className="btn btn-primary">
          <IconPlus size={18} />
          Add
        </button>
      </form>
      <section className="card p-5">
        <div className="space-y-2">
          {shopping.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-[#e5eae6] p-4"
            >
              <input
                className="size-5 accent-[#2f7d5c]"
                type="checkbox"
                checked={item.isPurchased}
                onChange={() => toggleShopping(item.id)}
                aria-label={`Mark ${item.name} purchased`}
              />
              <div className="flex-1">
                <p
                  className={`font-bold ${item.isPurchased ? "text-slate-400 line-through" : ""}`}
                >
                  {item.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.quantity} {item.unit}
                  {item.relatedRecipeId
                    ? " · Added from recipe"
                    : " · Manually added"}
                </p>
              </div>
              <button
                aria-label={`Delete ${item.name}`}
                className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                onClick={() => deleteShopping(item.id)}
              >
                <IconTrash size={18} />
              </button>
            </div>
          ))}
          {shopping.length === 0 && (
            <div className="py-12 text-center">
              <div className="text-5xl">🧺</div>
              <h2 className="mt-4 font-bold">Your list is clear</h2>
              <p className="mt-1 text-sm text-slate-500">
                Missing recipe ingredients can be added here.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
