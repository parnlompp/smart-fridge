"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatISO } from "date-fns";
import { useDemo } from "./demo-provider";
import { ingredients } from "@/lib/demo-data";
import { estimateExpiry } from "@/lib/business/expiry";
import { inventorySchema } from "@/lib/schemas/inventory";
import type { InventoryItem, StorageLocation, Unit } from "@/lib/types";
export function InventoryForm({ item }: { item?: InventoryItem }) {
  const { addInventory, updateInventory } = useDemo();
  const router = useRouter();
  const [estimating, setEstimating] = useState(
    item?.expirySource === "estimated",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const today = formatISO(new Date(), { representation: "date" });
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const raw = {
      ingredientId: String(fd.get("ingredientId")),
      quantity: fd.get("quantity"),
      unit: String(fd.get("unit")),
      storageLocation: String(fd.get("storageLocation")),
      addedDate: String(fd.get("addedDate")),
      expiryDate: estimating ? undefined : String(fd.get("expiryDate")),
      notes: String(fd.get("notes")),
    };
    const parsed = inventorySchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setSaving(false);
      return;
    }
    const ingredient = ingredients.find(
      (i) => i.id === parsed.data.ingredientId,
    )!;
    const expiryDate = estimating
      ? estimateExpiry(
          parsed.data.addedDate,
          ingredient.category,
          parsed.data.storageLocation,
        )
      : parsed.data.expiryDate!;
    const value: InventoryItem = {
      id: item?.id ?? crypto.randomUUID(),
      ingredientId: ingredient.id,
      name: ingredient.name,
      category: ingredient.category,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit as Unit,
      storageLocation: parsed.data.storageLocation as StorageLocation,
      addedDate: parsed.data.addedDate,
      expiryDate,
      expirySource: estimating ? "estimated" : "entered",
      notes: parsed.data.notes,
    };
    if (item) updateInventory(value);
    else addInventory(value);
    router.push("/inventory");
  }
  return (
    <form onSubmit={submit} className="card max-w-3xl p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className="label">Ingredient *</span>
          <select
            name="ingredientId"
            defaultValue={item?.ingredientId ?? ""}
            className="input"
          >
            <option value="">Select ingredient</option>
            {ingredients.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} · {i.category}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Quantity *</span>
          <input
            name="quantity"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={item?.quantity}
            className="input"
            placeholder="e.g. 250"
          />
        </label>
        <label>
          <span className="label">Unit *</span>
          <select
            name="unit"
            defaultValue={item?.unit ?? "g"}
            className="input"
          >
            {["g", "kg", "ml", "L", "pieces", "packs", "cans"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Storage location *</span>
          <select
            name="storageLocation"
            defaultValue={item?.storageLocation ?? "Refrigerator"}
            className="input"
          >
            <option>Refrigerator</option>
            <option>Freezer</option>
            <option>Pantry</option>
          </select>
        </label>
        <label>
          <span className="label">Added date *</span>
          <input
            name="addedDate"
            type="date"
            defaultValue={item?.addedDate ?? today}
            className="input"
          />
        </label>
        <div>
          <span className="label">Expiry date</span>
          {!estimating && (
            <input
              name="expiryDate"
              type="date"
              defaultValue={item?.expiryDate}
              className="input"
            />
          )}
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={estimating}
              onChange={(e) => setEstimating(e.target.checked)}
            />{" "}
            I don’t know—estimate it
          </label>
        </div>
        <label className="md:col-span-2">
          <span className="label">
            Notes <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <textarea
            name="notes"
            maxLength={300}
            defaultValue={item?.notes}
            className="input min-h-24"
            placeholder="Package opened, meal plan notes…"
          />
        </label>
      </div>
      {estimating && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <b>Estimate only:</b> This expiry date is an estimate only and does
          not guarantee food safety.
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700"
        >
          {error}
        </p>
      )}
      <div className="mt-7 flex gap-3">
        <button disabled={saving} className="btn btn-primary">
          {saving ? "Saving…" : item ? "Save changes" : "Add to inventory"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
