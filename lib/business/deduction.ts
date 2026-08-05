import type { InventoryItem, Recipe } from "@/lib/types";

export interface DeductionResult {
  ok: boolean;
  inventory: InventoryItem[];
  insufficient: {
    name: string;
    needed: number;
    available: number;
    unit: string;
  }[];
  summary: Record<string, number>;
}

export function calculateDeduction(
  recipe: Recipe,
  inventory: InventoryItem[],
  servings: number,
): DeductionResult {
  const scale = servings / recipe.defaultServings;
  const insufficient = recipe.ingredients
    .filter((r) => !r.isOptional)
    .flatMap((required) => {
      const available = inventory
        .filter(
          (i) =>
            i.ingredientId === required.ingredientId &&
            i.unit === required.unit,
        )
        .reduce((sum, i) => sum + i.quantity, 0);
      const needed = required.requiredQuantity * scale;
      return available < needed
        ? [{ name: required.name, needed, available, unit: required.unit }]
        : [];
    });
  if (insufficient.length)
    return { ok: false, inventory, insufficient, summary: {} };

  const result = inventory.map((item) => ({ ...item }));
  const summary: Record<string, number> = {};
  for (const required of recipe.ingredients.filter(
    (item) => !item.isOptional,
  )) {
    let remaining = required.requiredQuantity * scale;
    summary[required.name] = remaining;
    for (const item of result
      .filter(
        (i) =>
          i.ingredientId === required.ingredientId && i.unit === required.unit,
      )
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))) {
      const used = Math.min(item.quantity, remaining);
      item.quantity -= used;
      remaining -= used;
      if (remaining <= 0) break;
    }
  }
  return {
    ok: true,
    inventory: result.filter((item) => item.quantity > 0),
    insufficient: [],
    summary,
  };
}
