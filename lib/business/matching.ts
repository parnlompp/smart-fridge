import { getExpiryStatus, isUsable } from "./expiry";
import type { InventoryItem, Recipe, RecipeIngredient } from "@/lib/types";

export function calculateMissingIngredients(
  recipe: Recipe,
  inventory: InventoryItem[],
  today = new Date(),
): RecipeIngredient[] {
  const usableIds = new Set(
    inventory
      .filter((item) => isUsable(item.expiryDate, today))
      .map((item) => item.ingredientId),
  );
  return recipe.ingredients.filter(
    (item) => !item.isOptional && !usableIds.has(item.ingredientId),
  );
}

export function calculateMatch(
  recipe: Recipe,
  inventory: InventoryItem[],
  today = new Date(),
) {
  const required = recipe.ingredients.filter((item) => !item.isOptional);
  const missing = calculateMissingIngredients(recipe, inventory, today);
  const availableCount = required.length - missing.length;
  const percentage =
    required.length === 0
      ? 100
      : Math.round((availableCount / required.length) * 100);
  return {
    percentage,
    availableCount,
    totalRequired: required.length,
    missing,
  };
}

export function nearExpiryUsed(
  recipe: Recipe,
  inventory: InventoryItem[],
  today = new Date(),
) {
  const recipeIds = new Set(
    recipe.ingredients.map((item) => item.ingredientId),
  );
  const ids = new Set(
    inventory
      .filter(
        (item) =>
          recipeIds.has(item.ingredientId) &&
          ["today", "soon"].includes(
            getExpiryStatus(item.expiryDate, today).status,
          ),
      )
      .map((item) => item.ingredientId),
  );
  return recipe.ingredients.filter((item) => ids.has(item.ingredientId));
}
